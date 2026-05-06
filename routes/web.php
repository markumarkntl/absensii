<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Student;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route('dashboard'));

Route::middleware(['auth', 'verified'])->group(function () {

    // ── SISWA ─────────────────────────────────────────────────────────────────
    Route::middleware('role:siswa')->prefix('siswa')->name('siswa.')->group(function () {
        Route::get('/dashboard', [Student\DashboardController::class,  'index'])  ->name('dashboard');
        Route::get('/presensi',  [Student\AttendanceController::class, 'index'])  ->name('presensi');
        Route::post('/presensi', [Student\AttendanceController::class, 'store'])  ->name('presensi.store');
        Route::get('/riwayat',   [Student\AttendanceController::class, 'history'])->name('riwayat');
        Route::get('/izin',      [Student\PermissionController::class, 'index'])  ->name('izin');
        Route::post('/izin',     [Student\PermissionController::class, 'store'])  ->name('izin.store');
        Route::get('/profil',    [Student\ProfileController::class,    'index'])  ->name('profil');
    });

    // ── ADMIN ─────────────────────────────────────────────────────────────────
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard',   [Admin\DashboardController::class,  'index'])  ->name('dashboard');
        Route::get('/monitor',     [Admin\MonitorController::class,    'index'])  ->name('monitor');

        // Manajemen Siswa (CRUD)
        Route::get('/siswa',              [Admin\StudentController::class,   'index'])  ->name('siswa');
        Route::post('/siswa',             [Admin\StudentController::class,   'store'])  ->name('siswa.store');
        Route::put('/siswa/{student}',    [Admin\StudentController::class,   'update']) ->name('siswa.update');
        Route::delete('/siswa/{student}', [Admin\StudentController::class,   'destroy'])->name('siswa.destroy');

        // Manajemen Kelas (CRUD)
        Route::get('/kelas',               [Admin\ClassroomController::class, 'index'])  ->name('kelas');
        Route::post('/kelas',              [Admin\ClassroomController::class, 'store'])  ->name('kelas.store');
        Route::put('/kelas/{classroom}',   [Admin\ClassroomController::class, 'update']) ->name('kelas.update');
        Route::delete('/kelas/{classroom}',[Admin\ClassroomController::class, 'destroy'])->name('kelas.destroy');

        // Izin
        Route::get('/izin',        [Admin\PermissionController::class, 'index'])  ->name('izin');
        Route::patch('/izin/{id}', [Admin\PermissionController::class, 'approve'])->name('izin.approve');

        // Laporan
        Route::get('/laporan',     [Admin\ReportController::class,     'index'])  ->name('laporan');
    });

    // ── Redirect /dashboard berdasarkan role ──────────────────────────────────
    Route::get('/dashboard', function () {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        return $user->isAdmin()
            ? redirect()->route('admin.dashboard')
            : redirect()->route('siswa.dashboard');
    })->name('dashboard');
});

require __DIR__.'/auth.php';