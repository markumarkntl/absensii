import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FlashMessage from '@/Components/FlashMessage';
import {
    FileText, Clock, CheckCircle2, XCircle,
    ChevronLeft, ChevronRight, Eye, Check, X,
    Calendar, User, BookOpen, AlertCircle,
    Filter,
} from 'lucide-react';

// ── Badge status ───────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const map = {
        Pending:  { label: 'Menunggu',  cls: 'bg-amber-100  text-amber-700  border-amber-200'  },
        Approved: { label: 'Disetujui', cls: 'bg-green-100  text-green-700  border-green-200'  },
        Rejected: { label: 'Ditolak',   cls: 'bg-red-100    text-red-700    border-red-200'    },
    };
    const { label, cls } = map[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600' };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
            {label}
        </span>
    );
}

// ── Badge tipe izin ────────────────────────────────────────────────────────────
function TypeBadge({ type }) {
    const map = {
        Sakit: 'bg-blue-100 text-blue-700 border-blue-200',
        Izin:  'bg-purple-100 text-purple-700 border-purple-200',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${map[type] ?? 'bg-slate-100 text-slate-600'}`}>
            {type}
        </span>
    );
}

// ── Format tanggal ─────────────────────────────────────────────────────────────
function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

function dateRange(start, end) {
    const s = formatDate(start);
    const e = formatDate(end);
    return s === e ? s : `${s} – ${e}`;
}

// ── Modal Detail + Approval ────────────────────────────────────────────────────
function DetailModal({ permission, onClose }) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        action: '',
        note: '',
    });

    const handleAction = (action) => {
        setData('action', action);
    };

    const submit = () => {
        if (!data.action) return;
        patch(route('admin.izin.approve', permission.id), {
            onSuccess: () => { reset(); onClose(); },
            preserveScroll: true,
        });
    };

    const student   = permission.student;
    const user      = student?.user;
    const classroom = student?.classroom;
    const isPending = permission.is_approved === 'Pending';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <FileText size={18} className="text-blue-600" />
                        <h2 className="text-base font-bold text-slate-800">Detail Pengajuan Izin</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Info siswa */}
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2.5">
                        <Row icon={User} label="Nama Siswa"  value={user?.name ?? '-'} />
                        <Row icon={BookOpen} label="Kelas"   value={classroom?.nama_kelas ?? '-'} />
                        <Row icon={FileText} label="NISN"    value={student?.nisn ?? '-'} mono />
                    </div>

                    {/* Info izin */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500 font-medium">Jenis Izin</span>
                            <TypeBadge type={permission.type} />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500 font-medium">Periode</span>
                            <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                <Calendar size={13} className="text-slate-400" />
                                {dateRange(permission.start_date, permission.end_date)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500 font-medium">Status</span>
                            <StatusBadge status={permission.is_approved} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium mb-1">Alasan</p>
                            <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2.5 leading-relaxed">
                                {permission.reason}
                            </p>
                        </div>

                        {/* Bukti surat */}
                        {permission.proof_file && (
                            <div>
                                <p className="text-sm text-slate-500 font-medium mb-1">Bukti / Surat</p>
                                <a
                                    href={`/storage/${permission.proof_file}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                >
                                    <Eye size={14} /> Lihat File
                                </a>
                            </div>
                        )}

                        {/* Info approval jika sudah diproses */}
                        {!isPending && permission.approved_by && (
                            <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 border border-slate-200">
                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Info Proses</p>
                                <p className="text-sm text-slate-600">
                                    Diproses oleh: <span className="font-medium">{permission.approved_by?.name ?? '-'}</span>
                                </p>
                                <p className="text-sm text-slate-600">
                                    Pada: <span className="font-medium">{formatDate(permission.approved_at)}</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Form approval — hanya jika masih Pending */}
                    {isPending && (
                        <div className="border-t border-slate-100 pt-4 space-y-3">
                            <p className="text-sm font-semibold text-slate-700">Keputusan</p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleAction('Approved')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                                        text-sm font-semibold border-2 transition-all
                                        ${data.action === 'Approved'
                                            ? 'bg-green-600 border-green-600 text-white shadow-md'
                                            : 'border-green-300 text-green-700 hover:bg-green-50'}`}
                                >
                                    <Check size={15} /> Setujui
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleAction('Rejected')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                                        text-sm font-semibold border-2 transition-all
                                        ${data.action === 'Rejected'
                                            ? 'bg-red-600 border-red-600 text-white shadow-md'
                                            : 'border-red-300 text-red-700 hover:bg-red-50'}`}
                                >
                                    <X size={15} /> Tolak
                                </button>
                            </div>

                            {data.action && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                                        Catatan (opsional)
                                    </label>
                                    <textarea
                                        value={data.note}
                                        onChange={e => setData('note', e.target.value)}
                                        rows={3}
                                        placeholder="Tambahkan catatan jika diperlukan..."
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white outline-none
                                            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    />
                                    {errors.note && <p className="mt-1 text-xs text-red-500">{errors.note}</p>}
                                </div>
                            )}

                            {data.action && (
                                <button
                                    onClick={submit}
                                    disabled={processing}
                                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all
                                        disabled:opacity-60
                                        ${data.action === 'Approved'
                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                            : 'bg-red-600 hover:bg-red-700 text-white'}`}
                                >
                                    {processing ? 'Memproses...' : (data.action === 'Approved' ? 'Konfirmasi Setujui' : 'Konfirmasi Tolak')}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Helper row detail ──────────────────────────────────────────────────────────
function Row({ icon: Icon, label, value, mono = false }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Icon size={13} />
                <span>{label}</span>
            </div>
            <span className={`text-sm font-semibold text-slate-700 truncate max-w-[55%] text-right
                              ${mono ? 'font-mono tracking-wider' : ''}`}>
                {value}
            </span>
        </div>
    );
}

// ── Pagination ─────────────────────────────────────────────────────────────────
function Pagination({ meta, onPage }) {
    const { current_page, last_page, from, to, total } = meta;
    if (last_page <= 1) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3
                         px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
            <span>Menampilkan {from}–{to} dari {total} pengajuan</span>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPage(current_page - 1)}
                    disabled={current_page === 1}
                    className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={16} />
                </button>
                {Array.from({ length: last_page }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === last_page || Math.abs(p - current_page) <= 1)
                    .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                        acc.push(p);
                        return acc;
                    }, [])
                    .map((p, i) =>
                        p === '...'
                            ? <span key={`e${i}`} className="px-2 text-slate-400">...</span>
                            : <button
                                key={p}
                                onClick={() => onPage(p)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                                    ${p === current_page
                                        ? 'bg-blue-600 text-white'
                                        : 'hover:bg-slate-100 text-slate-600'}`}
                              >
                                {p}
                              </button>
                    )}
                <button
                    onClick={() => onPage(current_page + 1)}
                    disabled={current_page === last_page}
                    className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function IzinIndex({ permissions, counts, filterStatus }) {
    const [selected, setSelected] = useState(null);

    const tabs = [
        { key: 'Pending',  label: 'Menunggu',  count: counts.pending,  icon: Clock,         color: 'text-amber-600'  },
        { key: 'Approved', label: 'Disetujui', count: counts.approved, icon: CheckCircle2,  color: 'text-green-600'  },
        { key: 'Rejected', label: 'Ditolak',   count: counts.rejected, icon: XCircle,       color: 'text-red-500'    },
        { key: 'all',      label: 'Semua',     count: counts.pending + counts.approved + counts.rejected, icon: Filter, color: 'text-slate-500' },
    ];

    const handleTab = (key) => {
        router.get(route('admin.izin'), { status: key }, { preserveState: true, replace: true });
    };

    const handlePage = (page) => {
        router.get(route('admin.izin'), { status: filterStatus, page }, { preserveState: true, replace: true });
    };

    const list  = permissions.data ?? [];
    const meta  = permissions.meta ?? permissions;

    return (
        <AuthenticatedLayout title="Approval Izin">
            <FlashMessage />

            <div className="space-y-5">
                {/* Header */}
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Pengajuan Izin Siswa</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Kelola dan proses permohonan izin / sakit dari siswa.</p>
                </div>

                {/* Tab Status */}
                <div className="flex gap-2 flex-wrap">
                    {tabs.map(({ key, label, count, icon: Icon, color }) => {
                        const active = filterStatus === key;
                        return (
                            <button
                                key={key}
                                onClick={() => handleTab(key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2
                                    transition-all duration-150
                                    ${active
                                        ? 'bg-slate-800 border-slate-800 text-white shadow-sm'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                            >
                                <Icon size={14} className={active ? 'text-white' : color} />
                                {label}
                                <span className={`px-1.5 py-0.5 rounded-full text-xs
                                    ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Tabel */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/60">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-8">#</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Siswa</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Jenis</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Periode</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Diajukan</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {list.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-16 text-slate-400">
                                            <AlertCircle size={32} className="mx-auto mb-2 opacity-40" />
                                            <p className="text-sm">Tidak ada pengajuan izin ditemukan.</p>
                                        </td>
                                    </tr>
                                ) : list.map((item, idx) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-slate-50/80 transition-colors"
                                    >
                                        <td className="px-5 py-3.5 text-slate-400 text-xs">
                                            {(meta.from ?? 1) + idx}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center
                                                                flex-shrink-0 text-blue-600 text-xs font-bold uppercase">
                                                    {item.student?.user?.name?.charAt(0) ?? '?'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800 leading-tight">
                                                        {item.student?.user?.name ?? '-'}
                                                    </p>
                                                    <p className="text-xs text-slate-400">{item.student?.classroom?.nama_kelas ?? '-'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <TypeBadge type={item.type} />
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-600">
                                            {dateRange(item.start_date, item.end_date)}
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-500 text-xs">
                                            {formatDate(item.created_at)}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <StatusBadge status={item.is_approved} />
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <button
                                                onClick={() => setSelected(item)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                                    bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                            >
                                                <Eye size={13} />
                                                {item.is_approved === 'Pending' ? 'Proses' : 'Detail'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {list.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <AlertCircle size={28} className="mx-auto mb-2 opacity-40" />
                                <p className="text-sm">Tidak ada pengajuan.</p>
                            </div>
                        ) : list.map((item) => (
                            <div key={item.id} className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center
                                                        flex-shrink-0 text-blue-600 text-sm font-bold uppercase">
                                            {item.student?.user?.name?.charAt(0) ?? '?'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 text-sm">{item.student?.user?.name ?? '-'}</p>
                                            <p className="text-xs text-slate-400">{item.student?.classroom?.nama_kelas ?? '-'}</p>
                                        </div>
                                    </div>
                                    <StatusBadge status={item.is_approved} />
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2 items-center text-xs text-slate-500">
                                    <TypeBadge type={item.type} />
                                    <span className="flex items-center gap-1">
                                        <Calendar size={11} />
                                        {dateRange(item.start_date, item.end_date)}
                                    </span>
                                </div>

                                <button
                                    onClick={() => setSelected(item)}
                                    className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold
                                        bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                >
                                    <Eye size={13} />
                                    {item.is_approved === 'Pending' ? 'Proses Izin' : 'Lihat Detail'}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <Pagination meta={meta} onPage={handlePage} />
                </div>
            </div>

            {/* Modal detail */}
            {selected && (
                <DetailModal
                    permission={selected}
                    onClose={() => setSelected(null)}
                />
            )}
        </AuthenticatedLayout>
    );
}