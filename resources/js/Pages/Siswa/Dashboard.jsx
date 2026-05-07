import { usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FlashMessage from '@/Components/FlashMessage';
import {
    CheckCircle2, HeartPulse, FileText, AlertTriangle,
    Clock, ClipboardCheck, CalendarDays, ChevronRight,
} from 'lucide-react';

// ── Konfigurasi status hari ini ───────────────────────────────────────────────
const TODAY_CFG = {
    Hadir: { label: 'Sudah Hadir',     bg: 'bg-green-50',  border: 'border-green-200',  icon: CheckCircle2,  ic: 'text-green-600',  badge: 'bg-green-100 text-green-700'   },
    Sakit: { label: 'Sakit (Terdata)', bg: 'bg-blue-50',   border: 'border-blue-200',   icon: HeartPulse,    ic: 'text-blue-600',   badge: 'bg-blue-100 text-blue-700'     },
    Izin:  { label: 'Izin (Terdata)',  bg: 'bg-purple-50', border: 'border-purple-200', icon: FileText,      ic: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
    Alfa:  { label: 'Tidak Hadir',     bg: 'bg-red-50',    border: 'border-red-200',    icon: AlertTriangle, ic: 'text-red-600',    badge: 'bg-red-100 text-red-700'       },
};

// ── Banner status absen hari ini ───────────────────────────────────────────────
function TodayBanner({ attendance, deadline }) {
    if (!attendance) {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Clock size={20} className="text-amber-600" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-800 text-sm">Belum Absen Hari Ini</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Batas: <span className="font-semibold text-amber-700">{deadline?.slice(0, 5)} WIB</span>
                        </p>
                    </div>
                </div>
                <Link
                    href="/siswa/presensi"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500
                               text-white text-sm font-semibold hover:bg-amber-600 transition-colors flex-shrink-0"
                >
                    <ClipboardCheck size={14} /> Absen
                    <ChevronRight size={13} />
                </Link>
            </div>
        );
    }

    const cfg  = TODAY_CFG[attendance.status] ?? TODAY_CFG.Alfa;
    const Icon = cfg.icon;

    return (
        <div className={`${cfg.bg} border ${cfg.border} rounded-2xl p-5 flex items-center gap-3`}>
            <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center flex-shrink-0">
                <Icon size={20} className={cfg.ic} />
            </div>
            <div>
                <p className="font-bold text-slate-800 text-sm">Status Hari Ini</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        {cfg.label}
                    </span>
                    {attendance.time_in && (
                        <span className="text-xs text-slate-500">
                            Masuk: <span className="font-mono font-semibold">{attendance.time_in}</span>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Kartu statistik ────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, iconBg, iconColor }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                <Icon size={18} className={iconColor} />
            </div>
            <div>
                <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-tight">{label}</p>
            </div>
        </div>
    );
}

// ── Chart 6 bulan (SVG stacked bar) ───────────────────────────────────────────
function SixMonthChart({ data }) {
    const maxVal = Math.max(...data.map(d => d.hadir + d.sakit + d.izin + d.alfa), 1);
    const barW = 32;
    const gap  = 14;
    const h    = 72;
    const totalW = data.length * (barW + gap) - gap;

    const segments = [
        { key: 'alfa',  color: '#ef4444' },
        { key: 'izin',  color: '#a855f7' },
        { key: 'sakit', color: '#3b82f6' },
        { key: 'hadir', color: '#22c55e' },
    ];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-700 mb-4">Tren Kehadiran 6 Bulan Terakhir</p>
            <div className="overflow-x-auto">
                <svg width={totalW + 8} height={h + 30} className="block mx-auto">
                    {data.map((d, i) => {
                        const x = i * (barW + gap);
                        let yOff = h;
                        return (
                            <g key={i}>
                                <rect x={x} y={0} width={barW} height={h} fill="#f1f5f9" rx={4} />
                                {segments.map(({ key, color }) => {
                                    const val  = d[key] ?? 0;
                                    if (!val) return null;
                                    const barH = Math.max((val / maxVal) * h, 2);
                                    yOff -= barH;
                                    const y = yOff;
                                    return (
                                        <rect key={key} x={x} y={y} width={barW} height={barH}
                                              fill={color} opacity={0.85}
                                              rx={key === 'hadir' && yOff === 0 ? 4 : 0} />
                                    );
                                })}
                                {d.hadir > 0 && (
                                    <text x={x + barW / 2}
                                          y={h - (d.hadir / maxVal) * h - 4}
                                          textAnchor="middle" fontSize={9}
                                          fill="#475569" fontWeight="600">
                                        {d.hadir}
                                    </text>
                                )}
                                <text x={x + barW / 2} y={h + 16}
                                      textAnchor="middle" fontSize={10} fill="#94a3b8">
                                    {d.month}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
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

// ── Quick links ────────────────────────────────────────────────────────────────
function QuickLinks() {
    const links = [
        { href: '/siswa/presensi', label: 'Absen Sekarang', icon: ClipboardCheck, color: 'text-blue-600',   bg: 'bg-blue-50'   },
        { href: '/siswa/riwayat',  label: 'Riwayat',        icon: CalendarDays,   color: 'text-green-600',  bg: 'bg-green-50'  },
        { href: '/siswa/izin',     label: 'Ajukan Izin',    icon: FileText,       color: 'text-purple-600', bg: 'bg-purple-50' },
    ];
    return (
        <div className="grid grid-cols-3 gap-3">
            {links.map(({ href, label, icon: Icon, color, bg }) => (
                <Link key={href} href={href}
                      className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col items-center
                                 gap-2 hover:border-blue-200 hover:shadow-sm transition-all shadow-sm text-center">
                    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                        <Icon size={18} className={color} />
                    </div>
                    <p className="text-xs font-semibold text-slate-700 leading-tight">{label}</p>
                </Link>
            ))}
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Dashboard({ todayAttendance, monthlyStats, sixMonthsStats, deadline }) {
    const { auth } = usePage().props;
    const firstName = auth.user?.name?.split(' ')[0] ?? 'Siswa';
    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
    const monthLabel = new Date().toLocaleDateString('id-ID', { month: 'long' });

    const stats = [
        { icon: CheckCircle2,  label: `Hadir ${monthLabel}`, value: monthlyStats?.hadir ?? 0, iconBg: 'bg-green-50',  iconColor: 'text-green-600'  },
        { icon: HeartPulse,    label: 'Sakit',               value: monthlyStats?.sakit ?? 0, iconBg: 'bg-blue-50',   iconColor: 'text-blue-600'   },
        { icon: FileText,      label: 'Izin',                value: monthlyStats?.izin  ?? 0, iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
        { icon: AlertTriangle, label: 'Alfa',                value: monthlyStats?.alfa  ?? 0, iconBg: 'bg-red-50',    iconColor: 'text-red-600'    },
    ];

    return (
        <AuthenticatedLayout title="Dashboard">
            <FlashMessage />
            <div className="space-y-5">
                {/* Sapaan */}
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Halo, {firstName}! 👋</h2>
                    <p className="text-sm text-slate-500 mt-0.5 capitalize">{today}</p>
                </div>

                {/* Status hari ini */}
                <TodayBanner attendance={todayAttendance} deadline={deadline} />

                {/* Quick links */}
                <QuickLinks />

                {/* Statistik bulan ini */}
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                        Statistik Bulan Ini
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {stats.map(c => <StatCard key={c.label} {...c} />)}
                    </div>
                </div>

                {/* Chart 6 bulan */}
                {sixMonthsStats?.length > 0 && (
                    <SixMonthChart data={sixMonthsStats} />
                )}
            </div>
        </AuthenticatedLayout>
    );
}