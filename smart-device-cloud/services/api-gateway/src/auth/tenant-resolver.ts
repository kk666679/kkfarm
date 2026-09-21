import type { JWTPayload } from 'jose';
import type { FastifyRequest } from 'fastify';

export function resolveTenant(claims: JWTPayload, req: FastifyRequest): string {
  const headerTenant = req.headers['x-tenant-id'];
  if (typeof headerTenant === 'string') return headerTenant;
  return (claims.tenant_id as string) ?? (claims.tid as string) ?? 'default';
}
