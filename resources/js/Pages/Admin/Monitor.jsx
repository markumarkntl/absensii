import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FlashMessage from '@/Components/FlashMessage';
import {
    Users, CheckCircle2, HeartPulse, FileText,
    Clock, AlertTriangle, RefreshCw, ChevronDown,
    ChevronUp, Search, Filter, Activity,
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

// ── Kartu ringkasan ────────────────────────────────────────────────────────────
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

// ── Progress bar ───────────────────────────────────────────────────────────────
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

// ── Accordion per kelas ────────────────────────────────────────────────────────
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
                                    <div className="text-right flex-shrink-0">
                                        <StatusBadge status={siswa.status} />
                                        {siswa.time_in && (
                                            <p className="text-xs text-slate-400 mt-0.5">{siswa.time_in}</p>
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

// ── Live feed ──────────────────────────────────────────────────────────────────
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
                            <p className="text-xs font-mono text-slate-500 flex-shrink-0">{c.time_in}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Monitor({
    summary, byClass, recentCheckins,
    classOptions, filterClass, filterStatus, today,
}) {
    const [search, setSearch]         = useState('');
    const [localClass, setLocalClass] = useState(filterClass ?? '');
    const [localStatus, setLocalStatus] = useState(filterStatus ?? '');
    const [refreshing, setRefreshing] = useState(false);

    // Auto-refresh setiap 60 detik
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
            { kelas: localClass || undefined, status: localStatus || undefined },
            { preserveState: true, replace: true }
        );
    };

    const resetFilter = () => {
        setLocalClass('');
        setLocalStatus('');
        router.get(route('admin.monitor'), {}, { preserveState: true, replace: true });
    };

    const summaryCards = [
        { icon: Users,         label: 'Total Siswa',  value: summary.total,  color: 'bg-slate-600' },
        { icon: CheckCircle2,  label: 'Hadir',        value: summary.hadir,  color: 'bg-green-500', sub: `${summary.persenHadir}% kehadiran` },
        { icon: HeartPulse,    label: 'Sakit',        value: summary.sakit,  color: 'bg-blue-500'  },
        { icon: FileText,      label: 'Izin',         value: summary.izin,   color: 'bg-purple-500'},
        { icon: AlertTriangle, label: 'Alfa',         value: summary.alfa,   color: 'bg-red-500'   },
        { icon: Clock,         label: 'Belum Absen',  value: summary.belum,  color: 'bg-amber-500' },
    ];

    return (
        <AuthenticatedLayout title="Monitor Real-time">
            <FlashMessage />

            <div className="space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Monitor Absensi</h2>
                        <p className="text-sm text-slate-500 mt-0.5 capitalize">{today}</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                                   bg-white border border-slate-200 text-slate-600 hover:bg-slate-50
                                   transition-colors shadow-sm self-start sm:self-auto"
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {summaryCards.map(c => <SummaryCard key={c.label} {...c} />)}
                </div>

                {/* Progress bar gabungan */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-slate-700">Komposisi Kehadiran Hari Ini</p>
                        <p className="text-sm font-bold text-green-600">{summary.persenHadir}% hadir</p>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                        {[
                            { val: summary.hadir, color: 'bg-green-500' },
                            { val: summary.sakit, color: 'bg-blue-400'  },
                            { val: summary.izin,  color: 'bg-purple-400'},
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
                            { label: 'Sakit',        val: summary.sakit, dot: 'bg-blue-400'   },
                            { label: 'Izin',         val: summary.izin,  dot: 'bg-purple-400' },
                            { label: 'Alfa',         val: summary.alfa,  dot: 'bg-red-400'    },
                            { label: 'Belum Absen',  val: summary.belum, dot: 'bg-slate-300'  },
                        ].map(({ label, val, dot }) => (
                            <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
                                <span className={`w-2 h-2 rounded-full ${dot}`} />
                                {label}: <span className="font-semibold text-slate-700 ml-0.5">{val}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filter & Search */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama / NISN siswa..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200
                                           bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500
                                           focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <select
                            value={localClass}
                            onChange={e => setLocalClass(e.target.value)}
                            className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white
                                       outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                        >
                            <option value="">Semua Kelas</option>
                            {classOptions.map(k => (
                                <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                            ))}
                        </select>

                        <select
                            value={localStatus}
                            onChange={e => setLocalStatus(e.target.value)}
                            className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white
                                       outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                        >
                            <option value="">All Status</option>
                            {Object.entries(STATUS_CFG).map(([key, { label }]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>

                        <div className="flex gap-2">
                            <button
                                onClick={applyFilter}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
                                           bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            >
                                <Filter size={13} /> Terapkan
                            </button>
                            {(filterClass || filterStatus) && (
                                <button
                                    onClick={resetFilter}
                                    className="px-3 py-2 rounded-xl text-sm text-slate-500 border border-slate-200
                                               hover:bg-slate-50 transition-colors"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Accordion kelas + live feed */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Kelas — 2/3 lebar */}
                    <div className="lg:col-span-2 space-y-3">
                        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Users size={15} className="text-blue-500" />
                            Status Per Kelas
                            <span className="text-slate-400 font-normal">({byClass.length} kelas)</span>
                        </h3>

                        {byClass.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">
                                <Users size={32} className="mx-auto mb-2 text-slate-300" />
                                <p className="text-sm text-slate-400">Tidak ada data kelas.</p>
                            </div>
                        ) : byClass.map(kelas => (
                            <ClassAccordion key={kelas.id} kelas={kelas} searchQuery={search} />
                        ))}
                    </div>

                    {/* Live feed — 1/3 lebar */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Activity size={15} className="text-green-500" />
                            Check-in Real-time
                        </h3>
                        <LiveFeed checkins={recentCheckins} />
                        <p className="text-xs text-slate-400 text-center">Auto-refresh setiap 60 detik</p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}