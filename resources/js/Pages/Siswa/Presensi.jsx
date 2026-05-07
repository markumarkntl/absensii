import { useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FlashMessage from '@/Components/FlashMessage';
import {
    CheckCircle2, Clock, Camera, Loader2, X,
    ShieldCheck, CalendarDays,
} from 'lucide-react';

function AlreadyCheckedIn({ attendance }) {
    return (
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 size={40} className="text-green-500" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800">Sudah Absen!</h3>
                <p className="text-slate-500 text-sm mt-1">Kamu sudah melakukan absensi hari ini.</p>
            </div>
            {attendance && (
                <div className="bg-slate-50 rounded-2xl border border-slate-200 px-6 py-4 w-full max-w-xs space-y-2.5 text-left">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Jam Masuk</span>
                        <span className="font-semibold text-slate-800">{attendance.time_in ?? '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Status</span>
                        <span className="font-semibold text-green-600">{attendance.status ?? '—'}</span>
                    </div>
                    {attendance.note && (
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Keterangan</span>
                            <span className="font-semibold text-slate-700 text-right max-w-[160px]">{attendance.note}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function CheckInForm({ schoolConfig, deadline, attendanceOpen }) {
    const fileRef = useRef();
    const [preview, setPreview] = useState(null);
    const { data, setData, post, processing, errors } = useForm({ photo: null });

    const handlePhoto = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setData('photo', file);
        setPreview(URL.createObjectURL(file));
    };

    const removePhoto = () => {
        setData('photo', null);
        setPreview(null);
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
                    Batas absen pukul <span className="font-semibold">{deadline}</span>.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="space-y-5">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-blue-800">{schoolConfig?.name ?? 'Sekolah'}</p>
                    <p className="text-xs text-blue-600 mt-0.5">Batas waktu absen: {deadline}</p>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Foto Selfie <span className="text-red-500">*</span>
                </label>

                {preview ? (
                    <div className="relative">
                        <img src={preview} alt="Preview selfie"
                            className="w-full h-56 object-cover rounded-2xl border border-slate-200" />
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

            <button type="submit" disabled={processing || !data.photo}
                className="w-full py-3.5 rounded-2xl bg-blue-600 text-white text-sm font-bold
                           hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2 shadow-sm transition-colors">
                {processing
                    ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
                    : <><CheckCircle2 size={16} /> Absen Sekarang</>
                }
            </button>
            {!data.photo && (
                <p className="text-xs text-slate-400 text-center">Upload foto selfie terlebih dahulu.</p>
            )}
        </form>
    );
}

export default function Presensi({ todayAttendance, hasCheckedIn, schoolConfig, deadline, attendanceOpen }) {
    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    return (
        <AuthenticatedLayout title="Presensi Hari Ini">
            <FlashMessage />
            <div className="max-w-md mx-auto space-y-4">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <CalendarDays size={15} className="opacity-80" />
                        <span className="text-sm opacity-80 capitalize">{today}</span>
                    </div>
                    <h2 className="text-xl font-bold">Presensi Hari Ini</h2>
                    <p className="text-blue-100 text-xs mt-1">
                        {hasCheckedIn ? 'Status kehadiran kamu hari ini' : `Batas absen pukul ${deadline}`}
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    {hasCheckedIn
                        ? <AlreadyCheckedIn attendance={todayAttendance} />
                        : <CheckInForm schoolConfig={schoolConfig} deadline={deadline} attendanceOpen={attendanceOpen} />
                    }
                </div>
            </div>
        </AuthenticatedLayout>
    );
}