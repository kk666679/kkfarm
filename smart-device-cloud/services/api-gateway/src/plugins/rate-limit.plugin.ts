import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';
import type { FastifyPluginAsync } from 'fastify';
import type { GatewayConfig } from '../config.js';

const plugin: FastifyPluginAsync<GatewayConfig> = async (app, config) => {
  await app.register(rateLimit, {
    global: true,
    max: config.rateLimitGlobalMax,
    timeWindow: config.rateLimitGlobalWindowMs,
    keyGenerator: req => {
      const user = (req as any).user;
      if (user?.tenantId) return `tenant:${user.tenantId}`;
      if (user?.id) return `user:${user.id}`;
      return `ip:${req.ip}`;
    },
    errorResponseBuilder: (req, ctx) => ({
      type: 'https://api.sdc.dev/errors/rate-limit',
      title: 'Too Many Requests',
      status: 429,
      detail: `Rate limit exceeded. Retry in ${ctx.after}.`,
      requestId: req.id,
    }),
  });
};

export default fp(plugin, { name: 'rate-limit-plugin' });
