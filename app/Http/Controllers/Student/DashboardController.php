<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Services\AttendanceService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly AttendanceService $attendanceService
    ) {}

    /**
     * GET /siswa/dashboard
     * Dashboard siswa: status absen hari ini + statistik bulanan + chart 6 bulan.
     */
    public function index(Request $request): Response
    {
        /** @var \App\Models\User $user */
        $user    = $request->user();
        $student = $user->studentDetail->load('classroom');

        $todayAttendance = $this->attendanceService->getTodayAttendance($student);
        $monthlyStats    = $this->attendanceService->getMonthlyStats($student, (int) now()->year, (int) now()->month);
        $sixMonthsStats  = $this->attendanceService->getSixMonthsStats($student);

        return Inertia::render('Siswa/Dashboard', [
            'todayAttendance' => $todayAttendance,
            'monthlyStats'    => $monthlyStats,
            'sixMonthsStats'  => $sixMonthsStats,
            'deadline'        => config('sass.attendance_deadline'),
            'attendanceOpen'  => config('sass.attendance_open'),
        ]);
    }
}