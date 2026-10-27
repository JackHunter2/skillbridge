import { useEffect, useState } from 'react';
import api from '../../services/api';

const kolom = [
    ['most_helpful', 'Apa yang paling membantu?'],
    ['most_difficult', 'Apa yang sulit atau membingungkan?'],
    ['would_change', 'Apa yang akan kamu ubah?'],
];

export default function FeedbackForm({ reviewId }) {
    const [form, setForm] = useState({
        ai_accuracy: 0, most_helpful: '', most_difficult: '', would_change: '',
    });
    const [sudahIsi, setSudahIsi] = useState(false);
    const [pesan, setPesan] = useState({ tipe: '', teks: '' });
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        api.get(`/feedback/review/${reviewId}`).then((res) => {
            if (res.data.feedback) {
                setForm({
                    ai_accuracy: res.data.feedback.ai_accuracy || 0,
                    most_helpful: res.data.feedback.most_helpful || '',
                    most_difficult: res.data.feedback.most_difficult || '',
                    would_change: res.data.feedback.would_change || '',
                });
                setSudahIsi(true);
            }
        });
    }, [reviewId]);

    const kirim = async (e) => {
        e.preventDefault();
        setPesan({ tipe: '', teks: '' });
        setBusy(true);
        try {
            const res = await api.post('/feedback', { review_id: reviewId, ...form });
            setPesan({ tipe: 'ok', teks: res.data.message });
            setSudahIsi(true);
        } catch (err) {
            setPesan({ tipe: 'err', teks: err.response?.data?.message || 'Gagal mengirim masukan' });
        } finally {
            setBusy(false);
        }
    };

    const input = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

    return (
        <form onSubmit={kirim} className="bg-white rounded-2xl shadow p-6 mt-6">
            <h2 className="font-semibold text-slate-900">Bantu kami memperbaiki aplikasi ini</h2>
            <p className="text-sm text-slate-500 mt-1">
                Masukan kamu dipakai untuk tahap pengujian. Semakin spesifik, semakin berguna.
            </p>

            <div className="mt-4">
                <p className="text-sm font-medium text-slate-700">Seberapa akurat feedback AI menurut kamu?</p>
                <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <button type="button" key={n} onClick={() => setForm({ ...form, ai_accuracy: n })}
                                className={`w-10 h-10 rounded-lg border text-sm font-semibold ${
                                    form.ai_accuracy === n
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                                }`}>
                            {n}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-slate-400 mt-1">1 = tidak akurat, 5 = sangat akurat</p>
            </div>

            {kolom.map(([nama, label]) => (
                <div key={nama} className="mt-4">
                    <label className="text-sm font-medium text-slate-700">{label}</label>
                    <textarea rows={2} maxLength={1000} className={input} value={form[nama]}
                              onChange={(e) => setForm({ ...form, [nama]: e.target.value })} />
                </div>
            ))}

            {pesan.teks && (
                <p className={`mt-4 text-sm rounded-lg p-3 ${
                    pesan.tipe === 'ok' ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'
                }`}>
                    {pesan.teks}
                </p>
            )}

            <button disabled={busy}
                    className="mt-4 rounded-lg bg-blue-600 text-white font-medium px-5 py-2 hover:bg-blue-700 disabled:opacity-60">
                {busy ? 'Mengirim...' : sudahIsi ? 'Perbarui masukan' : 'Kirim masukan'}
            </button>
        </form>
    );
}