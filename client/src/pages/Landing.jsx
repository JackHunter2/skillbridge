import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardCheck, Compass, Gauge, Sparkles, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Brand from '../components/layout/Brand';
import Button from '../components/ui/Button';
import { APP_NAME } from '../config';

const masalah = [
    ['Bingung skill apa yang dicari industri', 'Banyak kursus tersedia, tapi tidak jelas mana yang benar-benar dibutuhkan.'],
    ['Portofolio tidak pernah dinilai', 'Tanpa review, sulit tahu kualitas dan kekurangannya sebelum melamar.'],
    ['Mentor terbatas dan mahal', 'Akses ke reviewer sering bergantung koneksi atau biaya.'],
];

const langkah = [
    ['Pilih posisi yang dibutuhkan', 'Data Analyst, UI/UX, Digital Marketing, atau Web Developer.'],
    ['Unggah portofolio', 'Cukup file PDF atau tempel isi portofolio dari link kamu.'],
    ['Terima hasilnya', 'Skor, saran perbaikan, skill gap, dan roadmap belajar.'],
];

const fitur = [
    [Gauge, 'Skor per aspek', 'Kejelasan, bukti dampak, relevansi, dan tampilan dinilai terpisah.'],
    [ClipboardCheck, 'Saran before/after', 'Setiap saran dilengkapi contoh kalimat sebelum dan sesudah diperbaiki.'],
    [Target, 'Skill gap', 'Bandingkan kemampuan kamu dengan kebutuhan posisi yang dibutuhkan.'],
    [Compass, 'Roadmap 30 hari', 'Langkah belajar mingguan yang fokus pada gap terbesar.'],
];

function ContohHasil() {
    const bar = [
        ['Kejelasan', 80, 'bg-emerald-500'],
        ['Bukti dampak', 48, 'bg-amber-500'],
        ['Relevansi', 85, 'bg-emerald-500'],
        ['Tampilan', 70, 'bg-emerald-500'],
    ];
    return (
        <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-brand-100/70 blur-2xl" />
            <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                <div className="flex items-center gap-5">
                    <div className="relative h-20 w-20 shrink-0">
                        <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
                            <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                            <circle cx="40" cy="40" r="34" fill="none" stroke="#12a37f" strokeWidth="8"
                                    strokeLinecap="round" strokeDasharray="166.6 213.6" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xl font-extrabold text-navy">78</span>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-400">Contoh ilustrasi hasil review</p>
                        <p className="font-bold text-navy">CV Data Analyst</p>
                        <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              Kuat
            </span>
                    </div>
                </div>

                <div className="mt-6 space-y-3">
                    {bar.map(([nama, nilai, warna]) => (
                        <div key={nama}>
                            <div className="flex justify-between text-xs">
                                <span className="font-medium text-slate-700">{nama}</span>
                                <span className="text-slate-500">{nilai}</span>
                            </div>
                            <div className="mt-1 h-2 rounded-full bg-slate-100">
                                <div className={`h-2 rounded-full ${warna}`} style={{ width: `${nilai}%` }} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-5 rounded-lg bg-brand-50 p-3 text-sm">
                    <p className="font-semibold text-brand-700">Saran prioritas tinggi</p>
                    <p className="mt-0.5 text-slate-700">Tambahkan angka hasil di setiap proyek agar dampaknya terlihat.</p>
                </div>
            </div>
        </div>
    );
}

export default function Landing() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-white">
            <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                <Brand />
                <div className="flex items-center gap-2">
                    {user ? (
                        <Button as={Link} to="/dashboard" size="sm">Buka dashboard</Button>
                    ) : (
                        <>
                            <Button as={Link} to="/login" variant="ghost" size="sm">Masuk</Button>
                            <Button as={Link} to="/register" size="sm">Daftar gratis</Button>
                        </>
                    )}
                </div>
            </header>

            <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-2 lg:pt-16">
                <div className="fade-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <Sparkles className="h-3.5 w-3.5" /> Review portofolio berbasis AI
          </span>
                    <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-navy sm:text-5xl">
                        Tahu persis apa yang kurang dari portofolio kamu.
                    </h1>
                    <p className="mt-5 max-w-lg text-lg text-slate-600">
                        Unggah CV atau portofolio, lalu dapatkan skor, saran yang spesifik, dan roadmap belajar
                        30 hari menuju posisi impian kamu.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Button as={Link} to={user ? '/dashboard' : '/register'} size="lg">
                            Mulai sekarang <ArrowRight className="h-4 w-4" />
                        </Button>
                        {!user && <Button as={Link} to="/login" variant="secondary" size="lg">Saya sudah punya akun</Button>}
                    </div>
                    <p className="mt-4 text-sm text-slate-500">Untuk fresh graduate dan anak magang.</p>
                </div>
                <div className="fade-up"><ContohHasil /></div>
            </section>

            <section className="bg-navy py-20 text-white">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <h2 className="text-3xl font-extrabold">Masalah yang ingin kami selesaikan</h2>
                    <p className="mt-2 max-w-2xl text-slate-300">
                        Mereka bukan kurang belajar, tetapi kurang arah dan kurang feedback.
                    </p>
                    <div className="mt-10 grid gap-5 md:grid-cols-3">
                        {masalah.map(([judul, isi], i) => (
                            <div key={judul} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                                <span className="text-sm font-bold text-accent-500">0{i + 1}</span>
                                <h3 className="mt-2 font-semibold">{judul}</h3>
                                <p className="mt-2 text-sm text-slate-300">{isi}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
                <h2 className="text-3xl font-extrabold text-navy">Cara kerjanya</h2>
                <div className="mt-10 grid gap-6 md:grid-cols-3">
                    {langkah.map(([judul, isi], i) => (
                        <div key={judul} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 font-bold text-white">
                {i + 1}
              </span>
                            <div>
                                <h3 className="font-semibold text-navy">{judul}</h3>
                                <p className="mt-1 text-sm text-slate-600">{isi}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-slate-50 py-20">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <h2 className="text-3xl font-extrabold text-navy">Yang kamu dapatkan</h2>
                    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {fitur.map(([Ikon, judul, isi]) => (
                            <div key={judul} className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Ikon className="h-5 w-5" />
                </span>
                                <h3 className="mt-4 font-semibold text-navy">{judul}</h3>
                                <p className="mt-2 text-sm text-slate-600">{isi}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
                <div className="rounded-3xl bg-navy px-8 py-14 text-center text-white">
                    <h2 className="text-3xl font-extrabold">Siap melihat portofolio kamu dari sudut pandang rekruter?</h2>
                    <div className="mt-8">
                        <Button as={Link} to={user ? '/dashboard' : '/register'} size="lg">
                            Coba sekarang <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </section>

            <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
                {APP_NAME} • Dikembangkan oleh Abdul Rachman Ibrahim
            </footer>
        </div>
    );
}
