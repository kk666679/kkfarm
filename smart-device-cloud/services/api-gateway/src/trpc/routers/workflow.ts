/**
 * workflow — INTERNAL tRPC router.
 *
 * Used for trusted service-to-service communication (e.g. dashboard → gateway,
 * agent → gateway). Not exposed to external consumers.
 *
 * External consumers use REST:
 *   GET  /api/v1/workflows
 *   POST /api/v1/workflows/:id/execute
 */
import { z } from 'zod';
import { router, protectedProcedure, hasPermission } from '../trpc.js';

export const workflowRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ input, ctx }) => {
      return ctx.adapters.internal.request('/workflows', {
        query: { limit: String(input.limit) },
        requestId: ctx.requestId,
      });
    }),

  byId: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
    return ctx.adapters.internal.request(`/workflows/${input.id}`, {
      requestId: ctx.requestId,
    });
  }),

  execute: protectedProcedure
    .use(hasPermission('workflow:execute'))
    .input(z.object({ id: z.string(), input: z.record(z.string(), z.unknown()).optional() }))
    .mutation(async ({ input, ctx }) => {
      ctx.log.info('Workflow execution requested', { workflowId: input.id });
      return ctx.adapters.internal.request(`/workflows/${input.id}/execute`, {
        method: 'POST',
        body: input.input ?? {},
        requestId: ctx.requestId,
      });
    }),

  status: protectedProcedure
    .input(z.object({ executionId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.adapters.internal.request(`/workflow-executions/${input.executionId}`, {
        requestId: ctx.requestId,
      });
    }),
});
