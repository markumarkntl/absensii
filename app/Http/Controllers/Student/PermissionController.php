<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PermissionController extends Controller
{
    // -------------------------------------------------------------------------
    // Daftar Izin Siswa
    // -------------------------------------------------------------------------

    /**
     * GET /siswa/izin
     * Tampilkan daftar pengajuan izin milik siswa yang sedang login.
     */
    public function index(Request $request): Response
    {
        /** @var \App\Models\User $user */
        $user    = $request->user();
        $student = $user->studentDetail;

        $permissions = Permission::where('student_id', $student->id)
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Siswa/Izin', [
            'permissions' => $permissions,
        ]);
    }

    // -------------------------------------------------------------------------
    // Kirim Pengajuan Izin
    // -------------------------------------------------------------------------

    /**
     * POST /siswa/izin
     * Simpan pengajuan izin baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'type'       => ['required', Rule::in(['Sakit', 'Izin'])],
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date'   => ['required', 'date', 'after_or_equal:start_date'],
            'reason'     => ['required', 'string', 'max:1000'],
            'proof_file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        /** @var \App\Models\User $user */
        $user    = $request->user();
        $student = $user->studentDetail;

        // Cegah pengajuan ganda: cek overlap dengan izin Pending yang sudah ada
        $overlap = Permission::where('student_id', $student->id)
            ->where('is_approved', 'Pending')
            ->where(function ($query) use ($request) {
                $query
                    ->whereBetween('start_date', [$request->start_date, $request->end_date])
                    ->orWhereBetween('end_date',  [$request->start_date, $request->end_date])
                    ->orWhere(function ($q) use ($request) {
                        $q->where('start_date', '<=', $request->start_date)
                          ->where('end_date',   '>=', $request->end_date);
                    });
            })
            ->exists();

        if ($overlap) {
            return back()->with(
                'error',
                'Kamu sudah memiliki pengajuan izin yang sedang menunggu persetujuan pada rentang tanggal tersebut.'
            );
        }

        // Upload bukti surat (opsional)
        $proofPath = null;
        if ($request->hasFile('proof_file')) {
            $file      = $request->file('proof_file');
            $filename  = 'bukti_' . $student->id . '_' . now()->format('Ymd_His') . '.' . $file->extension();
            $proofPath = $file->storeAs('permissions/proofs', $filename, 'public');
        }

        Permission::create([
            'student_id'  => $student->id,
            'type'        => $request->type,
            'start_date'  => $request->start_date,
            'end_date'    => $request->end_date,
            'reason'      => $request->reason,
            'proof_file'  => $proofPath,
            'is_approved' => 'Pending',
        ]);

        return redirect()
            ->route('siswa.izin')
            ->with('success', 'Pengajuan izin berhasil dikirim. Menunggu persetujuan admin.');
    }
}