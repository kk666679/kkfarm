import { useMemo } from 'react';
import { useAuthStore } from '@/store/auth.store';

interface RolePermissions {
  [role: string]: string[];
}

const rolePermissions: RolePermissions = {
  admin: ['*'],
  operator: [
    'devices:read',
    'devices:write',
    'devices:delete',
    'sessions:read',
    'sessions:write',
    'workflows:read',
    'workflows:write',
    'tasks:read',
    'tasks:write',
  ],
  viewer: ['devices:read', 'sessions:read', 'workflows:read', 'tasks:read'],
};

export interface UsePermissionsReturn {
  hasPermission: (permission: string) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  userRoles: string[];
}

export function usePermissions(options?: { userRoles?: string[] }): UsePermissionsReturn {
  const userRoles = options?.userRoles;
  const authUserRole = useAuthStore(state => state.user?.role);

  const roles = useMemo(() => {
    if (userRoles) return userRoles;
    if (authUserRole) return [authUserRole];
    const stored = localStorage.getItem('user_roles');
    return stored ? stored.split(',') : ['viewer'];
  }, [userRoles, authUserRole]);

  const hasPermission = useMemo(
    () => (permission: string) => {
      return roles.some(role => {
        const perms = rolePermissions[role] || [];
        return perms.includes('*') || perms.includes(permission);
      });
    },
    [roles]
  );

  const hasAllPermissions = useMemo(
    () => (permissions: string[]) => {
      return permissions.every(hasPermission);
    },
    [hasPermission]
  );

  const hasAnyPermission = useMemo(
    () => (permissions: string[]) => {
      return permissions.some(hasPermission);
    },
    [hasPermission]
  );

  return {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    userRoles: roles,
  };
}