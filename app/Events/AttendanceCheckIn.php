<?php

namespace App\Events;

use App\Models\Attendance;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AttendanceCheckedIn implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $data;

    public function __construct(Attendance $attendance)
    {
        $attendance->load('student.user', 'student.classroom');

        $this->data = [
            'id'            => $attendance->id,
            'student_name'  => $attendance->student?->user?->name ?? '-',
            'nisn'          => $attendance->student?->nisn ?? '-',
            'classroom'     => $attendance->student?->classroom?->nama_kelas ?? '-',
            'date'          => $attendance->date?->toDateString(),
            'time_in'       => $attendance->time_in,
            'status'        => $attendance->status,
            'is_late'       => $attendance->is_late,
            'late_reason'   => $attendance->late_reason,
            'photo_path'    => $attendance->photo_path,
            'checked_in_at' => now()->toDateTimeString(),
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
        return 'attendance.checked-in';
    }
}