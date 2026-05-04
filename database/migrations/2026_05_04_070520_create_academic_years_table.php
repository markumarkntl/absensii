<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_years', function (Blueprint $table) {
            $table->id();
            $table->string('tahun', 9);          // e.g. "2025/2026"
            $table->tinyInteger('semester');      // 1 atau 2
            $table->boolean('status_aktif')->default(false);
            $table->timestamps();

            $table->unique(['tahun', 'semester']); // Mencegah duplikat
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_years');
    }
};