import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user, logout } = useAuth();

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
                </div>
            </div>
        </div>
    );
}