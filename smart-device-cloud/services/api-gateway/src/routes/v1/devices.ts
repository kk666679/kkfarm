import type { FastifyPluginAsync } from 'fastify';

export const deviceRoutes: FastifyPluginAsync = async app => {
  app.get('/devices', { preHandler: [app.authenticate] }, async req => {
    const { status, region, limit } = (req.query ?? {}) as Record<string, string>;
    return app.adapters.deviceAgent.request('/devices', {
      query: { ...(status && { status }), ...(region && { region }), limit: limit ?? '50' },
      requestId: req.id,
    });
  });

  app.get('/devices/:id', { preHandler: [app.authenticate] }, async req => {
    const { id } = req.params as { id: string };
    return app.adapters.deviceAgent.request(`/devices/${id}`, { requestId: req.id });
  });

  app.post(
    '/devices/:id/reboot',
    { preHandler: [app.authenticate, app.requirePermission('device:write')] },
    async req => {
      const { id } = req.params as { id: string };
      return app.adapters.deviceAgent.request(`/devices/${id}/reboot`, {
        method: 'POST',
        requestId: req.id,
      });
    }
  );
};
