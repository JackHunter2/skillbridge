import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Info, Link2, UploadCloud, X } from 'lucide-react';
import api from '../services/api';
import Button from '../components/ui/Button';
import { inputCls, labelCls } from '../components/ui/styles';
import { useAuth } from '../context/AuthContext';
import { getTeks } from '../utils/userType';

const MAKS = 5 * 1024 * 1024;
const ukuran = (b) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);

export default function UploadPortfolio() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const teks = getTeks(user.user_type);
    const [mode, setMode] = useState('file');
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [url, setUrl] = useState('');
    const [text, setText] = useState('');
    const [drag, setDrag] = useState(false);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const pilihFile = (f) => {
        setError('');
        if (!f) return;
        if (f.type !== 'application/pdf') return setError('Hanya file PDF yang diperbolehkan');
        if (f.size > MAKS) return setError('Ukuran file maksimal 5 MB');
        setFile(f);
    };

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

    const tab = (aktif) =>
        `flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
            aktif ? 'bg-white text-navy shadow-sm' : 'text-slate-600 hover:text-navy'
        }`;

    return (
        <div className="fade-up mx-auto max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Langkah 2 dari 2</span>
            <h1 className="mt-2 text-2xl font-extrabold text-navy sm:text-3xl">{teks.judulUpload}</h1>
            <p className="mt-2 text-slate-500">Isinya akan dinilai oleh AI sesuai peran target Anda.</p>

            <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50/60 p-4 text-sm text-slate-700">
                <p className="font-semibold text-brand-700">Untuk {teks.label.toLowerCase()}</p>
                <p className="mt-1">{teks.petunjukUpload}</p>
            </div>

            <form onSubmit={kirim} className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
                {error && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        <Info className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                    </div>
                )}

                <div>
                    <label className={labelCls}>Judul</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} required
                           placeholder={teks.contohJudul} className={inputCls} />
                </div>

                <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
                    <button type="button" onClick={() => setMode('file')} className={tab(mode === 'file')}>
                        <FileText className="h-4 w-4" /> File PDF
                    </button>
                    <button type="button" onClick={() => setMode('link')} className={tab(mode === 'link')}>
                        <Link2 className="h-4 w-4" /> Link
                    </button>
                </div>

                {mode === 'file' ? (
                    file ? (
                        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                            <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600">
                  <FileText className="h-5 w-5" />
                </span>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-900">{file.name}</p>
                                    <p className="text-xs text-slate-500">{ukuran(file.size)}</p>
                                </div>
                            </div>
                            <button type="button" onClick={() => setFile(null)}
                                    className="rounded-lg p-2 text-slate-500 hover:bg-white" title="Hapus file">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <label
                            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                            onDragLeave={() => setDrag(false)}
                            onDrop={(e) => { e.preventDefault(); setDrag(false); pilihFile(e.dataTransfer.files[0]); }}
                            className={`flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
                                drag ? 'border-brand-600 bg-brand-50' : 'border-slate-300 hover:border-brand-500 hover:bg-slate-50'
                            }`}>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <UploadCloud className="h-6 w-6" />
              </span>
                            <p className="mt-4 text-sm font-semibold text-navy">Tarik file ke sini atau klik untuk memilih</p>
                            <p className="mt-1 text-xs text-slate-500">PDF, maksimal 5 MB. Gunakan PDF yang teksnya bisa diblok, bukan hasil scan.</p>
                            <input type="file" accept="application/pdf" className="hidden"
                                   onChange={(e) => pilihFile(e.target.files[0])} />
                        </label>
                    )
                ) : (
                    <>
                        <div>
                            <label className={labelCls}>Link portofolio</label>
                            <input value={url} onChange={(e) => setUrl(e.target.value)} required
                                   placeholder="https://..." className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Isi / deskripsi portofolio</label>
                            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} required
                                      placeholder={teks.contohIsi}
                                      className={inputCls} />
                            <p className={`mt-1 text-xs ${text.trim().length >= 100 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {text.trim().length}/100 karakter minimal. AI menilai dari teks yang Anda tempel.
                            </p>
                        </div>
                    </>
                )}
                <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <p>
                        <strong>Privasi data:</strong> file PDF langsung dihapus dari server setelah teksnya dibaca. Teks
                        portofolio dihapus otomatis setelah 180 hari tanpa aktivitas, dan Anda bisa menghapusnya kapan saja
                        dari Dashboard. Hasil reviu tetap tersimpan.
                    </p>
                </div>
                <div className="flex items-center gap-3 pt-1">
                    <Button loading={busy}>Unggah</Button>
                    <Button as={Link} to="/dashboard" variant="ghost">Batal</Button>
                </div>
            </form>
        </div>
    );
}