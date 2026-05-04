<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')
                  ->constrained('student_details')
                  ->cascadeOnDelete();
            $table->date('date');
            $table->time('time_in')->nullable();
            $table->time('time_out')->nullable();
            $table->enum('status', ['Hadir', 'Sakit', 'Izin', 'Alfa'])
                  ->default('Alfa');
            $table->decimal('lat_in', 10, 7)->nullable();  // ±90.0000000
            $table->decimal('long_in', 11, 7)->nullable(); // ±180.0000000
            $table->string('photo_path')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            // Satu siswa hanya 1 record per hari
            $table->unique(['student_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};