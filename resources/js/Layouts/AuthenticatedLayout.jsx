import { useState, useEffect } from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import {
    LayoutDashboard, ClipboardCheck, CalendarDays,
    FileText, IdCard, Users, BookOpen, ShieldCheck,
    BarChart3, MonitorCheck, Menu, X, LogOut,
    ChevronRight, Bell
} from 'lucide-react';

// ── Menu config ────────────────────────────────────────────
const studentMenu = [
    { label: 'Dashboard',         href: '/siswa/dashboard', icon: LayoutDashboard },
    { label: 'Presensi Hari Ini', href: '/siswa/presensi',  icon: ClipboardCheck   },
    { label: 'Riwayat Kehadiran', href: '/siswa/riwayat',   icon: CalendarDays     },
    { label: 'Pengajuan Izin',    href: '/siswa/izin',      icon: FileText         },
    { label: 'Profil & ID Digital', href: '/siswa/profil',  icon: IdCard           },
];

const adminMenu = [
    { label: 'Dashboard',         href: '/admin/dashboard', icon: LayoutDashboard  },
    { label: 'Monitor Real-time', href: '/admin/monitor',   icon: MonitorCheck     },
    { label: 'Data Siswa',        href: '/admin/siswa',     icon: Users            },
    { label: 'Data Kelas',        href: '/admin/kelas',     icon: BookOpen         },
    { label: 'Approval Izin',     href: '/admin/izin',      icon: ShieldCheck      },
    { label: 'Laporan',           href: '/admin/laporan',   icon: BarChart3        },
];

// ── NavItem ────────────────────────────────────────────────
function NavItem({ item, currentPath, collapsed }) {
    const Icon    = item.icon;
    const isActive = currentPath.startsWith(item.href);

    return (
        <Link
            href={item.href}
            className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150
                ${isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                ${collapsed ? 'justify-center' : ''}
            `}
            title={collapsed ? item.label : undefined}
        >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && (
                <span className="flex-1 truncate">{item.label}</span>
            )}
            {!collapsed && isActive && (
                <ChevronRight size={14} className="opacity-60" />
            )}
        </Link>
    );
}

// ── Sidebar ────────────────────────────────────────────────
function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
    const { auth } = usePage().props;
    const currentPath = window.location.pathname;
    const menu        = auth.user?.isAdmin ? adminMenu : studentMenu;
    const roleLabel   = auth.user?.isAdmin ? 'Administrator' : 'Siswa';

    const handleLogout = () => {
        router.post('/logout');
    };

    const sidebarContent = (
        <div className="flex flex-col h-full bg-slate-900 text-white">
            {/* Logo */}
            <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-700/50
                            ${collapsed ? 'justify-center' : ''}`}>
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ClipboardCheck size={16} className="text-white" />
                </div>
                {!collapsed && (
                    <div>
                        <p className="font-bold text-sm leading-tight">SASS</p>
                        <p className="text-[10px] text-slate-400 leading-tight">Sistem Absensi Siswa</p>
                    </div>
                )}
            </div>

            {/* Role Badge */}
            {!collapsed && (
                <div className="px-4 pt-4 pb-2">
                    <div className="bg-slate-800 rounded-lg px-3 py-2.5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30
                                        flex items-center justify-center flex-shrink-0 text-blue-400 text-xs font-bold">
                            {auth.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-semibold truncate">{auth.user?.name}</p>
                            <p className="text-[11px] text-slate-400">{roleLabel}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Nav Menu */}
            <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
                {!collapsed && (
                    <p className="text-[10px] font-semibold uppercase tracking-widest
                                  text-slate-500 px-2 mb-2">Menu</p>
                )}
                {menu.map((item) => (
                    <NavItem
                        key={item.href}
                        item={item}
                        currentPath={currentPath}
                        collapsed={collapsed}
                    />
                ))}
            </nav>

            {/* Logout */}
            <div className="px-3 pb-4 border-t border-slate-700/50 pt-3">
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                                font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400
                                transition-all duration-150
                                ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? 'Logout' : undefined}
                >
                    <LogOut size={18} className="flex-shrink-0" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <> 
            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0
                               transition-all duration-300 ease-in-out
                               ${collapsed ? 'w-16' : 'w-60'}`}>
                {sidebarContent}

                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-20 w-6 h-6 bg-slate-700 rounded-full
                               border border-slate-600 flex items-center justify-center
                               hover:bg-slate-600 transition-colors z-10"
                >
                    <ChevronRight
                        size={12}
                        className={`text-slate-300 transition-transform duration-300
                                   ${collapsed ? '' : 'rotate-180'}`}
                    />
                </button>
            </aside>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-40 flex">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="relative z-50 w-72 h-full">
                        {sidebarContent}
                    </aside>
                </div>
            )}
        </>
    );
}

// ── Topbar ─────────────────────────────────────────────────
function Topbar({ setMobileOpen, title }) {
    const { auth } = usePage().props;

    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b
                           border-slate-200 px-4 lg:px-6 py-3 flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
                <Menu size={20} className="text-slate-600" />
            </button>

            {/* Page title */}
            <h1 className="flex-1 text-base font-semibold text-slate-800 truncate">
                {title}
            </h1>

            {/* Right actions */}
            <div className="flex items-center gap-2">
                <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
                    <Bell size={18} className="text-slate-600" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center
                                justify-center text-white text-xs font-bold">
                    {auth.user?.name?.charAt(0).toUpperCase()}
                </div>
            </div>
        </header>
    );
}

// ── Main Layout ────────────────────────────────────────────
export default function AuthenticatedLayout({ children, title = 'Dashboard' }) {
    const [collapsed,   setCollapsed]   = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { url } = usePage();

    // Tutup mobile sidebar saat navigasi
    useEffect(() => {
        setMobileOpen(false);
    }, [url]);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            {/* Main content */}
            <div className="flex flex-col flex-1 overflow-hidden">
                <Topbar setMobileOpen={setMobileOpen} title={title} />

                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}