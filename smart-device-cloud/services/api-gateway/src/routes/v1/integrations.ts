import type { FastifyPluginAsync } from 'fastify';

export const integrationRoutes: FastifyPluginAsync = async app => {
  app.get('/integrations', { preHandler: [app.authenticate] }, async req => {
    return app.adapters.internal.request('/integrations', { requestId: req.id });
  });

  app.post(
    '/integrations',
    { preHandler: [app.authenticate, app.requirePermission('integration:write')] },
    async req => {
      return app.adapters.internal.request('/integrations', {
        method: 'POST',
        body: req.body,
        requestId: req.id,
      });
    }
  );
};
