<?php

namespace App\Events;

use App\Models\Attendance;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LatePermissionUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $data;

    public function __construct(Attendance $attendance, string $action)
    {
        $attendance->load('student.user', 'student.classroom');

        $this->data = [
            'id'                     => $attendance->id,
            'student_name'           => $attendance->student?->user?->name ?? '-',
            'nisn'                   => $attendance->student?->nisn ?? '-',
            'classroom'              => $attendance->student?->classroom?->nama_kelas ?? '-',
            'date'                   => $attendance->date?->toDateString(),
            'time_in'                => $attendance->time_in,
            'late_reason'            => $attendance->late_reason,
            'late_permission_status' => $attendance->late_permission_status,
            'action'                 => $action, // 'new' | 'approved' | 'rejected'
            'updated_at'             => now()->toDateTimeString(),
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin.late-permission'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'late-permission.updated';
    }
}