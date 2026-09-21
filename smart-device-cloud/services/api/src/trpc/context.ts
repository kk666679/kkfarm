import type { FastifyRequest } from 'fastify';

export interface Context {
  userId?: string;
  userSub?: string;
  tenantId?: string;
  roles: string[];
  scopes: string[];
  db?: unknown;
  timescale?: unknown;
  redis?: unknown;
  deviceManager?: unknown;
  isProduction: boolean;
  isDevelopment: boolean;
  requestId: string;
  timestamp: Date;
}

export async function createContext(opts: {
  request: FastifyRequest;
  db?: unknown;
  timescale?: unknown;
  redis?: unknown;
  deviceManager?: unknown;
}): Promise<Context> {
  const { request, db, timescale, redis, deviceManager } = opts;
  const user = (request as any).user;
  const auth = (request as any).auth;
  const userId = user?.id || auth?.sub;
  const tenantId = user?.tenant_id || auth?.tenant_id;

  return {
    userId,
    userSub: userId,
    tenantId,
    roles: user?.role ? [user.role] : auth?.roles || [],
    scopes: user?.permissions || auth?.scopes || [],
    db,
    timescale,
    redis,
    deviceManager,
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    requestId: (request as any).id || 'unknown',
    timestamp: new Date(),
  };
}
