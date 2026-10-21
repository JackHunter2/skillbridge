import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const { user, register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        full_name: '', email: '', password: '', user_type: 'fresh_graduate',
    });
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    if (user) return <Navigate to="/dashboard" replace />;

    const ubah = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const kirim = async (e) => {
        e.preventDefault();
        setError('');
        setBusy(true);
        try {
            await register(form);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mendaftar, coba lagi');
        } finally {
            setBusy(false);
        }
    };

    const input = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <form onSubmit={kirim} className="bg-white rounded-2xl shadow p-8 w-full max-w-sm space-y-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Daftar</h1>
                    <p className="text-slate-500 text-sm">Buat akun untuk mulai mereviu portofolio</p>
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}

                <div>
                    <label className="text-sm font-medium text-slate-700">Nama lengkap</label>
                    <input name="full_name" required value={form.full_name} onChange={ubah} className={input} />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <input name="email" type="email" required value={form.email} onChange={ubah} className={input} />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-700">Password (min. 6 karakter)</label>
                    <input name="password" type="password" required value={form.password} onChange={ubah} className={input} />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-700">Saya adalah</label>
                    <select name="user_type" value={form.user_type} onChange={ubah} className={input}>
                        <option value="fresh_graduate">Fresh graduate</option>
                        <option value="anak_magang">Anak magang</option>
                    </select>
                </div>

                <button disabled={busy}
                        className="w-full rounded-lg bg-blue-600 text-white font-medium py-2 hover:bg-blue-700 disabled:opacity-60">
                    {busy ? 'Memproses...' : 'Daftar'}
                </button>

                <p className="text-sm text-slate-600 text-center">
                    Sudah punya akun? <Link to="/login" className="text-blue-600 font-medium">Masuk</Link>
                </p>
            </form>
        </div>
    );
}