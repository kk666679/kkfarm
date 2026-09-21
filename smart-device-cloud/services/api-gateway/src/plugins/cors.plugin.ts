import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import type { FastifyPluginAsync } from 'fastify';
import type { GatewayConfig } from '../config.js';

const plugin: FastifyPluginAsync<GatewayConfig> = async (app, config) => {
  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin || config.corsOrigins.includes(origin)) {
        return cb(null, true);
      }
      cb(new Error(`Origin ${origin} not allowed`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Tenant-ID'],
    exposedHeaders: ['X-Request-ID', 'api-version', 'api-supported-versions'],
    maxAge: 86400,
  });
};

export default fp(plugin, { name: 'cors-plugin' });
