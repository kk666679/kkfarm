import type { FastifyPluginAsync } from 'fastify';

export const browserRoutes: FastifyPluginAsync = async app => {
  app.get('/browsers', { preHandler: [app.authenticate] }, async req => {
    return app.adapters.internal.request('/browsers', { requestId: req.id });
  });
};
