<?php

namespace App\Http\Controllers\Admin;

use App\Events\LatePermissionUpdated;
use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Events\LatePermissionStatusChanged;

class LatePermissionController extends Controller
{
    public function index(Request $request): Response
    {
        $statusFilter = $request->query('status', 'Pending');

        $query = Attendance::with(['student.user', 'student.classroom'])
            ->where('is_late', true)
            ->whereNotNull('late_permission_status');

        if ($statusFilter && $statusFilter !== 'Semua') {
            $query->where('late_permission_status', $statusFilter);
        }

        $requests = $query
            ->orderByDesc('date')
            ->orderByDesc('time_in')
            ->paginate(20)
            ->through(fn ($att) => [
                'id'                     => $att->id,
                'student_name'           => $att->student?->user?->name ?? '-',
                'nisn'                   => $att->student?->nisn ?? '-',
                'classroom'              => $att->student?->classroom?->nama_kelas ?? '-',
                'date'                   => $att->date,
                'time_in'                => $att->time_in,
                'late_reason'            => $att->late_reason,
                'late_permission_status' => $att->late_permission_status,
                'late_approved_at'       => $att->late_approved_at,
            ]);

        $pendingCount = Attendance::where('is_late', true)
            ->where('late_permission_status', 'Pending')
            ->count();

        return Inertia::render('Admin/IzinTerlambat', [
            'requests'     => $requests,
            'pendingCount' => $pendingCount,
            'statusFilter' => $statusFilter,
        ]);
    }

    public function approve(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'action' => ['required', 'in:Approved,Rejected'],
        ]);

        $attendance = Attendance::where('is_late', true)
            ->where('late_permission_status', 'Pending')
            ->findOrFail($id);

        $attendance->update([
            'late_permission_status' => $request->action,
            'late_approved_by'       => $request->user()->id,
            'late_approved_at'       => now(),
        ]);

        //  Broadcast ke channel admin.late-permission
        broadcast(new LatePermissionUpdated(
            $attendance->fresh(),
            strtolower($request->action) // 'approved' | 'rejected'
        ));
        //  Broadcast ke siswa yang bersangkutan
        broadcast(new LatePermissionStatusChanged($attendance->fresh()));

        $label = $request->action === 'Approved' ? 'disetujui' : 'ditolak';

        return back()->with('success', "Izin terlambat berhasil {$label}.");
    }
}