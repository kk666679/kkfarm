import type { GatewayConfig } from './config.js';
import type { GatewayAdapters } from './gateway/register-adapters.js';

declare module 'fastify' {
  interface FastifyInstance {
    adapters: GatewayAdapters;
    gatewayConfig: GatewayConfig;
  }
}
