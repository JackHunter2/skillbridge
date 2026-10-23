import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, LogOut, Repeat, Settings, Upload, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getTeks } from '../../utils/userType';
import Avatar from '../ui/Avatar';
import Brand from './Brand';

const link = ({ isActive }) =>
    `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
        isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
    }`;

const item = 'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100';

export default function AppLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [buka, setBuka] = useState(false);
    const kotak = useRef(null);

    useEffect(() => {
        if (!buka) return;
        const klik = (e) => {
            if (kotak.current && !kotak.current.contains(e.target)) setBuka(false);
        };
        const tombol = (e) => {
            if (e.key === 'Escape') setBuka(false);
        };
        document.addEventListener('mousedown', klik);
        document.addEventListener('keydown', tombol);
        return () => {
            document.removeEventListener('mousedown', klik);
            document.removeEventListener('keydown', tombol);
        };
    }, [buka]);

    const tutup = () => setBuka(false);
    const keluar = () => {
        setBuka(false);
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen">
            <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-6">
                        <Brand to="/dashboard" />
                        <nav className="hidden items-center gap-1 sm:flex">
                            <NavLink to="/dashboard" className={link}>
                                <LayoutDashboard className="h-4 w-4" /> Dashboard
                            </NavLink>
                            <NavLink to="/upload" className={link}>
                                <Upload className="h-4 w-4" /> Upload
                            </NavLink>
                        </nav>
                    </div>

                    <div ref={kotak} className="relative">
                        <button
                            onClick={() => setBuka(!buka)}
                            aria-haspopup="menu"
                            aria-expanded={buka}
                            className="flex items-center gap-2 rounded-full p-1 pr-2 transition hover:bg-slate-100"
                        >
                            <Avatar user={user} />
                            <span className="hidden text-left sm:block">
                <span className="block text-sm font-semibold leading-tight text-slate-900">{user.full_name}</span>
                <span className="block text-xs text-slate-500">{getTeks(user.user_type).label}</span>
              </span>
                            <ChevronDown className={`h-4 w-4 text-slate-400 transition ${buka ? 'rotate-180' : ''}`} />
                        </button>

                        {buka && (
                            <div role="menu" className="fade-up absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                                <div className="flex items-center gap-3 px-3 py-3">
                                    <Avatar user={user} />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-slate-900">{user.full_name}</p>
                                        <p className="truncate text-xs text-slate-500">{user.email}</p>
                                    </div>
                                </div>
                                <div className="my-1 h-px bg-slate-100" />

                                <div className="sm:hidden">
                                    <Link to="/dashboard" onClick={tutup} className={item}>
                                        <LayoutDashboard className="h-4 w-4 text-slate-400" /> Dashboard
                                    </Link>
                                    <Link to="/upload" onClick={tutup} className={item}>
                                        <Upload className="h-4 w-4 text-slate-400" /> Upload portofolio
                                    </Link>
                                    <div className="my-1 h-px bg-slate-100" />
                                </div>

                                <Link to="/profile" onClick={tutup} className={item}>
                                    <User className="h-4 w-4 text-slate-400" /> Profil
                                </Link>
                                <Link to="/settings" onClick={tutup} className={item}>
                                    <Settings className="h-4 w-4 text-slate-400" /> Pengaturan
                                </Link>
                                <Link to="/onboarding" onClick={tutup} className={item}>
                                    <Repeat className="h-4 w-4 text-slate-400" /> Ganti peran target
                                </Link>
                                <div className="my-1 h-px bg-slate-100" />
                                <button onClick={keluar} className={`${item} text-red-600 hover:bg-red-50`}>
                                    <LogOut className="h-4 w-4" /> Keluar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
                <Outlet />
            </main>
        </div>
    );
}