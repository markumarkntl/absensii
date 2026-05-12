<?php

namespace App\Events;

use App\Models\Attendance;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LatePermissionStatusChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $data;
    private int $studentId;

    public function __construct(Attendance $attendance)
    {
        $this->studentId = $attendance->student_id;

        $this->data = [
            'id'                     => $attendance->id,
            'date'                   => $attendance->date?->toDateString(),
            'time_in'                => $attendance->time_in,
            'late_permission_status' => $attendance->late_permission_status,
            'late_approved_at'       => $attendance->late_approved_at?->toDateTimeString(),
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("siswa.{$this->studentId}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'late-permission.status-changed';
    }
}