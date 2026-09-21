import { FastifyPluginAsync } from 'fastify';
import { securityService } from '../services/security.service.ts';
import { requirePermission, PERMISSIONS } from '../middleware/auth.middleware.ts';

export const securityRoutes: FastifyPluginAsync = async fastify => {
  fastify.get(
    '/security/compliance',
    {
      preHandler: [requirePermission(PERMISSIONS.READ_SECURITY)],
    },
    async () => {
      return await securityService.getComplianceStats();
    }
  );
};
