import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { FileText, FolderOpen, Info, Link2, Plus, Sparkles, Target, Trash2, TrendingUp } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import ReviewingOverlay from '../components/review/ReviewingOverlay';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { scoreTone } from '../utils/score';
import { getTeks } from '../utils/userType';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [roleName, setRoleName] = useState('');
    const [portfolios, setPortfolios] = useState([]);
    const [loadingList, setLoadingList] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState('');
    const [hapusTarget, setHapusTarget] = useState(null);
    const [hapusBusy, setHapusBusy] = useState(false);

    useEffect(() => {
        if (!user.target_role_id) return;
        api.get('/roles').then((res) => {
            const r = res.data.roles.find((x) => x.role_id === user.target_role_id);
            setRoleName(r ? r.role_name : '');
        });
        api.get('/portfolios')
            .then((res) => setPortfolios(res.data.portfolios))
            .finally(() => setLoadingList(false));
    }, [user.target_role_id]);

    if (!user.target_role_id) return <Navigate to="/onboarding" replace />;

    const tungguSelesai = async (reviewId) => {
        const mulai = Date.now();
        while (Date.now() - mulai < 180000) {
            await new Promise((r) => setTimeout(r, 3000));
            const { data } = await api.get(`/reviews/${reviewId}/status`);
            if (data.status === 'done') return;
            if (data.status === 'failed') throw new Error(data.message || 'Reviu gagal diproses');
        }
        throw new Error('Reviu memakan waktu terlalu lama. Muat ulang halaman beberapa saat lagi.');
    };

    const jalankanReviu = async (p) => {
        setError('');
        setBusyId(p.portfolio_id);
        try {
            const res = await api.post(`/portfolios/${p.portfolio_id}/review`);
            await tungguSelesai(res.data.review_id);
            navigate(`/reviews/${res.data.review_id}`);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Reviu gagal, coba lagi');
            setBusyId(null);
        }
    };

    const hapusPortofolio = async () => {
        setHapusBusy(true);
        setError('');
        try {
            await api.delete(`/portfolios/${hapusTarget.portfolio_id}`);
            setPortfolios((list) => list.filter((x) => x.portfolio_id !== hapusTarget.portfolio_id));
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menghapus portofolio');
        } finally {
            setHapusBusy(false);
            setHapusTarget(null);
        }
    };

    const terbaru = portfolios.find((p) => p.latest_score != null);
    const nadaTerbaru = terbaru ? scoreTone(Number(terbaru.latest_score)) : null;
    const namaDepan = user.full_name.split(' ')[0];
    const teks = getTeks(user.user_type);

    const stat = 'rounded-2xl border border-slate-200 bg-white p-5';
    const ikon = 'flex h-10 w-10 items-center justify-center rounded-xl';

    return (
        <div className="fade-up">
            {busyId && <ReviewingOverlay />}

            {hapusTarget && (
                <ConfirmDialog
                    title="Hapus portofolio ini?"
                    loading={hapusBusy}
                    onConfirm={hapusPortofolio}
                    onCancel={() => !hapusBusy && setHapusTarget(null)}
                >
                    Portofolio <strong>{hapusTarget.title}</strong> beserta semua hasil reviu, skill gap, dan
                    roadmap-nya akan dihapus permanen. File PDF di server juga ikut dihapus. Tindakan ini tidak bisa dibatalkan.
                </ConfirmDialog>
            )}

            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
          <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
            {teks.label}
          </span>
                    <h1 className="mt-2 text-2xl font-extrabold text-navy sm:text-3xl">Halo, {namaDepan}</h1>
                    <p className="mt-1 max-w-xl text-slate-500">{teks.sapaan}</p>
                </div>
                <Button as={Link} to="/upload"><Plus className="h-4 w-4" /> Upload portofolio</Button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className={stat}>
                    <span className={`${ikon} bg-brand-50 text-brand-600`}><FolderOpen className="h-5 w-5" /></span>
                    <p className="mt-4 text-3xl font-extrabold text-navy">{portfolios.length}</p>
                    <p className="text-sm text-slate-500">Portofolio diunggah</p>
                </div>
                <div className={stat}>
                    <span className={`${ikon} bg-accent-50 text-accent-600`}><TrendingUp className="h-5 w-5" /></span>
                    <p className="mt-4 text-3xl font-extrabold text-navy">
                        {terbaru ? Math.round(terbaru.latest_score) : '—'}
                    </p>
                    <p className="text-sm text-slate-500">
                        Skor terbaru{nadaTerbaru && <span className={`ml-2 font-semibold ${nadaTerbaru.text}`}>{nadaTerbaru.label}</span>}
                    </p>
                </div>
                <div className={stat}>
                    <span className={`${ikon} bg-amber-50 text-amber-600`}><Target className="h-5 w-5" /></span>
                    <p className="mt-4 text-xl font-extrabold text-navy">{roleName || '...'}</p>
                    <p className="text-sm text-slate-500">
                        Peran target <Link to="/onboarding" className="ml-1 font-semibold text-brand-600">Ganti</Link>
                    </p>
                </div>
            </div>

            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="font-bold text-navy">Portofolio Anda</h2>

                {error && (
                    <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        <Info className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                    </div>
                )}

                {loadingList ? (
                    <div className="mt-4 space-y-3">
                        {[1, 2].map((n) => <div key={n} className="h-20 animate-pulse rounded-xl bg-slate-100" />)}
                    </div>
                ) : portfolios.length === 0 ? (
                    <div className="mt-6 rounded-xl border-2 border-dashed border-slate-200 py-12 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Sparkles className="h-6 w-6" />
            </span>
                        <p className="mt-4 font-semibold text-navy">Belum ada portofolio</p>
                        <p className="mt-1 text-sm text-slate-500">{teks.kosong}</p>
                        <div className="mt-5"><Button as={Link} to="/upload">Upload sekarang</Button></div>
                    </div>
                ) : (
                    <ul className="mt-4 space-y-3">
                        {portfolios.map((p) => {
                            const nada = p.latest_score != null ? scoreTone(Number(p.latest_score)) : null;
                            return (
                                <li key={p.portfolio_id}
                                    className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex min-w-0 items-center gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      {p.source_type === 'file' ? <FileText className="h-5 w-5" /> : <Link2 className="h-5 w-5" />}
                    </span>
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-slate-900">{p.title}</p>
                                            <p className="text-xs text-slate-500">
                                                {p.source_type === 'file' ? 'File PDF' : 'Link'} •{' '}
                                                {new Date(p.uploaded_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        {nada && (
                                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${nada.bg} ${nada.text}`}>
                        Skor {Math.round(p.latest_score)}
                      </span>
                                        )}
                                        {p.latest_review_id && (
                                            <Button as={Link} to={`/reviews/${p.latest_review_id}`} variant="secondary" size="sm">
                                                Lihat hasil
                                            </Button>
                                        )}
                                        <Button size="sm" onClick={() => jalankanReviu(p)} disabled={busyId !== null}>
                                            <Sparkles className="h-4 w-4" />
                                            {p.latest_review_id ? 'Reviu ulang' : 'Reviu AI'}
                                        </Button>
                                        <button
                                            onClick={() => setHapusTarget(p)}
                                            disabled={busyId !== null}
                                            title="Hapus portofolio"
                                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
            <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
                <h2 className="font-bold text-navy">{teks.judulTips}</h2>
                <ul className="mt-3 space-y-2">
                    {teks.tips.map((t) => (
                        <li key={t} className="flex gap-2 text-sm text-slate-700">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                            {t}
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}