import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { appRouter } from './router.ts';
import { createContext } from './context.ts';
import { authenticateRequest } from '../middleware/auth.middleware.ts';

export interface TRPCPluginOptions {
  prefix?: string;
  db?: unknown;
  timescale?: unknown;
  redis?: unknown;
  environment?: 'development' | 'production';
}

export const trpcPlugin: FastifyPluginAsync<TRPCPluginOptions> = async (fastify, options) => {
  fastify.log.info(`Registering tRPC plugin at ${options.prefix || '/trpc'}`);
};

export async function registerTRPCPlugin(fastify: any, options?: TRPCPluginOptions) {
  const prefix = options?.prefix || '/trpc';

  await fastify.register(fastifyTRPCPlugin, {
    prefix,
    trpcOptions: {
      router: appRouter,
      createContext: async ({ req }: { req: FastifyRequest }) =>
        createContext({
          request: req,
          db: options?.db,
          timescale: options?.timescale,
          redis: options?.redis,
          deviceManager: (fastify as any).deviceManager,
        }),
    },
  });

  // Internal auth middleware for tRPC — health procedures are public,
  // all other procedures require a valid authenticated session.
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: any) => {
    const url = (request as any).url || '';
    if (!url.startsWith(prefix)) return;
    if (request.method === 'OPTIONS') return;

    const path = url.replace(prefix, '').split('?')[0];
    if (path === '/health.ping' || path === '/health.ready' || path === '/health.info') {
      return;
    }

    const user = await authenticateRequest(request, reply);
    if (user) {
      (request as any).user = user;
    }
  });

  fastify.log.info(`tRPC plugin registered successfully at ${prefix}`);
}
