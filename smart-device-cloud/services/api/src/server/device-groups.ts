import { FastifyPluginAsync } from 'fastify';
import { randomUUID } from 'node:crypto';
import { run, all, get } from '../db/database.ts';
import { requirePermission, PERMISSIONS } from '../middleware/auth.middleware.ts';

function mapGroupRow(row: any): Record<string, unknown> {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    parentId: row.parent_id,
    path: row.path,
    deviceCount: row.device_count,
    onlineCount: row.online_count,
    offlineCount: row.offline_count,
    maintenanceCount: row.maintenance_count,
    status: row.status,
    createdAt: row.created_at,
    assignedTo: row.assigned_to,
    tags: JSON.parse(row.tags || '[]'),
    metadata: JSON.parse(row.metadata || '{}'),
  };
}

function buildPath(parentId: string | null | undefined, name: string): string {
  if (!parentId) return `/${name}`;
  const parent = get('SELECT * FROM device_groups WHERE id = ?', [parentId]);
  if (!parent) {
    return `/${name}`;
  }
  return `${parent.path}/${name}`;
}

export const deviceGroupRoutes: FastifyPluginAsync = async fastify => {
  fastify.get(
    '/device-groups',
    {
      schema: {
        description: 'List device groups',
        tags: ['device-groups'],
        response: {
          200: {
            type: 'object',
            properties: { groups: { type: 'array', items: { type: 'object' } } },
          },
        },
      },
      preHandler: [requirePermission(PERMISSIONS.READ_DEVICES)],
    },
    async () => {
      const rows = all('SELECT * FROM device_groups ORDER BY created_at DESC');
      return { groups: rows.map(mapGroupRow) };
    }
  );

  fastify.get(
    '/device-groups/stats',
    {
      schema: {
        description: 'Get device group statistics',
        tags: ['device-groups'],
        response: { 200: { type: 'object', properties: { stats: { type: 'object' } } } },
      },
      preHandler: [requirePermission(PERMISSIONS.READ_DEVICES)],
    },
    async () => {
      const groups = all('SELECT * FROM device_groups') as any[];
      const totalGroups = groups.length;
      const activeGroups = groups.filter(g => g.status === 'active').length;
      const totalDevicesRow = get<{ count: number }>('SELECT COUNT(*) as count FROM devices');
      const totalDevices = totalDevicesRow?.count || 0;
      const devicesInGroupsRow = get<{ count: number }>(
        'SELECT COUNT(*) as count FROM devices WHERE group_id IS NOT NULL'
      );
      const devicesInGroups = devicesInGroupsRow?.count || 0;
      const avgDevicesPerGroup =
        totalGroups > 0 ? Number((devicesInGroups / totalGroups).toFixed(2)) : 0;
      return {
        stats: {
          totalGroups,
          activeGroups,
          totalDevices,
          devicesInGroups,
          avgDevicesPerGroup,
        },
      };
    }
  );

  fastify.post(
    '/device-groups',
    {
      schema: {
        description: 'Create device group',
        tags: ['device-groups'],
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1 },
            description: { type: 'string' },
            parentId: { type: 'string' },
            status: { type: 'string', enum: ['active', 'inactive'] },
            tags: { type: 'array', items: { type: 'string' } },
            metadata: { type: 'object' },
          },
          required: ['name'],
        },
        response: {
          201: { type: 'object' },
          400: { type: 'object', properties: { error: { type: 'object' } } },
        },
      },
      preHandler: [requirePermission(PERMISSIONS.WRITE_DEVICES)],
    },
    async (request, reply) => {
      const body = request.body as any;
      if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
        return reply
          .status(400)
          .send({ error: { code: 'VALIDATION_ERROR', message: 'name is required' } });
      }
      const now = new Date().toISOString();
      const id = `group-${randomUUID()}`;
      const path = buildPath(body.parentId || null, body.name);
      run(
        `INSERT INTO device_groups (id, name, description, parent_id, path, status, created_at, assigned_to, tags, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          body.name,
          body.description ?? null,
          body.parentId ?? null,
          path,
          body.status ?? 'active',
          now,
          null,
          JSON.stringify(body.tags ?? []),
          JSON.stringify(body.metadata ?? {}),
        ]
      );
      const row = get('SELECT * FROM device_groups WHERE id = ?', [id]);
      reply.status(201);
      return { group: mapGroupRow(row) };
    }
  );

  fastify.put(
    '/device-groups/:id',
    {
      schema: {
        description: 'Update device group',
        tags: ['device-groups'],
        params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1 },
            description: { type: 'string' },
            status: { type: 'string', enum: ['active', 'inactive'] },
          },
        },
        response: {
          200: { type: 'object', properties: { group: { type: 'object' } } },
          404: { type: 'object', properties: { error: { type: 'object' } } },
          400: { type: 'object', properties: { error: { type: 'object' } } },
        },
      },
      preHandler: [requirePermission(PERMISSIONS.WRITE_DEVICES)],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const existing = get('SELECT * FROM device_groups WHERE id = ?', [id]);
      if (!existing) {
        return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Group not found' } });
      }
      const body = request.body as any;
      const sets: string[] = [];
      const params: any[] = [];
      if (body.name !== undefined) {
        sets.push('name = ?');
        params.push(body.name);
      }
      if (body.description !== undefined) {
        sets.push('description = ?');
        params.push(body.description);
      }
      if (body.status !== undefined) {
        sets.push('status = ?');
        params.push(body.status);
      }
      if (sets.length === 0) {
        return { group: mapGroupRow(existing) };
      }
      params.push(id);
      run(`UPDATE device_groups SET ${sets.join(', ')} WHERE id = ?`, params);
      const row = get('SELECT * FROM device_groups WHERE id = ?', [id]);
      return { group: mapGroupRow(row) };
    }
  );

  fastify.delete(
    '/device-groups/:id',
    {
      schema: {
        description: 'Delete device group',
        tags: ['device-groups'],
        params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' } } },
          404: { type: 'object', properties: { error: { type: 'object' } } },
        },
      },
      preHandler: [requirePermission(PERMISSIONS.WRITE_DEVICES)],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const existing = get('SELECT id FROM device_groups WHERE id = ?', [id]);
      if (!existing) {
        return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Group not found' } });
      }
      run('UPDATE devices SET group_id = NULL WHERE group_id = ?', [id]);
      run('DELETE FROM device_groups WHERE id = ?', [id]);
      return { success: true };
    }
  );

  fastify.post(
    '/device-groups/:id/move',
    {
      schema: {
        description: 'Move device group',
        tags: ['device-groups'],
        params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        body: { type: 'object', properties: { parentId: { type: 'string' } } },
        response: {
          200: { type: 'object', properties: { group: { type: 'object' } } },
          404: { type: 'object', properties: { error: { type: 'object' } } },
          400: { type: 'object', properties: { error: { type: 'object' } } },
        },
      },
      preHandler: [requirePermission(PERMISSIONS.WRITE_DEVICES)],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const existing = get('SELECT * FROM device_groups WHERE id = ?', [id]);
      if (!existing) {
        return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Group not found' } });
      }
      const body = request.body as { parentId?: string };
      const newParentId = body.parentId || null;
      if (newParentId === id) {
        return reply
          .status(400)
          .send({ error: { code: 'VALIDATION_ERROR', message: 'Cannot move group into itself' } });
      }
      const path = buildPath(newParentId, existing.name as string);
      run('UPDATE device_groups SET parent_id = ?, path = ? WHERE id = ?', [newParentId, path, id]);
      const row = get('SELECT * FROM device_groups WHERE id = ?', [id]);
      return { group: mapGroupRow(row) };
    }
  );
};
