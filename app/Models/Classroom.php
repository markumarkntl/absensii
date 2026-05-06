<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Classroom extends Model
{
    protected $fillable = [
        'nama_kelas',
        'jurusan',
        'academic_year_id',
    ];

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function students(): HasMany
    {
        return $this->hasMany(StudentDetail::class);
    }

    /**
     * Jumlah siswa di kelas ini.
     */
    public function getStudentCountAttribute(): int
    {
        return $this->students()->count();
    }
}