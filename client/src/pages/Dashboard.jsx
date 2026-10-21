import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [roleName, setRoleName] = useState('');
    const [portfolios, setPortfolios] = useState([]);
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user.target_role_id) return;
        api.get('/roles').then((res) => {
            const r = res.data.roles.find((x) => x.role_id === user.target_role_id);
            setRoleName(r ? r.role_name : '');
        });
        api.get('/portfolios').then((res) => setPortfolios(res.data.portfolios));
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

                    <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 p-4">
                        <div>
                            <p className="text-xs text-blue-700 font-medium">PERAN TARGET</p>
                            <p className="font-semibold text-slate-900">{roleName || '...'}</p>
                        </div>
                        <Link to="/onboarding" className="text-sm text-blue-600 font-medium">Ganti</Link>
                    </div>
                </div>

                <div className="mt-6 bg-white rounded-2xl shadow p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-slate-900">Portofolio Anda</h2>
                        <Link to="/upload"
                              className="rounded-lg bg-blue-600 text-white text-sm font-medium px-4 py-2 hover:bg-blue-700">
                            + Upload
                        </Link>
                    </div>

                    {error && <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}
                    {busyId && (
                        <p className="mt-4 text-sm text-blue-700 bg-blue-50 rounded-lg p-3">
                            AI sedang menilai portofolio Anda. Proses ini bisa memakan 10–40 detik, jangan tutup halaman.
                        </p>
                    )}

                    {portfolios.length === 0 ? (
                        <p className="text-sm text-slate-500 mt-4">Belum ada portofolio. Upload yang pertama.</p>
                    ) : (
                        <ul className="mt-4 divide-y divide-slate-100">
                            {portfolios.map((p) => (
                                <li key={p.portfolio_id} className="py-3 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="font-medium text-slate-900">{p.title}</p>
                                        <p className="text-xs text-slate-400">
                                            {p.source_type === 'file' ? 'File PDF' : 'Link'} •{' '}
                                            {new Date(p.uploaded_at).toLocaleDateString('id-ID')}
                                            {p.latest_score != null && <> • Skor terakhir {Math.round(p.latest_score)}</>}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {p.latest_review_id && (
                                            <Link to={`/reviews/${p.latest_review_id}`}
                                                  className="text-sm text-blue-600 font-medium">Lihat hasil</Link>
                                        )}
                                        <button
                                            onClick={() => jalankanReviu(p)}
                                            disabled={busyId !== null}
                                            className="rounded-lg bg-blue-600 text-white text-sm font-medium px-3 py-1.5 hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {busyId === p.portfolio_id ? 'Menilai...' : p.latest_review_id ? 'Reviu ulang' : 'Reviu AI'}
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}