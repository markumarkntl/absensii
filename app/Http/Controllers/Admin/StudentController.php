<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
use App\Models\StudentDetail;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    /**
     * Tampilkan daftar siswa dengan pencarian & filter kelas.
     */
    public function index(Request $request): Response
    {
        $classrooms = Classroom::orderBy('nama_kelas')->get(['id', 'nama_kelas', 'jurusan']);

        $students = StudentDetail::with(['user', 'classroom'])
            ->when($request->search, function ($q, $search) {
                $q->whereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"))
                  ->orWhere('nisn', 'like', "%{$search}%");
            })
            ->when($request->classroom_id, fn ($q, $id) => $q->where('classroom_id', $id))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($s) => [
                'id'           => $s->id,
                'name'         => $s->user->name,
                'email'        => $s->user->email,
                'nisn'         => $s->nisn,
                'jenis_kelamin'=> $s->jenis_kelamin,
                'foto_profil'  => $s->foto_profil
                                    ? Storage::url($s->foto_profil)
                                    : null,
                'classroom'    => $s->classroom
                                    ? ['id' => $s->classroom->id, 'nama_kelas' => $s->classroom->nama_kelas]
                                    : null,
                'user_id'      => $s->user_id,
            ]);

        return Inertia::render('Admin/Siswa/Index', [
            'students'   => $students,
            'classrooms' => $classrooms,
            'filters'    => $request->only('search', 'classroom_id'),
        ]);
    }

    /**
     * Simpan siswa baru beserta akun user-nya.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'          => ['required', 'string', 'max:255'],
            'email'         => ['required', 'email', 'unique:users,email'],
            'password'      => ['required', 'string', 'min:6'],
            'nisn'          => ['required', 'string', 'size:10', 'unique:student_details,nisn'],
            'jenis_kelamin' => ['required', 'in:L,P'],
            'classroom_id'  => ['required', 'exists:classrooms,id'],
            'foto_profil'   => ['nullable', 'image', 'max:2048'],
        ]);

        DB::transaction(function () use ($validated, $request) {
            // Buat akun user
            $user = User::create([
                'name'     => $validated['name'],
                'email'    => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);
            $user->assignRole('siswa');

            // Upload foto jika ada
            $fotoPath = $request->hasFile('foto_profil')
                ? $request->file('foto_profil')->store('foto-profil', 'public')
                : null;

            // Buat detail siswa
            StudentDetail::create([
                'user_id'       => $user->id,
                'classroom_id'  => $validated['classroom_id'],
                'nisn'          => $validated['nisn'],
                'jenis_kelamin' => $validated['jenis_kelamin'],
                'foto_profil'   => $fotoPath,
            ]);
        });

        return back()->with('success', 'Siswa berhasil ditambahkan.');
    }

    /**
     * Update data siswa (tanpa mengubah password kecuali diisi).
     */
    public function update(Request $request, StudentDetail $student): RedirectResponse
    {
        $validated = $request->validate([
            'name'          => ['required', 'string', 'max:255'],
            'email'         => ['required', 'email', Rule::unique('users', 'email')->ignore($student->user_id)],
            'password'      => ['nullable', 'string', 'min:6'],
            'nisn'          => ['required', 'string', 'size:10', Rule::unique('student_details', 'nisn')->ignore($student->id)],
            'jenis_kelamin' => ['required', 'in:L,P'],
            'classroom_id'  => ['required', 'exists:classrooms,id'],
            'foto_profil'   => ['nullable', 'image', 'max:2048'],
        ]);

        DB::transaction(function () use ($validated, $request, $student) {
            // Update user
            $userUpdate = [
                'name'  => $validated['name'],
                'email' => $validated['email'],
            ];
            if (! empty($validated['password'])) {
                $userUpdate['password'] = Hash::make($validated['password']);
            }
            $student->user->update($userUpdate);

            // Update foto jika ada file baru
            $fotoPath = $student->foto_profil;
            if ($request->hasFile('foto_profil')) {
                // Hapus foto lama
                if ($fotoPath) {
                    Storage::disk('public')->delete($fotoPath);
                }
                $fotoPath = $request->file('foto_profil')->store('foto-profil', 'public');
            }

            // Update detail siswa
            $student->update([
                'classroom_id'  => $validated['classroom_id'],
                'nisn'          => $validated['nisn'],
                'jenis_kelamin' => $validated['jenis_kelamin'],
                'foto_profil'   => $fotoPath,
            ]);
        });

        return back()->with('success', 'Data siswa berhasil diperbarui.');
    }

    /**
     * Hapus siswa beserta akun user-nya.
     */
    public function destroy(StudentDetail $student): RedirectResponse
    {
        DB::transaction(function () use ($student) {
            // Hapus foto profil
            if ($student->foto_profil) {
                Storage::disk('public')->delete($student->foto_profil);
            }
            // Hapus user (cascade ke student_details via FK)
            $student->user->delete();
        });

        return back()->with('success', 'Siswa berhasil dihapus.');
    }
}