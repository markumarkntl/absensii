<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\StudentDetail;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;

class AttendanceService
{
    // -------------------------------------------------------------------------
    // GEOFENCING
    // -------------------------------------------------------------------------

    /**
     * Hitung jarak dua titik koordinat menggunakan Haversine formula.
     * Kembalikan jarak dalam meter.
     */
    public function calculateDistance(
        float $lat1,
        float $lng1,
        float $lat2,
        float $lng2
    ): float {
        $earthRadius = 6371000; // meter

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2))
            * sin($dLng / 2) ** 2;

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Cek apakah koordinat siswa masuk dalam radius sekolah.
     */
    public function isWithinRadius(float $studentLat, float $studentLng): bool
    {
        $schoolLat     = (float) config('sass.school_lat');
        $schoolLng     = (float) config('sass.school_lng');
        $allowedRadius = (int)   config('sass.attendance_radius_meters');

        $distance = $this->calculateDistance($schoolLat, $schoolLng, $studentLat, $studentLng);

        return $distance <= $allowedRadius;
    }

    /**
     * Ambil jarak siswa dari sekolah dalam meter.
     */
    public function getDistanceFromSchool(float $studentLat, float $studentLng): float
    {
        $schoolLat = (float) config('sass.school_lat');
        $schoolLng = (float) config('sass.school_lng');

        return $this->calculateDistance($schoolLat, $schoolLng, $studentLat, $studentLng);
    }

    // -------------------------------------------------------------------------
    // ABSENSI HARIAN
    // -------------------------------------------------------------------------

    /**
     * Cek apakah siswa sudah absen hari ini.
     */
    public function hasCheckedInToday(StudentDetail $student): bool
    {
        return $student->attendances()
            ->whereDate('date', today())
            ->exists();
    }

    /**
     * Ambil record absensi siswa hari ini (null jika belum absen).
     */
    public function getTodayAttendance(StudentDetail $student): ?Attendance
    {
        return $student->attendances()
            ->whereDate('date', today())
            ->first();
    }

    /**
     * Simpan foto selfie ke storage/public/attendances/selfies/YYYY/MM/.
     * Kembalikan path relatif untuk disimpan ke database.
     */
    public function storeSelfie(UploadedFile $photo, int $studentId): string
    {
        $filename  = 'selfie_' . $studentId . '_' . now()->format('Ymd_His') . '.' . $photo->extension();
        $directory = 'attendances/selfies/' . now()->format('Y/m');

        return $photo->storeAs($directory, $filename, 'public');
    }

    /**
     * Proses check-in siswa.
     *
     * Urutan validasi:
     *   1. Jam absen belum berakhir
     *   2. Belum absen hari ini (cegah duplikat)
     *   3. Dalam radius sekolah (geofencing)
     *   4. Simpan foto selfie (opsional)
     *   5. Buat record Attendance
     *
     * @return array{success: bool, message: string, attendance?: Attendance}
     */
    public function checkIn(
        StudentDetail $student,
        ?float        $lat,
        ?float        $lng,
        ?UploadedFile $photo = null
    ): array {
        // 1. Cek deadline jam absen
        $deadline = Carbon::today()->setTimeFromTimeString(config('sass.attendance_deadline'));
        if (now()->gt($deadline)) {
            return [
                'success' => false,
                'message' => 'Waktu absen sudah berakhir pukul ' . $deadline->format('H:i') . ' WIB.',
            ];
        }

        // 2. Cegah absen ganda
        if ($this->hasCheckedInToday($student)) {
            return [
                'success' => false,
                'message' => 'Kamu sudah melakukan absen hari ini.',
            ];
        }

        // 3. Validasi radius geofencing (hanya jika koordinat tersedia)
        if ($lat !== null && $lng !== null) {
            if (! $this->isWithinRadius($lat, $lng)) {
                $distance = round($this->getDistanceFromSchool($lat, $lng));
                $radius   = config('sass.attendance_radius_meters');

                return [
                    'success' => false,
                    'message' => "Lokasi kamu terlalu jauh dari sekolah ({$distance} meter). Maksimal radius absen adalah {$radius} meter.",
                ];
            }
        }

        // 4. Simpan foto selfie
        $photoPath = null;
        if ($photo) {
            $photoPath = $this->storeSelfie($photo, $student->id);
        }

        // 5. Buat record absensi
        $attendance = Attendance::create([
            'student_id' => $student->id,
            'date'       => today(),
            'time_in'    => now()->format('H:i:s'),
            'status'     => 'Hadir',
            'lat_in'     => $lat,
            'long_in'    => $lng,
            'photo_path' => $photoPath,
        ]);

        return [
            'success'    => true,
            'message'    => 'Absen berhasil! Selamat belajar.',
            'attendance' => $attendance,
        ];
    }

    // -------------------------------------------------------------------------
    // STATISTIK TAHUNAN (untuk laporan siswa)
    // -------------------------------------------------------------------------

    /**
     * Statistik kehadiran siswa dalam satu tahun penuh.
     */
    public function getYearlyStats(StudentDetail $student, int $year): array
    {
        $attendances = $student->attendances()
            ->whereYear('date', $year)
            ->get();

        return [
            'hadir' => $attendances->where('status', 'Hadir')->count(),
            'sakit' => $attendances->where('status', 'Sakit')->count(),
            'izin'  => $attendances->where('status', 'Izin')->count(),
            'alfa'  => $attendances->where('status', 'Alfa')->count(),
        ];
    }
    // -------------------------------------------------------------------------
    // STATISTIK & RIWAYAT
    // -------------------------------------------------------------------------

    /**
     * Statistik kehadiran siswa untuk bulan tertentu.
     *
     * @return array{hadir: int, sakit: int, izin: int, alfa: int, total_hari_sekolah: int}
     */
    public function getMonthlyStats(StudentDetail $student, int $year, int $month): array
    {
        $records = $student->attendances()
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        return [
            'hadir'              => $records['Hadir'] ?? 0,
            'sakit'              => $records['Sakit'] ?? 0,
            'izin'               => $records['Izin']  ?? 0,
            'alfa'               => $records['Alfa']  ?? 0,
            'total_hari_sekolah' => array_sum($records),
        ];
    }

    /**
     * Daftar absensi siswa per bulan, diurutkan berdasarkan tanggal.
     * Dipakai untuk tampilan kalender dan list riwayat.
     */
    public function getMonthlyHistory(StudentDetail $student, int $year, int $month): Collection
    {
        return $student->attendances()
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->orderBy('date')
            ->get(['id', 'date', 'time_in', 'time_out', 'status', 'photo_path', 'note']);
    }

    /**
     * Statistik 6 bulan terakhir untuk chart dashboard.
     *
     * @return Collection<int, array{month: string, year: int, hadir: int, sakit: int, izin: int, alfa: int}>
     */
    public function getSixMonthsStats(StudentDetail $student): Collection
    {
        return collect(range(5, 0))->map(function (int $monthsAgo) use ($student) {
            $date = now()->subMonths($monthsAgo);

            return [
                'month' => $date->format('M'),
                'year'  => (int) $date->year,
                ...$this->getMonthlyStats($student, (int) $date->year, (int) $date->month),
            ];
        });
    }
}