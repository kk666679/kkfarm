export type Permission = 'screen' | 'input' | 'install' | 'record' | 'files';
export type OAuthScope =
  'device:read' | 'device:write' | 'workflow:execute' | 'integration:manage' | 'admin:all';

export interface PermissionSet {
  userId: string;
  permissions: Permission[];
  scopes: OAuthScope[];
  expiresAt?: string;
}

export interface AuthContext {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  scopes: OAuthScope[];
  token?: string;
  authenticated: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  isolationMode: 'strict' | 'shared';
  allowedRegions: string[];
  costCeiling?: number;
  killSwitch?: boolean;
}
