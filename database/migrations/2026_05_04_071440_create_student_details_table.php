<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->unique()                        // 1 user = 1 detail
                  ->constrained('users')
                  ->cascadeOnDelete();
            $table->foreignId('classroom_id')
                  ->constrained('classrooms')
                  ->restrictOnDelete();             // Jangan hapus kelas jika ada siswa
            $table->string('nisn', 10)->unique();
            $table->enum('jenis_kelamin', ['L', 'P']);
            $table->string('foto_profil')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_details');
    }
};