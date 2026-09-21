/**
 * billing — INTERNAL tRPC router.
 *
 * Used for trusted service-to-service communication (e.g. admin dashboard).
 * External consumers use REST: GET /api/v1/billing/usage
 */
import { z } from 'zod';
import { router, protectedProcedure, hasPermission } from '../trpc.js';

export const billingRouter = router({
  usage: protectedProcedure
    .use(hasPermission('billing:read'))
    .input(z.object({ period: z.string().default('current') }))
    .query(async ({ input, ctx }) => {
      return ctx.adapters.billing.request('/usage', {
        query: { tenantId: ctx.user!.tenantId, period: input.period },
        requestId: ctx.requestId,
      });
    }),

  invoices: protectedProcedure
    .use(hasPermission('billing:read'))
    .input(z.object({ limit: z.number().min(1).max(24).default(12) }))
    .query(async ({ input, ctx }) => {
      return ctx.adapters.billing.request('/invoices', {
        query: { tenantId: ctx.user!.tenantId, limit: String(input.limit) },
        requestId: ctx.requestId,
      });
    }),
});
