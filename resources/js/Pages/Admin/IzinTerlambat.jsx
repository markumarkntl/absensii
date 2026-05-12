import { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FlashMessage from '@/Components/FlashMessage';
import useEcho from '@/Hooks/useEcho';
import useToast from '@/Hooks/useToast';
import RealtimeToast from '@/Components/RealtimeToast';
import { Clock, CheckCircle2, XCircle, AlertTriangle, Bell } from 'lucide-react';

const STATUS_CFG = {
    Pending:  { label: 'Menunggu',  badge: 'bg-amber-100 text-amber-700 border-amber-200' },
    Approved: { label: 'Disetujui', badge: 'bg-green-100 text-green-700 border-green-200' },
    Rejected: { label: 'Ditolak',   badge: 'bg-red-100   text-red-700   border-red-200'   },
};

function RequestCard({ req }) {
    const [loading, setLoading] = useState(false);
    const cfg = STATUS_CFG[req.late_permission_status] ?? STATUS_CFG.Pending;

    const handleAction = (action) => {
        setLoading(true);
        router.patch(
            `/admin/izin-terlambat/${req.id}`,
            { action },
            { onFinish: () => setLoading(false) }
        );
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">

            {/* Header kartu */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center
                                    text-amber-700 text-sm font-bold flex-shrink-0 uppercase">
                        {req.student_name?.charAt(0)}
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800 text-sm">{req.student_name}</p>
                        <p className="text-xs text-slate-400">{req.classroom} · NISN: {req.nisn}</p>
                    </div>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.badge}`}>
                    {cfg.label}
                </span>
            </div>

            {/* Info tanggal & jam */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 rounded-xl p-3">
                <div>
                    <p className="text-slate-400">Tanggal</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{req.date}</p>
                </div>
                <div>
                    <p className="text-slate-400">Jam Masuk</p>
                    <p className="font-semibold text-amber-600 mt-0.5 flex items-center gap-1">
                        <Clock size={11} /> {req.time_in}
                    </p>
                </div>
            </div>

            {/* Alasan */}
            {req.late_reason && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <p className="text-xs font-semibold text-amber-700 mb-1">Alasan Keterlambatan:</p>
                    <p className="text-xs text-slate-600">{req.late_reason}</p>
                </div>
            )}

            {/* Tombol approve/reject */}
            {req.late_permission_status === 'Pending' && (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleAction('Approved')}
                        disabled={loading}
                        className="flex-1 py-2 rounded-xl bg-green-500 text-white text-xs font-bold
                                   hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-1.5
                                   transition-colors"
                    >
                        <CheckCircle2 size={13} /> Setujui
                    </button>
                    <button
                        onClick={() => handleAction('Rejected')}
                        disabled={loading}
                        className="flex-1 py-2 rounded-xl bg-red-500 text-white text-xs font-bold
                                   hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-1.5
                                   transition-colors"
                    >
                        <XCircle size={13} /> Tolak
                    </button>
                </div>
            )}

            {/* Waktu diproses */}
            {req.late_permission_status !== 'Pending' && req.late_approved_at && (
                <p className="text-xs text-slate-400 text-center">
                    Diproses: {new Date(req.late_approved_at).toLocaleString('id-ID')}
                </p>
            )}
        </div>
    );
}

export default function IzinTerlambat({ requests, pendingCount: initialPendingCount, statusFilter }) {
    const [filter, setFilter]               = useState(statusFilter ?? 'Pending');
    const [pendingCount, setPendingCount]   = useState(initialPendingCount);
    const [newCount, setNewCount]           = useState(0); // 🔴 counter notif baru yg belum dilihat
    const { toasts, addToast, removeToast } = useToast();

    // 🔴 Listen izin terlambat baru (dari siswa check-in terlambat)
    useEcho('admin.late-permission', 'late-permission.updated', useCallback((payload) => {
        const d = payload.data;

        if (d.action === 'new' || d.late_permission_status === 'Pending') {
            // Tambah pending count
            setPendingCount(prev => prev + 1);

            // Tambah counter notif baru
            if (filter !== 'Pending' && filter !== 'Semua') {
                setNewCount(prev => prev + 1);
            }

            addToast({
                type: 'terlambat',
                title: '⏰ Izin Terlambat Baru',
                message: `${d.student_name} — ${d.classroom}`,
            });
        }

        if (d.action === 'approved') {
            setPendingCount(prev => Math.max(0, prev - 1));
            addToast({
                type: 'approved',
                title: '✅ Izin Terlambat Disetujui',
                message: `${d.student_name} — ${d.classroom}`,
            });
        }

        if (d.action === 'rejected') {
            setPendingCount(prev => Math.max(0, prev - 1));
            addToast({
                type: 'rejected',
                title: '❌ Izin Terlambat Ditolak',
                message: `${d.student_name} — ${d.classroom}`,
            });
        }

        // Reload data jika filter cocok dengan status yang berubah
        const shouldReload =
            filter === 'Semua' ||
            (filter === 'Pending' && d.late_permission_status === 'Pending') ||
            (filter === 'Approved' && d.action === 'approved') ||
            (filter === 'Rejected' && d.action === 'rejected');

        if (shouldReload) {
            router.reload({ only: ['requests', 'pendingCount'] });
        }
    }, [filter, addToast]));

    const applyFilter = (val) => {
        setFilter(val);
        setNewCount(0); // reset counter saat pindah tab
        router.get('/admin/izin-terlambat', { status: val }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout title="Izin Terlambat">
            <FlashMessage />

            {/*  Toast real-time */}
            <RealtimeToast toasts={toasts} onRemove={removeToast} />

            <div className="space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Izin Hadir Terlambat</h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {pendingCount > 0
                                ? <span className="text-amber-600 font-semibold">{pendingCount} pengajuan menunggu persetujuan</span>
                                : 'Tidak ada pengajuan baru'
                            }
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* 🔴 Indikator real-time aktif */}
                        <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Real-time
                        </span>
                        {pendingCount > 0 && (
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                <AlertTriangle size={18} className="text-amber-600" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 flex-wrap">
                    {[
                        { key: 'Pending',  label: 'Menunggu', count: pendingCount },
                        { key: 'Approved', label: 'Disetujui' },
                        { key: 'Rejected', label: 'Ditolak'   },
                        { key: 'Semua',    label: 'Semua'     },
                    ].map(({ key, label, count }) => (
                        <button
                            key={key}
                            onClick={() => applyFilter(key)}
                            className={`relative px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors
                                ${filter === key
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            {label}
                            {/* Badge count */}
                            {count > 0 && (
                                <span className="ml-1.5 inline-flex items-center justify-center
                                                 min-w-4 h-4 px-1 rounded-full bg-amber-500 text-white text-xs font-bold">
                                    {count}
                                </span>
                            )}
                            {/*  Dot notif baru untuk tab lain */}
                            {key !== 'Pending' && key === filter && newCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full
                                                 flex items-center justify-center text-white text-xs animate-pulse" />
                            )}
                        </button>
                    ))}

                    {/*  Banner notif ada data baru */}
                    {newCount > 0 && filter !== 'Pending' && (
                        <button
                            onClick={() => applyFilter('Pending')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                       bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100
                                       transition-colors animate-pulse"
                        >
                            <Bell size={12} />
                            {newCount} izin terlambat baru — Lihat
                        </button>
                    )}
                </div>

                {/* List kartu */}
                {requests.data.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                        <Clock size={36} className="mx-auto mb-3 text-slate-300" />
                        <p className="text-sm text-slate-400">Tidak ada pengajuan izin terlambat.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {requests.data.map(req => (
                            <RequestCard key={req.id} req={req} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {requests.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: requests.last_page }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => router.get('/admin/izin-terlambat', { status: filter, page }, { preserveState: true })}
                                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors
                                    ${requests.current_page === page
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}