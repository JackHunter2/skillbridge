import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function UploadPortfolio() {
    const navigate = useNavigate();
    const [mode, setMode] = useState('file');
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [url, setUrl] = useState('');
    const [text, setText] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const kirim = async (e) => {
        e.preventDefault();
        setError('');

        const body = new FormData();
        body.append('title', title);
        if (mode === 'file') {
            if (!file) return setError('Pilih file PDF terlebih dahulu');
            body.append('file', file);
        } else {
            body.append('url', url);
            body.append('text', text);
        }

        setBusy(true);
        try {
            await api.post('/portfolios', body);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengunggah, coba lagi');
        } finally {
            setBusy(false);
        }
    };

    const input = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';
    const tab = (aktif) =>
        `flex-1 rounded-lg py-2 text-sm font-medium ${aktif ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`;

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <form onSubmit={kirim} className="max-w-xl mx-auto bg-white rounded-2xl shadow p-8 space-y-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Upload portofolio</h1>
                    <p className="text-slate-500 text-sm">CV atau portofolio Anda akan dinilai oleh AI.</p>
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}

                <div>
                    <label className="text-sm font-medium text-slate-700">Judul</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} required
                           placeholder="Contoh: CV Data Analyst 2026" className={input} />
                </div>

                <div className="flex gap-2">
                    <button type="button" onClick={() => setMode('file')} className={tab(mode === 'file')}>File PDF</button>
                    <button type="button" onClick={() => setMode('link')} className={tab(mode === 'link')}>Link</button>
                </div>

                {mode === 'file' ? (
                    <div>
                        <label className="text-sm font-medium text-slate-700">File PDF (maks. 5 MB)</label>
                        <input type="file" accept="application/pdf"
                               onChange={(e) => setFile(e.target.files[0] || null)}
                               className="mt-1 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-700" />
                        <p className="text-xs text-slate-400 mt-2">Gunakan PDF yang teksnya bisa diblok, bukan hasil scan/gambar.</p>
                    </div>
                ) : (
                    <>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Link portofolio</label>
                            <input value={url} onChange={(e) => setUrl(e.target.value)} required
                                   placeholder="https://..." className={input} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Isi / deskripsi portofolio</label>
                            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} required
                                      placeholder="Tempel teks portofolio Anda: proyek, peran, tools, dan hasil yang dicapai..."
                                      className={input} />
                            <p className="text-xs text-slate-400 mt-1">Minimal 100 karakter. AI menilai dari teks yang Anda tempel.</p>
                        </div>
                    </>
                )}

                <div className="flex items-center gap-3">
                    <button disabled={busy}
                            className="rounded-lg bg-blue-600 text-white font-medium px-6 py-2 hover:bg-blue-700 disabled:opacity-60">
                        {busy ? 'Mengunggah...' : 'Unggah'}
                    </button>
                    <Link to="/dashboard" className="text-sm text-slate-600">Batal</Link>
                </div>
            </form>
        </div>
    );
}