<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class RoleAndAdminSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Buat Role ──────────────────────────────────────────────────────
        $adminRole = Role::firstOrCreate(['name' => 'admin',  'guard_name' => 'web']);
        $siswaRole = Role::firstOrCreate(['name' => 'siswa',  'guard_name' => 'web']);

        // ── 2. Buat Akun Admin Default ────────────────────────────────────────
        $admin = User::firstOrCreate(
            ['email' => 'admin@sekolah.com'],
            [
                'name'     => 'Administrator',
                'password' => Hash::make('password'),
            ]
        );
        $admin->syncRoles([$adminRole]);

        // ── 3. Tahun Ajaran Aktif ─────────────────────────────────────────────
        $academicYear = AcademicYear::firstOrCreate(
            ['tahun' => '2025/2026', 'semester' => 2],
            ['status_aktif' => true]
        );

        $this->command->info('✅ Role, admin, tahun ajaran, dan kelas berhasil dibuat.');
        $this->command->info('   Admin login: admin@sekolah.com / password');
    }
}