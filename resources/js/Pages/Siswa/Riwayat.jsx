import { useState } from 'react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FlashMessage from '@/Components/FlashMessage';
import {
    CalendarDays, CheckCircle2, HeartPulse, FileText,
    AlertTriangle, ChevronLeft, ChevronRight, Clock,
    TrendingUp, Minus,
} from 'lucide-react';

// ── Konfigurasi status ─────────────────────────────────────────────────────────
const STATUS_CFG = {
    Hadir: { label: 'Hadir', bg: 'bg-green-100',  text: 'text-green-700',  icon: CheckCircle2,  dot: 'bg-green-500'  },
    Sakit: { label: 'Sakit', bg: 'bg-blue-100',   text: 'text-blue-700',   icon: HeartPulse,    dot: 'bg-blue-500'   },
    Izin:  { label: 'Izin',  bg: 'bg-purple-100', text: 'text-purple-700', icon: FileText,      dot: 'bg-purple-500' },
    Alfa:  { label: 'Alfa',  bg: 'bg-red-100',    text: 'text-red-700',    icon: AlertTriangle, dot: 'bg-red-500'    },
};

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

// ── Kartu statistik ────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, iconBg, iconColor }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                <Icon size={18} className={iconColor} />
            </div>
            <div>
                <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
        </div>
    );
}

// ── Badge status ───────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const cfg = STATUS_CFG[status] ?? { label: status, bg: 'bg-slate-100', text: 'text-slate-600' };
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
        </span>
    );
}

// ── Filter bulan/tahun ─────────────────────────────────────────────────────────
function MonthFilter({ year, month, currentYear, currentMonth }) {
    const canNext = !(year === currentYear && month === currentMonth);

    const navigate = (newYear, newMonth) => {
        router.get('/siswa/riwayat', { year: newYear, month: newMonth }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const prev = () => {
        if (month === 1) navigate(year - 1, 12);
        else navigate(year, month - 1);
    };

    const next = () => {
        if (!canNext) return;
        if (month === 12) navigate(year + 1, 1);
        else navigate(year, month + 1);
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={prev}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center
                           hover:bg-slate-50 transition-colors shadow-sm"
            >
                <ChevronLeft size={16} className="text-slate-600" />
            </button>
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-1.5 shadow-sm min-w-[150px] text-center">
                <p className="text-sm font-bold text-slate-800">
                    {MONTH_NAMES[month - 1]} {year}
                </p>
            </div>
            <button
                onClick={next}
                disabled={!canNext}
                className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-colors shadow-sm
                    ${canNext
                        ? 'bg-white border-slate-200 hover:bg-slate-50'
                        : 'bg-slate-50 border-slate-100 cursor-not-allowed opacity-40'}`}
            >
                <ChevronRight size={16} className="text-slate-600" />
            </button>
        </div>
    );
}

// ── Tabel riwayat ──────────────────────────────────────────────────────────────
function HistoryTable({ history }) {
    if (!history || history.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
                <CalendarDays size={40} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Belum ada data kehadiran di bulan ini</p>
                <p className="text-xs text-slate-400 mt-1">Data akan muncul setelah kamu melakukan absensi</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                Tanggal
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                Hari
                            </th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                Status
                            </th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                Jam Masuk
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                Keterangan
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {history.map((row, i) => {
                            const cfg = STATUS_CFG[row.status];
                            return (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{row.date_formatted}</td>
                                    <td className="px-4 py-3 text-slate-600 text-xs">{row.day_name}</td>
                                    <td className="px-4 py-3 text-center">
                                        <StatusBadge status={row.status} />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {row.time_in
                                            ? <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{row.time_in}</span>
                                            : <Minus size={14} className="text-slate-300 mx-auto" />
                                        }
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[180px] truncate">
                                        {row.note ?? <span className="text-slate-300">—</span>}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── Persentase kehadiran ───────────────────────────────────────────────────────
function AttendanceRate({ stats }) {
    const total  = (stats?.hadir ?? 0) + (stats?.sakit ?? 0) + (stats?.izin ?? 0) + (stats?.alfa ?? 0);
    const hadir  = stats?.hadir ?? 0;
    const pct    = total > 0 ? Math.round((hadir / total) * 100) : 0;
    const color  = pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-amber-600' : 'text-red-600';
    const barBg  = pct >= 80 ? 'bg-green-500'  : pct >= 60 ? 'bg-amber-500'  : 'bg-red-500';

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-slate-400" />
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tingkat Kehadiran</p>
                </div>
                <span className={`text-2xl font-bold ${color}`}>{pct}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${barBg}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <p className="text-xs text-slate-400 mt-1.5">{hadir} dari {total} hari tercatat</p>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function RiwayatIndex({ history, stats, filterYear, filterMonth, currentYear, currentMonth }) {
    const statCards = [
        { icon: CheckCircle2,  label: 'Hadir',  value: stats?.hadir ?? 0, iconBg: 'bg-green-50',  iconColor: 'text-green-600'  },
        { icon: HeartPulse,    label: 'Sakit',  value: stats?.sakit ?? 0, iconBg: 'bg-blue-50',   iconColor: 'text-blue-600'   },
        { icon: FileText,      label: 'Izin',   value: stats?.izin  ?? 0, iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
        { icon: AlertTriangle, label: 'Alfa',   value: stats?.alfa  ?? 0, iconBg: 'bg-red-50',    iconColor: 'text-red-600'    },
    ];

    return (
        <AuthenticatedLayout title="Riwayat Kehadiran">
            <FlashMessage />
            <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Riwayat Kehadiran</h2>
                        <p className="text-sm text-slate-500 mt-0.5">Rekap absensi kamu per bulan</p>
                    </div>
                    <MonthFilter
                        year={filterYear}
                        month={filterMonth}
                        currentYear={currentYear}
                        currentMonth={currentMonth}
                    />
                </div>

                {/* Persentase */}
                <AttendanceRate stats={stats} />

                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {statCards.map(c => <StatCard key={c.label} {...c} />)}
                </div>

                {/* Tabel */}
                <HistoryTable history={history} />
            </div>
        </AuthenticatedLayout>
    );
}