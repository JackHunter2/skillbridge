import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, CheckCircle2, Info, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { inputCls, labelCls } from '../components/ui/styles';
import { getTeks } from '../utils/userType';

const tipe = [
    ['fresh_graduate', 'Fresh graduate'],
    ['anak_magang', 'Anak magang'],
];
const TIPE_GAMBAR = ['image/jpeg', 'image/png', 'image/webp'];

// Potong menjadi persegi dari tengah dan kecilkan, sehingga unggahan ringan
function potongKotak(file, sisi = 320) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const s = Math.min(img.width, img.height);
            const c = document.createElement('canvas');
            c.width = sisi;
            c.height = sisi;
            const ctx = c.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, sisi, sisi);
            ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, sisi, sisi);
            URL.revokeObjectURL(url);
            c.toBlob((b) => (b ? resolve(b) : reject(new Error('Gagal memproses gambar'))), 'image/jpeg', 0.9);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('File bukan gambar yang valid'));
        };
        img.src = url;
    });
}

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
    const inputFile = useRef(null);
    const [profil, setProfil] = useState({ full_name: user.full_name, user_type: user.user_type });
    const [pesanFoto, setPesanFoto] = useState({ tipe: '', teks: '' });
    const [pesanProfil, setPesanProfil] = useState({ tipe: '', teks: '' });
    const [busyFoto, setBusyFoto] = useState(false);
    const [busyProfil, setBusyProfil] = useState(false);

    const pilihFoto = async (e) => {
        const file = e.target.files[0];
        e.target.value = '';
        if (!file) return;
        setPesanFoto({ tipe: '', teks: '' });

        if (!TIPE_GAMBAR.includes(file.type)) {
            return setPesanFoto({ tipe: 'err', teks: 'Gunakan gambar JPG, PNG, atau WEBP' });
        }
        if (file.size > 10 * 1024 * 1024) {
            return setPesanFoto({ tipe: 'err', teks: 'Ukuran gambar maksimal 10 MB' });
        }

        setBusyFoto(true);
        try {
            const blob = await potongKotak(file);
            const body = new FormData();
            body.append('avatar', blob, 'avatar.jpg');
            const res = await api.post('/users/me/avatar', body);
            updateUser(res.data.user);
            setPesanFoto({ tipe: 'ok', teks: 'Foto profil diperbarui' });
        } catch (err) {
            setPesanFoto({ tipe: 'err', teks: err.response?.data?.message || err.message || 'Gagal mengunggah foto' });
        } finally {
            setBusyFoto(false);
        }
    };

    const hapusFoto = async () => {
        setPesanFoto({ tipe: '', teks: '' });
        setBusyFoto(true);
        try {
            const res = await api.delete('/users/me/avatar');
            updateUser(res.data.user);
            setPesanFoto({ tipe: 'ok', teks: 'Foto profil dihapus' });
        } catch (err) {
            setPesanFoto({ tipe: 'err', teks: err.response?.data?.message || 'Gagal menghapus foto' });
        } finally {
            setBusyFoto(false);
        }
    };

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

    const kartu = 'rounded-2xl border border-slate-200 bg-white p-6';

    return (
        <div className="fade-up mx-auto max-w-xl">
            <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">Profil</h1>
            <p className="mt-2 text-slate-500">Atur foto dan data diri Anda.</p>

            <section className={`${kartu} mt-8`}>
                <h2 className="font-bold text-navy">Foto profil</h2>
                <div className="mt-4 flex flex-wrap items-center gap-5">
                    <Avatar user={user} size="lg" />
                    <div>
                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" onClick={() => inputFile.current.click()} loading={busyFoto}>
                                {!busyFoto && <Camera className="h-4 w-4" />} {user.avatar_path ? 'Ganti foto' : 'Unggah foto'}
                            </Button>
                            {user.avatar_path && (
                                <Button size="sm" variant="secondary" onClick={hapusFoto} disabled={busyFoto}>
                                    <Trash2 className="h-4 w-4" /> Hapus
                                </Button>
                            )}
                        </div>
                        <p className="mt-2 text-xs text-slate-500">JPG, PNG, atau WEBP. Otomatis dipotong persegi dari tengah.</p>
                    </div>
                    <input ref={inputFile} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pilihFoto} />
                </div>
                <div className="mt-4"><Pesan pesan={pesanFoto} /></div>
            </section>

            <form onSubmit={simpanProfil} className={`${kartu} mt-6 space-y-4`}>
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
        </div>
    );
}