import { FastifyPluginAsync } from 'fastify';
import { analyticsService } from '../services/analytics.service.ts';
import { requirePermission, PERMISSIONS } from '../middleware/auth.middleware.ts';

export const analyticsRoutes: FastifyPluginAsync = async fastify => {
  fastify.get(
    '/analytics/fleet-metrics',
    {
      preHandler: [requirePermission(PERMISSIONS.READ_ANALYTICS)],
    },
    async () => {
      return await analyticsService.getFleetMetrics();
    }
  );

  fastify.get(
    '/analytics/health-metrics',
    {
      preHandler: [requirePermission(PERMISSIONS.READ_ANALYTICS)],
    },
    async () => {
      return await analyticsService.getHealthMetrics();
    }
  );

  fastify.get(
    '/analytics/regional-metrics',
    {
      preHandler: [requirePermission(PERMISSIONS.READ_ANALYTICS)],
    },
    async () => {
      return await analyticsService.getRegionalMetrics();
    }
  );

  fastify.get(
    '/analytics/cost-metrics',
    {
      preHandler: [requirePermission(PERMISSIONS.READ_ANALYTICS)],
    },
    async () => {
      return await analyticsService.getCostMetrics();
    }
  );
};
