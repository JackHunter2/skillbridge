import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    if (user) return <Navigate to="/dashboard" replace />;

    const ubah = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const kirim = async (e) => {
        e.preventDefault();
        setError('');
        setBusy(true);
        try {
            await login(form.email, form.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal masuk, coba lagi');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <form onSubmit={kirim} className="bg-white rounded-2xl shadow p-8 w-full max-w-sm space-y-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Masuk</h1>
                    <p className="text-slate-500 text-sm">Platform Upskilling & Reviu Portofolio AI</p>
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}

                <div>
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <input name="email" type="email" required value={form.email} onChange={ubah}
                           className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-700">Password</label>
                    <input name="password" type="password" required value={form.password} onChange={ubah}
                           className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <button disabled={busy}
                        className="w-full rounded-lg bg-blue-600 text-white font-medium py-2 hover:bg-blue-700 disabled:opacity-60">
                    {busy ? 'Memproses...' : 'Masuk'}
                </button>

                <p className="text-sm text-slate-600 text-center">
                    Belum punya akun? <Link to="/register" className="text-blue-600 font-medium">Daftar</Link>
                </p>
            </form>
        </div>
    );
}