<?php

namespace App\Http\Controllers\Admin;

use App\Events\PermissionUpdated;
use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Permission;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use App\Events\PermissionStatusChanged;

class PermissionController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->query('status', 'Pending');

        $permissions = Permission::with([
            'student.user',
            'student.classroom',
            'approvedBy',
        ])
            ->when($status !== 'all', fn ($q) => $q->where('is_approved', $status))
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString();

        $counts = [
            'pending'  => Permission::where('is_approved', 'Pending')->count(),
            'approved' => Permission::where('is_approved', 'Approved')->count(),
            'rejected' => Permission::where('is_approved', 'Rejected')->count(),
        ];

        return Inertia::render('Admin/Izin', [
            'permissions'  => $permissions,
            'counts'       => $counts,
            'filterStatus' => $status,
        ]);
    }

    public function approve(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'action' => ['required', Rule::in(['Approved', 'Rejected'])],
            'note'   => ['nullable', 'string', 'max:500'],
        ]);

        $permission = Permission::with('student')->findOrFail($id);

        if ($permission->is_approved !== 'Pending') {
            return back()->with('error', 'Pengajuan ini sudah diproses sebelumnya.');
        }

        $permission->update([
            'is_approved' => $request->action,
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        if ($request->action === 'Approved') {
            $this->syncAttendanceStatus($permission);
        }

        //  Broadcast ke channel admin.permission
        broadcast(new PermissionUpdated(
            $permission->fresh(),
            strtolower($request->action) // 'approved' | 'rejected'
        ));
        // 🔴 Broadcast ke siswa yang bersangkutan
        broadcast(new PermissionStatusChanged($permission->fresh()));

        $label = $request->action === 'Approved' ? 'disetujui' : 'ditolak';

        return back()->with('success', "Pengajuan izin berhasil {$label}.");
    }

    private function syncAttendanceStatus(Permission $permission): void
    {
        $period = CarbonPeriod::create(
            Carbon::parse($permission->start_date),
            Carbon::parse($permission->end_date)
        );

        foreach ($period as $date) {
            if ($date->isWeekend()) continue;

            $dateString = $date->toDateString();
            $note       = 'Otomatis dari pengajuan izin #' . $permission->id;

            $existing = Attendance::where('student_id', $permission->student_id)
                ->whereDate('date', $dateString)
                ->first();

            if ($existing) {
                if ($existing->status === 'Alfa') {
                    $existing->update(['status' => $permission->type, 'note' => $note]);
                }
            } else {
                Attendance::create([
                    'student_id' => $permission->student_id,
                    'date'       => $dateString,
                    'status'     => $permission->type,
                    'note'       => $note,
                ]);
            }
        }
    }
}