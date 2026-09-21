import type { FastifyInstance } from 'fastify';
import type { GatewayConfig } from '../config.js';

import compressionPlugin from '../plugins/compression.plugin.js';
import securityHeadersPlugin from '../plugins/security-headers.plugin.js';
import requestIdPlugin from '../plugins/request-id.plugin.js';
import loggingPlugin from '../plugins/logging.plugin.js';
import tracingPlugin from '../plugins/tracing.plugin.js';
import metricsPlugin from '../plugins/metrics.plugin.js';
import corsPlugin from '../plugins/cors.plugin.js';
import rateLimitPlugin from '../plugins/rate-limit.plugin.js';
import authPlugin from '../plugins/auth.plugin.js';
import versionPlugin from '../plugins/version.plugin.js';
import errorPlugin from '../plugins/error.plugin.js';

export async function registerPlugins(app: FastifyInstance, config: GatewayConfig): Promise<void> {
  await app.register(requestIdPlugin);
  await app.register(compressionPlugin);
  await app.register(securityHeadersPlugin);
  await app.register(loggingPlugin);
  await app.register(tracingPlugin, config);
  await app.register(metricsPlugin);
  await app.register(corsPlugin, config);
  await app.register(rateLimitPlugin, config);
  await app.register(authPlugin, config);
  await app.register(versionPlugin, config);
  await app.register(errorPlugin);
}
