import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import type { FastifyInstance } from 'fastify';
import { appRouter } from '../trpc/routers/_app.js';
import { createContext } from '../trpc/context.js';

export async function registerTrpc(app: FastifyInstance, opts: { prefix: string }): Promise<void> {
  await app.register(fastifyTRPCPlugin, {
    prefix: opts.prefix,
    useWSS: true,
    trpcOptions: {
      router: appRouter,
      createContext,
      onError({ path, error }: { path?: string; error: Error }) {
        app.log.error({ path, message: error.message }, 'tRPC error');
      },
    },
  });
}
