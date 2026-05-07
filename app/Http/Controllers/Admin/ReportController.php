<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Attendance;
use App\Models\Classroom;
use App\Models\StudentDetail;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * GET /admin/laporan
     *
     * Tampilkan laporan rekap absensi.
     * Filter yang didukung:
     *  - classroom_id  : filter per kelas
     *  - date_from     : tanggal mulai (default: awal bulan ini)
     *  - date_to       : tanggal akhir (default: hari ini)
     *  - student_id    : filter per siswa (untuk detail individu)
     */
    public function index(Request $request): Response
    {
        $request->validate([
            'date_from'    => ['nullable', 'date'],
            'date_to'      => ['nullable', 'date', 'after_or_equal:date_from'],
            'classroom_id' => ['nullable', 'integer', 'exists:classrooms,id'],
            'student_id'   => ['nullable', 'integer', 'exists:student_details,id'],
        ]);

        // ── Default filter ────────────────────────────────────────────────────
        $dateFrom   = $request->date_from  ? Carbon::parse($request->date_from) : now()->startOfMonth();
        $dateTo     = $request->date_to    ? Carbon::parse($request->date_to)   : now();
        $classId    = $request->classroom_id;
        $studentId  = $request->student_id;

        // Jumlah hari efektif (Senin–Jumat) dalam rentang
        $effectiveDays = $this->countEffectiveDays($dateFrom, $dateTo);

        // ── Query siswa ───────────────────────────────────────────────────────
        $studentsQuery = StudentDetail::with([
            'user:id,name,email',
            'classroom:id,nama_kelas,jurusan',
        ])->when($classId,   fn ($q) => $q->where('classroom_id', $classId))
          ->when($studentId, fn ($q) => $q->where('id', $studentId));

        $students = $studentsQuery->get();

        // ── Ambil semua attendance dalam rentang (batch, bukan N+1) ──────────
        $studentIds = $students->pluck('id');

        $attendances = Attendance::whereIn('student_id', $studentIds)
            ->whereBetween('date', [$dateFrom->toDateString(), $dateTo->toDateString()])
            ->get()
            ->groupBy('student_id');

        // ── Hitung rekap per siswa ────────────────────────────────────────────
        $report = $students->map(function (StudentDetail $student) use ($attendances, $effectiveDays) {
            $recs   = $attendances->get($student->id, collect());

            $hadir  = $recs->where('status', 'Hadir')->count();
            $sakit  = $recs->where('status', 'Sakit')->count();
            $izin   = $recs->where('status', 'Izin')->count();
            $alfa   = $recs->where('status', 'Alfa')->count();
            $belum  = max(0, $effectiveDays - $hadir - $sakit - $izin - $alfa);
            $persen = $effectiveDays > 0 ? round(($hadir / $effectiveDays) * 100, 1) : 0;

            return [
                'id'            => $student->id,
                'name'          => $student->user?->name ?? '-',
                'nisn'          => $student->nisn,
                'classroom'     => $student->classroom?->nama_kelas ?? '-',
                'jurusan'       => $student->classroom?->jurusan ?? '-',
                'hadir'         => $hadir,
                'sakit'         => $sakit,
                'izin'          => $izin,
                'alfa'          => $alfa,
                'belum'         => $belum,
                'total_efektif' => $effectiveDays,
                'persen_hadir'  => $persen,
            ];
        })->sortByDesc('persen_hadir')->values();

        // ── Statistik ringkasan ───────────────────────────────────────────────
        $summary = [
            'total_siswa'    => $report->count(),
            'rata_hadir'     => $report->avg('persen_hadir') ? round($report->avg('persen_hadir'), 1) : 0,
            'total_hadir'    => $report->sum('hadir'),
            'total_sakit'    => $report->sum('sakit'),
            'total_izin'     => $report->sum('izin'),
            'total_alfa'     => $report->sum('alfa'),
            'effective_days' => $effectiveDays,
        ];

        // ── Dropdown option ───────────────────────────────────────────────────
        $classOptions = Classroom::orderBy('nama_kelas')->get(['id', 'nama_kelas', 'jurusan']);

        // Opsi siswa (hanya jika kelas dipilih, biar tidak terlalu banyak)
        $studentOptions = $classId
            ? StudentDetail::with('user:id,name')
                ->where('classroom_id', $classId)
                ->orderBy('id')
                ->get()
                ->map(fn ($s) => ['id' => $s->id, 'name' => $s->user?->name ?? '-', 'nisn' => $s->nisn])
            : collect();

        return Inertia::render('Admin/Laporan/Index', [
            'report'         => $report,
            'summary'        => $summary,
            'classOptions'   => $classOptions,
            'studentOptions' => $studentOptions,
            'filters'        => [
                'date_from'    => $dateFrom->toDateString(),
                'date_to'      => $dateTo->toDateString(),
                'classroom_id' => $classId ? (int) $classId : null,
                'student_id'   => $studentId ? (int) $studentId : null,
            ],
        ]);
    }

    /**
     * GET /admin/laporan/export
     *
     * Export laporan ke CSV. Filter sama seperti index().
     */
    public function export(Request $request): HttpResponse
    {
        $request->validate([
            'date_from'    => ['nullable', 'date'],
            'date_to'      => ['nullable', 'date', 'after_or_equal:date_from'],
            'classroom_id' => ['nullable', 'integer', 'exists:classrooms,id'],
        ]);

        $dateFrom  = $request->date_from ? Carbon::parse($request->date_from) : now()->startOfMonth();
        $dateTo    = $request->date_to   ? Carbon::parse($request->date_to)   : now();
        $classId   = $request->classroom_id;

        $effectiveDays = $this->countEffectiveDays($dateFrom, $dateTo);

        $students = StudentDetail::with(['user:id,name', 'classroom:id,nama_kelas,jurusan'])
            ->when($classId, fn ($q) => $q->where('classroom_id', $classId))
            ->get();

        $attendances = Attendance::whereIn('student_id', $students->pluck('id'))
            ->whereBetween('date', [$dateFrom->toDateString(), $dateTo->toDateString()])
            ->get()
            ->groupBy('student_id');

        // ── Build CSV ─────────────────────────────────────────────────────────
        $rows   = [];
        $rows[] = ['No', 'Nama Siswa', 'NISN', 'Kelas', 'Jurusan',
                   'Hadir', 'Sakit', 'Izin', 'Alfa', 'Belum Tercatat',
                   'Hari Efektif', '% Kehadiran'];

        foreach ($students as $i => $student) {
            $recs  = $attendances->get($student->id, collect());
            $hadir = $recs->where('status', 'Hadir')->count();
            $sakit = $recs->where('status', 'Sakit')->count();
            $izin  = $recs->where('status', 'Izin')->count();
            $alfa  = $recs->where('status', 'Alfa')->count();
            $belum = max(0, $effectiveDays - $hadir - $sakit - $izin - $alfa);
            $persen = $effectiveDays > 0 ? round(($hadir / $effectiveDays) * 100, 1) : 0;

            $rows[] = [
                $i + 1,
                $student->user?->name ?? '-',
                $student->nisn,
                $student->classroom?->nama_kelas ?? '-',
                $student->classroom?->jurusan ?? '-',
                $hadir, $sakit, $izin, $alfa, $belum,
                $effectiveDays,
                $persen . '%',
            ];
        }

        $filename = 'laporan-absensi_' . $dateFrom->format('Ymd') . '_' . $dateTo->format('Ymd') . '.csv';

        $csv = collect($rows)
            ->map(fn ($row) => implode(',', array_map(fn ($v) => '"' . str_replace('"', '""', $v) . '"', $row)))
            ->implode("\n");

        return response($csv, 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    // ── Helper ─────────────────────────────────────────────────────────────────

    /**
     * Hitung jumlah hari efektif (Senin–Jumat) dalam rentang tanggal.
     */
    private function countEffectiveDays(Carbon $from, Carbon $to): int
    {
        $count = 0;
        foreach (CarbonPeriod::create($from, $to) as $date) {
            if (!$date->isWeekend()) {
                $count++;
            }
        }
        return $count;
    }
}