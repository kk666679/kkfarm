import Fastify, { type FastifyInstance } from 'fastify';
import { registerPlugins } from './gateway/register-plugins.js';
import { registerAdapters } from './gateway/register-adapters.js';
import { registerRoutes } from './gateway/register-routes.js';
import { registerTrpc } from './gateway/register-trpc.js';
import { registerMcp } from './gateway/register-mcp.js';
import { registerHealth } from './gateway/register-health.js';
import type { GatewayConfig } from './config.js';

export async function buildGateway(config: GatewayConfig): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: config.logLevel,
      serializers: {
        req: req => ({ id: req.id, method: req.method, url: req.url }),
        res: res => ({ statusCode: res.statusCode }),
      },
    },
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
    disableRequestLogging: false,
    trustProxy: true,
    bodyLimit: config.bodyLimit,
    maxParamLength: 5000,
  });

  await registerPlugins(app, config);
  const adapters = await registerAdapters(config);
  app.decorate('adapters', adapters);
  app.decorate('gatewayConfig', config);

  await registerHealth(app);
  await registerRoutes(app, { prefix: '/api/v1' });
  await registerTrpc(app, { prefix: '/trpc' });
  await registerMcp(app, { prefix: '/mcp' });

  return app;
}
