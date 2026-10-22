import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Info } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { inputCls, labelCls } from '../components/ui/styles';
import { getTeks } from '../utils/userType';

const tipe = [
    ['fresh_graduate', 'Fresh graduate'],
    ['anak_magang', 'Anak magang'],
];

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

export default function Profile() {
    const { user, updateUser } = useAuth();
    const [profil, setProfil] = useState({ full_name: user.full_name, user_type: user.user_type });
    const [pw, setPw] = useState({ current_password: '', new_password: '', konfirmasi: '' });
    const [pesanProfil, setPesanProfil] = useState({ tipe: '', teks: '' });
    const [pesanPw, setPesanPw] = useState({ tipe: '', teks: '' });
    const [busyProfil, setBusyProfil] = useState(false);
    const [busyPw, setBusyPw] = useState(false);

    const simpanProfil = async (e) => {
        e.preventDefault();
        setPesanProfil({ tipe: '', teks: '' });
        setBusyProfil(true);
        try {
            const res = await api.put('/users/me', profil);
            updateUser(res.data.user);
            setPesanProfil({ tipe: 'ok', teks: 'Profil berhasil diperbarui' });
        } catch (err) {
            setPesanProfil({ tipe: 'err', teks: err.response?.data?.message || 'Gagal menyimpan profil' });
        } finally {
            setBusyProfil(false);
        }
    };

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

    const kartu = 'rounded-2xl border border-slate-200 bg-white p-6';

    return (
        <div className="fade-up mx-auto max-w-xl">
            <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">Profil & pengaturan</h1>
            <p className="mt-2 text-slate-500">Kelola data akun dan keamanan Anda.</p>

            <form onSubmit={simpanProfil} className={`${kartu} mt-8 space-y-4`}>
                <h2 className="font-bold text-navy">Data diri</h2>
                <Pesan pesan={pesanProfil} />
                <div>
                    <label className={labelCls}>Nama lengkap</label>
                    <input required value={profil.full_name}
                           onChange={(e) => setProfil({ ...profil, full_name: e.target.value })} className={inputCls} />
                </div>
                <div>
                    <label className={labelCls}>Email</label>
                    <input value={user.email} disabled className={`${inputCls} cursor-not-allowed bg-slate-50 text-slate-500`} />
                </div>
                <div>
                    <label className={labelCls}>Saya adalah</label>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                        {tipe.map(([nilai, label]) => (
                            <button type="button" key={nilai} onClick={() => setProfil({ ...profil, user_type: nilai })}
                                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                                        profil.user_type === nilai
                                            ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-600/20'
                                            : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                                    }`}>
                                {label}
                            </button>
                        ))}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{getTeks(profil.user_type).deskripsiDaftar}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <Button loading={busyProfil}>Simpan perubahan</Button>
                    <Link to="/onboarding" className="text-sm font-semibold text-brand-600">Ganti peran target</Link>
                </div>
            </form>

            <form onSubmit={simpanPassword} className={`${kartu} mt-6 space-y-4`}>
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
        </div>
    );
}