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
     *  - summary        : ringkasan Hadir / Sakit / Izin / Alfa / Belum Absen
     *  - byClass        : daftar kelas + status tiap siswa hari ini
     *  - recentCheckins : 15 check-in terbaru (untuk live feed)
     *  - filterClass    : nilai filter kelas aktif
     *  - filterStatus   : nilai filter status aktif
     *  - search         : kata kunci pencarian nama siswa
     */
    public function index(Request $request): Response
    {
        $today        = today()->toDateString();
        $classId      = $request->query('kelas');
        $statusFilter = $request->query('status');
        $search       = trim((string) $request->query('search', ''));

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
        $belumAbsen = max(0, $totalSiswa - $sudahAbsen);

        $summary = [
            'total'       => $totalSiswa,
            'hadir'       => $totalHadir,
            'sakit'       => $totalSakit,
            'izin'        => $totalIzin,
            'alfa'        => $totalAlfa,
            'belum'       => $belumAbsen,
            'persenHadir' => $totalSiswa > 0 ? round(($totalHadir / $totalSiswa) * 100) : 0,
        ];

        // ── Ambil semua absensi hari ini, index by student_id ─────────────────
        $todayAttendances = Attendance::whereDate('date', $today)
            ->get()
            ->keyBy('student_id');

        // ── Data per kelas ────────────────────────────────────────────────────
        $classesQuery = Classroom::with(['students.user']);

        if ($classId) {
            $classesQuery->where('id', $classId);
        }

        $classes = $classesQuery->get()->map(function (Classroom $classroom) use (
            $todayAttendances,
            $statusFilter,
            $search
        ) {
            $students = $classroom->students->map(function (StudentDetail $student) use ($todayAttendances) {
                $att = $todayAttendances->get($student->id);

                return [
                    'id'                     => $student->id,
                    'name'                   => $student->user?->name ?? '-',
                    'nisn'                   => $student->nisn,
                    'status'                 => $att?->status ?? 'Belum',
                    'time_in'                => $att?->time_in,
                    'time_out'               => $att?->time_out,
                    'note'                   => $att?->note,
                    'is_late'                => $att?->is_late ?? false,
                    'late_permission_status' => $att?->late_permission_status,
                ];
            });

            // Filter nama siswa (search)
            if ($search !== '') {
                $students = $students->filter(
                    fn ($s) => str_contains(strtolower($s['name']), strtolower($search))
                );
            }

            // Filter status — 'Belum' tidak ada di DB jadi filter di PHP
            if ($statusFilter) {
                $students = $students->filter(fn ($s) => $s['status'] === $statusFilter);
            }

            $students = $students->values();

            $total = $classroom->students->count();
            $hadir = $todayAttendances
                ->filter(fn ($a) =>
                    $classroom->students->pluck('id')->contains($a->student_id)
                    && $a->status === 'Hadir'
                )
                ->count();

            return [
                'id'       => $classroom->id,
                'name'     => $classroom->nama_kelas,
                'jurusan'  => $classroom->jurusan,
                'total'    => $total,
                'hadir'    => $hadir,
                'persen'   => $total > 0 ? round(($hadir / $total) * 100) : 0,
                'students' => $students,
            ];
        });

        // Sembunyikan kelas tanpa siswa yang match filter
        if ($statusFilter || $search !== '') {
            $classes = $classes->filter(fn ($k) => count($k['students']) > 0);
        }

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
            'search'         => $search,
            'today'          => today()->translatedFormat('l, d F Y'),
        ]);
    }
}