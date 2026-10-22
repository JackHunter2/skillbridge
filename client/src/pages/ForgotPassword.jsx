import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Info } from 'lucide-react';
import api from '../services/api';
import AuthShell from '../components/layout/AuthShell';
import Button from '../components/ui/Button';
import { inputCls, labelCls } from '../components/ui/styles';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [sukses, setSukses] = useState('');
    const [busy, setBusy] = useState(false);

    const kirim = async (e) => {
        e.preventDefault();
        setError('');
        setBusy(true);
        try {
            const res = await api.post('/auth/forgot-password', { email });
            setSukses(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengirim permintaan, coba lagi');
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthShell
            title="Lupa password?"
            subtitle="Masukkan email akun Anda. Kami kirimkan tautan untuk membuat password baru."
            footer={<Link to="/login" className="font-semibold text-brand-600">← Kembali ke halaman masuk</Link>}
        >
            {sukses ? (
                <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> {sukses}
                </div>
            ) : (
                <form onSubmit={kirim} className="space-y-4">
                    {error && (
                        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                            <Info className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                        </div>
                    )}
                    <div>
                        <label className={labelCls}>Email</label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                               placeholder="nama@email.com" className={inputCls} />
                    </div>
                    <Button loading={busy} className="w-full">Kirim tautan reset</Button>
                </form>
            )}
        </AuthShell>
    );
}