import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Check, Code, Database, Info, Megaphone, Palette } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const ikonPeran = {
    'Data Analyst': Database,
    'UI/UX Designer': Palette,
    'Digital Marketing': Megaphone,
    'Web Developer': Code,
};

export default function Onboarding() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(user.target_role_id || null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        api.get('/roles')
            .then((res) => setRoles(res.data.roles))
            .catch(() => setError('Gagal memuat daftar peran'))
            .finally(() => setLoading(false));
    }, []);

    const simpan = async () => {
        setError('');
        setBusy(true);
        try {
            const res = await api.put('/users/me/target-role', { role_id: selected });
            updateUser(res.data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan peran');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="fade-up mx-auto max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Langkah 1 dari 2</span>
            <h1 className="mt-2 text-2xl font-extrabold text-navy sm:text-3xl">Peran apa yang Anda tuju?</h1>
            <p className="mt-2 text-slate-500">
                Portofolio Anda akan dinilai berdasarkan kebutuhan skill peran ini. Anda bisa menggantinya kapan saja.
            </p>

            {error && (
                <div className="mt-5 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                </div>
            )}

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {loading
                    ? [1, 2, 3, 4].map((n) => <div key={n} className="h-36 animate-pulse rounded-2xl bg-slate-200" />)
                    : roles.map((r) => {
                        const Ikon = ikonPeran[r.role_name] || Briefcase;
                        const aktif = selected === r.role_id;
                        return (
                            <button key={r.role_id} onClick={() => setSelected(r.role_id)}
                                    className={`relative rounded-2xl border-2 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                                        aktif ? 'border-brand-600 ring-4 ring-brand-600/10' : 'border-slate-200'
                                    }`}>
                                {aktif && (
                                    <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white">
                      <Check className="h-4 w-4" />
                    </span>
                                )}
                                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                                    aktif ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-600'
                                }`}>
                    <Ikon className="h-5 w-5" />
                  </span>
                                <p className="mt-4 font-bold text-navy">{r.role_name}</p>
                                <p className="mt-1 text-sm text-slate-500">{r.description}</p>
                                {r.total_skills > 0 && (
                                    <p className="mt-3 text-xs font-medium text-slate-400">{r.total_skills} skill dinilai</p>
                                )}
                            </button>
                        );
                    })}
            </div>

            <div className="mt-8">
                <Button size="lg" onClick={simpan} disabled={!selected} loading={busy}>
                    Simpan & lanjut
                </Button>
            </div>
        </div>
    );
}