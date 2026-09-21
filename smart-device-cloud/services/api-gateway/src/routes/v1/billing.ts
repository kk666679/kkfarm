import type { FastifyPluginAsync } from 'fastify';

export const billingRoutes: FastifyPluginAsync = async app => {
  app.get(
    '/billing/usage',
    { preHandler: [app.authenticate, app.requirePermission('billing:read')] },
    async req => {
      const { period } = (req.query ?? {}) as { period?: string };
      return app.adapters.billing.request('/usage', {
        query: { tenantId: req.user!.tenantId, period: period ?? 'current' },
        requestId: req.id,
      });
    }
  );
};
