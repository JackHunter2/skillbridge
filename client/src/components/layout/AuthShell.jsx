import { Check } from 'lucide-react';
import Brand from './Brand';

const poin = [
    'Skor portofolio per aspek dalam hitungan detik',
    'Saran perbaikan lengkap dengan contoh before/after',
    'Skill gap dan roadmap belajar 30 hari sesuai peran target',
];

export default function AuthShell({ title, subtitle, children, footer }) {
    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            <aside className="relative hidden overflow-hidden bg-navy p-12 text-white lg:flex lg:flex-col lg:justify-between">
                <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />
                <div className="relative"><Brand dark /></div>
                <div className="relative">
                    <h2 className="text-3xl font-extrabold leading-tight">
                        Ubah portofolio biasa menjadi yang dilirik rekruter.
                    </h2>
                    <ul className="mt-8 space-y-4">
                        {poin.map((p) => (
                            <li key={p} className="flex gap-3 text-slate-200">
                                <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent-500" />
                                {p}
                            </li>
                        ))}
                    </ul>
                </div>
                <p className="relative text-sm text-slate-400">Untuk fresh graduate & anak magang.</p>
            </aside>

            <section className="flex items-center justify-center p-6">
                <div className="fade-up w-full max-w-sm">
                    <div className="mb-8 lg:hidden"><Brand /></div>
                    <h1 className="text-2xl font-bold text-navy">{title}</h1>
                    <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                    <div className="mt-8">{children}</div>
                    <p className="mt-6 text-center text-sm text-slate-600">{footer}</p>
                </div>
            </section>
        </div>
    );
}