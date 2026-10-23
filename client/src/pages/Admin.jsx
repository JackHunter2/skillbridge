import { useEffect, useState } from 'react';
import {
    BarChart3, Download, FolderOpen, Gauge, Info, MessageSquare, Search, Star, Tags, Users,
} from 'lucide-react';
import api from '../services/api';
import Button from '../components/ui/Button';
import { inputCls } from '../components/ui/styles';
import { getTeks } from '../utils/userType';

const tabs = [
    ['ringkasan', 'Ringkasan', BarChart3],
    ['feedback', 'Feedback', MessageSquare],
    ['peran', 'Peran', Tags],
    ['pengguna', 'Pengguna', Users],
];

const tgl = (d) =>
    new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

const kartu = 'rounded-2xl border border-slate-200 bg-white p-6';

function Statistik({ Ikon, nilai, label, sub }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Ikon className="h-5 w-5" />
      </span>
            <p className="mt-4 text-3xl font-extrabold text-navy">{nilai ?? '-'}</p>
            <p className="text-sm text-slate-500">{label}</p>
            {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
    );
}

function Batang({ items }) {
    if (!items.length) return <p className="text-sm text-slate-500">Belum ada data.</p>;
    const maks = Math.max(1, ...items.map((i) => i.jumlah));
    return (
        <ul className="space-y-3">
            {items.map((i) => (
                <li key={i.nama}>
                    <div className="flex justify-between gap-3 text-sm">
                        <span className="truncate font-medium text-slate-700">{i.nama}</span>
                        <span className="font-bold text-slate-900">{i.jumlah}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-brand-600" style={{ width: `${(i.jumlah / maks) * 100}%` }} />
                    </div>
                </li>
            ))}
        </ul>
    );
}

const warnaAkurasi = (n) =>
    n >= 4 ? 'bg-emerald-50 text-emerald-700' : n === 3 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700';

export default function Admin() {
    const [tab, setTab] = useState('ringkasan');
    const [ringkas, setRingkas] = useState(null);
    const [fb, setFb] = useState(null);
    const [q, setQ] = useState('');
    const [rating, setRating] = useState(0);
    const [roles, setRoles] = useState(null);
    const [users, setUsers] = useState(null);
    const [unduh, setUnduh] = useState(false);
    const [error, setError] = useState('');

    const galat = (err) => setError(err.response?.data?.message || 'Gagal memuat data');

    useEffect(() => {
        api.get('/admin/summary').then((res) => setRingkas(res.data)).catch(galat);
    }, []);

    useEffect(() => {
        if (tab !== 'feedback') return;
        const t = setTimeout(() => {
            api.get('/admin/feedback', { params: { q, rating } })
                .then((res) => setFb(res.data.feedback))
                .catch(galat);
        }, 300);
        return () => clearTimeout(t);
    }, [tab, q, rating]);

    useEffect(() => {
        if (tab === 'peran' && !roles) api.get('/admin/roles').then((res) => setRoles(res.data.roles)).catch(galat);
        if (tab === 'pengguna' && !users) api.get('/admin/users').then((res) => setUsers(res.data.users)).catch(galat);
    }, [tab]);

    const unduhCsv = async () => {
        setUnduh(true);
        try {
            const res = await api.get('/admin/feedback.csv', { params: { q, rating }, responseType: 'blob' });
            const url = URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'feedback-skillbridge.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch {
            setError('Gagal mengunduh CSV');
        } finally {
            setUnduh(false);
        }
    };

    const jadikanResmi = async (r) => {
        if (!window.confirm(`Jadikan "${r.role_name}" peran resmi? Semua pengguna akan melihatnya di daftar peran.`)) return;
        try {
            await api.post(`/admin/roles/${r.role_id}/promote`);
            setRoles((list) => list.filter((x) => x.role_id !== r.role_id));
        } catch (err) {
            galat(err);
        }
    };

    return (
        <div className="fade-up">
            <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">Panel admin</h1>
            <p className="mt-2 text-slate-500">
                Statistik dan masukan pengguna. Isi CV dan hasil reviu tidak dapat dilihat dari sini.
            </p>

            {error && (
                <div className="mt-5 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                </div>
            )}

            <nav className="mt-6 flex gap-1 overflow-x-auto rounded-xl bg-slate-200/60 p-1">
                {tabs.map(([key, label, Ikon]) => (
                    <button key={key} onClick={() => setTab(key)}
                            className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${
                                tab === key ? 'bg-white text-navy shadow-sm' : 'text-slate-600 hover:text-navy'
                            }`}>
                        <Ikon className="h-4 w-4" /> {label}
                    </button>
                ))}
            </nav>

            {tab === 'ringkasan' && (
                <div className="mt-6">
                    {!ringkas ? (
                        <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                                <Statistik Ikon={Users} nilai={ringkas.pengguna.total} label="Pengguna"
                                           sub={`${ringkas.pengguna.fresh} fresh graduate, ${ringkas.pengguna.magang} anak magang`} />
                                <Statistik Ikon={FolderOpen} nilai={ringkas.portofolio} label="Portofolio diunggah" />
                                <Statistik Ikon={Gauge} nilai={ringkas.reviu.selesai} label="Reviu selesai"
                                           sub={`${ringkas.reviu.gagal} gagal, ${ringkas.reviu.berjalan} berjalan`} />
                                <Statistik Ikon={BarChart3} nilai={ringkas.reviu.rata_skor} label="Rata-rata skor portofolio" />
                                <Statistik Ikon={MessageSquare} nilai={ringkas.feedback.total} label="Feedback masuk" />
                                <Statistik Ikon={Star} nilai={ringkas.feedback.akurasi} label="Akurasi AI menurut pengguna" sub="Skala 1-5" />
                            </div>

                            <div className="mt-6 grid gap-6 md:grid-cols-2">
                                <section className={kartu}>
                                    <h2 className="font-bold text-navy">Sebaran nilai akurasi AI</h2>
                                    <div className="mt-4"><Batang items={ringkas.sebaran_akurasi} /></div>
                                </section>
                                <section className={kartu}>
                                    <h2 className="font-bold text-navy">Peran paling banyak dipilih</h2>
                                    <div className="mt-4"><Batang items={ringkas.peran_populer} /></div>
                                </section>
                                <section className={`${kartu} md:col-span-2`}>
                                    <h2 className="font-bold text-navy">Model AI yang dipakai (reviu selesai)</h2>
                                    <div className="mt-4"><Batang items={ringkas.model} /></div>
                                </section>
                            </div>
                        </>
                    )}
                </div>
            )}

            {tab === 'feedback' && (
                <div className="mt-6">
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau isi masukan..."
                                   className={`${inputCls} mt-0 pl-10`} />
                        </div>
                        <select value={rating} onChange={(e) => setRating(Number(e.target.value))}
                                className={`${inputCls} mt-0 sm:w-44`}>
                            <option value={0}>Semua nilai</option>
                            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>Akurasi {n}</option>)}
                        </select>
                        <Button variant="secondary" onClick={unduhCsv} loading={unduh} className="shrink-0">
                            {!unduh && <Download className="h-4 w-4" />} Ekspor CSV
                        </Button>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">CSV tidak memuat nama maupun email pengguna.</p>

                    {!fb ? (
                        <div className="mt-5 h-32 animate-pulse rounded-2xl bg-slate-200" />
                    ) : fb.length === 0 ? (
                        <p className={`${kartu} mt-5 text-center text-sm text-slate-500`}>Belum ada feedback yang sesuai.</p>
                    ) : (
                        <ul className="mt-5 space-y-4">
                            {fb.map((f) => (
                                <li key={f.feedback_id} className={kartu}>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-semibold text-slate-900">{f.full_name}</span>
                                        <span className="text-xs text-slate-500">
                      {getTeks(f.user_type).label}{f.role_name ? ` • ${f.role_name}` : ''} • {tgl(f.created_at)}
                    </span>
                                        {f.ai_accuracy != null && (
                                            <span className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-bold ${warnaAkurasi(f.ai_accuracy)}`}>
                        Akurasi AI {f.ai_accuracy}/5
                      </span>
                                        )}
                                    </div>
                                    <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                                        {[['Paling membantu', f.most_helpful], ['Paling sulit', f.most_difficult], ['Akan diubah', f.would_change]].map(
                                            ([judul, isi]) => (
                                                <div key={judul}>
                                                    <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">{judul}</dt>
                                                    <dd className="mt-1 whitespace-pre-line text-slate-700">{isi || '-'}</dd>
                                                </div>
                                            )
                                        )}
                                    </dl>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {tab === 'peran' && (
                <section className={`${kartu} mt-6`}>
                    <h2 className="font-bold text-navy">Peran buatan pengguna</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Peran yang sering dipakai layak dijadikan peran resmi. Peran resmi muncul untuk semua pengguna.
                        Skill gap-nya tetap memakai skill umum sampai Anda menambahkan daftar skill khusus lewat database.
                    </p>
                    {!roles ? (
                        <div className="mt-4 h-24 animate-pulse rounded-xl bg-slate-100" />
                    ) : roles.length === 0 ? (
                        <p className="mt-4 text-sm text-slate-500">Belum ada peran buatan pengguna.</p>
                    ) : (
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="text-xs uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th className="py-2 pr-4">Peran</th><th className="py-2 pr-4">Dibuat oleh</th>
                                    <th className="py-2 pr-4">Pemakai</th><th className="py-2 pr-4">Portofolio</th>
                                    <th className="py-2 pr-4">Tanggal</th><th className="py-2" />
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {roles.map((r) => (
                                    <tr key={r.role_id}>
                                        <td className="py-3 pr-4 font-semibold text-slate-900">{r.role_name}</td>
                                        <td className="py-3 pr-4 text-slate-600">{r.pembuat || '-'}</td>
                                        <td className="py-3 pr-4">{r.pemakai}</td>
                                        <td className="py-3 pr-4">{r.portofolio}</td>
                                        <td className="whitespace-nowrap py-3 pr-4 text-slate-500">{tgl(r.created_at)}</td>
                                        <td className="py-3 text-right">
                                            <Button size="sm" variant="secondary" onClick={() => jadikanResmi(r)}>Jadikan resmi</Button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

            {tab === 'pengguna' && (
                <section className={`${kartu} mt-6`}>
                    <h2 className="font-bold text-navy">Pengguna terdaftar</h2>
                    {!users ? (
                        <div className="mt-4 h-24 animate-pulse rounded-xl bg-slate-100" />
                    ) : (
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="text-xs uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th className="py-2 pr-4">Nama</th><th className="py-2 pr-4">Email</th>
                                    <th className="py-2 pr-4">Status</th><th className="py-2 pr-4">Peran</th>
                                    <th className="py-2 pr-4">Portofolio</th><th className="py-2 pr-4">Reviu</th>
                                    <th className="py-2">Bergabung</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {users.map((u) => (
                                    <tr key={u.user_id}>
                                        <td className="whitespace-nowrap py-3 pr-4 font-semibold text-slate-900">{u.full_name}</td>
                                        <td className="py-3 pr-4 text-slate-600">{u.email}</td>
                                        <td className="whitespace-nowrap py-3 pr-4">{getTeks(u.user_type).label}</td>
                                        <td className="py-3 pr-4 text-slate-600">{u.role_name || '-'}</td>
                                        <td className="py-3 pr-4">{u.portofolio}</td>
                                        <td className="py-3 pr-4">{u.reviu}</td>
                                        <td className="whitespace-nowrap py-3 text-slate-500">{tgl(u.created_at)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}