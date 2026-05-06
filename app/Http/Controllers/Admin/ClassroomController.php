<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Classroom;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ClassroomController extends Controller
{
    /**
     * Tampilkan daftar kelas beserta jumlah siswa.
     */
    public function index(Request $request): Response
    {
        $academicYears = AcademicYear::orderByDesc('tahun')
            ->orderByDesc('semester')
            ->get(['id', 'tahun', 'semester', 'status_aktif']);

        $classrooms = Classroom::with(['academicYear', 'students'])
            ->when($request->academic_year_id, fn ($q, $id) => $q->where('academic_year_id', $id))
            ->when($request->search, fn ($q, $s) =>
                $q->where('nama_kelas', 'like', "%{$s}%")
                  ->orWhere('jurusan', 'like', "%{$s}%")
            )
            ->orderBy('nama_kelas')
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($c) => [
                'id'               => $c->id,
                'nama_kelas'       => $c->nama_kelas,
                'jurusan'          => $c->jurusan,
                'academic_year_id' => $c->academic_year_id,
                'academic_year'    => $c->academicYear
                                        ? "{$c->academicYear->tahun} Sem. {$c->academicYear->semester}"
                                        : '—',
                'student_count'    => $c->students->count(),
            ]);

        return Inertia::render('Admin/Kelas/Index', [
            'classrooms'    => $classrooms,
            'academicYears' => $academicYears,
            'filters'       => $request->only('search', 'academic_year_id'),
        ]);
    }

    /**
     * Simpan kelas baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_kelas'       => [
                'required', 'string', 'max:50',
                Rule::unique('classrooms')->where('academic_year_id', $request->academic_year_id),
            ],
            'jurusan'          => ['required', 'string', 'max:100'],
            'academic_year_id' => ['required', 'exists:academic_years,id'],
        ], [
            'nama_kelas.unique' => 'Nama kelas sudah ada untuk tahun ajaran ini.',
        ]);

        Classroom::create($validated);

        return back()->with('success', 'Kelas berhasil ditambahkan.');
    }

    /**
     * Update data kelas.
     */
    public function update(Request $request, Classroom $classroom): RedirectResponse
    {
        $validated = $request->validate([
            'nama_kelas'       => [
                'required', 'string', 'max:50',
                Rule::unique('classrooms')
                    ->where('academic_year_id', $request->academic_year_id)
                    ->ignore($classroom->id),
            ],
            'jurusan'          => ['required', 'string', 'max:100'],
            'academic_year_id' => ['required', 'exists:academic_years,id'],
        ], [
            'nama_kelas.unique' => 'Nama kelas sudah ada untuk tahun ajaran ini.',
        ]);

        $classroom->update($validated);

        return back()->with('success', 'Kelas berhasil diperbarui.');
    }

    /**
     * Hapus kelas (hanya jika tidak ada siswa di dalamnya).
     */
    public function destroy(Classroom $classroom): RedirectResponse
    {
        if ($classroom->students()->exists()) {
            return back()->with('error', 'Kelas tidak dapat dihapus karena masih memiliki siswa.');
        }

        $classroom->delete();

        return back()->with('success', 'Kelas berhasil dihapus.');
    }
}