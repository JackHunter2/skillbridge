import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute() {
    const { user, loading } = useAuth();

    if (loading) return <p className="p-6 text-slate-500">Memuat...</p>;
    if (!user) return <Navigate to="/login" replace />;
    return <Outlet />;
}