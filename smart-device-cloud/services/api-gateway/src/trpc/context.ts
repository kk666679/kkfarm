import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import type { UserContext } from '../types.js';

export interface Context {
  user: UserContext | null;
  requestId: string;
  ip: string;
  userAgent: string;
  adapters: Record<string, any>;
  log: {
    info: (msg: string, meta?: Record<string, unknown>) => void;
    error: (msg: string, meta?: Record<string, unknown>) => void;
  };
  metrics: {
    increment: (name: string, tags?: Record<string, string>) => void;
  };
}

export async function createContext({ req }: CreateFastifyContextOptions): Promise<Context> {
  const fastify = req.server as any;
  return {
    user: (req as any).user ?? null,
    requestId: req.id,
    ip: req.ip,
    userAgent: req.headers['user-agent'] ?? '',
    adapters: fastify.adapters,
    log: {
      info: (msg, meta) => fastify.log.info({ ...meta, requestId: req.id }, msg),
      error: (msg, meta) => fastify.log.error({ ...meta, requestId: req.id }, msg),
    },
    metrics: {
      increment: (name, tags) => fastify.metrics?.increment?.(name, tags),
    },
  };
}
