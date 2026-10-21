import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import FeedbackForm from '../components/review/FeedbackForm';

const barWarna = (n) => (n >= 75 ? 'bg-emerald-500' : n >= 50 ? 'bg-amber-500' : 'bg-red-500');
const strokeWarna = (n) => (n >= 75 ? '#10b981' : n >= 50 ? '#f59e0b' : '#ef4444');
const prioritasKelas = {
    tinggi: 'bg-red-100 text-red-700',
    sedang: 'bg-amber-100 text-amber-700',
    rendah: 'bg-slate-100 text-slate-600',
};

function ScoreCircle({ score }) {
    const r = 54;
    const keliling = 2 * Math.PI * r;
    const isi = (Math.min(Math.max(score, 0), 100) / 100) * keliling;
    return (
        <div className="relative w-36 h-36">
            <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                <circle cx="70" cy="70" r={r} fill="none" stroke="#e2e8f0" strokeWidth="12" />
                <circle cx="70" cy="70" r={r} fill="none" stroke={strokeWarna(score)} strokeWidth="12"
                        strokeLinecap="round" strokeDasharray={`${isi} ${keliling}`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900">{Math.round(score)}</span>
                <span className="text-xs text-slate-500">dari 100</span>
            </div>
        </div>
    );
}

function Kartu({ judul, children }) {
    return (
        <section className="bg-white rounded-2xl shadow p-6 mt-6">
            <h2 className="font-semibold text-slate-900 mb-4">{judul}</h2>
            {children}
        </section>
    );
}

export default function ReviewResult() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`/reviews/${id}`)
            .then((res) => setData(res.data))
            .catch((err) => setError(err.response?.data?.message || 'Gagal memuat hasil reviu'));
    }, [id]);

    if (error) {
        return (
            <div className="p-6 max-w-3xl mx-auto">
                <p className="text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
                <Link to="/dashboard" className="text-blue-600 text-sm mt-4 inline-block">← Kembali</Link>
            </div>
        );
    }
    if (!data) return <p className="p-6 text-slate-500">Memuat...</p>;

    const { review, scores, suggestions, gaps, roadmap } = data;
    const minggu = [...new Set(roadmap.map((r) => r.week_no))];

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-3xl mx-auto">
                <Link to="/dashboard" className="text-sm text-blue-600">← Kembali ke dashboard</Link>

                <section className="bg-white rounded-2xl shadow p-6 mt-4 flex flex-col sm:flex-row items-center gap-6">
                    <ScoreCircle score={Number(review.overall_score)} />
                    <div className="text-center sm:text-left">
                        <p className="text-xs text-slate-500">{review.role_name}</p>
                        <h1 className="text-xl font-bold text-slate-900">{review.title}</h1>
                        <p className="text-sm text-slate-600 mt-2">{review.summary}</p>
                    </div>
                </section>

                <Kartu judul="Skor per aspek">
                    <div className="space-y-5">
                        {scores.map((s) => (
                            <div key={s.criteria_id}>
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-slate-800">{s.criteria_name}</span>
                                    <span className="text-slate-600">{Math.round(s.score)}/100</span>
                                </div>
                                <div className="h-2.5 bg-slate-100 rounded-full mt-1.5">
                                    <div className={`h-2.5 rounded-full ${barWarna(s.score)}`} style={{ width: `${s.score}%` }} />
                                </div>
                                <p className="text-sm text-slate-500 mt-1.5">{s.explanation}</p>
                            </div>
                        ))}
                    </div>
                </Kartu>

                <Kartu judul="Saran perbaikan">
                    <div className="space-y-4">
                        {suggestions.map((s) => (
                            <div key={s.suggestion_id} className="rounded-xl border border-slate-200 p-4">
                                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${prioritasKelas[s.priority]}`}>
                    Prioritas {s.priority}
                  </span>
                                    {s.criteria_name && <span className="text-xs text-slate-500">{s.criteria_name}</span>}
                                    {s.section_ref && <span className="text-xs text-slate-400">• {s.section_ref}</span>}
                                </div>
                                <p className="text-sm text-slate-800 mt-2">{s.suggestion}</p>
                                {(s.example_before || s.example_after) && (
                                    <div className="grid sm:grid-cols-2 gap-3 mt-3">
                                        {s.example_before && (
                                            <div className="rounded-lg bg-red-50 p-3">
                                                <p className="text-xs font-semibold text-red-700 mb-1">Sebelum</p>
                                                <p className="text-sm text-slate-700">{s.example_before}</p>
                                            </div>
                                        )}
                                        {s.example_after && (
                                            <div className="rounded-lg bg-emerald-50 p-3">
                                                <p className="text-xs font-semibold text-emerald-700 mb-1">Sesudah</p>
                                                <p className="text-sm text-slate-700">{s.example_after}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Kartu>

                <Kartu judul="Skill gap">
                    <div className="space-y-4">
                        {gaps.map((g) => (
                            <div key={g.skill_id}>
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-slate-800">{g.skill_name}</span>
                                    <span className={g.gap_size > 0 ? 'text-red-600' : 'text-emerald-600'}>
                    {g.gap_size > 0 ? `Kurang ${g.gap_size} level` : 'Sudah memenuhi'}
                                        <span className="text-slate-400"> • level {g.current_level} dari {g.required_level} dibutuhkan</span>
                  </span>
                                </div>
                                <div className="relative h-2.5 bg-slate-100 rounded-full mt-1.5">
                                    <div className="h-2.5 rounded-full bg-blue-500" style={{ width: `${(g.current_level / 5) * 100}%` }} />
                                    <div className="absolute -top-1 h-4.5 w-0.5 bg-slate-700"
                                         style={{ left: `${(g.required_level / 5) * 100}%`, height: '1.1rem' }} />
                                </div>
                            </div>
                        ))}
                        <p className="text-xs text-slate-400">Garis hitam menunjukkan level yang dibutuhkan peran target.</p>
                    </div>
                </Kartu>

                <Kartu judul="Roadmap belajar 30 hari">
                    <div className="space-y-4">
                        {minggu.map((w) => (
                            <div key={w} className="flex gap-4">
                                <div className="shrink-0 w-16 h-8 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold flex items-center justify-center">
                                    Minggu {w}
                                </div>
                                <ul className="space-y-2 pt-1">
                                    {roadmap.filter((r) => r.week_no === w).map((r) => (
                                        <li key={r.item_id} className="text-sm text-slate-800">
                                            {r.title} <span className="text-xs text-slate-400">• {r.skill_name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </Kartu>
                <FeedbackForm reviewId={review.review_id} />
                <p className="text-xs text-slate-400 text-center mt-6">
                    Reviu dibuat oleh AI dan bersifat masukan awal, bukan penilaian final.
                </p>
            </div>
        </div>
    );
}