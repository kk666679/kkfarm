import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store'; 

export function PublicOnlyRoute() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}