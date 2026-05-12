<?php

namespace App\Events;

use App\Models\Permission;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PermissionUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $data;

    public function __construct(Permission $permission, string $action)
    {
        $permission->load('student.user', 'student.classroom');

        $this->data = [
            'id'           => $permission->id,
            'student_name' => $permission->student?->user?->name ?? '-',
            'nisn'         => $permission->student?->nisn ?? '-',
            'classroom'    => $permission->student?->classroom?->nama_kelas ?? '-',
            'type'         => $permission->type,
            'reason'       => $permission->reason,
            'start_date'   => $permission->start_date?->toDateString(),
            'end_date'     => $permission->end_date?->toDateString(),
            'is_approved'  => $permission->is_approved,
            'action'       => $action, // 'new' | 'approved' | 'rejected'
            'updated_at'   => now()->toDateTimeString(),
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin.permission'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'permission.updated';
    }
}