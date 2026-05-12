<?php

use Illuminate\Support\Facades\Broadcast;

// Channel admin (sudah ada sebelumnya)
Broadcast::channel('admin.attendance', function ($user) {
    return $user->hasRole('admin');
});

Broadcast::channel('admin.late-permission', function ($user) {
    return $user->hasRole('admin');
});

Broadcast::channel('admin.permission', function ($user) {
    return $user->hasRole('admin');
});

//  Channel private per siswa
Broadcast::channel('siswa.{studentId}', function ($user, $studentId) {
    return (int) $user->studentDetail?->id === (int) $studentId;
});