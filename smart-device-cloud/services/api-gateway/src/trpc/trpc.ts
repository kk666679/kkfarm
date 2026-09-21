import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import type { Context } from './context.js';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

const loggingMiddleware = middleware(async ({ path, type, next, ctx }) => {
  const start = Date.now();
  const result = await next();
  ctx.metrics.increment('trpc.request', { path, type, status: result.ok ? 'ok' : 'error' });
  ctx.log.info(`[tRPC] ${type} ${path}`, { durationMs: Date.now() - start, ok: result.ok });
  return result;
});

export const loggedProcedure = publicProcedure.use(loggingMiddleware);

const isAuthed = middleware(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const protectedProcedure = loggedProcedure.use(isAuthed);

const ROLE_PERMISSIONS: Record<string, string[]> = {
  owner: ['*'],
  admin: ['device:*', 'workflow:*', 'integration:*', 'agent:*', 'billing:*'],
  operator: ['device:read', 'device:write', 'workflow:execute'],
  developer: ['device:read', 'workflow:write'],
  viewer: ['device:read', 'workflow:read'],
};

export const hasPermission = (permission: string) =>
  middleware(({ ctx, next }) => {
    if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
    const perms = ROLE_PERMISSIONS[ctx.user.role] ?? [];
    if (!perms.includes('*') && !perms.includes(permission)) {
      throw new TRPCError({ code: 'FORBIDDEN', message: `Missing permission: ${permission}` });
    }
    return next();
  });
