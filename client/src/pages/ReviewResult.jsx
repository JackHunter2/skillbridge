import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    CartesianGrid, Line, LineChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart,
    ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { ArrowLeft, Check, Compass, Gauge, Lightbulb, Printer, Target } from 'lucide-react';
import api from '../services/api';
import Button from '../components/ui/Button';
import FeedbackForm from '../components/review/FeedbackForm';
import { scoreTone } from '../utils/score';

const barWarna = (n) => (n >= 75 ? 'bg-emerald-500' : n >= 50 ? 'bg-amber-500' : 'bg-red-500');
const prioritasKelas = {
    tinggi: 'bg-red-50 text-red-700',
    sedang: 'bg-amber-50 text-amber-700',
    rendah: 'bg-slate-100 text-slate-600',
};
const tabs = [
    ['ringkasan', 'Ringkasan', Gauge],
    ['saran', 'Saran', Lightbulb],
    ['skill', 'Skill gap', Target],
    ['roadmap', 'Roadmap', Compass],
];

function ScoreCircle({ score }) {
    const r = 54;
    const keliling = 2 * Math.PI * r;
    const isi = (Math.min(Math.max(score, 0), 100) / 100) * keliling;
    return (
        <div className="relative h-36 w-36 shrink-0">
            <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
                <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="12" />
                <circle cx="70" cy="70" r={r} fill="none" stroke="#34d399" strokeWidth="12"
                        strokeLinecap="round" strokeDasharray={`${isi} ${keliling}`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <span className="text-4xl font-extrabold">{Math.round(score)}</span>
                <span className="text-xs text-slate-300">dari 100</span>
            </div>
        </div>
    );
}

function Panel({ aktif, children }) {
    return <div className={aktif ? 'block' : 'hidden print:block'}>{children}</div>;
}

const kartu = 'mt-6 rounded-2xl border border-slate-200 bg-white p-6 print:break-inside-avoid';

export default function ReviewResult() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [tab, setTab] = useState('ringkasan');
    const [filter, setFilter] = useState('semua');
    const [items, setItems] = useState([]);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        api.get(`/reviews/${id}`)
            .then((res) => {
                setData(res.data);
                setItems(res.data.roadmap);
            })
            .catch((err) => setError(err.response?.data?.message || 'Gagal memuat hasil reviu'));
    }, [id]);

    useEffect(() => {
        api.get('/portfolios/history')
            .then((res) => setHistory(res.data.history))
            .catch(() => {});
    }, []);

    const centang = async (it) => {
        const berikut = it.status === 'selesai' ? 'belum' : 'selesai';
        const ubah = (status) =>
            setItems((list) => list.map((x) => (x.item_id === it.item_id ? { ...x, status } : x)));
        ubah(berikut);
        try {
            await api.patch(`/roadmap/items/${it.item_id}`, { status: berikut });
        } catch {
            ubah(it.status);
        }
    };

    if (error) {
        return (
            <div>
                <p className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>
                <Link to="/dashboard" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                    <ArrowLeft className="h-4 w-4" /> Kembali
                </Link>
            </div>
        );
    }
    if (!data) {
        return (
            <div className="space-y-4">
                <div className="h-48 animate-pulse rounded-3xl bg-slate-200" />
                <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
            </div>
        );
    }

    const { review, scores, suggestions, gaps } = data;
    const nada = scoreTone(Number(review.overall_score));
    const minggu = [...new Set(items.map((r) => r.week_no))];
    const selesai = items.filter((r) => r.status === 'selesai').length;
    const persen = items.length ? Math.round((selesai / items.length) * 100) : 0;
    const gapAktif = gaps.filter((g) => g.gap_size > 0).length;
    const radar = scores.map((s) => ({ aspek: s.criteria_name, nilai: Number(s.score) }));
    const riwayat = history.map((h, i) => ({ nama: `#${i + 1}`, skor: Math.round(Number(h.overall_score)) }));
    const selisih = riwayat.length > 1 ? riwayat[riwayat.length - 1].skor - riwayat[0].skor : 0;
    const saranTampil = suggestions.filter((s) => filter === 'semua' || s.priority === filter);
    const prioritasUtama = suggestions.slice(0, 3);
    const tanggal = new Date(review.created_at).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
    });

    return (
        <div className="fade-up">
            <div className="flex items-center justify-between print:hidden">
                <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                    <ArrowLeft className="h-4 w-4" /> Dashboard
                </Link>
                <Button variant="secondary" size="sm" onClick={() => window.print()}>
                    <Printer className="h-4 w-4" /> Cetak / simpan PDF
                </Button>
            </div>

            <section className="relative mt-4 overflow-hidden rounded-3xl bg-navy p-6 text-white sm:p-8">
                <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-600/30 blur-3xl" />
                <div className="relative flex flex-col items-center gap-6 sm:flex-row">
                    <ScoreCircle score={Number(review.overall_score)} />
                    <div className="text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">{review.role_name}</span>
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${nada.bg} ${nada.text}`}>{nada.label}</span>
                        </div>
                        <h1 className="mt-3 text-2xl font-extrabold">{review.title}</h1>
                        <p className="mt-1 text-xs text-slate-400">Dinilai pada {tanggal}</p>
                        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-200">{review.summary}</p>
                    </div>
                </div>
                <div className="relative mt-6 grid grid-cols-3 gap-3">
                    {[
                        [suggestions.length, 'Saran perbaikan'],
                        [gapAktif, 'Skill belum terpenuhi'],
                        [`${selesai}/${items.length}`, 'Roadmap selesai'],
                    ].map(([nilai, label]) => (
                        <div key={label} className="rounded-xl bg-white/5 p-3 text-center">
                            <p className="text-xl font-extrabold">{nilai}</p>
                            <p className="text-xs text-slate-300">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            <nav className="mt-6 flex gap-1 overflow-x-auto rounded-xl bg-slate-200/60 p-1 print:hidden">
                {tabs.map(([key, label, Ikon]) => (
                    <button key={key} onClick={() => setTab(key)}
                            className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${
                                tab === key ? 'bg-white text-navy shadow-sm' : 'text-slate-600 hover:text-navy'
                            }`}>
                        <Ikon className="h-4 w-4" /> {label}
                    </button>
                ))}
            </nav>

            <Panel aktif={tab === 'ringkasan'}>
                <section className={kartu}>
                    <h2 className="font-bold text-navy">Profil portofolio</h2>
                    <div className="mt-2 grid items-center gap-6 md:grid-cols-2">
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radar} outerRadius="72%">
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="aspek" tick={{ fill: '#334155', fontSize: 12 }} />
                                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar dataKey="nilai" stroke="#1e6fd9" fill="#1e6fd9" fillOpacity={0.3} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-5">
                            {scores.map((s) => (
                                <div key={s.criteria_id}>
                                    <div className="flex justify-between text-sm">
                                        <span className="font-semibold text-slate-800">{s.criteria_name}</span>
                                        <span className="font-bold text-slate-700">{Math.round(s.score)}</span>
                                    </div>
                                    <div className="mt-1.5 h-2 rounded-full bg-slate-100">
                                        <div className={`h-2 rounded-full ${barWarna(s.score)}`} style={{ width: `${s.score}%` }} />
                                    </div>
                                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{s.explanation}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {riwayat.length > 1 && (
                    <section className={kartu}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <h2 className="font-bold text-navy">Perkembangan skor</h2>
                                <p className="text-xs text-slate-500">Semua reviu Anda, urut dari yang paling awal</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                                selisih >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                            }`}>
                {selisih >= 0 ? '+' : ''}{selisih} poin sejak reviu pertama
              </span>
                        </div>
                        <div className="mt-4 h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={riwayat} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                                    <XAxis dataKey="nama" tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <Tooltip formatter={(v) => [`${v}`, 'Skor']} />
                                    <Line type="monotone" dataKey="skor" stroke="#1e6fd9" strokeWidth={3} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                )}

                {prioritasUtama.length > 0 && (
                    <section className={kartu}>
                        <h2 className="font-bold text-navy">Yang perlu dikerjakan lebih dulu</h2>
                        <ol className="mt-4 space-y-3">
                            {prioritasUtama.map((s, i) => (
                                <li key={s.suggestion_id} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                                    <p className="pt-0.5 text-sm text-slate-700">{s.suggestion}</p>
                                </li>
                            ))}
                        </ol>
                    </section>
                )}
            </Panel>

            <Panel aktif={tab === 'saran'}>
                <section className={kartu}>
                    <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                        <h2 className="font-bold text-navy">Saran perbaikan</h2>
                        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
                            {['semua', 'tinggi', 'sedang', 'rendah'].map((f) => (
                                <button key={f} onClick={() => setFilter(f)}
                                        className={`rounded-md px-3 py-1 text-xs font-semibold capitalize ${
                                            filter === f ? 'bg-white text-navy shadow-sm' : 'text-slate-500'
                                        }`}>
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                    <h2 className="hidden font-bold text-navy print:block">Saran perbaikan</h2>

                    <div className="mt-4 space-y-4">
                        {saranTampil.length === 0 && <p className="text-sm text-slate-500">Tidak ada saran pada filter ini.</p>}
                        {saranTampil.map((s) => (
                            <article key={s.suggestion_id} className="rounded-xl border border-slate-200 p-4 print:break-inside-avoid">
                                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${prioritasKelas[s.priority]}`}>
                    Prioritas {s.priority}
                  </span>
                                    {s.criteria_name && <span className="text-xs font-medium text-slate-500">{s.criteria_name}</span>}
                                    {s.section_ref && <span className="text-xs text-slate-400">• {s.section_ref}</span>}
                                </div>
                                <p className="mt-2 text-sm leading-relaxed text-slate-800">{s.suggestion}</p>
                                {(s.example_before || s.example_after) && (
                                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                        {s.example_before && (
                                            <div className="rounded-lg border border-red-100 bg-red-50/60 p-3">
                                                <p className="text-xs font-bold text-red-700">SEBELUM</p>
                                                <p className="mt-1 text-sm text-slate-700">{s.example_before}</p>
                                            </div>
                                        )}
                                        {s.example_after && (
                                            <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3">
                                                <p className="text-xs font-bold text-emerald-700">SESUDAH</p>
                                                <p className="mt-1 text-sm text-slate-700">{s.example_after}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                </section>
            </Panel>

            <Panel aktif={tab === 'skill'}>
                <section className={kartu}>
                    <h2 className="font-bold text-navy">Skill gap terhadap peran {review.role_name}</h2>
                    <div className="mt-5 space-y-5">
                        {gaps.map((g) => (
                            <div key={g.skill_id} className="print:break-inside-avoid">
                                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                                    <span className="font-semibold text-slate-800">{g.skill_name}</span>
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                        g.gap_size > 0 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                                    }`}>
                    {g.gap_size > 0 ? `Kurang ${g.gap_size} level` : 'Memenuhi'}
                  </span>
                                </div>
                                <div className="relative mt-2 h-2.5 rounded-full bg-slate-100">
                                    <div className="h-2.5 rounded-full bg-brand-600" style={{ width: `${(g.current_level / 5) * 100}%` }} />
                                    <div className="absolute w-0.5 rounded bg-navy"
                                         style={{ left: `${(g.required_level / 5) * 100}%`, top: '-4px', height: '18px' }} />
                                </div>
                                <p className="mt-1.5 text-xs text-slate-500">
                                    Level Anda {g.current_level}, dibutuhkan {g.required_level} (skala 0–5)
                                </p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-5 text-xs text-slate-400">Garis gelap menandai level yang dibutuhkan peran target.</p>
                </section>
            </Panel>

            <Panel aktif={tab === 'roadmap'}>
                <section className={kartu}>
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h2 className="font-bold text-navy">Roadmap belajar 30 hari</h2>
                            <p className="mt-1 text-sm text-slate-500 print:hidden">Centang langkah yang sudah Anda selesaikan.</p>
                        </div>
                        <p className="text-2xl font-extrabold text-brand-600">{persen}%</p>
                    </div>
                    <div className="mt-3 h-2.5 rounded-full bg-slate-100">
                        <div className="h-2.5 rounded-full bg-accent-500 transition-all" style={{ width: `${persen}%` }} />
                    </div>

                    <div className="mt-6 space-y-6">
                        {minggu.map((w) => (
                            <div key={w} className="print:break-inside-avoid">
                                <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Minggu {w}</p>
                                <ul className="mt-2 space-y-2">
                                    {items.filter((r) => r.week_no === w).map((r) => {
                                        const done = r.status === 'selesai';
                                        return (
                                            <li key={r.item_id}>
                                                <button onClick={() => centang(r)}
                                                        className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                                                            done ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 hover:border-brand-500 hover:bg-brand-50/40'
                                                        }`}>
                          <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
                              done ? 'border-accent-500 bg-accent-500 text-white' : 'border-slate-300'
                          }`}>
                            {done && <Check className="h-3.5 w-3.5" />}
                          </span>
                                                    <span>
                            <span className={`block text-sm font-medium ${done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                              {r.title}
                            </span>
                            <span className="mt-0.5 block text-xs text-slate-400">{r.skill_name}</span>
                          </span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            </Panel>

            <div className="print:hidden"><FeedbackForm reviewId={review.review_id} /></div>

            <p className="mt-6 text-center text-xs text-slate-400">
                Reviu dibuat oleh AI dan bersifat masukan awal, bukan penilaian final.
            </p>
        </div>
    );
}