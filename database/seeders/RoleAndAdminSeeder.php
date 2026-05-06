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

        // ── 4. Data Sample Kelas ──────────────────────────────────────────────
        $kelasData = [
            ['nama_kelas' => 'X RPL 1',   'jurusan' => 'Rekayasa Perangkat Lunak'],
            ['nama_kelas' => 'X RPL 2',   'jurusan' => 'Rekayasa Perangkat Lunak'],
            ['nama_kelas' => 'XI RPL 1',  'jurusan' => 'Rekayasa Perangkat Lunak'],
            ['nama_kelas' => 'XI RPL 2',  'jurusan' => 'Rekayasa Perangkat Lunak'],
            ['nama_kelas' => 'XII RPL 1', 'jurusan' => 'Rekayasa Perangkat Lunak'],
            ['nama_kelas' => 'XII RPL 2', 'jurusan' => 'Rekayasa Perangkat Lunak'],
        ];

        foreach ($kelasData as $kelas) {
            Classroom::firstOrCreate(
                [
                    'nama_kelas'       => $kelas['nama_kelas'],
                    'academic_year_id' => $academicYear->id,
                ],
                ['jurusan' => $kelas['jurusan']]
            );
        }

        $this->command->info('✅ Role, admin, tahun ajaran, dan kelas berhasil dibuat.');
        $this->command->info('   Admin login: admin@sekolah.com / password');
    }
}