<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Services\AttendanceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function __construct(
        private readonly AttendanceService $attendanceService
    ) {}

    // -------------------------------------------------------------------------
    // Halaman Presensi
    // -------------------------------------------------------------------------

    /**
     * GET /siswa/presensi
     * Tampilkan halaman presensi beserta status absen hari ini.
     */
    public function index(Request $request): Response
    {
        /** @var \App\Models\User $user */
        $user    = $request->user();
        $student = $user->studentDetail;

        $todayAttendance = $this->attendanceService->getTodayAttendance($student);

        return Inertia::render('Siswa/Presensi', [
            'todayAttendance' => $todayAttendance,
            'hasCheckedIn'    => (bool) $todayAttendance,

            // Kirim config sekolah ke frontend untuk validasi radius di UI
            'schoolConfig' => [
                'lat'    => (float) config('sass.school_lat'),
                'lng'    => (float) config('sass.school_lng'),
                'radius' => (int)   config('sass.attendance_radius_meters'),
                'name'   => config('sass.school_name'),
            ],

            'deadline'       => config('sass.attendance_deadline'),
            'attendanceOpen' => config('sass.attendance_open'),
        ]);
    }

    // -------------------------------------------------------------------------
    // Proses Absen
    // -------------------------------------------------------------------------

    /**
     * POST /siswa/presensi
     * Simpan absensi siswa (check-in).
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        /** @var \App\Models\User $user */
        $user    = $request->user();
        $student = $user->studentDetail;

        $result = $this->attendanceService->checkIn(
            student: $student,
            lat:     null,
            lng:     null,
            photo:   $request->file('photo'),
        );

        if (! $result['success']) {
            return back()->with('error', $result['message']);
        }

        return redirect()->route('siswa.presensi')->with('success', $result['message']);
    }

    // -------------------------------------------------------------------------
    // Riwayat Kehadiran
    // -------------------------------------------------------------------------

    /**
     * GET /siswa/riwayat?year=2026&month=5
     * Tampilkan riwayat kehadiran per bulan.
     */
    public function history(Request $request): Response
    {
        /** @var \App\Models\User $user */
        $user    = $request->user();
        $student = $user->studentDetail;

        // Ambil filter bulan/tahun dari query string, fallback ke bulan ini
        $year  = (int) $request->query('year',  now()->year);
        $month = (int) $request->query('month', now()->month);

        // Batasi ke range yang masuk akal
        $year  = max(2020, min($year,  now()->year));
        $month = max(1,    min($month, 12));

        $history = $this->attendanceService->getMonthlyHistory($student, $year, $month);
        $stats   = $this->attendanceService->getMonthlyStats($student, $year, $month);

        return Inertia::render('Siswa/Riwayat', [
            'history'      => $history,
            'stats'        => $stats,
            'filterYear'   => $year,
            'filterMonth'  => $month,
            'currentYear'  => (int) now()->year,
            'currentMonth' => (int) now()->month,
        ]);
    }
}