import { run, get, all } from '../db/database.ts';
import type { UserRole } from '@smart-device-cloud/shared';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  permissions?: string[];
}

export interface UpdateUserInput {
  name?: string;
  role?: UserRole;
  permissions?: string[];
  isActive?: boolean;
}

export class AdminService {
  async listUsers(filters?: {
    role?: UserRole;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ users: AdminUser[]; total: number }> {
    const where: string[] = [];
    const params: unknown[] = [];

    if (filters?.role) {
      where.push(`role = $${params.length + 1}`);
      params.push(filters.role);
    }
    if (filters?.isActive !== undefined) {
      where.push(`is_active = $${params.length + 1}`);
      params.push(filters.isActive);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;

    const users = await all<any>(
      `SELECT id, email, name, role, permissions, is_active, last_login_at, created_at, updated_at FROM users ${whereClause} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    const totalRow = await all<{ count: string }>(
      `SELECT COUNT(*) as count FROM users ${whereClause}`,
      params
    );
    const total = parseInt(totalRow[0]?.count || '0', 10);

    return {
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        permissions: JSON.parse(u.permissions || '[]'),
        isActive: u.is_active,
        lastLoginAt: u.last_login_at,
        createdAt: u.created_at,
        updatedAt: u.updated_at,
      })),
      total,
    };
  }

  async getUser(id: string): Promise<AdminUser | null> {
    const row = await get<any>(
      'SELECT id, email, name, role, permissions, is_active, last_login_at, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    if (!row) return null;

    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      permissions: JSON.parse(row.permissions || '[]'),
      isActive: row.is_active,
      lastLoginAt: row.last_login_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async createUser(input: CreateUserInput): Promise<AdminUser> {
    const id = randomUUID();
    const passwordHash = await bcrypt.hash(input.password, 10);
    const now = new Date().toISOString();

    await run(
      `INSERT INTO users (id, email, name, password_hash, role, permissions, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        input.email,
        input.name,
        passwordHash,
        input.role,
        JSON.stringify(input.permissions || []),
        true,
        now,
        now,
      ]
    );

    return {
      id,
      email: input.email,
      name: input.name,
      role: input.role,
      permissions: input.permissions || [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<AdminUser | null> {
    const existing = await this.getUser(id);
    if (!existing) return null;

    const updates: string[] = [];
    const params: unknown[] = [];

    if (input.name !== undefined) {
      updates.push(`name = $${params.length + 1}`);
      params.push(input.name);
    }
    if (input.role !== undefined) {
      updates.push(`role = $${params.length + 1}`);
      params.push(input.role);
    }
    if (input.permissions !== undefined) {
      updates.push(`permissions = $${params.length + 1}`);
      params.push(JSON.stringify(input.permissions));
    }
    if (input.isActive !== undefined) {
      updates.push(`is_active = $${params.length + 1}`);
      params.push(input.isActive);
    }

    if (updates.length === 0) {
      return existing;
    }

    updates.push(`updated_at = $${params.length + 1}`);
    params.push(new Date().toISOString());
    params.push(id);

    await run(`UPDATE users SET ${updates.join(', ')} WHERE id = $${params.length}`, params);

    return this.getUser(id);
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await run('DELETE FROM users WHERE id = $1', [id]);
    return true;
  }

  async getRoles(): Promise<{ role: UserRole; permissions: string[]; description: string }[]> {
    return [
      {
        role: 'owner',
        permissions: ['All permissions'],
        description: 'Full platform access including billing and user management',
      },
      {
        role: 'administrator',
        permissions: [
          'devices:read',
          'devices:write',
          'devices:delete',
          'workloads:read',
          'workloads:write',
          'workloads:delete',
          'analytics:read',
          'alerts:read',
          'alerts:write',
          'applications:read',
          'applications:write',
          'workflows:read',
          'workflows:write',
          'audit:read',
          'security:read',
          'cost:read',
          'settings:manage',
        ],
        description:
          'Device and workload management, configuration, but no billing or user management',
      },
      {
        role: 'operator',
        permissions: [
          'devices:read',
          'devices:write',
          'workloads:read',
          'workloads:write',
          'analytics:read',
          'alerts:read',
          'alerts:write',
          'applications:read',
          'workflows:read',
          'audit:read',
          'security:read',
          'cost:read',
        ],
        description:
          'View devices, start/stop workloads, view logs, but cannot modify configuration',
      },
      {
        role: 'developer',
        permissions: [
          'devices:read',
          'workloads:read',
          'analytics:read',
          'alerts:read',
          'applications:read',
          'applications:write',
          'workflows:read',
          'security:read',
        ],
        description:
          'View devices, deploy applications, view logs, but cannot control infrastructure',
      },
      {
        role: 'viewer',
        permissions: [
          'devices:read',
          'workloads:read',
          'analytics:read',
          'alerts:read',
          'applications:read',
          'workflows:read',
          'security:read',
          'cost:read',
          'audit:read',
        ],
        description: 'Read-only access to dashboards and reports',
      },
    ];
  }
}

export const adminService = new AdminService();
