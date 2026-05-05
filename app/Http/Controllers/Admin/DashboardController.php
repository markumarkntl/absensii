<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Classroom;
use App\Models\Permission;
use App\Models\StudentDetail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * GET /admin/dashboard
     * Dashboard admin: ringkasan absen hari ini, statistik per kelas,
     * izin pending, dan daftar absensi real-time terbaru.
     */
    public function index(Request $request): Response
    {
        $today = today()->toDateString();

        // ── Ringkasan absensi hari ini ────────────────────────────────────────
        $todayStats = Attendance::whereDate('date', $today)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $totalStudents  = StudentDetail::count();
        $totalHadir     = (int) ($todayStats['Hadir'] ?? 0);
        $totalSakit     = (int) ($todayStats['Sakit'] ?? 0);
        $totalIzin      = (int) ($todayStats['Izin']  ?? 0);
        $totalAlfa      = (int) ($todayStats['Alfa']  ?? 0);
        $totalBelumAbsen = $totalStudents - Attendance::whereDate('date', $today)->count();

        // ── Statistik per kelas ───────────────────────────────────────────────
        $classStats = Classroom::with([
            'students.attendances' => fn ($q) => $q->whereDate('date', $today),
        ])->get()->map(function (Classroom $classroom) {
            $total   = $classroom->students->count();
            $hadir   = $classroom->students
                ->filter(fn ($s) => $s->attendances->where('status', 'Hadir')->isNotEmpty())
                ->count();

            return [
                'id'     => $classroom->id,
                'name'   => $classroom->name,
                'total'  => $total,
                'hadir'  => $hadir,
                'persen' => $total > 0 ? round(($hadir / $total) * 100) : 0,
            ];
        });

        // ── Izin pending (preview 5 terbaru) ─────────────────────────────────
        $pendingPermissions = Permission::with(['student.user', 'student.classroom'])
            ->where('is_approved', 'Pending')
            ->orderBy('created_at')
            ->take(5)
            ->get();

        // ── Absensi real-time terbaru hari ini (10 terakhir) ─────────────────
        $latestAttendances = Attendance::with(['student.user', 'student.classroom'])
            ->whereDate('date', $today)
            ->where('status', 'Hadir')
            ->orderByDesc('time_in')
            ->take(10)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'summary' => [
                'total_students' => $totalStudents,
                'hadir'          => $totalHadir,
                'sakit'          => $totalSakit,
                'izin'           => $totalIzin,
                'alfa'           => $totalAlfa,
                'belum_absen'    => $totalBelumAbsen,
                'izin_pending'   => Permission::where('is_approved', 'Pending')->count(),
            ],
            'classStats'         => $classStats,
            'pendingPermissions' => $pendingPermissions,
            'latestAttendances'  => $latestAttendances,
        ]);
    }
}