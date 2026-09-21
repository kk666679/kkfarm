/**
 * analytics — INTERNAL tRPC router.
 *
 * Used for trusted service-to-service communication (e.g. dashboard widgets).
 * External consumers use REST: GET /api/v1/analytics/metrics
 */
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc.js';

export const analyticsRouter = router({
  metrics: protectedProcedure
    .input(
      z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        granularity: z.enum(['minute', 'hour', 'day']).default('hour'),
      })
    )
    .query(async ({ input, ctx }) => {
      return ctx.adapters.analytics.request('/metrics/query', {
        query: {
          ...(input.from && { from: input.from }),
          ...(input.to && { to: input.to }),
          granularity: input.granularity,
        },
        requestId: ctx.requestId,
      });
    }),

  deviceUtilization: protectedProcedure
    .input(z.object({ tenantId: z.string().optional(), period: z.string().default('24h') }))
    .query(async ({ input, ctx }) => {
      return ctx.adapters.analytics.request('/metrics/device-utilization', {
        query: {
          tenantId: input.tenantId ?? ctx.user!.tenantId,
          period: input.period,
        },
        requestId: ctx.requestId,
      });
    }),
});
