import { initTRPC, TRPCError, type inferRouterOutputs } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

const deviceRouter = t.router({
  list: t.procedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      return { devices: [], total: 0 };
    }),
  get: t.procedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return { device: null };
  }),
});

const workloadRouter = t.router({
  list: t.procedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      return { workloads: [], total: 0 };
    }),
  get: t.procedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return { workload: null };
  }),
});

const metricsRouter = t.router({
  fleet: t.procedure.query(async () => {
    return {
      totalDevices: 0,
      activeDevices: 0,
      totalWorkloads: 0,
      runningWorkloads: 0,
    };
  }),
  utilization: t.procedure
    .input(z.object({ period: z.enum(['1h', '24h', '7d', '30d']).default('24h') }))
    .query(async ({ input }) => {
      return { points: [] };
    }),
});

const activityRouter = t.router({
  recent: t.procedure
    .input(z.object({ limit: z.number().min(1).max(100).default(20) }))
    .query(async ({ input }) => {
      return { items: [] };
    }),
});

const partnerRouter = t.router({
  list: t.procedure
    .input(z.object({ limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ input }) => {
      return { partners: [] };
    }),
});

export const appRouter = t.router({
  device: deviceRouter,
  workload: workloadRouter,
  metrics: metricsRouter,
  activity: activityRouter,
  partner: partnerRouter,
});

export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
