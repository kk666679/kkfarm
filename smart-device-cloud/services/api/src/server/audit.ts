import { FastifyPluginAsync } from 'fastify';
import { auditService } from '../services/audit.service.ts';
import { requirePermission, PERMISSIONS } from '../middleware/auth.middleware.ts';

export const auditRoutes: FastifyPluginAsync = async fastify => {
  fastify.get(
    '/audit-log',
    {
      preHandler: [requirePermission(PERMISSIONS.READ_AUDIT)],
    },
    async request => {
      const query = request.query as {
        operatorId?: string;
        action?: string;
        targetId?: string;
        limit?: string;
        offset?: string;
      };
      const result = await auditService.getAll({
        operatorId: query.operatorId,
        action: query.action as any,
        targetId: query.targetId,
        limit: query.limit ? parseInt(query.limit) : 100,
        offset: query.offset ? parseInt(query.offset) : 0,
      });
      return result;
    }
  );
};
