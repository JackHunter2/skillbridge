import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [roleName, setRoleName] = useState('');

    useEffect(() => {
        if (!user.target_role_id) return;
        api.get('/roles').then((res) => {
            const r = res.data.roles.find((x) => x.role_id === user.target_role_id);
            setRoleName(r ? r.role_name : '');
        });
    }, [user.target_role_id]);

    if (!user.target_role_id) return <Navigate to="/onboarding" replace />;

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <button onClick={logout}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-white">
                        Keluar
                    </button>
                </div>

                <div className="mt-6 bg-white rounded-2xl shadow p-6">
                    <p className="text-slate-500 text-sm">Selamat datang,</p>
                    <p className="text-xl font-semibold text-slate-900">{user.full_name}</p>
                    <p className="text-slate-500 text-sm mt-1">
                        {user.email} • {user.user_type === 'anak_magang' ? 'Anak magang' : 'Fresh graduate'}
                    </p>

                    <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 p-4">
                        <div>
                            <p className="text-xs text-blue-700 font-medium">PERAN TARGET</p>
                            <p className="font-semibold text-slate-900">{roleName || '...'}</p>
                        </div>
                        <Link to="/onboarding" className="text-sm text-blue-600 font-medium">Ganti</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}