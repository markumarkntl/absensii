<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permission_requests', function (Blueprint $table) {  // ← ganti nama
            $table->id();
            $table->foreignId('student_id')
                  ->constrained('student_details')
                  ->cascadeOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('type', ['Sakit', 'Izin']);
            $table->text('reason');
            $table->string('proof_file')->nullable();
            $table->enum('is_approved', ['Pending', 'Approved', 'Rejected'])
                  ->default('Pending');
            $table->foreignId('approved_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permission_requests');  // ← ganti nama
    }
};