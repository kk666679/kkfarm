import { FastifyPluginAsync } from 'fastify';
import { workflowService } from '../services/workflow.service.ts';
import { auditService } from '../services/audit.service.ts';
import { requirePermission, PERMISSIONS } from '../middleware/auth.middleware.ts';

export const workflowRoutes: FastifyPluginAsync = async fastify => {
  fastify.get(
    '/workflows',
    {
      preHandler: [requirePermission(PERMISSIONS.READ_WORKFLOWS)],
    },
    async () => {
      return { workflows: await workflowService.getAll() };
    }
  );

  fastify.get<{ Params: { workflowId: string } }>(
    '/workflows/:workflowId',
    {
      preHandler: [requirePermission(PERMISSIONS.READ_WORKFLOWS)],
    },
    async (request, reply) => {
      const { workflowId } = request.params as { workflowId: string };
      const workflow = await workflowService.getById(workflowId);
      if (!workflow) {
        return reply
          .status(404)
          .send({ error: { code: 'NOT_FOUND', message: 'Workflow not found' } });
      }
      return { workflow };
    }
  );

  fastify.post(
    '/workflows',
    {
      preHandler: [requirePermission(PERMISSIONS.WRITE_WORKFLOWS)],
    },
    async (request, reply) => {
      const body = request.body as any;
      const workflow = await workflowService.create(body);
      await auditService.record({
        operatorId: (request as any).user?.id ?? 'system',
        operatorRole: (request as any).user?.role ?? 'viewer',
        operatorEmail: (request as any).user?.email ?? 'system',
        action: 'workflow_create',
        targetType: 'workflow',
        targetId: workflow.id,
        targetName: workflow.name,
        description: `Created workflow "${workflow.name}"`,
        parameters: body,
        status: 'success',
        errorMessage: undefined,
        traceId: undefined,
        immutable: true,
      });
      return reply.status(201).send({ workflow });
    }
  );

  fastify.post<{ Params: { workflowId: string } }>(
    '/workflows/:workflowId/execute',
    {
      preHandler: [requirePermission(PERMISSIONS.WRITE_WORKFLOWS)],
    },
    async request => {
      const { workflowId } = request.params as { workflowId: string };
      await workflowService.updateStatus(workflowId, 'running');
      await auditService.record({
        operatorId: (request as any).user?.id ?? 'system',
        operatorRole: (request as any).user?.role ?? 'viewer',
        operatorEmail: (request as any).user?.email ?? 'system',
        action: 'workflow_execute',
        targetType: 'workflow',
        targetId: workflowId,
        targetName: workflowId,
        description: `Executed workflow ${workflowId}`,
        parameters: {},
        status: 'success',
        errorMessage: undefined,
        traceId: undefined,
        immutable: true,
      });
      return { success: true };
    }
  );

  fastify.post<{ Params: { workflowId: string } }>(
    '/workflows/:workflowId/pause',
    {
      preHandler: [requirePermission(PERMISSIONS.WRITE_WORKFLOWS)],
    },
    async request => {
      const { workflowId } = request.params as { workflowId: string };
      await workflowService.updateStatus(workflowId, 'paused');
      return { success: true };
    }
  );

  fastify.post<{ Params: { workflowId: string } }>(
    '/workflows/:workflowId/resume',
    {
      preHandler: [requirePermission(PERMISSIONS.WRITE_WORKFLOWS)],
    },
    async request => {
      const { workflowId } = request.params as { workflowId: string };
      await workflowService.updateStatus(workflowId, 'running');
      return { success: true };
    }
  );

  fastify.post<{ Params: { workflowId: string } }>(
    '/workflows/:workflowId/cancel',
    {
      preHandler: [requirePermission(PERMISSIONS.WRITE_WORKFLOWS)],
    },
    async request => {
      const { workflowId } = request.params as { workflowId: string };
      await workflowService.updateStatus(workflowId, 'cancelled');
      return { success: true };
    }
  );
};
