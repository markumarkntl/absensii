<?php

namespace App\Events;

use App\Models\Permission;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PermissionStatusChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $data;
    private int $studentId;

    public function __construct(Permission $permission)
    {
        $this->studentId = $permission->student_id;

        $this->data = [
            'id'          => $permission->id,
            'type'        => $permission->type,
            'is_approved' => $permission->is_approved,
            'start_date'  => $permission->start_date?->toDateString(),
            'end_date'    => $permission->end_date?->toDateString(),
            'reason'      => $permission->reason,
            'approved_at' => $permission->approved_at?->toDateTimeString(),
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
        return 'permission.status-changed';
    }
}