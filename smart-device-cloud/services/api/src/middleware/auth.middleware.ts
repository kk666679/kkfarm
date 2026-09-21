import type { FastifyRequest, FastifyReply } from 'fastify';
import type { UserRole } from '@smart-device-cloud/shared';

export interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
    email: string;
    role: UserRole;
    permissions: string[];
    sessionId?: string;
    tenantId?: string;
  };
}

export const PERMISSIONS = {
  READ_DEVICES: 'devices:read',
  WRITE_DEVICES: 'devices:write',
  DELETE_DEVICES: 'devices:delete',
  READ_WORKLOADS: 'workloads:read',
  WRITE_WORKLOADS: 'workloads:write',
  DELETE_WORKLOADS: 'workloads:delete',
  READ_ANALYTICS: 'analytics:read',
  READ_ALERTS: 'alerts:read',
  WRITE_ALERTS: 'alerts:write',
  READ_APPLICATIONS: 'applications:read',
  WRITE_APPLICATIONS: 'applications:write',
  READ_WORKFLOWS: 'workflows:read',
  WRITE_WORKFLOWS: 'workflows:write',
  READ_AUDIT: 'audit:read',
  READ_SECURITY: 'security:read',
  READ_COST: 'cost:read',
  MANAGE_USERS: 'users:manage',
  MANAGE_SETTINGS: 'settings:manage',
} as const;

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: Object.values(PERMISSIONS),
  owner: Object.values(PERMISSIONS),
  administrator: [
    PERMISSIONS.READ_DEVICES,
    PERMISSIONS.WRITE_DEVICES,
    PERMISSIONS.DELETE_DEVICES,
    PERMISSIONS.READ_WORKLOADS,
    PERMISSIONS.WRITE_WORKLOADS,
    PERMISSIONS.DELETE_WORKLOADS,
    PERMISSIONS.READ_ANALYTICS,
    PERMISSIONS.READ_ALERTS,
    PERMISSIONS.WRITE_ALERTS,
    PERMISSIONS.READ_APPLICATIONS,
    PERMISSIONS.WRITE_APPLICATIONS,
    PERMISSIONS.READ_WORKFLOWS,
    PERMISSIONS.WRITE_WORKFLOWS,
    PERMISSIONS.READ_AUDIT,
    PERMISSIONS.READ_SECURITY,
    PERMISSIONS.READ_COST,
    PERMISSIONS.MANAGE_SETTINGS,
  ],
  operator: [
    PERMISSIONS.READ_DEVICES,
    PERMISSIONS.WRITE_DEVICES,
    PERMISSIONS.READ_WORKLOADS,
    PERMISSIONS.WRITE_WORKLOADS,
    PERMISSIONS.READ_ANALYTICS,
    PERMISSIONS.READ_ALERTS,
    PERMISSIONS.WRITE_ALERTS,
    PERMISSIONS.READ_APPLICATIONS,
    PERMISSIONS.READ_WORKFLOWS,
    PERMISSIONS.READ_AUDIT,
    PERMISSIONS.READ_SECURITY,
    PERMISSIONS.READ_COST,
  ],
  developer: [
    PERMISSIONS.READ_DEVICES,
    PERMISSIONS.READ_WORKLOADS,
    PERMISSIONS.READ_ANALYTICS,
    PERMISSIONS.READ_ALERTS,
    PERMISSIONS.READ_APPLICATIONS,
    PERMISSIONS.WRITE_APPLICATIONS,
    PERMISSIONS.READ_WORKFLOWS,
    PERMISSIONS.READ_SECURITY,
  ],
  viewer: [
    PERMISSIONS.READ_DEVICES,
    PERMISSIONS.READ_WORKLOADS,
    PERMISSIONS.READ_ANALYTICS,
    PERMISSIONS.READ_ALERTS,
    PERMISSIONS.READ_APPLICATIONS,
    PERMISSIONS.READ_WORKFLOWS,
    PERMISSIONS.READ_SECURITY,
    PERMISSIONS.READ_COST,
    PERMISSIONS.READ_AUDIT,
  ],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export async function authenticateRequest(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<AuthenticatedRequest['user'] | null> {
  try {
    await (request as any).jwtVerify();
    const user = (request as any).user as AuthenticatedRequest['user'];
    if (!user?.id) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export function requirePermission(permission: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = await authenticateRequest(request, reply);
    if (!user) {
      return reply.status(401).send({
        error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authentication token' },
      });
    }
    (request as any).user = user;

    if (!hasPermission(user.role, permission)) {
      return reply.status(403).send({
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions for this action' },
      });
    }
  };
}

export type { UserRole };
