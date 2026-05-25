<?php

namespace App\Console\Commands;

use App\Models\Attendance;
use App\Models\StudentDetail;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Console\Command;

/**
 * MarkAbsentStudentsCommand
 *
 * Jalankan setiap hari (dijadwalkan via routes/console.php).
 * Fungsi: isi record Alfa untuk setiap siswa yang TIDAK absen
 *         pada hari kerja (Senin–Jumat) yang sudah lewat.
 *
 * Cakupan: hari kemarin saja (default) agar tidak lambat,
 *          atau rentang khusus via opsi --from / --to.
 *
 * Contoh penggunaan manual:
 *   php artisan attendance:mark-absent
 *   php artisan attendance:mark-absent --from=2026-05-01 --to=2026-05-25
 */
class MarkAbsentStudentsCommand extends Command
{
    protected $signature = 'attendance:mark-absent
                            {--from= : Tanggal mulai (Y-m-d), default: kemarin}
                            {--to=   : Tanggal akhir  (Y-m-d), default: kemarin}';

    protected $description = 'Isi status Alfa untuk siswa yang tidak absen di hari kerja yang telah lewat';

    public function handle(): int
    {
        // ── Tentukan rentang tanggal ──────────────────────────────────────────
        $from = $this->option('from')
            ? Carbon::parse($this->option('from'))->startOfDay()
            : Carbon::yesterday()->startOfDay();

        $to = $this->option('to')
            ? Carbon::parse($this->option('to'))->startOfDay()
            : Carbon::yesterday()->startOfDay();

        // Jangan proses hari ini atau masa depan
        if ($to->gte(Carbon::today())) {
            $to = Carbon::yesterday()->startOfDay();
        }

        if ($from->gt($to)) {
            $this->error('Tanggal --from tidak boleh setelah --to.');
            return self::FAILURE;
        }

        // ── Ambil semua student ID sekali ─────────────────────────────────────
        $allStudentIds = StudentDetail::pluck('id')->toArray();

        if (empty($allStudentIds)) {
            $this->info('Tidak ada siswa di database.');
            return self::SUCCESS;
        }

        $totalMarked = 0;

        // ── Iterasi setiap hari kerja dalam rentang ───────────────────────────
        foreach (CarbonPeriod::create($from, $to) as $date) {
            // Lewati Sabtu & Minggu
            if ($date->isWeekend()) {
                continue;
            }

            $dateStr = $date->toDateString();

            // Siswa yang sudah punya record absensi hari itu (Hadir/Sakit/Izin/Alfa)
            $presentIds = Attendance::whereDate('date', $dateStr)
                ->whereIn('student_id', $allStudentIds)
                ->pluck('student_id')
                ->toArray();

            // Siswa yang belum ada record sama sekali
            $absentIds = array_diff($allStudentIds, $presentIds);

            if (empty($absentIds)) {
                $this->line("[{$dateStr}] Semua siswa sudah tercatat.");
                continue;
            }

            // Batch insert agar tidak lambat
            $records = array_map(fn ($sid) => [
                'student_id' => $sid,
                'date'       => $dateStr,
                'time_in'    => null,
                'time_out'   => null,
                'status'     => 'Alfa',
                'note'       => 'Otomatis: tidak absen',
                'created_at' => now(),
                'updated_at' => now(),
            ], $absentIds);

            // insertOrIgnore: jika sudah ada record (race condition), lewati
            Attendance::insertOrIgnore($records);

            $count = count($absentIds);
            $totalMarked += $count;
            $this->line("[{$dateStr}] {$count} siswa ditandai Alfa.");
        }

        $this->info("Selesai. Total {$totalMarked} record Alfa berhasil ditambahkan.");
        return self::SUCCESS;
    }
}