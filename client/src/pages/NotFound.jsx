import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center p-6 text-center">
            <div className="fade-up">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Compass className="h-8 w-8" />
        </span>
                <p className="mt-6 text-6xl font-extrabold text-navy">404</p>
                <p className="mt-2 text-lg font-semibold text-slate-800">Halaman tidak ditemukan</p>
                <p className="mt-1 text-slate-500">Alamat yang Anda tuju tidak ada atau sudah dipindahkan.</p>
                <div className="mt-6"><Button as={Link} to="/">Kembali ke beranda</Button></div>
            </div>
        </div>
    );
}