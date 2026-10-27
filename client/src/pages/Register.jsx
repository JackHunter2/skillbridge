import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/layout/AuthShell';
import Button from '../components/ui/Button';
import { inputCls, labelCls } from '../components/ui/styles';
import { getTeks } from '../utils/userType';

const tipe = [
    ['fresh_graduate', 'Fresh graduate'],
    ['anak_magang', 'Anak magang'],
];

export default function Register() {
    const { user, register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ full_name: '', email: '', password: '', user_type: 'fresh_graduate' });
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

    return (
        <AuthShell
            title="Buat akun"
            subtitle="Mulai review portofolio kamu dalam beberapa menit."
            footer={<>Sudah punya akun? <Link to="/login" className="font-semibold text-brand-600">Masuk</Link></>}
        >
            <form onSubmit={kirim} className="space-y-4">
                {error && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        <Info className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                    </div>
                )}
                <div>
                    <label className={labelCls}>Nama lengkap</label>
                    <input name="full_name" required value={form.full_name} onChange={ubah}
                           placeholder="Isi dengan nama kamu" className={inputCls} />
                </div>
                <div>
                    <label className={labelCls}>Email</label>
                    <input name="email" type="email" required value={form.email} onChange={ubah}
                           placeholder="nama@email.com" className={inputCls} />
                </div>
                <div>
                    <label className={labelCls}>Password</label>
                    <input name="password" type="password" required value={form.password} onChange={ubah}
                           placeholder="Minimal 6 karakter" className={inputCls} />
                </div>
                <div>
                    <label className={labelCls}>Saya adalah</label>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                        {tipe.map(([nilai, label]) => (
                            <button type="button" key={nilai} onClick={() => setForm({ ...form, user_type: nilai })}
                                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                                        form.user_type === nilai
                                            ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-600/20'
                                            : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                                    }`}>
                                {label}
                            </button>
                        ))}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{getTeks(form.user_type).deskripsiDaftar}</p>
                </div>
                <Button loading={busy} className="w-full">Daftar</Button>
            </form>
        </AuthShell>
    );
}