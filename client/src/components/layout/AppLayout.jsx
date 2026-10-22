import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Upload, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Brand from './Brand';

const link = ({ isActive }) =>
    `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
        isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
    }`;

export default function AppLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const inisial = (user.full_name || '?').trim().charAt(0).toUpperCase();

    const keluar = () => {
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
                            <NavLink to="/profile" className={link}>
                                <User className="h-4 w-4" /> Profil
                            </NavLink>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-semibold leading-tight text-slate-900">{user.full_name}</p>
                            <p className="text-xs text-slate-500">
                                {user.user_type === 'anak_magang' ? 'Anak magang' : 'Fresh graduate'}
                            </p>
                        </div>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
              {inisial}
            </span>
                        <button
                            onClick={keluar}
                            title="Keluar"
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
                <Outlet />
            </main>
        </div>
    );
}