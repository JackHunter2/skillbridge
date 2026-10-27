import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

const langkah = [
    'Membaca isi portofolio',
    'Menilai setiap aspek',
    'Menganalisis skill gap',
    'Menyusun roadmap belajar',
];

export default function ReviewingOverlay() {
    const [aktif, setAktif] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setAktif((v) => Math.min(v + 1, langkah.length - 1)), 3500);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4 backdrop-blur-sm">
            <div className="fade-up w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
                <h2 className="text-lg font-bold text-navy">AI sedang mereview portofolio kamu</h2>
                <p className="mt-1 text-sm text-slate-500">Mohon tunggu, jangan tutup halaman ini.</p>

                <ul className="mt-6 space-y-3">
                    {langkah.map((l, i) => (
                        <li key={l} className="flex items-center gap-3 text-sm">
                            {i < aktif ? (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-white">
                  <Check className="h-3.5 w-3.5" />
                </span>
                            ) : i === aktif ? (
                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                            ) : (
                                <span className="h-5 w-5 rounded-full border-2 border-slate-200" />
                            )}
                            <span className={i <= aktif ? 'font-medium text-slate-900' : 'text-slate-400'}>{l}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}