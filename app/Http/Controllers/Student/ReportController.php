<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Services\AttendanceService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __construct(
        private readonly AttendanceService $attendanceService
    ) {}

    /**
     * GET /siswa/laporan?year=2026
     */
    public function index(Request $request): Response
    {
        /** @var \App\Models\User $user */
        $user    = $request->user();
        $student = $user->studentDetail;

        $year = (int) $request->query('year', now()->year);
        $year = max(2024, min($year, now()->year));

        // Statistik tahunan
        $yearlyStats = $this->attendanceService->getYearlyStats($student, $year);

        // Tren 6 bulan terakhir (untuk chart)
        $sixMonthsStats = $this->attendanceService->getSixMonthsStats($student);

        return Inertia::render('Siswa/Laporan/Index', [
            'yearlyStats'    => $yearlyStats,
            'sixMonthsStats' => $sixMonthsStats,
            'filterYear'     => $year,
            'currentYear'    => (int) now()->year,
        ]);
    }
}