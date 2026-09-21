import { FastifyPluginAsync } from 'fastify';
import { costService } from '../services/cost.service.ts';
import { requirePermission, PERMISSIONS } from '../middleware/auth.middleware.ts';

export const costRoutes: FastifyPluginAsync = async fastify => {
  fastify.get(
    '/cost/summary',
    {
      preHandler: [requirePermission(PERMISSIONS.READ_COST)],
    },
    async () => {
      return await costService.getSummary();
    }
  );

  fastify.get(
    '/cost/history',
    {
      preHandler: [requirePermission(PERMISSIONS.READ_COST)],
    },
    async request => {
      const query = request.query as { range?: string };
      const range = query.range ?? '30d';
      return { records: await costService.getHistory(range) };
    }
  );
};
