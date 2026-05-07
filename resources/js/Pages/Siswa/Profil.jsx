import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FlashMessage from '@/Components/FlashMessage';
import { User, BookOpen, IdCard, Mail, VenetianMask, GraduationCap } from 'lucide-react';

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Icon size={15} className="text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 font-medium">{label}</p>
                <p className="text-sm font-semibold text-slate-800 truncate">{value ?? '—'}</p>
            </div>
        </div>
    );
}

export default function Profil({ student }) {
    if (!student) {
        return (
            <AuthenticatedLayout title="Profil & ID Digital">
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <User size={40} className="mb-3 opacity-30" />
                    <p className="text-sm">Data profil tidak ditemukan.</p>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout title="Profil & ID Digital">
            <FlashMessage />
            <div className="max-w-md mx-auto space-y-4">

                {/* ID Card */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-2 mb-5">
                        <IdCard size={18} className="opacity-80" />
                        <span className="text-sm font-semibold opacity-80">ID Digital Siswa</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {student.foto_profil ? (
                            <img
                                src={student.foto_profil}
                                alt={student.name}
                                className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30 flex-shrink-0"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30
                                            flex items-center justify-center flex-shrink-0 text-2xl font-bold">
                                {student.name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="text-lg font-bold leading-tight truncate">{student.name}</p>
                            <p className="text-blue-200 text-sm mt-0.5">{student.classroom ?? '—'}</p>
                            <p className="text-blue-300 text-xs mt-0.5">{student.jurusan ?? '—'}</p>
                        </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-white/20 flex items-center justify-between">
                        <div>
                            <p className="text-blue-300 text-xs">NISN</p>
                            <p className="text-white font-mono font-bold tracking-widest">{student.nisn ?? '—'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-blue-300 text-xs">Jenis Kelamin</p>
                            <p className="text-white font-semibold text-sm">
                                {student.jenis_kelamin === 'L' ? 'Laki-laki' : student.jenis_kelamin === 'P' ? 'Perempuan' : '—'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Detail info */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-2">
                    <InfoRow icon={User}          label="Nama Lengkap"   value={student.name} />
                    <InfoRow icon={Mail}          label="Email"          value={student.email} />
                    <InfoRow icon={IdCard}        label="NISN"           value={student.nisn} />
                    <InfoRow icon={BookOpen}      label="Kelas"          value={student.classroom} />
                    <InfoRow icon={GraduationCap} label="Jurusan"        value={student.jurusan} />
                    <InfoRow icon={VenetianMask}  label="Jenis Kelamin"  value={student.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} />
                </div>

                <p className="text-center text-xs text-slate-400">
                    Untuk mengubah data, hubungi admin sekolah.
                </p>
            </div>
        </AuthenticatedLayout>
    );
}