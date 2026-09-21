/**
 * integration — INTERNAL tRPC router.
 *
 * Used for trusted service-to-service communication.
 * External consumers use REST: GET /api/v1/integrations, POST /api/v1/integrations
 */
import { z } from 'zod';
import { router, protectedProcedure, hasPermission } from '../trpc.js';

export const integrationRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.adapters.internal.request('/integrations', { requestId: ctx.requestId });
  }),

  create: protectedProcedure
    .use(hasPermission('integration:write'))
    .input(
      z.object({
        type: z.string(),
        name: z.string().min(1),
        config: z.record(z.string(), z.unknown()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      ctx.log.info('Integration create requested', { type: input.type });
      return ctx.adapters.internal.request('/integrations', {
        method: 'POST',
        body: input,
        requestId: ctx.requestId,
      });
    }),

  delete: protectedProcedure
    .use(hasPermission('integration:write'))
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.adapters.internal.request(`/integrations/${input.id}`, {
        method: 'DELETE',
        requestId: ctx.requestId,
      });
    }),
});
