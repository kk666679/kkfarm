import { FastifyPluginAsync } from 'fastify';
import { alertService } from '../services/alert.service.ts';
import { requirePermission, PERMISSIONS } from '../middleware/auth.middleware.ts';

export const alertRoutes: FastifyPluginAsync = async fastify => {
  fastify.get(
    '/alerts',
    {
      preHandler: [requirePermission(PERMISSIONS.READ_ALERTS)],
    },
    async request => {
      const query = request.query as { limit?: string };
      const limit = query.limit ? parseInt(query.limit) : 50;
      return { alerts: await alertService.getAll(limit) };
    }
  );

  fastify.get<{ Params: { alertId: string } }>(
    '/alerts/:alertId',
    {
      preHandler: [requirePermission(PERMISSIONS.READ_ALERTS)],
    },
    async (request, reply) => {
      const { alertId } = request.params as { alertId: string };
      const alert = await alertService.getById(alertId);
      if (!alert) {
        return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Alert not found' } });
      }
      return { alert };
    }
  );

  fastify.post<{ Params: { alertId: string } }>(
    '/alerts/:alertId/resolve',
    {
      preHandler: [requirePermission(PERMISSIONS.WRITE_ALERTS)],
    },
    async request => {
      const { alertId } = request.params as { alertId: string };
      const alert = await alertService.resolve(alertId, (request as any).user?.id);
      return { alert };
    }
  );
};
