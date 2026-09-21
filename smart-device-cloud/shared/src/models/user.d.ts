export type UserRole = 'admin' | 'owner' | 'administrator' | 'operator' | 'developer' | 'viewer';
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: string[];
  passwordHash?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}
//# sourceMappingURL=user.d.ts.map
