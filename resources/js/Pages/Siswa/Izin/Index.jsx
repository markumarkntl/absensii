import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FlashMessage from '@/Components/FlashMessage';
import {
    FileText, Plus, X, Upload, Calendar, Loader2,
} from 'lucide-react';

// ── Konfigurasi status ─────────────────────────────────────────────────────────
const STATUS_CFG = {
    Pending:  { label: 'Menunggu',  bg: 'bg-amber-100', text: 'text-amber-700' },
    Approved: { label: 'Disetujui', bg: 'bg-green-100', text: 'text-green-700' },
    Rejected: { label: 'Ditolak',   bg: 'bg-red-100',   text: 'text-red-700'   },
};

// ── Badge status ───────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const cfg = STATUS_CFG[status] ?? { label: status, bg: 'bg-slate-100', text: 'text-slate-600' };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
        </span>
    );
}

// ── Modal form izin ────────────────────────────────────────────────────────────
function IzinModal({ onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'Izin',
        start_date: '',
        end_date: '',
        reason: '',
        proof_file: null,
    });

    const [fileName, setFileName] = useState('');

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('proof_file', file);
            setFileName(file.name);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post('/siswa/izin', {
            forceFormData: true,
            onSuccess: () => { reset(); onClose(); },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800">Ajukan Izin / Sakit</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                    >
                        <X size={16} className="text-slate-600" />
                    </button>
                </div>

                <form onSubmit={submit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Tipe */}
                    <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Tipe Pengajuan</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Izin', 'Sakit'].map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setData('type', t)}
                                    className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${data.type === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
                    </div>

                    {/* Tanggal */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Dari Tanggal</label>
                            <div className="relative">
                                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="date"
                                    value={data.start_date}
                                    onChange={e => setData('start_date', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            {errors.start_date && <p className="text-xs text-red-500 mt-1">{errors.start_date}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Sampai Tanggal</label>
                            <div className="relative">
                                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="date"
                                    value={data.end_date}
                                    onChange={e => setData('end_date', e.target.value)}
                                    min={data.start_date || new Date().toISOString().split('T')[0]}
                                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            {errors.end_date && <p className="text-xs text-red-500 mt-1">{errors.end_date}</p>}
                        </div>
                    </div>

                    {/* Alasan */}
                    <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Alasan</label>
                        <textarea
                            value={data.reason}
                            onChange={e => setData('reason', e.target.value)}
                            rows={3}
                            placeholder="Jelaskan alasan izin / sakit kamu..."
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
                    </div>

                    {/* Bukti */}
                    <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                            Bukti Surat <span className="text-slate-400 font-normal">(opsional · PDF/JPG/PNG, maks 5MB)</span>
                        </label>
                        <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${fileName ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-slate-50'}`}>
                            <Upload size={16} className={fileName ? 'text-blue-500' : 'text-slate-400'} />
                            <span className={`text-sm truncate ${fileName ? 'text-blue-700 font-medium' : 'text-slate-500'}`}>
                                {fileName || 'Klik untuk upload file bukti'}
                            </span>
                            <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFile} />
                        </label>
                        {errors.proof_file && <p className="text-xs text-red-500 mt-1">{errors.proof_file}</p>}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {processing
                            ? <><Loader2 size={16} className="animate-spin" /> Mengirim...</>
                            : <><FileText size={16} /> Kirim Pengajuan</>
                        }
                    </button>
                </form>
            </div>
        </div>
    );
}

// ── Card izin ──────────────────────────────────────────────────────────────────
function IzinCard({ item }) {
    const isMultiDay = item.start_date !== item.end_date;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.type === 'Sakit' ? 'bg-blue-50' : 'bg-purple-50'}`}>
                        <FileText size={18} className={item.type === 'Sakit' ? 'text-blue-600' : 'text-purple-600'} />
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-sm">{item.type}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {item.start_date_formatted}
                            {isMultiDay && ` — ${item.end_date_formatted}`}
                        </p>
                    </div>
                </div>
                <StatusBadge status={item.is_approved} />
            </div>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed line-clamp-2">{item.reason}</p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                <span className="text-xs text-slate-400">
                    Diajukan {item.created_at_formatted}
                </span>
                {item.proof_file && (
                    <a
                        href={`/storage/${item.proof_file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 font-medium hover:underline"
                    >
                        Lihat Bukti
                    </a>
                )}
            </div>
        </div>
    );
}

// ── Pagination ─────────────────────────────────────────────────────────────────
function Pagination({ links }) {
    if (!links || links.length <= 3) return null;

    const getClass = (link) => {
        if (link.active) return 'bg-blue-600 text-white';
        if (link.url) return 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50';
        return 'bg-white border border-slate-100 text-slate-300 cursor-not-allowed';
    };

    return (
        <div className="flex items-center justify-center gap-1">
            {links.map((link, i) => (
                <a
                    key={i}
                    href={link.url ?? '#'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${getClass(link)}`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    onClick={(e) => { if (!link.url) e.preventDefault(); }}
                />
            ))}
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function IzinIndex({ permissions }) {
    const [showModal, setShowModal] = useState(false);
    const items = permissions?.data ?? [];

    const pending  = items.filter(i => i.is_approved === 'Pending').length;
    const approved = items.filter(i => i.is_approved === 'Approved').length;
    const rejected = items.filter(i => i.is_approved === 'Rejected').length;

    return (
        <AuthenticatedLayout title="Pengajuan Izin">
            <FlashMessage />
            {showModal && <IzinModal onClose={() => setShowModal(false)} />}

            <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Pengajuan Izin</h2>
                        <p className="text-sm text-slate-500 mt-0.5">Kelola izin dan surat sakit kamu</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus size={16} /> Ajukan Izin
                    </button>
                </div>

                {/* Ringkasan */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 text-center">
                        <p className="text-2xl font-bold text-amber-700">{pending}</p>
                        <p className="text-xs text-amber-600 mt-0.5">Pending</p>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-2xl p-3 text-center">
                        <p className="text-2xl font-bold text-green-700">{approved}</p>
                        <p className="text-xs text-green-600 mt-0.5">Disetujui</p>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-3 text-center">
                        <p className="text-2xl font-bold text-red-700">{rejected}</p>
                        <p className="text-xs text-red-600 mt-0.5">Ditolak</p>
                    </div>
                </div>

                {/* List */}
                {items.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
                        <FileText size={40} className="text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">Belum ada pengajuan izin</p>
                        <p className="text-xs text-slate-400 mt-1">Tekan "Ajukan Izin" untuk membuat pengajuan baru</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map((item, i) => <IzinCard key={i} item={item} />)}
                    </div>
                )}

                {/* Pagination */}
                <Pagination links={permissions?.links} />
            </div>
        </AuthenticatedLayout>
    );
}