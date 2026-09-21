import type { FastifyPluginAsync } from 'fastify';

export const analyticsRoutes: FastifyPluginAsync = async app => {
  app.get('/analytics/metrics', { preHandler: [app.authenticate] }, async req => {
    return app.adapters.analytics.request('/metrics/query', {
      query: (req.query ?? {}) as Record<string, string>,
      requestId: req.id,
    });
  });
};
