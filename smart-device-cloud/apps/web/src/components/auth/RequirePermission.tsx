import { Navigate, Outlet } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuthStore } from '@/store/auth.store';

interface RequirePermissionProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export function RequirePermission({
  permission,
  permissions = [],
  requireAll = false,
  fallback,
}: RequirePermissionProps) {
  const userRoles = useAuthStore(state => state.user?.role ? [state.user.role] : []);

  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions({
    userRoles,
  });

  let hasAccess = true;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  }

  if (!hasAccess) {
    return fallback || <Navigate to="/" replace />;
  }

  return <Outlet />;
}