<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            // Apakah siswa terlambat?
            $table->boolean('is_late')->default(false)->after('time_in');

            // Status izin terlambat dari admin
            $table->enum('late_permission_status', ['Pending', 'Approved', 'Rejected'])
                  ->nullable()
                  ->after('is_late');

            // Admin yang memproses izin terlambat
            $table->foreignId('late_approved_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete()
                  ->after('late_permission_status');

            $table->timestamp('late_approved_at')->nullable()->after('late_approved_by');

            // Alasan terlambat dari siswa
            $table->string('late_reason')->nullable()->after('late_approved_at');
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropForeign(['late_approved_by']);
            $table->dropColumn([
                'is_late',
                'late_permission_status',
                'late_approved_by',
                'late_approved_at',
                'late_reason',
            ]);
        });
    }
};