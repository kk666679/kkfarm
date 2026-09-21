import Fastify, { type FastifyInstance } from 'fastify';
import type { GatewayConfig } from '../config.js';

export function createFastifyInstance(config: GatewayConfig): FastifyInstance {
  return Fastify({
    logger: { level: config.logLevel },
    requestIdHeader: 'x-request-id',
    trustProxy: true,
    bodyLimit: config.bodyLimit,
    maxParamLength: 5000,
  });
}
