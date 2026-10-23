import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoute() {
    const { user } = useAuth();
    return user.user_type === 'admin' ? <Outlet /> : <Navigate to="/dashboard" replace />;
}