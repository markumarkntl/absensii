<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentDetail extends Model
{
    protected $fillable = [
        'user_id', 'classroom_id', 'nisn',
        'jenis_kelamin', 'foto_profil',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class, 'student_id');
    }

    public function permissions(): HasMany
    {
        return $this->hasMany(Permission::class, 'student_id');
    }

    // Absensi hari ini (helper)
    public function todayAttendance()
    {
        return $this->attendances()
                    ->whereDate('date', today())
                    ->first();
    }
}