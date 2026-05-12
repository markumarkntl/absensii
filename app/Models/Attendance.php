<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
   protected $fillable = [
    'student_id', 'date', 'time_in', 'time_out',
    'status', 'lat_in', 'long_in', 'photo_path', 'note',
    'is_late', 'late_permission_status', 'late_approved_by',
    'late_approved_at', 'late_reason',
];

protected $casts = [
    'date'             => 'date',
    'lat_in'           => 'decimal:7',
    'long_in'          => 'decimal:7',
    'is_late'          => 'boolean',
    'late_approved_at' => 'datetime',
];

    public function student(): BelongsTo
    {
        return $this->belongsTo(StudentDetail::class, 'student_id');
    }

    // Scope filter per status
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    // Scope filter per bulan
    public function scopeThisMonth($query)
    {
        return $query->whereMonth('date', now()->month)
                     ->whereYear('date', now()->year);
    }
}