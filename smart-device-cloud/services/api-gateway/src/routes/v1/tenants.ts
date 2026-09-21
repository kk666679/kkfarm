import type { FastifyPluginAsync } from 'fastify';

export const tenantRoutes: FastifyPluginAsync = async app => {
  app.get('/tenants/current', { preHandler: [app.authenticate] }, async req => {
    return { tenantId: req.user!.tenantId, role: req.user!.role };
  });
};
