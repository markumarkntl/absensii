import { useState } from 'react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FlashMessage from '@/Components/FlashMessage';
import {
    BarChart3, Download, Search, Filter, RefreshCw,
    Users, CheckCircle2, HeartPulse, FileText,
    AlertTriangle, CalendarDays, TrendingUp, ChevronUp, ChevronDown,
} from 'lucide-react';

// ── Warna % kehadiran ──────────────────────────────────────────────────────────
function persenColor(pct) {
    if (pct >= 80) return 'text-green-600';
    if (pct >= 60) return 'text-amber-600';
    return 'text-red-600';
}

function persenBg(pct) {
    if (pct >= 80) return 'bg-green-500';
    if (pct >= 60) return 'bg-amber-500';
    return 'bg-red-500';
}

// ── Mini progress bar ──────────────────────────────────────────────────────────
function MiniBar({ pct }) {
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${persenBg(pct)}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                />
            </div>
            <span className={`text-xs font-bold w-10 text-right ${persenColor(pct)}`}>
                {pct}%
            </span>
        </div>
    );
}

// ── Kartu ringkasan ────────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color, sub }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={18} className="text-white" />
            </div>
            <div className="min-w-0">
                <p className="text-xl font-bold text-slate-800 leading-none">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{label}</p>
                {sub && <p className="text-xs font-medium text-slate-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

// ── Sort icon ──────────────────────────────────────────────────────────────────
function SortIcon({ col, sortCol, sortDir }) {
    if (sortCol !== col) return <ChevronUp size={12} className="text-slate-300" />;
    return sortDir === 'asc'
        ? <ChevronUp size={12} className="text-blue-500" />
        : <ChevronDown size={12} className="text-blue-500" />;
}

// ── Tabel laporan ──────────────────────────────────────────────────────────────
function ReportTable({ data }) {
    const [sortCol, setSortCol] = useState('persen_hadir');
    const [sortDir, setSortDir] = useState('desc');
    const [search,  setSearch]  = useState('');

    const toggleSort = (col) => {
        if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortCol(col); setSortDir('desc'); }
    };

    const filtered = data
        .filter(r =>
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            r.nisn?.includes(search) ||
            r.classroom.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            const va = a[sortCol] ?? 0;
            const vb = b[sortCol] ?? 0;
            const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
            return sortDir === 'asc' ? cmp : -cmp;
        });

    const cols = [
        { key: 'name',         label: 'Nama Siswa',    align: 'left'   },
        { key: 'classroom',    label: 'Kelas',         align: 'left'   },
        { key: 'hadir',        label: 'Hadir',         align: 'center' },
        { key: 'sakit',        label: 'Sakit',         align: 'center' },
        { key: 'izin',         label: 'Izin',          align: 'center' },
        { key: 'alfa',         label: 'Alfa',          align: 'center' },
        { key: 'belum',        label: 'Belum',         align: 'center' },
        { key: 'persen_hadir', label: '% Hadir',       align: 'left'   },
    ];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Search dalam tabel */}
            <div className="px-4 py-3 border-b border-slate-100">
                <div className="relative max-w-xs">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari nama / NISN / kelas..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-slate-200
                                   bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500
                                   focus:border-blue-500 transition-colors"
                    />
                </div>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50/60 border-b border-slate-100">
                            <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-8">#</th>
                            {cols.map(c => (
                                <th
                                    key={c.key}
                                    onClick={() => toggleSort(c.key)}
                                    className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide
                                                cursor-pointer select-none hover:text-slate-700 transition-colors
                                                ${c.align === 'center' ? 'text-center' : 'text-left'}`}
                                >
                                    <span className="inline-flex items-center gap-1">
                                        {c.label}
                                        <SortIcon col={c.key} sortCol={sortCol} sortDir={sortDir} />
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={cols.length + 1} className="text-center py-14 text-slate-400">
                                    <BarChart3 size={32} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">Tidak ada data laporan.</p>
                                </td>
                            </tr>
                        ) : filtered.map((row, idx) => (
                            <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="px-5 py-3.5 text-xs text-slate-400">{idx + 1}</td>
                                <td className="px-4 py-3.5">
                                    <p className="font-semibold text-slate-800">{row.name}</p>
                                    <p className="text-xs text-slate-400 font-mono">{row.nisn}</p>
                                </td>
                                <td className="px-4 py-3.5">
                                    <p className="text-slate-700 text-xs font-medium">{row.classroom}</p>
                                    {row.jurusan && (
                                        <p className="text-xs text-slate-400 truncate max-w-[140px]">{row.jurusan}</p>
                                    )}
                                </td>
                                <td className="px-4 py-3.5 text-center">
                                    <span className="font-semibold text-green-600">{row.hadir}</span>
                                </td>
                                <td className="px-4 py-3.5 text-center">
                                    <span className="font-semibold text-blue-600">{row.sakit}</span>
                                </td>
                                <td className="px-4 py-3.5 text-center">
                                    <span className="font-semibold text-purple-600">{row.izin}</span>
                                </td>
                                <td className="px-4 py-3.5 text-center">
                                    <span className={`font-semibold ${row.alfa > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                        {row.alfa}
                                    </span>
                                </td>
                                <td className="px-4 py-3.5 text-center">
                                    <span className={`font-semibold ${row.belum > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                                        {row.belum}
                                    </span>
                                </td>
                                <td className="px-4 py-3.5 min-w-[120px]">
                                    <MiniBar pct={row.persen_hadir} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
                {filtered.length === 0 ? (
                    <p className="text-center py-10 text-sm text-slate-400">Tidak ada data.</p>
                ) : filtered.map((row, idx) => (
                    <div key={row.id} className="p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                            <div>
                                <p className="font-semibold text-slate-800 text-sm">{row.name}</p>
                                <p className="text-xs text-slate-400">{row.classroom} · <span className="font-mono">{row.nisn}</span></p>
                            </div>
                            <span className={`text-lg font-bold ${persenColor(row.persen_hadir)}`}>
                                {row.persen_hadir}%
                            </span>
                        </div>
                        <MiniBar pct={row.persen_hadir} />
                        <div className="flex gap-3 text-xs text-slate-500 flex-wrap">
                            <span className="text-green-600 font-semibold">H: {row.hadir}</span>
                            <span className="text-blue-600 font-semibold">S: {row.sakit}</span>
                            <span className="text-purple-600 font-semibold">I: {row.izin}</span>
                            <span className="text-red-600 font-semibold">A: {row.alfa}</span>
                            <span className="text-amber-600 font-semibold">B: {row.belum}</span>
                            <span className="text-slate-400">dari {row.total_efektif} hari</span>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length > 0 && (
                <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
                    Menampilkan {filtered.length} dari {data.length} siswa
                </div>
            )}
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function LaporanIndex({
    report, summary, classOptions, studentOptions, filters,
}) {
    const [form, setForm] = useState({
        date_from:    filters.date_from    ?? '',
        date_to:      filters.date_to      ?? '',
        classroom_id: filters.classroom_id ?? '',
        student_id:   filters.student_id   ?? '',
    });

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const applyFilter = () => {
        router.get(
            route('admin.laporan'),
            {
                date_from:    form.date_from    || undefined,
                date_to:      form.date_to      || undefined,
                classroom_id: form.classroom_id || undefined,
                student_id:   form.student_id   || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const resetFilter = () => {
        setForm({ date_from: '', date_to: '', classroom_id: '', student_id: '' });
        router.get(route('admin.laporan'), {}, { preserveState: true, replace: true });
    };

    const exportCSV = () => {
        const params = new URLSearchParams({
            date_from:    filters.date_from    ?? '',
            date_to:      filters.date_to      ?? '',
            classroom_id: filters.classroom_id ?? '',
        });
        window.location.href = route('admin.laporan.export') + '?' + params.toString();
    };

    const summaryCards = [
        { icon: Users,        label: 'Total Siswa',      value: summary.total_siswa, color: 'bg-slate-600' },
        { icon: TrendingUp,   label: 'Rata-rata Hadir',  value: summary.rata_hadir + '%', color: 'bg-green-500' },
        { icon: CheckCircle2, label: 'Total Hadir',      value: summary.total_hadir, color: 'bg-green-400' },
        { icon: HeartPulse,   label: 'Total Sakit',      value: summary.total_sakit, color: 'bg-blue-500'  },
        { icon: FileText,     label: 'Total Izin',       value: summary.total_izin,  color: 'bg-purple-500'},
        { icon: AlertTriangle,label: 'Total Alfa',       value: summary.total_alfa,  color: 'bg-red-500'   },
    ];

    return (
        <AuthenticatedLayout title="Laporan Absensi">
            <FlashMessage />

            <div className="space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Laporan Absensi</h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Rekap kehadiran siswa dalam rentang tanggal.
                            Hari efektif: <span className="font-semibold text-slate-700">{summary.effective_days} hari</span>
                        </p>
                    </div>
                    <button
                        onClick={exportCSV}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                                   bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm self-start sm:self-auto"
                    >
                        <Download size={14} /> Export CSV
                    </button>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {summaryCards.map(c => <SummaryCard key={c.label} {...c} />)}
                </div>

                {/* Panel filter */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <Filter size={12} /> Filter Laporan
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Tanggal mulai */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Dari Tanggal</label>
                            <div className="relative">
                                <CalendarDays size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="date"
                                    value={form.date_from}
                                    onChange={e => set('date_from', e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-200
                                               bg-white outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                                />
                            </div>
                        </div>

                        {/* Tanggal akhir */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Sampai Tanggal</label>
                            <div className="relative">
                                <CalendarDays size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="date"
                                    value={form.date_to}
                                    onChange={e => set('date_to', e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-200
                                               bg-white outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                                />
                            </div>
                        </div>

                        {/* Filter kelas */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Kelas</label>
                            <select
                                value={form.classroom_id}
                                onChange={e => {
                                    set('classroom_id', e.target.value);
                                    set('student_id', ''); // reset siswa
                                }}
                                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200
                                           bg-white outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                            >
                                <option value="">Semua Kelas</option>
                                {classOptions.map(k => (
                                    <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filter siswa (muncul hanya jika kelas dipilih) */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Siswa
                                {!form.classroom_id && (
                                    <span className="ml-1 text-slate-400 font-normal normal-case">(pilih kelas dulu)</span>
                                )}
                            </label>
                            <select
                                value={form.student_id}
                                onChange={e => set('student_id', e.target.value)}
                                disabled={!form.classroom_id}
                                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200
                                           bg-white outline-none focus:ring-2 focus:ring-blue-500 text-slate-700
                                           disabled:bg-slate-50 disabled:text-slate-400"
                            >
                                <option value="">Semua Siswa</option>
                                {studentOptions.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.nisn})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={applyFilter}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
                                       bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                            <Filter size={13} /> Tampilkan
                        </button>
                        <button
                            onClick={resetFilter}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
                                       border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            <RefreshCw size={13} /> Reset
                        </button>
                    </div>
                </div>

                {/* Tabel */}
                <ReportTable data={report} />

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-xs text-slate-500 px-1">
                    {[
                        { dot: 'bg-green-500',  label: 'H = Hadir'       },
                        { dot: 'bg-blue-500',   label: 'S = Sakit'       },
                        { dot: 'bg-purple-500', label: 'I = Izin'        },
                        { dot: 'bg-red-500',    label: 'A = Alfa'        },
                        { dot: 'bg-amber-500',  label: 'B = Belum tercatat'},
                    ].map(({ dot, label }) => (
                        <span key={label} className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${dot}`} />
                            {label}
                        </span>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}