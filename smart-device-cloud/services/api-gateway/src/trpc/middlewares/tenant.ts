import { middleware } from '../trpc.js';

export const resolveTenantMiddleware = middleware(({ ctx, next }) => {
  if (!ctx.user) throw new Error('No user context');
  return next({ ctx: { ...ctx, tenantId: ctx.user.tenantId } });
});
