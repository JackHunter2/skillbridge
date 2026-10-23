import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase, Bug, Calculator, Check, ClipboardList, Code, Database, Globe, Info,
    Megaphone, Palette, PenTool, Plus, Search, TrendingUp, Users, Video,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { inputCls, labelCls } from '../components/ui/styles';

const ikonPeran = {
    'Umum / Lintas Bidang': Globe,
    'Data Analyst': Database,
    'UI/UX Designer': Palette,
    'Digital Marketing': Megaphone,
    'Web Developer': Code,
    'Business Analyst': TrendingUp,
    'Project Manager': ClipboardList,
    'Graphic Designer': PenTool,
    'Content Creator': Video,
    'Finance & Accounting': Calculator,
    'Human Resources': Users,
    'Sales & Business Development': Briefcase,
    'QA Tester': Bug,
};

export default function Onboarding() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(user.target_role_id || null);
    const [cari, setCari] = useState('');
    const [kustom, setKustom] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [busyKustom, setBusyKustom] = useState(false);

    useEffect(() => {
        api.get('/roles')
            .then((res) => setRoles(res.data.roles))
            .catch(() => setError('Gagal memuat daftar peran'))
            .finally(() => setLoading(false));
    }, []);

    const tampil = roles.filter((r) =>
        `${r.role_name} ${r.description || ''}`.toLowerCase().includes(cari.trim().toLowerCase())
    );

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

    const simpanKustom = async (e) => {
        e.preventDefault();
        setError('');
        setBusyKustom(true);
        try {
            const res = await api.post('/roles/custom', { role_name: kustom });
            updateUser(res.data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan peran');
            setBusyKustom(false);
        }
    };

    return (
        <div className="fade-up mx-auto max-w-5xl">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Langkah 1 dari 2</span>
            <h1 className="mt-2 text-2xl font-extrabold text-navy sm:text-3xl">Peran apa yang Anda tuju?</h1>
            <p className="mt-2 text-slate-500">
                Portofolio Anda akan dinilai berdasarkan kebutuhan peran ini. Belum yakin? Pilih
                <strong> Umum / Lintas Bidang</strong>. Anda bisa menggantinya kapan saja.
            </p>

            {error && (
                <div className="mt-5 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                </div>
            )}

            <div className="relative mt-6">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={cari} onChange={(e) => setCari(e.target.value)}
                       placeholder="Cari peran..." className={`${inputCls} mt-0 pl-10`} />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {loading
                    ? [1, 2, 3, 4].map((n) => <div key={n} className="h-36 animate-pulse rounded-2xl bg-slate-200" />)
                    : tampil.map((r) => {
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
                                <p className="mt-4 flex flex-wrap items-center gap-2 font-bold text-navy">
                                    {r.role_name}
                                    {r.is_custom === 1 && (
                                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">Peran Anda</span>
                                    )}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">{r.description}</p>
                                {r.total_skills > 0 && (
                                    <p className="mt-3 text-xs font-medium text-slate-400">{r.total_skills} skill dinilai</p>
                                )}
                            </button>
                        );
                    })}
                {!loading && tampil.length === 0 && (
                    <p className="text-sm text-slate-500 sm:col-span-2">
                        Tidak ada peran yang cocok dengan pencarian. Tulis perannya sendiri di bawah.
                    </p>
                )}
            </div>

            <div className="mt-6">
                <Button size="lg" onClick={simpan} disabled={!selected} loading={busy}>
                    Simpan & lanjut
                </Button>
            </div>

            <form onSubmit={simpanKustom} className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-6">
                <h2 className="font-bold text-navy">Peran Anda tidak ada di daftar?</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Tulis sendiri perannya. Isi portofolio tetap dinilai sesuai peran yang Anda tulis, sedangkan
                    skill gap memakai kemampuan umum lintas bidang.
                </p>
                <label className={`${labelCls} mt-4 block`}>Nama peran</label>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <input value={kustom} onChange={(e) => setKustom(e.target.value)} maxLength={60} required
                           placeholder="Contoh: Data Scientist Kesehatan" className={inputCls} />
                    <Button loading={busyKustom} variant="dark" className="shrink-0 sm:mt-1.5">
                        <Plus className="h-4 w-4" /> Gunakan peran ini
                    </Button>
                </div>
            </form>
        </div>
    );
}