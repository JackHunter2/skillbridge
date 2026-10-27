import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/layout/AuthShell';
import Button from '../components/ui/Button';
import { inputCls, labelCls } from '../components/ui/styles';

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
        <AuthShell
            title="Selamat datang kembali"
            subtitle="Masuk untuk melanjutkan review portofolio kamu."
            footer={<>Belum punya akun? <Link to="/register" className="font-semibold text-brand-600">Daftar</Link></>}
        >
            <form onSubmit={kirim} className="space-y-4">
                {error && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        <Info className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                    </div>
                )}
                <div>
                    <label className={labelCls}>Email</label>
                    <input name="email" type="email" required value={form.email} onChange={ubah}
                           placeholder="nama@email.com" className={inputCls} />
                </div>
                <div>
                    <div className="flex items-center justify-between">
                        <label className={labelCls}>Password</label>
                        <Link to="/forgot-password" className="text-xs font-semibold text-brand-600 hover:underline">
                            Lupa password?
                        </Link>
                    </div>
                    <input name="password" type="password" required value={form.password} onChange={ubah}
                           placeholder="Password" className={inputCls} />
                </div>
                <Button loading={busy} className="w-full">Masuk</Button>
            </form>
        </AuthShell>
    );
}