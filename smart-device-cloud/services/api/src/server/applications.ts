import { FastifyPluginAsync } from 'fastify';
import { applicationService } from '../services/application.service.ts';
import { auditService } from '../services/audit.service.ts';
import { DeviceManager } from './device-manager.ts';
import { requirePermission, PERMISSIONS } from '../middleware/auth.middleware.ts';

export const applicationRoutes: FastifyPluginAsync = async fastify => {
  fastify.get(
    '/applications',
    {
      preHandler: [requirePermission(PERMISSIONS.READ_APPLICATIONS)],
    },
    async () => {
      return { applications: await applicationService.getAll() };
    }
  );

  fastify.get<{ Params: { appId: string } }>(
    '/applications/:appId',
    {
      preHandler: [requirePermission(PERMISSIONS.READ_APPLICATIONS)],
    },
    async (request, reply) => {
      const { appId } = request.params as { appId: string };
      const app = await applicationService.getById(appId);
      if (!app) {
        return reply
          .status(404)
          .send({ error: { code: 'NOT_FOUND', message: 'Application not found' } });
      }
      return { application: app };
    }
  );

  fastify.post(
    '/applications',
    {
      preHandler: [requirePermission(PERMISSIONS.WRITE_APPLICATIONS)],
    },
    async (request, reply) => {
      const body = request.body as any;
      const app = await applicationService.create(body);
      return reply.status(201).send({ application: app });
    }
  );

  fastify.post<{ Params: { appId: string } }>(
    '/applications/:appId/deploy',
    {
      preHandler: [requirePermission(PERMISSIONS.WRITE_APPLICATIONS)],
    },
    async request => {
      const { appId } = request.params as { appId: string };
      const body = request.body as { deviceIds: string[] };
      await applicationService.updateStatus(appId, {
        installStatus: 'installing',
        installedDeviceCount: body.deviceIds.length,
      });
      return { success: true };
    }
  );

  fastify.post<{ Params: { appId: string } }>(
    '/applications/:appId/rollback',
    {
      preHandler: [requirePermission(PERMISSIONS.WRITE_APPLICATIONS)],
    },
    async request => {
      const { appId } = request.params as { appId: string };
      await applicationService.updateStatus(appId, { installStatus: 'installed' });
      return { success: true };
    }
  );

  fastify.get<{ Params: { appId: string } }>(
    '/applications/:appId/devices',
    {
      preHandler: [requirePermission(PERMISSIONS.READ_APPLICATIONS)],
    },
    async request => {
      const { appId } = request.params as { appId: string };
      const deviceManager = DeviceManager as any;
      if (!deviceManager.globalDeviceManager) {
        return { devices: [] };
      }
      const devices = deviceManager.globalDeviceManager.getAll();
      return { devices };
    }
  );
};
