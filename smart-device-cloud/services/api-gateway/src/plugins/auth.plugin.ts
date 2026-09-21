import fp from 'fastify-plugin';
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { verifyJWT } from '../auth/oauth-validator.js';
import { resolveTenant } from '../auth/tenant-resolver.js';
import { hasPermission } from '../auth/permission-checker.js';
import type { GatewayConfig } from '../config.js';
import type { UserContext } from '../types.js';

declare module 'fastify' {
  interface FastifyRequest {
    user: UserContext | null;
  }
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requirePermission: (
      permission: string
    ) => (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const plugin: FastifyPluginAsync<GatewayConfig> = async (app, config) => {
  app.decorateRequest('user', null);

  app.decorate('authenticate', async (req: FastifyRequest, reply: FastifyReply) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return reply.code(401).send({
        type: 'https://api.sdc.dev/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Missing or invalid Authorization header',
        requestId: req.id,
      });
    }

    try {
      const claims = await verifyJWT(header.slice(7), config);
      if (!claims.sub) throw new Error('Token subject is missing');
      const tenantId = resolveTenant(claims, req);
      req.user = {
        id: claims.sub,
        role: (claims.role as string) ?? 'viewer',
        tenantId,
        scopes: ((claims.scope as string) ?? '').split(' ').filter(Boolean),
      };
    } catch (error) {
      return reply.code(401).send({
        type: 'https://api.sdc.dev/errors/invalid-token',
        title: 'Invalid Token',
        status: 401,
        detail: (error as Error).message,
        requestId: req.id,
      });
    }
  });

  app.decorate('requirePermission', (permission: string) => {
    return async (req: FastifyRequest, reply: FastifyReply) => {
      if (!req.user) {
        return reply.code(401).send({
          type: 'https://api.sdc.dev/errors/unauthorized',
          title: 'Unauthorized',
          status: 401,
          requestId: req.id,
        });
      }
      if (!hasPermission(req.user.role, permission)) {
        req.log.warn({ userId: req.user.id, permission }, 'Permission denied');
        return reply.code(403).send({
          type: 'https://api.sdc.dev/errors/forbidden',
          title: 'Forbidden',
          status: 403,
          detail: `Missing permission: ${permission}`,
          requestId: req.id,
        });
      }
    };
  });
};

export default fp(plugin, { name: 'auth-plugin' });
