import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CheckCircle2, Info, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { inputCls, labelCls } from '../components/ui/styles';
import { ACCENTS, getAccent, setAccent } from '../utils/theme';

function Pesan({ pesan }) {
    if (!pesan.teks) return null;
    const ok = pesan.tipe === 'ok';
    const Ikon = ok ? CheckCircle2 : Info;
    return (
        <div className={`flex items-start gap-2 rounded-lg p-3 text-sm ${ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
            <Ikon className="mt-0.5 h-4 w-4 shrink-0" /> {pesan.teks}
        </div>
    );
}

export default function Settings() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [aksen, setAksen] = useState(getAccent());
    const [pw, setPw] = useState({ current_password: '', new_password: '', konfirmasi: '' });
    const [pesanPw, setPesanPw] = useState({ tipe: '', teks: '' });
    const [busyPw, setBusyPw] = useState(false);

    const [dialog, setDialog] = useState(false);
    const [pwHapus, setPwHapus] = useState('');
    const [errHapus, setErrHapus] = useState('');
    const [busyHapus, setBusyHapus] = useState(false);

    const simpanPassword = async (e) => {
        e.preventDefault();
        setPesanPw({ tipe: '', teks: '' });
        if (pw.new_password !== pw.konfirmasi) {
            return setPesanPw({ tipe: 'err', teks: 'Konfirmasi password baru tidak sama' });
        }
        setBusyPw(true);
        try {
            await api.put('/users/me/password', {
                current_password: pw.current_password,
                new_password: pw.new_password,
            });
            setPw({ current_password: '', new_password: '', konfirmasi: '' });
            setPesanPw({ tipe: 'ok', teks: 'Password berhasil diubah' });
        } catch (err) {
            setPesanPw({ tipe: 'err', teks: err.response?.data?.message || 'Gagal mengubah password' });
        } finally {
            setBusyPw(false);
        }
    };

    const tutupDialog = () => {
        if (busyHapus) return;
        setDialog(false);
        setPwHapus('');
        setErrHapus('');
    };

    const hapusAkun = async () => {
        setErrHapus('');
        setBusyHapus(true);
        try {
            await api.delete('/users/me', { data: { password: pwHapus } });
            logout();
            navigate('/');
        } catch (err) {
            setErrHapus(err.response?.data?.message || 'Gagal menghapus akun');
            setBusyHapus(false);
        }
    };

    const kartu = 'rounded-2xl border border-slate-200 bg-white p-6';

    return (
        <div className="fade-up mx-auto max-w-xl">
            <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">Pengaturan</h1>
            <p className="mt-2 text-slate-500">Keamanan dan pengelolaan akun Anda.</p>
            <section className={`${kartu} mt-8`}>
                <h2 className="font-bold text-navy">Tampilan</h2>
                <p className="mt-1 text-sm text-slate-500">Pilih warna aksen aplikasi. Pilihan tersimpan di browser ini.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                    {ACCENTS.map((a) => {
                        const aktif = aksen === a.key;
                        return (
                            <button
                                key={a.key}
                                type="button"
                                onClick={() => { setAccent(a.key); setAksen(a.key); }}
                                aria-pressed={aktif}
                                className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition ${
                                    aktif ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                            >
                <span className="flex h-5 w-5 items-center justify-center rounded-full text-white" style={{ background: a.warna }}>
                  {aktif && <Check className="h-3 w-3" />}
                </span>
                                {a.label}
                            </button>
                        );
                    })}
                </div>
            </section>

            <form onSubmit={simpanPassword} className={`${kartu} mt-8 space-y-4`}>
                <h2 className="font-bold text-navy">Ganti password</h2>
                <Pesan pesan={pesanPw} />
                <div>
                    <label className={labelCls}>Password saat ini</label>
                    <input type="password" required value={pw.current_password}
                           onChange={(e) => setPw({ ...pw, current_password: e.target.value })} className={inputCls} />
                </div>
                <div>
                    <label className={labelCls}>Password baru</label>
                    <input type="password" required value={pw.new_password}
                           onChange={(e) => setPw({ ...pw, new_password: e.target.value })}
                           placeholder="Minimal 6 karakter" className={inputCls} />
                </div>
                <div>
                    <label className={labelCls}>Ulangi password baru</label>
                    <input type="password" required value={pw.konfirmasi}
                           onChange={(e) => setPw({ ...pw, konfirmasi: e.target.value })} className={inputCls} />
                </div>
                <Button loading={busyPw} variant="dark">Ubah password</Button>
            </form>

            <section className="mt-6 rounded-2xl border border-red-200 bg-red-50/40 p-6">
                <h2 className="font-bold text-red-700">Zona berbahaya</h2>
                <p className="mt-2 text-sm text-slate-600">
                    Menghapus akun akan menghapus permanen seluruh portofolio, hasil reviu, roadmap, dan feedback Anda.
                    Tindakan ini tidak bisa dibatalkan.
                </p>
                <div className="mt-4">
                    <Button variant="danger" onClick={() => setDialog(true)}>
                        <Trash2 className="h-4 w-4" /> Hapus akun saya
                    </Button>
                </div>
            </section>

            {dialog && (
                <ConfirmDialog
                    title="Hapus akun secara permanen?"
                    confirmLabel="Ya, hapus akun"
                    loading={busyHapus}
                    disabled={!pwHapus}
                    onConfirm={hapusAkun}
                    onCancel={tutupDialog}
                >
                    <p>Masukkan password Anda untuk mengonfirmasi. Semua data akan terhapus dan tidak bisa dipulihkan.</p>
                    <input type="password" value={pwHapus} onChange={(e) => setPwHapus(e.target.value)}
                           placeholder="Password Anda" className={inputCls} autoFocus />
                    {errHapus && <p className="mt-2 text-sm text-red-600">{errHapus}</p>}
                </ConfirmDialog>
            )}
        </div>
    );
}