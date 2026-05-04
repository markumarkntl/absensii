import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FlashMessage from '@/Components/FlashMessage';
import { usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <AuthenticatedLayout title="Dashboard Siswa">
            <FlashMessage />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Placeholder widget — akan diisi di Langkah 4 */}
                {[
                    { label: 'Hadir Bulan Ini',  value: '–', color: 'bg-blue-500'    },
                    { label: 'Total Izin/Sakit',  value: '–', color: 'bg-amber-500'   },
                    { label: 'Tidak Hadir (Alfa)',value: '–', color: 'bg-red-500'     },
                ].map(w => (
                    <div key={w.label}
                         className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
                        <div className={`w-10 h-10 ${w.color} rounded-lg`} />
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{w.value}</p>
                            <p className="text-xs text-slate-500">{w.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <p className="text-slate-500 text-sm">
                    Selamat datang, <span className="font-semibold text-slate-800">{auth.user?.name}</span>.
                    Widget lengkap akan hadir di Langkah 4.
                </p>
            </div>
        </AuthenticatedLayout>
    );
}