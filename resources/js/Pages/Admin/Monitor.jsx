import { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FlashMessage from '@/Components/FlashMessage';
import useEcho from '@/Hooks/useEcho';
import useToast from '@/Hooks/useToast';
import RealtimeToast from '@/Components/RealtimeToast';
import {
    Users, CheckCircle2, HeartPulse, FileText,
    Clock, AlertTriangle, RefreshCw, ChevronDown,
    ChevronUp, Activity,
} from 'lucide-react';

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CFG = {
    Hadir: { label: 'Hadir',       dot: 'bg-green-500',  badge: 'bg-green-100  text-green-700  border-green-200'  },
    Sakit: { label: 'Sakit',       dot: 'bg-blue-500',   badge: 'bg-blue-100   text-blue-700   border-blue-200'   },
    Izin:  { label: 'Izin',        dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700 border-purple-200' },
    Alfa:  { label: 'Alfa',        dot: 'bg-red-500',    badge: 'bg-red-100    text-red-700    border-red-200'    },
    Belum: { label: 'Belum Absen', dot: 'bg-slate-300',  badge: 'bg-slate-100  text-slate-500  border-slate-200'  },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CFG[status] ?? STATUS_CFG.Belum;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function SummaryCard({ icon: Icon, label, value, color, sub }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={20} className="text-white" />
            </div>
            <div className="min-w-0">
                <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{label}</p>
                {sub && <p className="text-xs text-green-600 font-medium mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

function ProgressBar({ value, color = 'bg-green-500' }) {
    return (
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-500 ${color}`}
                style={{ width: `${Math.min(value, 100)}%` }}
            />
        </div>
    );
}

function ClassAccordion({ kelas, searchQuery }) {
    const [open, setOpen] = useState(false);

    const filtered = searchQuery
        ? kelas.students.filter(s =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.nisn && s.nisn.includes(searchQuery))
          )
        : kelas.students;

    const persenColor =
        kelas.persen >= 80 ? 'bg-green-500' :
        kelas.persen >= 50 ? 'bg-amber-500' : 'bg-red-500';

    const countByStatus = (st) => kelas.students.filter(s => s.status === st).length;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <button
                onClick={() => setOpen(!open)}
                className="w-full px-5 py-4 flex items-center gap-4 hover:bg-slate-50/80 transition-colors text-left"
            >
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Users size={18} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-slate-800 text-sm">{kelas.name}</p>
                        {kelas.jurusan && (
                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                {kelas.jurusan}
                            </span>
                        )}
                    </div>
                    <ProgressBar value={kelas.persen} color={persenColor} />
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                        <span className="text-green-600 font-semibold">{kelas.hadir} hadir</span>
                        <span>dari {kelas.total} siswa</span>
                        <span className="font-bold text-slate-700">{kelas.persen}%</span>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                    {['Sakit', 'Izin', 'Alfa', 'Belum'].map(s => {
                        const count = countByStatus(s);
                        if (!count) return null;
                        return (
                            <span key={s} className="flex items-center gap-1 text-xs text-slate-500">
                                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CFG[s]?.dot}`} />
                                {count}
                            </span>
                        );
                    })}
                </div>
                {open
                    ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0" />
                    : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
            </button>

            {open && (
                <div className="border-t border-slate-100">
                    {filtered.length === 0 ? (
                        <p className="text-center py-6 text-sm text-slate-400">Tidak ada siswa ditemukan.</p>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {filtered.map(siswa => (
                                <div
                                    key={siswa.id}
                                    className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors"
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                                    flex-shrink-0 text-xs font-bold uppercase text-white
                                                    ${STATUS_CFG[siswa.status]?.dot ?? 'bg-slate-300'}`}>
                                        {siswa.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{siswa.name}</p>
                                        {siswa.nisn && (
                                            <p className="text-xs text-slate-400 font-mono">{siswa.nisn}</p>
                                        )}
                                    </div>
                                    <div className="text-right flex-shrink-0 space-y-0.5">
                                        <div className="flex items-center gap-1.5 justify-end">
                                            <StatusBadge status={siswa.status} />
                                            {siswa.is_late && (
                                                <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200
                                                                  px-1.5 py-0.5 rounded-full font-semibold">
                                                    Terlambat
                                                </span>
                                            )}
                                        </div>
                                        {siswa.time_in && (
                                            <p className="text-xs text-slate-400">Masuk: {siswa.time_in}</p>
                                        )}
                                        {siswa.time_out && (
                                            <p className="text-xs text-slate-400">Pulang: {siswa.time_out}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Live Feed ──────────────────────────────────────────────────────────────────
function LiveFeed({ checkins }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <Activity size={15} className="text-green-500" />
                <h3 className="text-sm font-bold text-slate-700">Check-in Terbaru</h3>
                <span className="ml-auto flex items-center gap-1.5 text-xs text-green-600 font-medium">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Live
                </span>
            </div>
            {checkins.length === 0 ? (
                <p className="text-center py-8 text-sm text-slate-400">Belum ada check-in hari ini.</p>
            ) : (
                <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                    {checkins.map(c => (
                        <div key={c.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                            <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center
                                            text-xs font-bold text-green-700 flex-shrink-0 uppercase">
                                {c.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-700 truncate">{c.name}</p>
                                <p className="text-xs text-slate-400">{c.classroom}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-xs font-mono text-slate-500">{c.time_in}</p>
                                {c.is_late && (
                                    <span className="text-xs text-amber-600 font-semibold">Terlambat</span>
                                )}
                                {c.time_out && (
                                    <p className="text-xs text-blue-500 font-mono">Pulang: {c.time_out}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Monitor({
    summary: initialSummary,
    byClass,
    recentCheckins: initialCheckins,
    classOptions,
    filterClass,
    filterStatus,
    search: initialSearch,
    today,
}) {
    const [search, setSearch]           = useState(initialSearch ?? '');
    const [localClass, setLocalClass]   = useState(filterClass ?? '');
    const [localStatus, setLocalStatus] = useState(filterStatus ?? '');
    const [refreshing, setRefreshing]   = useState(false);

    // State real-time
    const [summary, setSummary]   = useState(initialSummary);
    const [checkins, setCheckins] = useState(initialCheckins);
    const { toasts, addToast, removeToast } = useToast();

    // Listen event check-in
    useEcho('admin.attendance', 'attendance.checked-in', useCallback((payload) => {
        const d = payload.data;

        setCheckins(prev => {
            const exists = prev.find(c => c.id === d.id);
            if (exists) return prev;
            return [
                {
                    id: d.id, name: d.student_name,
                    classroom: d.classroom, time_in: d.time_in,
                    is_late: d.is_late, time_out: null,
                },
                ...prev,
            ].slice(0, 15);
        });

        setSummary(prev => ({
            ...prev,
            hadir: prev.hadir + 1,
            belum: Math.max(0, prev.belum - 1),
            persenHadir: prev.total > 0
                ? Math.round(((prev.hadir + 1) / prev.total) * 100)
                : 0,
        }));

        addToast({
            type: d.is_late ? 'terlambat' : 'check-in',
            title: d.is_late ? '⚠️ Siswa Terlambat' : '✅ Siswa Check-in',
            message: `${d.student_name} — ${d.classroom}`,
        });
    }, [addToast]));

    // Listen event check-out
    useEcho('admin.attendance', 'attendance.checked-out', useCallback((payload) => {
        const d = payload.data;

        setCheckins(prev =>
            prev.map(c => c.id === d.id ? { ...c, time_out: d.time_out } : c)
        );

        addToast({
            type: 'check-out',
            title: '🏠 Siswa Check-out',
            message: `${d.student_name} — ${d.classroom} pukul ${d.time_out}`,
        });
    }, [addToast]));

    // Auto-refresh setiap 60 detik (fallback)
    useEffect(() => {
        const id = setInterval(() => {
            router.reload({ only: ['summary', 'byClass', 'recentCheckins'] });
        }, 60_000);
        return () => clearInterval(id);
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        router.reload({
            only: ['summary', 'byClass', 'recentCheckins'],
            onFinish: () => setRefreshing(false),
        });
    };

    const applyFilter = () => {
        router.get(
            route('admin.monitor'),
            {
                kelas:  localClass  || undefined,
                status: localStatus || undefined,
                search: search      || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const resetFilter = () => {
        setLocalClass('');
        setLocalStatus('');
        setSearch('');
        router.get(route('admin.monitor'), {}, { preserveState: true, replace: true });
    };

    const summaryCards = [
        { icon: Users,         label: 'Total Siswa', value: summary.total, color: 'bg-slate-600' },
        { icon: CheckCircle2,  label: 'Hadir',       value: summary.hadir, color: 'bg-green-500', sub: `${summary.persenHadir}% kehadiran` },
        { icon: HeartPulse,    label: 'Sakit',       value: summary.sakit, color: 'bg-blue-500'  },
        { icon: FileText,      label: 'Izin',        value: summary.izin,  color: 'bg-purple-500' },
        { icon: AlertTriangle, label: 'Alfa',        value: summary.alfa,  color: 'bg-red-500'   },
        { icon: Clock,         label: 'Belum Absen', value: summary.belum, color: 'bg-amber-500' },
    ];

    return (
        <AuthenticatedLayout title="Monitor Real-time">
            <FlashMessage />

            <RealtimeToast toasts={toasts} onRemove={removeToast} />

            <div className="space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Monitor Absensi</h2>
                        <p className="text-sm text-slate-500 mt-0.5 capitalize">{today}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Real-time aktif
                        </span>
                        <button
                            onClick={handleRefresh}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                                       bg-white border border-slate-200 text-slate-600 hover:bg-slate-50
                                       transition-colors shadow-sm"
                        >
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {summaryCards.map(c => <SummaryCard key={c.label} {...c} />)}
                </div>

                {/* Progress bar komposisi */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-slate-700">Komposisi Kehadiran Hari Ini</p>
                        <p className="text-sm font-bold text-green-600">{summary.persenHadir}% hadir</p>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                        {[
                            { val: summary.hadir, color: 'bg-green-500' },
                            { val: summary.sakit, color: 'bg-blue-400'  },
                            { val: summary.izin,  color: 'bg-purple-400' },
                            { val: summary.alfa,  color: 'bg-red-400'   },
                            { val: summary.belum, color: 'bg-slate-200' },
                        ].map(({ val, color }, i) =>
                            summary.total > 0 && val > 0 ? (
                                <div
                                    key={i}
                                    className={`h-full ${color} transition-all duration-500`}
                                    style={{ width: `${(val / summary.total) * 100}%` }}
                                />
                            ) : null
                        )}
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2.5">
                        {[
                            { label: 'Hadir',       val: summary.hadir, dot: 'bg-green-500'  },
                            { label: 'Sakit',       val: summary.sakit, dot: 'bg-blue-400'   },
                            { label: 'Izin',        val: summary.izin,  dot: 'bg-purple-400' },
                            { label: 'Alfa',        val: summary.alfa,  dot: 'bg-red-400'    },
                            { label: 'Belum Absen', val: summary.belum, dot: 'bg-slate-300'  },
                        ].map(({ label, val, dot }) => (
                            <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
                                <span className={`w-2 h-2 rounded-full ${dot}`} />
                                {label}: <span className="font-semibold text-slate-700 ml-0.5">{val}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filter & Search */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-40">
                        <label className="text-xs font-semibold text-slate-600 mb-1 block">Kelas</label>
                        <select
                            value={localClass}
                            onChange={e => setLocalClass(e.target.value)}
                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Semua Kelas</option>
                            {classOptions.map(k => (
                                <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1 min-w-40">
                        <label className="text-xs font-semibold text-slate-600 mb-1 block">Status</label>
                        <select
                            value={localStatus}
                            onChange={e => setLocalStatus(e.target.value)}
                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Semua Status</option>
                            {['Hadir', 'Sakit', 'Izin', 'Alfa', 'Belum'].map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1 min-w-48">
                        <label className="text-xs font-semibold text-slate-600 mb-1 block">Cari Siswa</label>
                        <input
                            type="text"
                            placeholder="Nama / NISN..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyFilter()}
                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={applyFilter}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                        Filter
                    </button>
                    <button
                        onClick={resetFilter}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        Reset
                    </button>
                </div>

                {/* Content grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Daftar kelas */}
                    <div className="lg:col-span-2 space-y-3">
                        {byClass.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                                <p className="text-slate-400 text-sm">Tidak ada data yang cocok.</p>
                            </div>
                        ) : (
                            byClass.map(k => (
                                <ClassAccordion key={k.id} kelas={k} searchQuery={search} />
                            ))
                        )}
                    </div>

                    {/* Live feed */}
                    <div className="lg:col-span-1">
                        <LiveFeed checkins={checkins} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}