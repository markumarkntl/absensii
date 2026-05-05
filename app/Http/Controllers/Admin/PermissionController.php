<?php

namespace App\Http\Controllers\Admin;

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

class PermissionController extends Controller
{
    // -------------------------------------------------------------------------
    // Daftar Pengajuan Izin (Admin)
    // -------------------------------------------------------------------------

    /**
     * GET /admin/izin?status=Pending
     * Tampilkan semua pengajuan izin siswa dengan filter status.
     */
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

        // Badge count untuk setiap tab status
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

    // -------------------------------------------------------------------------
    // Approve / Reject Izin
    // -------------------------------------------------------------------------

    /**
     * PATCH /admin/izin/{id}
     * Setujui atau tolak pengajuan izin siswa.
     * Jika disetujui, update status attendance pada rentang tanggal izin.
     */
    public function approve(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'action' => ['required', Rule::in(['Approved', 'Rejected'])],
            'note'   => ['nullable', 'string', 'max:500'],
        ]);

        $permission = Permission::with('student')->findOrFail($id);

        // Pastikan izin masih berstatus Pending
        if ($permission->is_approved !== 'Pending') {
            return back()->with('error', 'Pengajuan ini sudah diproses sebelumnya.');
        }

        $permission->update([
            'is_approved' => $request->action,
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        // Jika disetujui: sinkronisasi status attendance
        if ($request->action === 'Approved') {
            $this->syncAttendanceStatus($permission);
        }

        $label = $request->action === 'Approved' ? 'disetujui' : 'ditolak';

        return back()->with('success', "Pengajuan izin berhasil {$label}.");
    }

    // -------------------------------------------------------------------------
    // Helper: Sinkronisasi Attendance
    // -------------------------------------------------------------------------

    /**
     * Setelah izin disetujui, update atau buat record attendance pada
     * rentang tanggal izin (skip Sabtu & Minggu).
     *
     * Aturan:
     * - Jika record sudah ada dan statusnya Alfa → update ke Sakit/Izin
     * - Jika record sudah ada dan statusnya Hadir → biarkan (tidak di-override)
     * - Jika record belum ada → buat baru dengan status Sakit/Izin
     */
    private function syncAttendanceStatus(Permission $permission): void
    {
        $period = CarbonPeriod::create(
            Carbon::parse($permission->start_date),
            Carbon::parse($permission->end_date)
        );

        foreach ($period as $date) {
            // Skip hari libur
            if ($date->isWeekend()) {
                continue;
            }

            $dateString = $date->toDateString();
            $note       = 'Otomatis dari pengajuan izin #' . $permission->id;

            $existing = Attendance::where('student_id', $permission->student_id)
                ->whereDate('date', $dateString)
                ->first();

            if ($existing) {
                // Hanya update jika saat ini Alfa (tidak menimpa Hadir)
                if ($existing->status === 'Alfa') {
                    $existing->update([
                        'status' => $permission->type,
                        'note'   => $note,
                    ]);
                }
            } else {
                // Belum ada record, buat baru
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