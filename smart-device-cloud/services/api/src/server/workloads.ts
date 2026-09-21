import { FastifyPluginAsync } from 'fastify';
import { workloadService } from '../services/workload.service.ts';
import { requirePermission, PERMISSIONS } from '../middleware/auth.middleware.ts';

export const workloadRoutes: FastifyPluginAsync = async fastify => {
  fastify.get(
    '/workloads',
    {
      preHandler: [requirePermission(PERMISSIONS.READ_WORKLOADS)],
    },
    async () => {
      return { workloads: await workloadService.getAll() };
    }
  );

  fastify.get<{ Params: { workloadId: string } }>(
    '/workloads/:workloadId',
    {
      preHandler: [requirePermission(PERMISSIONS.READ_WORKLOADS)],
    },
    async (request, reply) => {
      const { workloadId } = request.params as { workloadId: string };
      const workload = await workloadService.getById(workloadId);
      if (!workload) {
        return reply
          .status(404)
          .send({ error: { code: 'NOT_FOUND', message: 'Workload not found' } });
      }
      return { workload };
    }
  );

  fastify.post(
    '/workloads',
    {
      preHandler: [requirePermission(PERMISSIONS.WRITE_WORKLOADS)],
    },
    async (request, reply) => {
      const body = request.body as any;
      const workload = await workloadService.create(body);
      return reply.status(201).send({ workload });
    }
  );

  fastify.post<{ Params: { workloadId: string } }>(
    '/workloads/:workloadId/start',
    {
      preHandler: [requirePermission(PERMISSIONS.WRITE_WORKLOADS)],
    },
    async (request, reply) => {
      const { workloadId } = request.params as { workloadId: string };
      const body = request.body as { deviceIds?: string[] };
      const execution = await workloadService.start(workloadId, body.deviceIds ?? []);
      return { success: true, execution };
    }
  );

  fastify.post<{ Params: { workloadId: string } }>(
    '/workloads/:workloadId/stop',
    {
      preHandler: [requirePermission(PERMISSIONS.WRITE_WORKLOADS)],
    },
    async request => {
      const { workloadId } = request.params as { workloadId: string };
      await workloadService.updateStatus(workloadId, 'failed');
      return { success: true };
    }
  );

  fastify.get<{ Params: { workloadId: string } }>(
    '/workloads/:workloadId/executions',
    {
      preHandler: [requirePermission(PERMISSIONS.READ_WORKLOADS)],
    },
    async request => {
      const { workloadId } = request.params as { workloadId: string };
      const executions = await workloadService.getExecutions(workloadId);
      return { executions };
    }
  );
};
