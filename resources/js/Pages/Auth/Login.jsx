import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login — SASS" />

            <div className="min-h-screen flex">

                {/* ── Panel Kiri: Branding ─────────────────────────────── */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 flex-col justify-between p-12">

                    {/* Pattern dekoratif */}
                    <div className="absolute inset-0 opacity-10">
                        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>

                    {/* Lingkaran dekoratif */}
                    <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full" />
                    <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-white/10 rounded-full" />

                    {/* Logo & nama sistem */}
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <span className="text-white font-bold text-xl tracking-wide">SASS</span>
                        </div>
                        <p className="text-blue-200 text-sm">Sistem Absensi Siswa Digital</p>
                    </div>

                    {/* Teks tengah */}
                    <div className="relative z-10">
                        <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                            Hadir Tepat<br />Waktu, Setiap Hari.
                        </h1>
                        <p className="text-blue-200 text-base leading-relaxed max-w-sm">
                            Presensi digital berbasis GPS yang akurat, mudah, dan tercatat otomatis setiap hari sekolah.
                        </p>
                    </div>

                    {/* Stats bawah */}
                    <div className="relative z-10 flex gap-8">
                        <div>
                            <p className="text-white text-2xl font-bold">GPS</p>
                            <p className="text-blue-200 text-xs mt-0.5">Geofencing Akurat</p>
                        </div>
                        <div className="w-px bg-white/20" />
                        <div>
                            <p className="text-white text-2xl font-bold">Auto</p>
                            <p className="text-blue-200 text-xs mt-0.5">Rekap Otomatis</p>
                        </div>
                        <div className="w-px bg-white/20" />
                        <div>
                            <p className="text-white text-2xl font-bold">Real‑time</p>
                            <p className="text-blue-200 text-xs mt-0.5">Monitor Admin</p>
                        </div>
                    </div>
                </div>

                {/* ── Panel Kanan: Form Login ───────────────────────────── */}
                <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-gray-50">

                    {/* Logo mobile */}
                    <div className="flex items-center gap-2 mb-8 lg:hidden">
                        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <span className="font-bold text-gray-900 text-lg">SASS</span>
                    </div>

                    <div className="w-full max-w-md">

                        {/* Heading */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">Selamat datang!</h2>
                            <p className="text-gray-500 text-sm mt-1">Masuk ke akun SASS kamu untuk melanjutkan.</p>
                        </div>

                        {/* Flash status (misal: password reset berhasil) */}
                        {status && (
                            <div className="mb-6 flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                                <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <p className="text-sm text-green-700">{status}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-5">

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    autoComplete="username"
                                    autoFocus
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="nama@sekolah.sch.id"
                                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 placeholder-gray-400
                                        bg-white transition-colors outline-none
                                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                        ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                />
                                {errors.email && (
                                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 placeholder-gray-400
                                        bg-white transition-colors outline-none
                                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                        ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                />
                                {errors.password && (
                                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Remember me + Lupa password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                    <span className="text-sm text-gray-600">Ingat saya</span>
                                </label>

                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                                    >
                                        Lupa password?
                                    </Link>
                                )}
                            </div>

                            {/* Tombol Login */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white
                                    bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                    disabled:opacity-60 disabled:cursor-not-allowed
                                    transition-colors flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Masuk...
                                    </>
                                ) : (
                                    'Masuk'
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <p className="mt-8 text-center text-xs text-gray-400">
                            &copy; {new Date().getFullYear()} SASS · Sistem Absensi Siswa Digital
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}