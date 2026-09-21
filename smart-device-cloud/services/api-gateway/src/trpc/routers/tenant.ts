/**
 * tenant — INTERNAL tRPC router.
 *
 * Used for trusted service-to-service communication (e.g. billing → gateway,
 * admin dashboard → gateway). Not exposed to external consumers.
 *
 * External consumers use REST: GET /api/v1/tenants/current
 */
import { z } from 'zod';
import { router, protectedProcedure, hasPermission } from '../trpc.js';

export const tenantRouter = router({
  current: protectedProcedure.query(({ ctx }) => ({
    tenantId: ctx.user!.tenantId,
    role: ctx.user!.role,
  })),

  byId: protectedProcedure
    .use(hasPermission('admin'))
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.adapters.internal.request(`/tenants/${input.id}`, {
        requestId: ctx.requestId,
      });
    }),

  updateLimits: protectedProcedure
    .use(hasPermission('admin'))
    .input(
      z.object({
        tenantId: z.string(),
        deviceLimit: z.number().int().positive().optional(),
        apiRateLimit: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      ctx.log.info('Tenant limits update', { tenantId: input.tenantId });
      return ctx.adapters.internal.request(`/tenants/${input.tenantId}/limits`, {
        method: 'PATCH',
        body: { deviceLimit: input.deviceLimit, apiRateLimit: input.apiRateLimit },
        requestId: ctx.requestId,
      });
    }),
});
