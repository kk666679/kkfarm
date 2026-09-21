import { FastifyPluginAsync } from 'fastify';
import { DeviceManager } from './device-manager.ts';
import { requirePermission, PERMISSIONS } from '../middleware/auth.middleware.ts';
import { run } from '../db/database.ts';
import type { Device } from '@smart-device-cloud/shared';

function mapDeviceRow(row: any): Device {
  return {
    id: row.id,
    name: row.name,
    provider: row.provider,
    serial: row.serial,
    androidVersion: row.android_version,
    apiLevel: row.api_level,
    status: row.status,
    state: row.state ?? 'offline',
    containerId: row.container_id,
    adbHost: row.adb_host,
    adbPort: row.adb_port,
    assignedTaskId: row.assigned_task_id,
    lastHeartbeat: row.last_heartbeat,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const deviceRoutes: FastifyPluginAsync = async (fastify, options) => {
  const deviceManager = (options as any)?.deviceManager as DeviceManager;

  fastify.get(
    '/devices',
    {
      schema: {
        description: 'List devices',
        tags: ['devices'],
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
            offset: { type: 'integer', minimum: 0, default: 0 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              devices: { type: 'array', items: { type: 'object' } },
              total: { type: 'integer' },
              limit: { type: 'integer' },
              offset: { type: 'integer' },
            },
          },
        },
      },
      preHandler: [requirePermission(PERMISSIONS.READ_DEVICES)],
    },
    async request => {
      const query = request.query as { limit?: number; offset?: number };
      const limit = query.limit ?? 50;
      const offset = query.offset ?? 0;
      const allDevices = deviceManager.getAll();
      const paged = allDevices.slice(offset, offset + limit);
      return { devices: paged, total: allDevices.length, limit, offset };
    }
  );

  fastify.get(
    '/devices/:id',
    {
      schema: {
        description: 'Get device by ID',
        tags: ['devices'],
        response: {
          200: { type: 'object', properties: { device: { type: 'object' } } },
          404: { type: 'object', properties: { error: { type: 'object' } } },
        },
      },
      preHandler: [requirePermission(PERMISSIONS.READ_DEVICES)],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const device = deviceManager.getById(id);
      if (!device) {
        return reply
          .status(404)
          .send({ error: { code: 'NOT_FOUND', message: 'Device not found' } });
      }
      return { device };
    }
  );

  fastify.post(
    '/devices',
    {
      schema: {
        description: 'Create device',
        tags: ['devices'],
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1 },
            provider: { type: 'string', minLength: 1 },
            serial: { type: 'string' },
            androidVersion: { type: 'string' },
            apiLevel: { type: 'integer' },
            containerId: { type: 'string' },
            adbHost: { type: 'string' },
            adbPort: { type: 'integer' },
          },
          required: ['name', 'provider'],
          additionalProperties: false,
        },
        response: { 201: { type: 'object', properties: { device: { type: 'object' } } } },
      },
      preHandler: [requirePermission(PERMISSIONS.WRITE_DEVICES)],
    },
    async (request, reply) => {
      const body = request.body as any;
      const device = await deviceManager.create({
        name: body.name,
        provider: body.provider,
        serial: body.serial,
        androidVersion: body.androidVersion,
        apiLevel: body.apiLevel,
        containerId: body.containerId,
        adbHost: body.adbHost,
        adbPort: body.adbPort,
        status: 'offline',
        state: 'offline',
      });
      return reply.status(201).send({ device });
    }
  );

  fastify.delete(
    '/devices/:id',
    {
      schema: {
        description: 'Delete device',
        tags: ['devices'],
        params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' } } },
          404: { type: 'object', properties: { error: { type: 'object' } } },
        },
      },
      preHandler: [requirePermission(PERMISSIONS.DELETE_DEVICES)],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const existed = await deviceManager.delete(id);
      if (!existed) {
        return reply
          .status(404)
          .send({ error: { code: 'NOT_FOUND', message: 'Device not found' } });
      }
      return { success: true };
    }
  );

  fastify.patch(
    '/devices/:id/state',
    {
      schema: {
        description: 'Update device state',
        tags: ['devices'],
        params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        body: { type: 'object', properties: { state: { type: 'string' } }, required: ['state'] },
        response: {
          200: { type: 'object', properties: { device: { type: 'object' } } },
          404: { type: 'object', properties: { error: { type: 'object' } } },
        },
      },
      preHandler: [requirePermission(PERMISSIONS.WRITE_DEVICES)],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as { state: string };
      const device = deviceManager.getById(id);
      if (!device) {
        return reply
          .status(404)
          .send({ error: { code: 'NOT_FOUND', message: 'Device not found' } });
      }
      device.status = body.state as any;
      device.updatedAt = new Date().toISOString();
      (deviceManager as any).devices.set(id, device);
      run('UPDATE devices SET status = ?, updated_at = ? WHERE id = ?', [
        body.state,
        device.updatedAt,
        id,
      ]);
      return { device };
    }
  );

  fastify.post(
    '/devices/:id/actions/:command',
    {
      schema: {
        description: 'Send action to device',
        tags: ['devices'],
        params: {
          type: 'object',
          properties: { id: { type: 'string' }, command: { type: 'string' } },
          required: ['id', 'command'],
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' } } },
          404: { type: 'object', properties: { error: { type: 'object' } } },
        },
      },
      preHandler: [requirePermission(PERMISSIONS.WRITE_DEVICES)],
    },
    async (request, reply) => {
      const { id, command } = request.params as { id: string; command: string };
      const device = deviceManager.getById(id);
      if (!device) {
        return reply
          .status(404)
          .send({ error: { code: 'NOT_FOUND', message: 'Device not found' } });
      }
      switch (command) {
        case 'start':
          await deviceManager.start(id);
          break;
        case 'stop':
          await deviceManager.stop(id);
          break;
        case 'restart':
          await deviceManager.stop(id);
          await deviceManager.start(id);
          break;
        default:
          break;
      }
      return { success: true };
    }
  );

  fastify.post(
    '/devices/:id/start',
    {
      schema: {
        description: 'Start device',
        tags: ['devices'],
        params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        response: { 200: { type: 'object' } },
      },
      preHandler: [requirePermission(PERMISSIONS.WRITE_DEVICES)],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      await deviceManager.start(id);
      return { device: deviceManager.getById(id) };
    }
  );

  fastify.post(
    '/devices/:id/stop',
    {
      schema: {
        description: 'Stop device',
        tags: ['devices'],
        params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        response: { 200: { type: 'object' } },
      },
      preHandler: [requirePermission(PERMISSIONS.WRITE_DEVICES)],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      await deviceManager.stop(id);
      return { device: deviceManager.getById(id) };
    }
  );

  fastify.post(
    '/devices/:id/restart',
    {
      schema: {
        description: 'Restart device',
        tags: ['devices'],
        params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        response: { 200: { type: 'object' } },
      },
      preHandler: [requirePermission(PERMISSIONS.WRITE_DEVICES)],
    },
    async request => {
      const { id } = request.params as { id: string };
      await deviceManager.stop(id);
      await deviceManager.start(id);
      return { device: deviceManager.getById(id) };
    }
  );

  fastify.get(
    '/devices/:id/health',
    {
      schema: {
        description: 'Device health check',
        tags: ['devices'],
        params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        response: { 200: { type: 'object' } },
      },
      preHandler: [requirePermission(PERMISSIONS.READ_DEVICES)],
    },
    async request => {
      const { id } = request.params as { id: string };
      return deviceManager.healthCheck(id);
    }
  );
};
