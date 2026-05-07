import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FlashMessage from '@/Components/FlashMessage';
import {
    Plus, Search, Pencil, Trash2, X, User,
    ChevronLeft, ChevronRight, Upload, Eye, EyeOff
} from 'lucide-react';

// ── Komponen Badge Jenis Kelamin ──────────────────────────────────────────────
function GenderBadge({ jk }) {
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
            ${jk === 'L'
                ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                : 'bg-pink-50 text-pink-700 ring-1 ring-pink-200'}`}>
            {jk === 'L' ? 'Laki-laki' : 'Perempuan'}
        </span>
    );
}

// ── Komponen Input Field ──────────────────────────────────────────────────────
function Field({ label, error, children }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                {label}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

function Input({ error, ...props }) {
    return (
        <input
            {...props}
            className={`w-full px-3 py-2 text-sm rounded-lg border bg-white outline-none
                transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${error ? 'border-red-400 bg-red-50' : 'border-slate-300 text-slate-800'}`}
        />
    );
}

function Select({ error, children, ...props }) {
    return (
        <select
            {...props}
            className={`w-full px-3 py-2 text-sm rounded-lg border bg-white outline-none
                transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${error ? 'border-red-400 bg-red-50' : 'border-slate-300 text-slate-800'}`}
        >
            {children}
        </select>
    );
}

// ── Modal Tambah / Edit Siswa ─────────────────────────────────────────────────
function StudentModal({ mode, student, classrooms, onClose }) {
    const isEdit = mode === 'edit';
    const [showPass, setShowPass] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name:          isEdit ? student.name          : '',
        email:         isEdit ? student.email         : '',
        password:      '',
        nisn:          isEdit ? student.nisn          : '',
        jenis_kelamin: isEdit ? student.jenis_kelamin : 'L',
        classroom_id:  isEdit ? student.classroom?.id : '',
        foto_profil:   null,
    });

    const submit = (e) => {
        e.preventDefault();
        const options = {
            forceFormData: true,
            onSuccess: () => { reset(); onClose(); },
            onError: () => {}, // jangan tutup modal jika ada error validasi
        };
        if (isEdit) {
            post(route('admin.siswa.update', student.id) + '?_method=PUT', options);
        } else {
            post(route('admin.siswa.store'), options);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl
                            max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <div>
                        <h2 className="text-base font-bold text-slate-800">
                            {isEdit ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {isEdit ? `Mengubah data ${student.name}` : 'Isi form untuk menambah siswa'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <X size={18} className="text-slate-500" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={submit} className="px-6 py-5 space-y-4">
                    {/* Nama */}
                    <Field label="Nama Lengkap" error={errors.name}>
                        <Input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder="Nama siswa"
                            error={errors.name}
                            autoFocus
                        />
                    </Field>

                    {/* Email */}
                    <Field label="Email" error={errors.email}>
                        <Input
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            placeholder="email@sekolah.sch.id"
                            error={errors.email}
                        />
                    </Field>

                    {/* Password */}
                    <Field
                        label={isEdit ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password'}
                        error={errors.password}
                    >
                        <div className="relative">
                            <Input
                                type={showPass ? 'text' : 'password'}
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                placeholder={isEdit ? '••••••••' : 'Minimal 6 karakter'}
                                error={errors.password}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </Field>

                    {/* NISN & Jenis Kelamin (2 kolom) */}
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="NISN (10 digit)" error={errors.nisn}>
                            <Input
                                type="text"
                                maxLength={10}
                                value={data.nisn}
                                onChange={e => setData('nisn', e.target.value)}
                                placeholder="0000000000"
                                error={errors.nisn}
                            />
                        </Field>
                        <Field label="Jenis Kelamin" error={errors.jenis_kelamin}>
                            <Select
                                value={data.jenis_kelamin}
                                onChange={e => setData('jenis_kelamin', e.target.value)}
                                error={errors.jenis_kelamin}
                            >
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                            </Select>
                        </Field>
                    </div>

                    {/* Kelas */}
                    <Field label="Kelas" error={errors.classroom_id}>
                        <Select
                            value={data.classroom_id}
                            onChange={e => setData('classroom_id', e.target.value)}
                            error={errors.classroom_id}
                        >
                            <option value="">-- Pilih Kelas --</option>
                            {classrooms.map(c => (
                                <option key={c.id} value={c.id}>{c.nama_kelas}</option>
                            ))}
                        </Select>
                    </Field>

                    {/* Foto Profil */}
                    <Field label="Foto Profil (opsional)" error={errors.foto_profil}>
                        <label className="flex items-center gap-3 px-3 py-2.5 border border-dashed border-slate-300
                                          rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                            <Upload size={16} className="text-slate-400 flex-shrink-0" />
                            <span className="text-sm text-slate-500 truncate">
                                {data.foto_profil ? data.foto_profil.name : 'Pilih file gambar...'}
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => setData('foto_profil', e.target.files[0] || null)}
                            />
                        </label>
                    </Field>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800
                                       hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600
                                       hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed
                                       rounded-lg transition-colors flex items-center gap-2"
                        >
                            {processing && (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                            )}
                            {isEdit ? 'Simpan Perubahan' : 'Tambah Siswa'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Modal Konfirmasi Hapus ────────────────────────────────────────────────────
function DeleteModal({ student, onClose }) {
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        setProcessing(true);
        router.delete(route('admin.siswa.destroy', student.id), {
            onFinish: () => { setProcessing(false); onClose(); },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                    <Trash2 size={22} className="text-red-500" />
                </div>
                <h3 className="text-base font-bold text-slate-800 text-center">Hapus Siswa?</h3>
                <p className="text-sm text-slate-500 text-center mt-2">
                    Data <span className="font-semibold text-slate-700">{student.name}</span> beserta
                    akun dan riwayat presensinya akan dihapus permanen.
                </p>
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 text-sm font-medium text-slate-600 border border-slate-300
                                   rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={processing}
                        className="flex-1 py-2 text-sm font-semibold text-white bg-red-500
                                   hover:bg-red-600 disabled:opacity-60 rounded-lg transition-colors"
                    >
                        {processing ? 'Menghapus...' : 'Ya, Hapus'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ links, meta }) {
    if (!meta || !links || meta.last_page <= 1) return null;

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <p className="text-xs text-slate-500">
                Menampilkan <span className="font-medium">{meta.from}–{meta.to}</span> dari{' '}
                <span className="font-medium">{meta.total}</span> siswa
            </p>
            <div className="flex items-center gap-1">
                {links.map((link, i) => {
                    if (link.label.includes('Previous')) {
                        return (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40
                                           disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} className="text-slate-600" />
                            </button>
                        );
                    }
                    if (link.label.includes('Next')) {
                        return (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40
                                           disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={16} className="text-slate-600" />
                            </button>
                        );
                    }
                    return (
                        <button
                            key={i}
                            onClick={() => link.url && router.get(link.url)}
                            className={`w-8 h-8 text-xs rounded-lg font-medium transition-colors
                                ${link.active
                                    ? 'bg-blue-600 text-white'
                                    : 'hover:bg-slate-100 text-slate-600'}`}
                        >
                            {link.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ── Halaman Utama ─────────────────────────────────────────────────────────────
export default function SiswaIndex({ students, classrooms, filters }) {
    const [modal, setModal]   = useState(null); // null | 'add' | 'edit' | 'delete'
    const [selected, setSelected] = useState(null);

    // Guard against undefined data
    const studentsData  = students?.data  ?? [];
    const studentsTotal = students?.total ?? 0;
    const studentsMeta  = students?.meta  ?? null;
    const studentsLinks = students?.links ?? [];

    const { data: searchData, setData: setSearch, get } = useForm({
        search:       filters.search       ?? '',
        classroom_id: filters.classroom_id ?? '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('admin.siswa'), { preserveScroll: true, replace: true });
    };

    const openEdit   = (s) => { setSelected(s); setModal('edit');   };
    const openDelete = (s) => { setSelected(s); setModal('delete'); };
    const closeModal = ()  => { setModal(null); setSelected(null);  };

    return (
        <AuthenticatedLayout title="Data Siswa">
            <FlashMessage />

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Manajemen Siswa</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Total <span className="font-semibold text-slate-700">{studentsTotal}</span> siswa terdaftar
                    </p>
                </div>
                <button
                    onClick={() => setModal('add')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700
                               text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                >
                    <Plus size={16} />
                    Tambah Siswa
                </button>
            </div>

            {/* ── Filter & Search ── */}
            <form onSubmit={handleSearch}
                  className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchData.search}
                        onChange={e => setSearch('search', e.target.value)}
                        placeholder="Cari nama atau NISN..."
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl
                                   outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                </div>
                <select
                    value={searchData.classroom_id}
                    onChange={e => setSearch('classroom_id', e.target.value)}
                    className="px-3 py-2.5 text-sm border border-slate-300 rounded-xl bg-white
                               outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                               text-slate-700 min-w-[160px]"
                >
                    <option value="">Semua Kelas</option>
                    {classrooms.map(c => (
                        <option key={c.id} value={c.id}>{c.nama_kelas}</option>
                    ))}
                </select>
                <button
                    type="submit"
                    className="px-4 py-2.5 text-sm font-medium bg-slate-800 text-white
                               rounded-xl hover:bg-slate-700 transition-colors"
                >
                    Cari
                </button>
            </form>

            {/* ── Tabel ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {studentsData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <User size={40} className="mb-3 opacity-30" />
                        <p className="text-sm font-medium">Tidak ada siswa ditemukan</p>
                        <p className="text-xs mt-1">Coba ubah filter atau tambah siswa baru</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/70">
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                            Siswa
                                        </th>
                                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                            NISN
                                        </th>
                                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                            Kelas
                                        </th>
                                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                            Jenis Kelamin
                                        </th>
                                        <th className="px-4 py-3.5" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {studentsData.map(s => (
                                        <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    {s.foto_profil ? (
                                                        <img
                                                            src={s.foto_profil}
                                                            alt={s.name}
                                                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                                                        />
                                                    ) : (
                                                        <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200
                                                                        flex items-center justify-center text-blue-600 text-xs font-bold">
                                                            {s.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-slate-800">{s.name}</p>
                                                        <p className="text-xs text-slate-400">{s.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-700">
                                                    {s.nisn}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-slate-600">
                                                {s.classroom?.nama_kelas ?? (
                                                    <span className="text-slate-300 italic text-xs">— belum ada —</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <GenderBadge jk={s.jenis_kelamin} />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => openEdit(s)}
                                                        className="p-2 rounded-lg text-slate-400 hover:text-blue-600
                                                                   hover:bg-blue-50 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => openDelete(s)}
                                                        className="p-2 rounded-lg text-slate-400 hover:text-red-600
                                                                   hover:bg-red-50 transition-colors"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {studentsData.map(s => (
                                <div key={s.id} className="flex items-center gap-3 px-4 py-4">
                                    {s.foto_profil ? (
                                        <img
                                            src={s.foto_profil}
                                            alt={s.name}
                                            className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center
                                                        justify-center text-blue-600 text-sm font-bold flex-shrink-0">
                                            {s.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 truncate">{s.name}</p>
                                        <p className="text-xs text-slate-400">
                                            NISN: {s.nisn} · {s.classroom?.nama_kelas ?? '—'}
                                        </p>
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0">
                                        <button
                                            onClick={() => openEdit(s)}
                                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            onClick={() => openDelete(s)}
                                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Pagination links={studentsLinks} meta={studentsMeta} />
                    </>
                )}
            </div>

            {/* ── Modals ── */}
            {modal === 'add' && (
                <StudentModal
                    mode="add"
                    classrooms={classrooms}
                    onClose={closeModal}
                />
            )}
            {modal === 'edit' && selected && (
                <StudentModal
                    mode="edit"
                    student={selected}
                    classrooms={classrooms}
                    onClose={closeModal}
                />
            )}
            {modal === 'delete' && selected && (
                <DeleteModal
                    student={selected}
                    onClose={closeModal}
                />
            )}
        </AuthenticatedLayout>
    );
}