import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Info } from 'lucide-react';
import api from '../services/api';
import AuthShell from '../components/layout/AuthShell';
import Button from '../components/ui/Button';
import { inputCls, labelCls } from '../components/ui/styles';

export default function ResetPassword() {
    const [params] = useSearchParams();
    const token = params.get('token') || '';
    const [form, setForm] = useState({ password: '', konfirmasi: '' });
    const [error, setError] = useState('');
    const [sukses, setSukses] = useState('');
    const [busy, setBusy] = useState(false);

    const kirim = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.konfirmasi) return setError('Konfirmasi password tidak sama');

        setBusy(true);
        try {
            const res = await api.post('/auth/reset-password', { token, password: form.password });
            setSukses(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengubah password, coba lagi');
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthShell
            title="Buat password baru"
            subtitle="Pilih password baru untuk akun Anda."
            footer={<Link to="/login" className="font-semibold text-brand-600">Ke halaman masuk</Link>}
        >
            {sukses ? (
                <div className="space-y-4">
                    <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> {sukses}
                    </div>
                    <Button as={Link} to="/login" className="w-full">Masuk sekarang</Button>
                </div>
            ) : !token ? (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    Tautan tidak lengkap. Minta tautan baru lewat halaman "Lupa password".
                </div>
            ) : (
                <form onSubmit={kirim} className="space-y-4">
                    {error && (
                        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                            <Info className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                        </div>
                    )}
                    <div>
                        <label className={labelCls}>Password baru</label>
                        <input type="password" required value={form.password}
                               onChange={(e) => setForm({ ...form, password: e.target.value })}
                               placeholder="Minimal 6 karakter" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Ulangi password baru</label>
                        <input type="password" required value={form.konfirmasi}
                               onChange={(e) => setForm({ ...form, konfirmasi: e.target.value })} className={inputCls} />
                    </div>
                    <Button loading={busy} className="w-full">Simpan password baru</Button>
                </form>
            )}
        </AuthShell>
    );
}