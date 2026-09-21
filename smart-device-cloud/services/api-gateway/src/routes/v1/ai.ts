import type { FastifyPluginAsync } from 'fastify';

export const aiRoutes: FastifyPluginAsync = async app => {
  app.post(
    '/ai/diagnose',
    { preHandler: [app.authenticate, app.requirePermission('ai:execute')] },
    async req => {
      return app.adapters.internal.request('/ai/diagnose', {
        method: 'POST',
        body: req.body,
        requestId: req.id,
      });
    }
  );
};
