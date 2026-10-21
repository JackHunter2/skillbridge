import { useEffect, useState } from 'react';
import axios from 'axios';

export default function App() {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get('/api/health')
            .then((res) => setData(res.data))
            .catch((err) => setError(err.message));
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full">
                <h1 className="text-2xl font-bold text-slate-900">Platform Upskilling AI</h1>
                <p className="text-slate-500 mt-1">Tes koneksi frontend ke backend</p>

                <div className="mt-6 rounded-xl bg-slate-100 p-4 text-sm">
                    {error && <p className="text-red-600">Gagal: {error}</p>}
                    {!data && !error && <p>Memuat...</p>}
                    {data && (
                        <p className="text-emerald-700 font-medium">
                            Status: {data.status} | Database: {data.database} | Peran: {data.target_roles}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}