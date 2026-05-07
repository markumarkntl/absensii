<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Classroom;
use App\Models\StudentDetail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MonitorController extends Controller
{
    /**
     * GET /admin/monitor
     *
     * Tampilkan monitor real-time absensi hari ini.
     * Data yang dikirim:
     *  - summary       : ringkasan Hadir / Sakit / Izin / Alfa / Belum Absen
     *  - byClass       : daftar kelas + status tiap siswa hari ini
     *  - recentCheckins: 15 check-in terbaru (untuk live feed)
     *  - filterClass   : nilai filter kelas aktif (dari query string)
     */
    public function index(Request $request): Response
    {
        $today        = today()->toDateString();
        $classId      = $request->query('kelas');
        $statusFilter = $request->query('status');

        // ── Ringkasan global hari ini ─────────────────────────────────────────
        $totalSiswa = StudentDetail::count();

        $stats = Attendance::whereDate('date', $today)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $totalHadir = (int) ($stats['Hadir'] ?? 0);
        $totalSakit = (int) ($stats['Sakit'] ?? 0);
        $totalIzin  = (int) ($stats['Izin']  ?? 0);
        $totalAlfa  = (int) ($stats['Alfa']  ?? 0);
        $sudahAbsen = Attendance::whereDate('date', $today)->count();
        $belumAbsen = $totalSiswa - $sudahAbsen;

        $summary = [
            'total'       => $totalSiswa,
            'hadir'       => $totalHadir,
            'sakit'       => $totalSakit,
            'izin'        => $totalIzin,
            'alfa'        => $totalAlfa,
            'belum'       => $belumAbsen,
            'persenHadir' => $totalSiswa > 0 ? round(($totalHadir / $totalSiswa) * 100) : 0,
        ];

        // ── Data per kelas ────────────────────────────────────────────────────
        $classesQuery = Classroom::with([
            'students.user',
            'students.attendances' => fn ($q) => $q->whereDate('date', $today),
        ]);

        if ($classId) {
            $classesQuery->where('id', $classId);
        }

        $classes = $classesQuery->get()->map(function (Classroom $classroom) use ($statusFilter) {
            $students = $classroom->students->map(function (StudentDetail $student) {
                $att = $student->attendances->first();

                return [
                    'id'       => $student->id,
                    'name'     => $student->user?->name ?? '-',
                    'nisn'     => $student->nisn,
                    'status'   => $att?->status ?? 'Belum',
                    'time_in'  => $att?->time_in,
                    'time_out' => $att?->time_out,
                    'note'     => $att?->note,
                ];
            });

            // Filter status setelah mapping (agar persen tetap akurat)
            $filtered = $statusFilter
                ? $students->filter(fn ($s) => $s['status'] === $statusFilter)->values()
                : $students;

            $total = $classroom->students->count();
            $hadir = $students->where('status', 'Hadir')->count();

            return [
                'id'       => $classroom->id,
                'name'     => $classroom->nama_kelas,
                'jurusan'  => $classroom->jurusan,
                'total'    => $total,
                'hadir'    => $hadir,
                'persen'   => $total > 0 ? round(($hadir / $total) * 100) : 0,
                'students' => $filtered,
            ];
        });

        // ── Recent check-ins (live feed) ──────────────────────────────────────
        $recentCheckins = Attendance::with(['student.user', 'student.classroom'])
            ->whereDate('date', $today)
            ->where('status', 'Hadir')
            ->whereNotNull('time_in')
            ->orderByDesc('time_in')
            ->take(15)
            ->get()
            ->map(fn ($att) => [
                'id'        => $att->id,
                'name'      => $att->student?->user?->name ?? '-',
                'classroom' => $att->student?->classroom?->nama_kelas ?? '-',
                'time_in'   => $att->time_in,
                'photo'     => $att->photo_path,
            ]);

        // ── Dropdown filter kelas ─────────────────────────────────────────────
        $classOptions = Classroom::orderBy('nama_kelas')
            ->get(['id', 'nama_kelas', 'jurusan']);

        return Inertia::render('Admin/Monitor', [
            'summary'        => $summary,
            'byClass'        => $classes->values(),
            'recentCheckins' => $recentCheckins,
            'classOptions'   => $classOptions,
            'filterClass'    => $classId ? (int) $classId : null,
            'filterStatus'   => $statusFilter,
            'today'          => today()->translatedFormat('l, d F Y'),
        ]);
    }
}