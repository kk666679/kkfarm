import type { FastifyPluginAsync } from 'fastify';

export const telemetryRoutes: FastifyPluginAsync = async app => {
  app.get('/telemetry/:deviceId', { preHandler: [app.authenticate] }, async req => {
    const { deviceId } = req.params as { deviceId: string };
    const { range } = (req.query ?? {}) as { range?: string };
    return app.adapters.telemetry.request(`/telemetry/${deviceId}`, {
      query: { range: range ?? '1h' },
      requestId: req.id,
    });
  });
};
