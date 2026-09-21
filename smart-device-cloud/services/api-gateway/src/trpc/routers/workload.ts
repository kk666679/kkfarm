/**
 * workload — INTERNAL tRPC router.
 *
 * Used for trusted service-to-service communication.
 * External consumers use REST: GET /api/v1/workloads, POST /api/v1/workloads/:id/start
 */
import { z } from 'zod';
import { router, protectedProcedure, hasPermission } from '../trpc.js';

export const workloadRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      return ctx.adapters.workload.request('/workloads', {
        query: {
          ...(input.status && { status: input.status }),
          limit: String(input.limit),
        },
        requestId: ctx.requestId,
      });
    }),

  byId: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
    return ctx.adapters.workload.request(`/workloads/${input.id}`, {
      requestId: ctx.requestId,
    });
  }),

  start: protectedProcedure
    .use(hasPermission('workload:write'))
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      ctx.log.info('Workload start requested', { workloadId: input.id });
      return ctx.adapters.workload.request(`/workloads/${input.id}/start`, {
        method: 'POST',
        requestId: ctx.requestId,
      });
    }),

  stop: protectedProcedure
    .use(hasPermission('workload:write'))
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      ctx.log.info('Workload stop requested', { workloadId: input.id });
      return ctx.adapters.workload.request(`/workloads/${input.id}/stop`, {
        method: 'POST',
        requestId: ctx.requestId,
      });
    }),
});
