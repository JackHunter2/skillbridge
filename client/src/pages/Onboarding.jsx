import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Onboarding() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [selected, setSelected] = useState(user.target_role_id || null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        api.get('/roles')
            .then((res) => setRoles(res.data.roles))
            .catch(() => setError('Gagal memuat daftar peran'));
    }, []);

    const simpan = async () => {
        setError('');
        setBusy(true);
        try {
            const res = await api.put('/users/me/target-role', { role_id: selected });
            updateUser(res.data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan peran');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div>
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold text-slate-900">Pilih peran target Anda</h1>
                <p className="text-slate-500 mt-1">
                    Portofolio Anda akan dinilai sesuai kebutuhan peran ini.
                </p>

                {error && <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {roles.map((r) => (
                        <button
                            key={r.role_id}
                            onClick={() => setSelected(r.role_id)}
                            className={`text-left rounded-2xl bg-white p-5 shadow border-2 transition ${
                                selected === r.role_id ? 'border-blue-600' : 'border-transparent hover:border-slate-300'
                            }`}
                        >
                            <p className="font-semibold text-slate-900">{r.role_name}</p>
                            <p className="text-sm text-slate-500 mt-1">{r.description}</p>
                            <p className="text-xs text-slate-400 mt-3">{r.total_skills} skill dinilai</p>
                        </button>
                    ))}
                </div>

                <button
                    onClick={simpan}
                    disabled={!selected || busy}
                    className="mt-6 rounded-lg bg-blue-600 text-white font-medium px-6 py-2 hover:bg-blue-700 disabled:opacity-50"
                >
                    {busy ? 'Menyimpan...' : 'Simpan & lanjut'}
                </button>
            </div>
        </div>
    );
}