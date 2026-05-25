<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ── Auto Alfa Scheduler ───────────────────────────────────────────────────────
// Jalankan setiap hari pukul 23:59 WIB
// Menandai siswa yang tidak absen hari ini menjadi Alfa
Schedule::command('attendance:mark-absent')
    ->dailyAt('23:59')
    ->timezone('Asia/Jakarta')
    ->withoutOverlapping()
    ->runInBackground()
    ->description('Tandai siswa tidak hadir sebagai Alfa setiap malam');