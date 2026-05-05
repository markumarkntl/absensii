<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('permissions', function (Blueprint $table) {
            // Menambahkan kolom is_approved setelah kolom guard_name
            // Kita gunakan default 'Pending' agar data lama tidak bernilai null
            $table->string('is_approved')->default('Pending')->after('guard_name');
            
            /* 
               OPSI LAIN: Jika ingin menggunakan Enum agar pilihan status terbatas
               $table->enum('is_approved', ['Pending', 'Approved', 'Rejected'])->default('Pending')->after('guard_name');
            */
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('permissions', function (Blueprint $table) {
            // Menghapus kolom jika migration di-rollback
            $table->dropColumn('is_approved');
        });
    }
};