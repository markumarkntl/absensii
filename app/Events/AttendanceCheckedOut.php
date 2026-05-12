<?php

namespace App\Events;

use App\Models\Attendance;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AttendanceCheckedOut implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $data;

    public function __construct(Attendance $attendance)
    {
        $attendance->load('student.user', 'student.classroom');

        $this->data = [
            'id'             => $attendance->id,
            'student_name'   => $attendance->student?->user?->name ?? '-',
            'nisn'           => $attendance->student?->nisn ?? '-',
            'classroom'      => $attendance->student?->classroom?->nama_kelas ?? '-',
            'date'           => $attendance->date?->toDateString(),
            'time_in'        => $attendance->time_in,
            'time_out'       => $attendance->time_out,
            'status'         => $attendance->status,
            'checked_out_at' => now()->toDateTimeString(),
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin.attendance'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'attendance.checked-out';
    }
}