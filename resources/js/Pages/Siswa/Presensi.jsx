import { useRef, useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FlashMessage from '@/Components/FlashMessage';
import {
    CheckCircle2, Clock, Camera, Loader2, X,
    ShieldCheck, CalendarDays, AlertTriangle,
    LogOut, Timer,
} from 'lucide-react';

// ── Jam Real-time ─────────────────────────────────────────────
function LiveClock() {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    return (
        <span className="font-mono tabular-nums">
            {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
    );
}

// ── Sudah Check-in ────────────────────────────────────────────
function AlreadyCheckedIn({ attendance, checkoutOpen, onCheckout, checkingOut }) {
    const isLate     = attendance?.is_late;
    const lateStatus = attendance?.late_permission_status;
    const hasOut     = !!attendance?.time_out;

    const now = new Date();
    const [coH, coM] = (checkoutOpen ?? '14:00:00').split(':').map(Number);
    const canCheckout = now.getHours() > coH || (now.getHours() === coH && now.getMinutes() >= coM);

    return (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center
                ${isLate ? 'bg-amber-100' : 'bg-green-100'}`}>
                {isLate
                    ? <AlertTriangle size={38} className="text-amber-500" />
                    : <CheckCircle2  size={38} className="text-green-500" />
                }
            </div>

            <div>
                <h3 className="text-xl font-bold text-slate-800">
                    {isLate ? 'Hadir (Terlambat)' : 'Sudah Absen!'}
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                    {isLate
                        ? 'Kamu hadir terlambat. Izin terlambatmu sedang diproses admin.'
                        : 'Kamu sudah melakukan absensi hari ini.'}
                </p>
            </div>

            {/* Detail waktu */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 px-6 py-4 w-full max-w-xs space-y-2.5 text-left">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Jam Masuk</span>
                    <span className={`font-semibold ${isLate ? 'text-amber-600' : 'text-slate-800'}`}>
                        {attendance?.time_in ?? '—'}
                        {isLate && <span className="ml-1 text-xs text-amber-400">(Terlambat)</span>}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Jam Pulang</span>
                    <span className="font-semibold text-slate-800">
                        {attendance?.time_out ?? '—'}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Status</span>
                    <span className="font-semibold text-green-600">{attendance?.status ?? '—'}</span>
                </div>
                {isLate && lateStatus && (
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Izin Terlambat</span>
                        <span className={`font-semibold text-xs px-2 py-0.5 rounded-full
                            ${lateStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                              lateStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'}`}>
                            {lateStatus === 'Approved' ? 'Disetujui' :
                             lateStatus === 'Rejected' ? 'Ditolak' : 'Menunggu Admin'}
                        </span>
                    </div>
                )}
            </div>

            {/* Tombol Absen Pulang */}
            {!hasOut && (
                canCheckout ? (
                    <button
                        onClick={onCheckout}
                        disabled={checkingOut}
                        className="w-full max-w-xs py-3 rounded-2xl bg-slate-700 text-white text-sm font-bold
                                   hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2
                                   shadow-sm transition-colors"
                    >
                        {checkingOut
                            ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
                            : <><LogOut size={16} /> Absen Pulang</>
                        }
                    </button>
                ) : (
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Timer size={12} />
                        Absen pulang dibuka pukul {checkoutOpen?.slice(0, 5) ?? '14:00'} WIB
                    </p>
                )
            )}

            {hasOut && (
                <p className="text-xs text-slate-400 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-green-500" />
                    Sudah absen pulang pukul {attendance.time_out}
                </p>
            )}
        </div>
    );
}

// ── Form Check-in ─────────────────────────────────────────────
function CheckInForm({ schoolConfig, deadline, attendanceOpen, isLateNow, lateTime }) {
    const fileRef = useRef();
    const [preview, setPreview]           = useState(null);
    const [showLateForm, setShowLateForm] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        photo:       null,
        late_reason: '',
    });

    const handlePhoto = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setData('photo', file);
        setPreview(URL.createObjectURL(file));
        if (isLateNow) setShowLateForm(true);
    };

    const removePhoto = () => {
        setData('photo', null);
        setPreview(null);
        setShowLateForm(false);
        if (fileRef.current) fileRef.current.value = '';
    };

    const submit = (e) => {
        e.preventDefault();
        post('/siswa/presensi', { forceFormData: true });
    };

    if (!attendanceOpen) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                    <Clock size={30} className="text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Absensi Belum Dibuka</h3>
                <p className="text-slate-500 text-sm max-w-xs">
                    Absen dibuka pukul <span className="font-semibold">{lateTime?.slice(0, 5) ?? '06:00'}</span> —
                    batas absen pukul <span className="font-semibold">{deadline?.slice(0, 5)}</span> WIB.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="space-y-5">

            {/* Banner info */}
            <div className={`border rounded-2xl p-4 flex items-start gap-3
                ${isLateNow ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-100'}`}>
                {isLateNow
                    ? <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    : <ShieldCheck   size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                }
                <div>
                    <p className={`text-sm font-semibold ${isLateNow ? 'text-amber-800' : 'text-blue-800'}`}>
                        {isLateNow
                            ? `⚠️ Kamu Terlambat! (Batas tepat waktu: ${lateTime?.slice(0, 5) ?? '07:00'} WIB)`
                            : (schoolConfig?.name ?? 'Sekolah')
                        }
                    </p>
                    <p className={`text-xs mt-0.5 ${isLateNow ? 'text-amber-600' : 'text-blue-600'}`}>
                        {isLateNow
                            ? 'Isi alasan keterlambatan. Izin akan dikirim ke admin untuk disetujui.'
                            : `Batas waktu absen: ${deadline?.slice(0, 5)} WIB`
                        }
                    </p>
                </div>
            </div>

            {/* Upload foto */}
            <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Foto Selfie <span className="text-red-500">*</span>
                </label>
                {preview ? (
                    <div className="relative">
                        <img src={preview} alt="Preview selfie"
                            className="w-full h-52 object-cover rounded-2xl border border-slate-200" />
                        <button type="button" onClick={removePhoto}
                            className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md
                                       flex items-center justify-center text-slate-600 hover:text-red-500 transition-colors">
                            <X size={16} />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
                            Foto siap ✓
                        </div>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center gap-3 px-4 py-8
                                      border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer
                                      hover:border-blue-400 hover:bg-blue-50 transition-colors">
                        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
                            <Camera size={24} className="text-slate-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-slate-600">Ambil atau Pilih Foto</p>
                            <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, WEBP · Maks 5MB</p>
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" capture="user"
                            className="hidden" onChange={handlePhoto} />
                    </label>
                )}
                {errors.photo && <p className="text-xs text-red-500">{errors.photo}</p>}
            </div>

            {/* Form alasan terlambat */}
            {isLateNow && showLateForm && (
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        Alasan Keterlambatan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        rows={3}
                        placeholder="Contoh: Ban motor bocor, macet di jalan, dll..."
                        value={data.late_reason}
                        onChange={e => setData('late_reason', e.target.value)}
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-amber-200 bg-amber-50
                                   outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400
                                   transition-colors resize-none text-slate-700 placeholder:text-slate-400"
                    />
                    {errors.late_reason && <p className="text-xs text-red-500">{errors.late_reason}</p>}
                    <p className="text-xs text-amber-600">
                        Alasan ini dikirim ke admin untuk persetujuan izin hadir terlambat.
                    </p>
                </div>
            )}

            <button type="submit"
                disabled={processing || !data.photo || (isLateNow && !data.late_reason)}
                className={`w-full py-3.5 rounded-2xl text-white text-sm font-bold
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2 shadow-sm transition-colors
                           ${isLateNow ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {processing
                    ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
                    : isLateNow
                        ? <><AlertTriangle size={16} /> Absen + Ajukan Izin Terlambat</>
                        : <><CheckCircle2 size={16} /> Absen Sekarang</>
                }
            </button>

            {!data.photo && (
                <p className="text-xs text-slate-400 text-center">Upload foto selfie terlebih dahulu.</p>
            )}
            {isLateNow && data.photo && !data.late_reason && (
                <p className="text-xs text-amber-500 text-center">Isi alasan keterlambatan terlebih dahulu.</p>
            )}
        </form>
    );
}

// ── Main Page ─────────────────────────────────────────────────
export default function Presensi({
    todayAttendance,
    hasCheckedIn,
    schoolConfig,
    deadline,
    attendanceOpen,
    isLateNow,
    lateTime,
    checkoutOpen,
    checkoutDeadline,
}) {
    const [checkingOut, setCheckingOut] = useState(false);
    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    const handleCheckout = () => {
        setCheckingOut(true);
        router.post('/siswa/presensi/checkout', {}, {
            onFinish: () => setCheckingOut(false),
        });
    };

    return (
        <AuthenticatedLayout title="Presensi Hari Ini">
            <FlashMessage />
            <div className="max-w-md mx-auto space-y-4">

                {/* Header dengan jam real-time */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <CalendarDays size={15} className="opacity-80" />
                            <span className="text-sm opacity-80 capitalize">{today}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full">
                            <Clock size={12} className="opacity-80" />
                            <span className="text-sm font-medium"><LiveClock /></span>
                        </div>
                    </div>
                    <h2 className="text-xl font-bold">Presensi Hari Ini</h2>
                    <p className="text-blue-100 text-xs mt-1">
                        {hasCheckedIn
                            ? `Masuk: ${todayAttendance?.time_in ?? '—'} WIB`
                            : `Tepat waktu s.d. ${lateTime?.slice(0, 5) ?? '07:00'} · Batas ${deadline?.slice(0, 5) ?? '08:00'} WIB`
                        }
                    </p>
                </div>

                {/* Kartu konten */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    {hasCheckedIn
                        ? <AlreadyCheckedIn
                            attendance={todayAttendance}
                            checkoutOpen={checkoutOpen}
                            onCheckout={handleCheckout}
                            checkingOut={checkingOut}
                          />
                        : <CheckInForm
                            schoolConfig={schoolConfig}
                            deadline={deadline}
                            attendanceOpen={attendanceOpen}
                            isLateNow={isLateNow}
                            lateTime={lateTime}
                          />
                    }
                </div>

                {/* Info jam sekolah */}
                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 grid grid-cols-3 gap-3 text-center text-xs">
                    <div>
                        <p className="text-slate-400">Absen Dibuka</p>
                        <p className="font-bold text-slate-700 mt-0.5">{attendanceOpen?.slice(0, 5) ?? '06:00'}</p>
                    </div>
                    <div>
                        <p className="text-slate-400">Batas Tepat Waktu</p>
                        <p className="font-bold text-green-600 mt-0.5">{lateTime?.slice(0, 5) ?? '07:00'}</p>
                    </div>
                    <div>
                        <p className="text-slate-400">Jam Pulang</p>
                        <p className="font-bold text-slate-700 mt-0.5">{checkoutOpen?.slice(0, 5) ?? '14:00'}</p>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}