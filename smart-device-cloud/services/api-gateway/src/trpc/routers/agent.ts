/**
 * agent — INTERNAL tRPC router.
 *
 * Used exclusively for device-agent ↔ gateway service-to-service communication.
 * Never exposed to external consumers.
 */
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc.js';

export const agentRouter = router({
  heartbeat: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        deviceIds: z.array(z.string()),
        status: z.enum(['healthy', 'degraded', 'offline']),
        metrics: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      ctx.log.info('Agent heartbeat', { agentId: input.agentId, status: input.status });
      return ctx.adapters.deviceAgent.request('/agents/heartbeat', {
        method: 'POST',
        body: input,
        requestId: ctx.requestId,
      });
    }),

  register: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        version: z.string(),
        capabilities: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      ctx.log.info('Agent registration', { agentId: input.agentId });
      return ctx.adapters.deviceAgent.request('/agents/register', {
        method: 'POST',
        body: input,
        requestId: ctx.requestId,
      });
    }),
});
