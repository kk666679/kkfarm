import { FastifyPluginAsync } from 'fastify';
import { randomUUID } from 'node:crypto';
import { run, all, get } from '../db/database.ts';
import { z } from 'zod';
import { requirePermission, PERMISSIONS } from '../middleware/auth.middleware.ts';

function mapProviderRow(row: any): Record<string, unknown> {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    status: row.status,
    location: row.location,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAccountRow(row: any): Record<string, unknown> {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    platform: row.platform,
    permissions: JSON.parse(row.permissions || '[]'),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const ProvisioningSchema = z.object({
  provider: z.object({ id: z.string().min(1), name: z.string() }),
  deviceConfig: z.object({
    model: z.string().min(1),
    manufacturer: z.string().min(1),
    androidVersion: z.string().optional(),
    apiLevel: z.number().optional(),
    screenSize: z.string().optional(),
    resolution: z.string().optional(),
    cpu: z.string().optional(),
    ram: z.string().optional(),
    storage: z.string().optional(),
    battery: z.string().optional(),
    cameras: z.number().optional(),
    sensors: z.array(z.string()).optional(),
    network: z.enum(['wifi', 'cellular', 'ethernet']).optional(),
  }),
  profile: z.object({ id: z.string().min(1), name: z.string() }),
  region: z.object({
    region: z.string().min(1),
    timezone: z.string().min(1),
    language: z.string().optional(),
    currency: z.string().optional(),
    network: z.string().optional(),
  }),
  accountAssignment: z.object({ accountId: z.string().min(1), accountName: z.string() }),
});

export const provisioningRoutes: FastifyPluginAsync = async fastify => {
  fastify.get(
    '/device-providers',
    {
      schema: {
        description: 'List device providers',
        tags: ['provisioning'],
        response: {
          200: {
            type: 'object',
            properties: { providers: { type: 'array', items: { type: 'object' } } },
          },
        },
      },
      preHandler: [requirePermission(PERMISSIONS.READ_DEVICES)],
    },
    async () => {
      const rows = all('SELECT * FROM device_providers ORDER BY created_at DESC');
      return { providers: rows.map(mapProviderRow) };
    }
  );

  fastify.get(
    '/accounts',
    {
      schema: {
        description: 'List accounts',
        tags: ['provisioning'],
        response: {
          200: {
            type: 'object',
            properties: { accounts: { type: 'array', items: { type: 'object' } } },
          },
        },
      },
      preHandler: [requirePermission(PERMISSIONS.READ_DEVICES)],
    },
    async () => {
      const rows = all('SELECT * FROM accounts ORDER BY created_at DESC');
      return { accounts: rows.map(mapAccountRow) };
    }
  );

  fastify.post(
    '/provisioning',
    {
      schema: {
        description: 'Provision a new device',
        tags: ['provisioning'],
        body: {
          type: 'object',
          properties: {
            provider: {
              type: 'object',
              properties: { id: { type: 'string' }, name: { type: 'string' } },
              required: ['id', 'name'],
            },
            deviceConfig: {
              type: 'object',
              properties: {
                model: { type: 'string' },
                manufacturer: { type: 'string' },
                androidVersion: { type: 'string' },
                apiLevel: { type: 'number' },
                screenSize: { type: 'string' },
                resolution: { type: 'string' },
                cpu: { type: 'string' },
                ram: { type: 'string' },
                storage: { type: 'string' },
                battery: { type: 'string' },
                cameras: { type: 'number' },
                sensors: { type: 'array', items: { type: 'string' } },
                network: { type: 'string' },
              },
              required: ['model', 'manufacturer'],
            },
            profile: {
              type: 'object',
              properties: { id: { type: 'string' }, name: { type: 'string' } },
              required: ['id', 'name'],
            },
            region: {
              type: 'object',
              properties: {
                region: { type: 'string' },
                timezone: { type: 'string' },
                language: { type: 'string' },
                currency: { type: 'string' },
                network: { type: 'string' },
              },
              required: ['region', 'timezone'],
            },
            accountAssignment: {
              type: 'object',
              properties: { accountId: { type: 'string' }, accountName: { type: 'string' } },
              required: ['accountId', 'accountName'],
            },
          },
          required: ['provider', 'deviceConfig', 'profile', 'region', 'accountAssignment'],
        },
      },
      preHandler: [requirePermission(PERMISSIONS.WRITE_DEVICES)],
    },
    async (request, reply) => {
      const body = request.body as any;
      const provider = get<Record<string, unknown>>('SELECT * FROM device_providers WHERE id = ?', [
        body.provider.id,
      ]);
      if (!provider) {
        return reply
          .status(400)
          .send({ error: { code: 'VALIDATION_ERROR', message: 'Invalid provider' } });
      }
      const profile = get<Record<string, unknown>>('SELECT * FROM device_profiles WHERE id = ?', [
        body.profile.id,
      ]);
      if (!profile) {
        return reply
          .status(400)
          .send({ error: { code: 'VALIDATION_ERROR', message: 'Invalid profile' } });
      }
      const account = get<Record<string, unknown>>('SELECT * FROM accounts WHERE id = ?', [
        body.accountAssignment.accountId,
      ]);
      if (!account) {
        return reply
          .status(400)
          .send({ error: { code: 'VALIDATION_ERROR', message: 'Invalid account' } });
      }

      const now = new Date().toISOString();
      const deviceId = `device-${randomUUID()}`;
      run(
        `INSERT INTO devices (id, name, provider, status, android_version, api_level, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          deviceId,
          `${body.deviceConfig.manufacturer} ${body.deviceConfig.model}`,
          body.provider.name,
          'offline',
          body.deviceConfig.androidVersion ?? null,
          body.deviceConfig.apiLevel ?? null,
          now,
          now,
        ]
      );
      const deviceRow = get('SELECT * FROM devices WHERE id = ?', [deviceId]);
      if (!deviceRow) {
        return reply
          .status(500)
          .send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create device' } });
      }
      return reply.status(201).send({
        device: {
          id: deviceRow.id,
          name: deviceRow.name,
          provider: deviceRow.provider,
          status: deviceRow.status,
          androidVersion: deviceRow.android_version,
          apiLevel: deviceRow.api_level,
          createdAt: deviceRow.created_at,
          updatedAt: deviceRow.updated_at,
        },
      });
    }
  );
};
