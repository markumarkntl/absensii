<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicYear extends Model
{
    protected $fillable = ['tahun', 'semester', 'status_aktif'];

    protected $casts = [
        'status_aktif' => 'boolean',
        'semester'     => 'integer',
    ];

    // Hanya boleh ada 1 tahun ajaran aktif
    public function scopeActive($query)
    {
        return $query->where('status_aktif', true);
    }

    public function classrooms(): HasMany
    {
        return $this->hasMany(Classroom::class);
    }
}