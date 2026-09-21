import type { FastifyPluginAsync } from 'fastify';

export const emulatorRoutes: FastifyPluginAsync = async app => {
  app.get('/emulators', { preHandler: [app.authenticate] }, async req => {
    return app.adapters.internal.request('/emulators', { requestId: req.id });
  });
};
