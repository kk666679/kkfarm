import { FastifyPluginAsync } from 'fastify';
import { intelligenceService } from '../services/intelligence.service.ts';
import { requirePermission, PERMISSIONS } from '../middleware/auth.middleware.ts';

export const intelligenceRoutes: FastifyPluginAsync = async fastify => {
  fastify.get(
    '/intelligence/recommendations',
    {
      preHandler: [requirePermission(PERMISSIONS.READ_ANALYTICS)],
    },
    async request => {
      const query = request.query as { limit?: string };
      const limit = query.limit ? parseInt(query.limit) : 10;
      return { recommendations: await intelligenceService.getRecommendations(limit) };
    }
  );

  fastify.post<{ Params: { recId: string } }>(
    '/intelligence/recommendations/:recId/apply',
    {
      preHandler: [requirePermission(PERMISSIONS.READ_ANALYTICS)],
    },
    async request => {
      const { recId } = request.params as { recId: string };
      await intelligenceService.updateStatus(recId, 'accepted');
      return { success: true };
    }
  );

  fastify.post<{ Params: { recId: string } }>(
    '/intelligence/recommendations/:recId/ignore',
    {
      preHandler: [requirePermission(PERMISSIONS.READ_ANALYTICS)],
    },
    async request => {
      const { recId } = request.params as { recId: string };
      await intelligenceService.updateStatus(recId, 'dismissed');
      return { success: true };
    }
  );
};
