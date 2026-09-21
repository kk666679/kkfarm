import type { FastifyPluginAsync } from 'fastify';

export const remoteRoutes: FastifyPluginAsync = async app => {
  app.get('/remote/sessions', { preHandler: [app.authenticate] }, async req => {
    return app.adapters.internal.request('/remote/sessions', { requestId: req.id });
  });
};
