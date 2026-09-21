const ROLE_PERMISSIONS: Record<string, string[]> = {
  owner: ['*'],
  admin: ['device:*', 'workflow:*', 'integration:*', 'agent:*', 'billing:*', 'mcp:*'],
  operator: ['device:read', 'device:write', 'workflow:execute', 'mcp:invoke'],
  developer: ['device:read', 'workflow:write', 'mcp:invoke'],
  viewer: ['device:read', 'workflow:read'],
};

export function hasPermission(role: string, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role] ?? [];
  if (perms.includes('*')) return true;
  for (const p of perms) {
    if (p === permission) return true;
    if (p.endsWith(':*') && permission.startsWith(p.slice(0, -2) + ':')) return true;
  }
  return false;
}
