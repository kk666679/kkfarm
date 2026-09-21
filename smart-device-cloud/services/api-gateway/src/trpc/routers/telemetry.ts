/**
 * telemetry — INTERNAL tRPC router.
 *
 * Used for trusted service-to-service telemetry queries (e.g. dashboard charts).
 * External consumers use REST: GET /api/v1/telemetry/*
 */
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc.js';

export const telemetryRouter = router({
  deviceMetrics: protectedProcedure
    .input(
      z.object({
        deviceId: z.string(),
        metric: z.string(),
        from: z.string().optional(),
        to: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      return ctx.adapters.telemetry.request(`/devices/${input.deviceId}/metrics/${input.metric}`, {
        query: {
          ...(input.from && { from: input.from }),
          ...(input.to && { to: input.to }),
        },
        requestId: ctx.requestId,
      });
    }),

  fleetSummary: protectedProcedure
    .input(z.object({ tenantId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      return ctx.adapters.telemetry.request('/fleet/summary', {
        query: { tenantId: input.tenantId ?? ctx.user!.tenantId },
        requestId: ctx.requestId,
      });
    }),
});
