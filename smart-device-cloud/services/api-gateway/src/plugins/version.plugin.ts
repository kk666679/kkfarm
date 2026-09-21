import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import type { GatewayConfig } from '../config.js';

interface VersionPolicy {
  version: string;
  deprecatedAt?: string;
  sunsetAt?: string;
  successor?: string;
}

const POLICIES: Record<string, VersionPolicy> = {
  v1: { version: 'v1' },
};

const plugin: FastifyPluginAsync<GatewayConfig> = async (app, config) => {
  app.addHook('onRequest', async (req, reply) => {
    const match = req.url.match(/^\/api\/(v\d+)/);
    const version = match?.[1] ?? config.apiDefaultVersion;
    const policy = POLICIES[version];

    reply.header('api-version', version);
    reply.header('api-supported-versions', config.apiSupportedVersions.join(', '));

    if (policy?.deprecatedAt) {
      reply.header('Deprecation', policy.deprecatedAt);
      if (policy.sunsetAt) reply.header('Sunset', policy.sunsetAt);
      if (policy.successor) {
        reply.header('Link', `<${policy.successor}>; rel="successor-version"`);
      }
    }
  });
};

export default fp(plugin, { name: 'version-plugin' });
