import { useState } from 'react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FlashMessage from '@/Components/FlashMessage';
import {
    BarChart3, CheckCircle2, HeartPulse, FileText,
    AlertTriangle, TrendingUp, CalendarDays, Award,
} from 'lucide-react';

const MONTH_NAMES = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

// ── Warna persentase ───────────────────────────────────────────────────────────
function pctColor(pct) {
    if (pct >= 80) return { text: 'text-green-600', bg: 'bg-green-500', badge: 'bg-green-100 text-green-700' };
    if (pct >= 60) return { text: 'text-amber-600', bg: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700' };
    return            { text: 'text-red-600',   bg: 'bg-red-500',   badge: 'bg-red-100 text-red-700'     };
}

// ── Kartu statistik ────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, iconBg, iconColor, sub }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                <Icon size={18} className={iconColor} />
            </div>
            <div>
                <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                {sub && <p className="text-xs font-medium text-slate-400">{sub}</p>}
            </div>
        </div>
    );
}

// ── Donut chart persentase ─────────────────────────────────────────────────────
function DonutChart({ stats }) {
    const hadir  = stats?.hadir ?? 0;
    const sakit  = stats?.sakit ?? 0;
    const izin   = stats?.izin  ?? 0;
    const alfa   = stats?.alfa  ?? 0;
    const total  = hadir + sakit + izin + alfa;
    const pct    = total > 0 ? Math.round((hadir / total) * 100) : 0;
    const colors = pctColor(pct);

    const r = 52, cx = 64, cy = 64;
    const circumference = 2 * Math.PI * r;
    const filled = total > 0 ? (hadir / total) * circumference : 0;

    const segments = [
        { val: hadir, color: '#22c55e' },
        { val: sakit, color: '#3b82f6' },
        { val: izin,  color: '#a855f7' },
        { val: alfa,  color: '#ef4444' },
    ];

    let offset = 0;
    const paths = segments.map((s, i) => {
        if (!s.val || total === 0) return null;
        const len   = (s.val / total) * circumference;
        const dash  = `${len} ${circumference - len}`;
        const el    = (
            <circle key={i} cx={cx} cy={cy} r={r}
                fill="none" stroke={s.color} strokeWidth={14}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
            />
        );
        offset += len;
        return el;
    });

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Komposisi Kehadiran</p>
            <div className="flex items-center gap-6">
                {/* Donut */}
                <div className="relative flex-shrink-0">
                    <svg width={128} height={128} viewBox="0 0 128 128">
                        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={14} />
                        {total > 0 ? paths : null}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className={`text-2xl font-bold leading-none ${colors.text}`}>{pct}%</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Hadir</p>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-2">
                    {[
                        { label: 'Hadir', val: hadir, color: 'bg-green-500'  },
                        { label: 'Sakit', val: sakit, color: 'bg-blue-500'   },
                        { label: 'Izin',  val: izin,  color: 'bg-purple-500' },
                        { label: 'Alfa',  val: alfa,  color: 'bg-red-500'    },
                    ].map(({ label, val, color }) => (
                        <div key={label} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
                                <span className="text-xs text-slate-600">{label}</span>
                            </div>
                            <span className="text-xs font-bold text-slate-800">{val} hari</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Chart 6 bulan ──────────────────────────────────────────────────────────────
function SixMonthChart({ data }) {
    if (!data || data.length === 0) return null;

    const maxVal = Math.max(...data.map(d => (d.hadir ?? 0) + (d.sakit ?? 0) + (d.izin ?? 0) + (d.alfa ?? 0)), 1);
    const h = 100, barW = 14, gap = 6;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Tren 6 Bulan Terakhir</p>
            <div className="overflow-x-auto">
                <svg width={data.length * (barW * 4 + gap * 3 + 20)} height={h + 30}
                     style={{ minWidth: '100%' }}>
                    {data.map((d, i) => {
                        const x      = i * (barW * 4 + gap * 3 + 20) + 10;
                        const vals   = [
                            { v: d.hadir ?? 0, color: '#22c55e' },
                            { v: d.sakit ?? 0, color: '#3b82f6' },
                            { v: d.izin  ?? 0, color: '#a855f7' },
                            { v: d.alfa  ?? 0, color: '#ef4444' },
                        ];
                        return (
                            <g key={i}>
                                {vals.map(({ v, color }, j) => {
                                    const bh = Math.round((v / maxVal) * h);
                                    return (
                                        <rect key={j}
                                            x={x + j * (barW + gap)} y={h - bh}
                                            width={barW} height={bh}
                                            fill={color} rx={3} opacity={0.85}
                                        />
                                    );
                                })}
                                <text x={x + (barW * 4 + gap * 3) / 2} y={h + 16}
                                      textAnchor="middle" fontSize={10} fill="#94a3b8">
                                    {MONTH_NAMES[(d.month ?? 1) - 1]}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
                {[
                    { label: 'Hadir', color: 'bg-green-500'  },
                    { label: 'Sakit', color: 'bg-blue-500'   },
                    { label: 'Izin',  color: 'bg-purple-500' },
                    { label: 'Alfa',  color: 'bg-red-500'    },
                ].map(({ label, color }) => (
                    <span key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className={`w-2 h-2 rounded-full ${color}`} />
                        {label}
                    </span>
                ))}
            </div>
        </div>
    );
}

// ── Filter tahun ───────────────────────────────────────────────────────────────
function YearFilter({ year, currentYear }) {
    const years = Array.from({ length: currentYear - 2023 }, (_, i) => 2024 + i);

    return (
        <select
            value={year}
            onChange={e => router.get('/siswa/laporan', { year: e.target.value }, { preserveState: true })}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold
                       text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function LaporanSiswaIndex({ yearlyStats, sixMonthsStats, filterYear, currentYear }) {
    const total  = (yearlyStats?.hadir ?? 0) + (yearlyStats?.sakit ?? 0) + (yearlyStats?.izin ?? 0) + (yearlyStats?.alfa ?? 0);
    const pct    = total > 0 ? Math.round(((yearlyStats?.hadir ?? 0) / total) * 100) : 0;
    const colors = pctColor(pct);

    const statCards = [
        { icon: CheckCircle2,  label: 'Total Hadir',  value: yearlyStats?.hadir ?? 0, iconBg: 'bg-green-50',  iconColor: 'text-green-600',  sub: 'hari' },
        { icon: HeartPulse,    label: 'Total Sakit',  value: yearlyStats?.sakit ?? 0, iconBg: 'bg-blue-50',   iconColor: 'text-blue-600',   sub: 'hari' },
        { icon: FileText,      label: 'Total Izin',   value: yearlyStats?.izin  ?? 0, iconBg: 'bg-purple-50', iconColor: 'text-purple-600', sub: 'hari' },
        { icon: AlertTriangle, label: 'Total Alfa',   value: yearlyStats?.alfa  ?? 0, iconBg: 'bg-red-50',    iconColor: 'text-red-600',    sub: 'hari' },
    ];

    return (
        <AuthenticatedLayout title="Laporan Kehadiran">
            <FlashMessage />
            <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Laporan Kehadiran</h2>
                        <p className="text-sm text-slate-500 mt-0.5">Rekap tahunan kehadiran kamu</p>
                    </div>
                    <YearFilter year={filterYear} currentYear={currentYear} />
                </div>

                {/* Summary hero */}
                <div className={`rounded-2xl p-5 border ${colors.text === 'text-green-600' ? 'bg-green-50 border-green-100' : colors.text === 'text-amber-600' ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors.text === 'text-green-600' ? 'bg-green-100' : colors.text === 'text-amber-600' ? 'bg-amber-100' : 'bg-red-100'}`}>
                            <Award size={24} className={colors.text} />
                        </div>
                        <div>
                            <p className={`text-3xl font-bold leading-none ${colors.text}`}>{pct}%</p>
                            <p className="text-sm text-slate-600 mt-0.5 font-medium">Tingkat Kehadiran Tahun {filterYear}</p>
                        </div>
                    </div>
                    <div className="mt-3 h-2 bg-white/60 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${colors.bg}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">{yearlyStats?.hadir ?? 0} hadir dari {total} hari tercatat</p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {statCards.map(c => <StatCard key={c.label} {...c} />)}
                </div>

                {/* Donut */}
                <DonutChart stats={yearlyStats} />

                {/* Chart tren */}
                <SixMonthChart data={sixMonthsStats} />
            </div>
        </AuthenticatedLayout>
    );
}