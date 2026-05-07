<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * GET /siswa/profil
     * Tampilkan profil & ID digital siswa.
     */
    public function index(Request $request): Response
    {
        /** @var \App\Models\User $user */
        $user    = $request->user();
        $student = $user->studentDetail?->load('classroom');

        return Inertia::render('Siswa/Profil', [
            'student' => $student ? [
                'id'            => $student->id,
                'name'          => $user->name,
                'email'         => $user->email,
                'nisn'          => $student->nisn,
                'jenis_kelamin' => $student->jenis_kelamin,
                'foto_profil'   => $student->foto_profil
                                    ? asset('storage/' . $student->foto_profil)
                                    : null,
                'classroom'     => $student->classroom?->nama_kelas,
                'jurusan'       => $student->classroom?->jurusan,
            ] : null,
        ]);
    }
}