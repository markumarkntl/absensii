import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FlashMessage from '@/Components/FlashMessage';
import {
    Plus, Search, Pencil, Trash2, X,
    BookOpen, Users, ChevronLeft, ChevronRight,
} from 'lucide-react';

// ── Field wrapper ─────────────────────────────────────────────────────────────
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

// ── Modal Tambah / Edit Kelas ─────────────────────────────────────────────────
function KelasModal({ mode, kelas, academicYears, onClose }) {
    const isEdit = mode === 'edit';

    const { data, setData, post, processing, errors, reset } = useForm({
        nama_kelas:       isEdit ? kelas.nama_kelas       : '',
        jurusan:          isEdit ? kelas.jurusan          : '',
        academic_year_id: isEdit ? kelas.academic_year_id : (academicYears.find(y => y.status_aktif)?.id ?? ''),
    });

    const submit = (e) => {
        e.preventDefault();
        const options = {
            onSuccess: () => { reset(); onClose(); },
        };
        if (isEdit) {
            post(route('admin.kelas.update', kelas.id) + '?_method=PUT', options);
        } else {
            post(route('admin.kelas.store'), options);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <div>
                        <h2 className="text-base font-bold text-slate-800">
                            {isEdit ? 'Edit Kelas' : 'Tambah Kelas Baru'}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {isEdit ? `Mengubah data ${kelas.nama_kelas}` : 'Isi form untuk menambah kelas'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                        <X size={18} className="text-slate-500" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={submit} className="px-6 py-5 space-y-4">

                    {/* Nama Kelas */}
                    <Field label="Nama Kelas" error={errors.nama_kelas}>
                        <Input
                            type="text"
                            value={data.nama_kelas}
                            onChange={e => setData('nama_kelas', e.target.value)}
                            placeholder="Contoh: XII RPL 1"
                            error={errors.nama_kelas}
                            autoFocus
                        />
                    </Field>

                    {/* Jurusan */}
                    <Field label="Jurusan" error={errors.jurusan}>
                        <Input
                            type="text"
                            value={data.jurusan}
                            onChange={e => setData('jurusan', e.target.value)}
                            placeholder="Contoh: Rekayasa Perangkat Lunak"
                            error={errors.jurusan}
                        />
                    </Field>

                    {/* Tahun Ajaran */}
                    <Field label="Tahun Ajaran" error={errors.academic_year_id}>
                        <Select
                            value={data.academic_year_id}
                            onChange={e => setData('academic_year_id', e.target.value)}
                            error={errors.academic_year_id}
                        >
                            <option value="">-- Pilih Tahun Ajaran --</option>
                            {academicYears.map(y => (
                                <option key={y.id} value={y.id}>
                                    {y.tahun} Semester {y.semester}
                                    {y.status_aktif ? ' (Aktif)' : ''}
                                </option>
                            ))}
                        </Select>
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
                            {isEdit ? 'Simpan Perubahan' : 'Tambah Kelas'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Modal Konfirmasi Hapus ────────────────────────────────────────────────────
function DeleteModal({ kelas, onClose }) {
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        setProcessing(true);
        router.delete(route('admin.kelas.destroy', kelas.id), {
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
                <h3 className="text-base font-bold text-slate-800 text-center">Hapus Kelas?</h3>
                <p className="text-sm text-slate-500 text-center mt-2">
                    Kelas <span className="font-semibold text-slate-700">{kelas.nama_kelas}</span> akan
                    dihapus permanen. Kelas yang masih memiliki siswa tidak dapat dihapus.
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
    if (meta.last_page <= 1) return null;
    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <p className="text-xs text-slate-500">
                Menampilkan <span className="font-medium">{meta.from}–{meta.to}</span> dari{' '}
                <span className="font-medium">{meta.total}</span> kelas
            </p>
            <div className="flex items-center gap-1">
                {links.map((link, i) => {
                    if (link.label.includes('Previous')) return (
                        <button key={i} disabled={!link.url} onClick={() => link.url && router.get(link.url)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">
                            <ChevronLeft size={16} className="text-slate-600" />
                        </button>
                    );
                    if (link.label.includes('Next')) return (
                        <button key={i} disabled={!link.url} onClick={() => link.url && router.get(link.url)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">
                            <ChevronRight size={16} className="text-slate-600" />
                        </button>
                    );
                    return (
                        <button key={i} onClick={() => link.url && router.get(link.url)}
                            className={`w-8 h-8 text-xs rounded-lg font-medium transition-colors
                                ${link.active ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'}`}>
                            {link.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ── Halaman Utama ─────────────────────────────────────────────────────────────
export default function KelasIndex({ classrooms, academicYears, filters }) {
    const [modal, setModal]     = useState(null);
    const [selected, setSelected] = useState(null);

    const { data: searchData, setData: setSearch, get } = useForm({
        search:           filters.search           ?? '',
        academic_year_id: filters.academic_year_id ?? '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('admin.kelas'), { preserveScroll: true, replace: true });
    };

    const openEdit   = (k) => { setSelected(k); setModal('edit');   };
    const openDelete = (k) => { setSelected(k); setModal('delete'); };
    const closeModal = ()  => { setModal(null); setSelected(null);  };

    return (
        <AuthenticatedLayout title="Data Kelas">
            <FlashMessage />

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Manajemen Kelas</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Total <span className="font-semibold text-slate-700">{classrooms.total}</span> kelas terdaftar
                    </p>
                </div>
                <button
                    onClick={() => setModal('add')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700
                               text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                >
                    <Plus size={16} />
                    Tambah Kelas
                </button>
            </div>

            {/* ── Filter & Search ── */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchData.search}
                        onChange={e => setSearch('search', e.target.value)}
                        placeholder="Cari nama kelas atau jurusan..."
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl
                                   outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                </div>
                <select
                    value={searchData.academic_year_id}
                    onChange={e => setSearch('academic_year_id', e.target.value)}
                    className="px-3 py-2.5 text-sm border border-slate-300 rounded-xl bg-white
                               outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 min-w-[180px]"
                >
                    <option value="">Semua Tahun Ajaran</option>
                    {academicYears.map(y => (
                        <option key={y.id} value={y.id}>
                            {y.tahun} Sem. {y.semester}{y.status_aktif ? ' ✓' : ''}
                        </option>
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

            {/* ── Grid Kelas / Tabel ── */}
            {classrooms.data.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <BookOpen size={40} className="mb-3 opacity-30" />
                        <p className="text-sm font-medium">Tidak ada kelas ditemukan</p>
                        <p className="text-xs mt-1">Coba ubah filter atau tambah kelas baru</p>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/70">
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Nama Kelas
                                    </th>
                                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Jurusan
                                    </th>
                                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Tahun Ajaran
                                    </th>
                                    <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Jumlah Siswa
                                    </th>
                                    <th className="px-4 py-3.5" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {classrooms.data.map(k => (
                                    <tr key={k.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center
                                                                justify-center text-indigo-600 flex-shrink-0">
                                                    <BookOpen size={16} />
                                                </div>
                                                <span className="font-semibold text-slate-800">{k.nama_kelas}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-slate-600">{k.jurusan}</td>
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs
                                                             font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                                                {k.academic_year}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 text-slate-600">
                                                <Users size={14} className="text-slate-400" />
                                                <span className="font-semibold">{k.student_count}</span>
                                                <span className="text-xs text-slate-400">siswa</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEdit(k)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-blue-600
                                                               hover:bg-blue-50 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => openDelete(k)}
                                                    disabled={k.student_count > 0}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-red-600
                                                               hover:bg-red-50 transition-colors
                                                               disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title={k.student_count > 0 ? 'Kelas masih memiliki siswa' : 'Hapus'}
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
                        {classrooms.data.map(k => (
                            <div key={k.id} className="flex items-center gap-3 px-4 py-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center
                                                justify-center text-indigo-600 flex-shrink-0">
                                    <BookOpen size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-800">{k.nama_kelas}</p>
                                    <p className="text-xs text-slate-400">
                                        {k.jurusan} · {k.student_count} siswa
                                    </p>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    <button onClick={() => openEdit(k)}
                                        className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                        <Pencil size={15} />
                                    </button>
                                    <button
                                        onClick={() => openDelete(k)}
                                        disabled={k.student_count > 0}
                                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50
                                                   disabled:opacity-30 disabled:cursor-not-allowed">
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Pagination links={classrooms.links} meta={classrooms.meta} />
                </div>
            )}

            {/* ── Modals ── */}
            {modal === 'add' && (
                <KelasModal mode="add" academicYears={academicYears} onClose={closeModal} />
            )}
            {modal === 'edit' && selected && (
                <KelasModal mode="edit" kelas={selected} academicYears={academicYears} onClose={closeModal} />
            )}
            {modal === 'delete' && selected && (
                <DeleteModal kelas={selected} onClose={closeModal} />
            )}
        </AuthenticatedLayout>
    );
}