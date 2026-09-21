import { FastifyPluginAsync } from 'fastify';
import { randomUUID } from 'node:crypto';
import { run, all, get } from '../db/database.ts';
import { requirePermission, PERMISSIONS } from '../middleware/auth.middleware.ts';

function mapProfileRow(row: any): Record<string, unknown> {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    tags: JSON.parse(row.tags || '[]'),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    version: row.version,
    isActive: Boolean(row.is_active),
    category: row.category,
    priority: row.priority,
    applicableDevices: JSON.parse(row.applicable_devices || '[]'),
    ...JSON.parse(row.content || '{}'),
  };
}

function mapVersionRow(row: any): Record<string, unknown> {
  return {
    id: row.id,
    version: row.version,
    changes: row.changes,
    changedBy: row.changed_by,
    changedAt: row.changed_at,
    content: JSON.parse(row.content || '{}'),
  };
}

export const deviceProfileRoutes: FastifyPluginAsync = async fastify => {
  fastify.get(
    '/device-profiles',
    {
      schema: {
        description: 'List device profiles',
        tags: ['device-profiles'],
        response: {
          200: {
            type: 'object',
            properties: { profiles: { type: 'array', items: { type: 'object' } } },
          },
        },
      },
      preHandler: [requirePermission(PERMISSIONS.READ_APPLICATIONS)],
    },
    async () => {
      const rows = all('SELECT * FROM device_profiles ORDER BY updated_at DESC');
      return { profiles: rows.map(mapProfileRow) };
    }
  );

  fastify.get(
    '/device-profiles/:id',
    {
      schema: {
        description: 'Get device profile by ID',
        tags: ['device-profiles'],
        params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        response: {
          200: { type: 'object', properties: { profile: { type: 'object' } } },
          404: { type: 'object', properties: { error: { type: 'object' } } },
        },
      },
      preHandler: [requirePermission(PERMISSIONS.READ_APPLICATIONS)],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const row = get('SELECT * FROM device_profiles WHERE id = ?', [id]);
      if (!row) {
        return reply
          .status(404)
          .send({ error: { code: 'NOT_FOUND', message: 'Profile not found' } });
      }
      return { profile: mapProfileRow(row) };
    }
  );

  fastify.post(
    '/device-profiles',
    {
      schema: {
        description: 'Create device profile',
        tags: ['device-profiles'],
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1 },
            description: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            category: { type: 'string', enum: ['standard', 'custom', 'template'] },
            priority: { type: 'string', enum: ['low', 'medium', 'high'] },
            applicableDevices: { type: 'array', items: { type: 'string' } },
            content: { type: 'object' },
          },
          required: ['name'],
        },
      },
      preHandler: [requirePermission(PERMISSIONS.WRITE_APPLICATIONS)],
    },
    async (request, reply) => {
      const body = request.body as any;
      if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
        return reply
          .status(400)
          .send({ error: { code: 'VALIDATION_ERROR', message: 'name is required' } });
      }
      const now = new Date().toISOString();
      const id = `profile-${randomUUID()}`;
      const content = JSON.stringify(body.content ?? {});
      run(
        `INSERT INTO device_profiles (id, name, description, tags, category, priority, applicable_devices, content, created_at, updated_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          body.name,
          body.description ?? null,
          JSON.stringify(body.tags ?? []),
          body.category ?? 'standard',
          body.priority ?? 'medium',
          JSON.stringify(body.applicableDevices ?? []),
          content,
          now,
          now,
          'system',
        ]
      );
      run(
        `INSERT INTO device_profile_versions (id, profile_id, version, changes, changed_by, content) VALUES (?, ?, ?, ?, ?, ?)`,
        [`version-${randomUUID()}`, id, 1, 'Initial version', 'system', content]
      );
      const row = get('SELECT * FROM device_profiles WHERE id = ?', [id]);
      return reply.status(201).send({ profile: mapProfileRow(row) });
    }
  );

  fastify.put(
    '/device-profiles/:id',
    {
      schema: {
        description: 'Update device profile',
        tags: ['device-profiles'],
        params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1 },
            description: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            category: { type: 'string', enum: ['standard', 'custom', 'template'] },
            priority: { type: 'string', enum: ['low', 'medium', 'high'] },
            applicableDevices: { type: 'array', items: { type: 'string' } },
            content: { type: 'object' },
          },
        },
        response: {
          200: { type: 'object', properties: { profile: { type: 'object' } } },
          404: { type: 'object', properties: { error: { type: 'object' } } },
        },
      },
      preHandler: [requirePermission(PERMISSIONS.WRITE_APPLICATIONS)],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const existing = get('SELECT * FROM device_profiles WHERE id = ?', [id]);
      if (!existing) {
        return reply
          .status(404)
          .send({ error: { code: 'NOT_FOUND', message: 'Profile not found' } });
      }
      const body = request.body as any;
      const now = new Date().toISOString();
      const sets: string[] = ['updated_at = ?'];
      const params: any[] = [now];
      if (body.name !== undefined) {
        sets.push('name = ?');
        params.push(body.name);
      }
      if (body.description !== undefined) {
        sets.push('description = ?');
        params.push(body.description);
      }
      if (body.tags !== undefined) {
        sets.push('tags = ?');
        params.push(JSON.stringify(body.tags));
      }
      if (body.category !== undefined) {
        sets.push('category = ?');
        params.push(body.category);
      }
      if (body.priority !== undefined) {
        sets.push('priority = ?');
        params.push(body.priority);
      }
      if (body.applicableDevices !== undefined) {
        sets.push('applicable_devices = ?');
        params.push(JSON.stringify(body.applicableDevices));
      }
      if (body.content !== undefined) {
        sets.push('content = ?');
        params.push(JSON.stringify(body.content));
      }
      params.push(id);
      run(`UPDATE device_profiles SET ${sets.join(', ')} WHERE id = ?`, params);
      const row = get('SELECT * FROM device_profiles WHERE id = ?', [id]);
      return { profile: mapProfileRow(row) };
    }
  );

  fastify.delete(
    '/device-profiles/:id',
    {
      schema: {
        description: 'Delete device profile',
        tags: ['device-profiles'],
        params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' } } },
          404: { type: 'object', properties: { error: { type: 'object' } } },
        },
      },
      preHandler: [requirePermission(PERMISSIONS.WRITE_APPLICATIONS)],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const existing = get('SELECT id FROM device_profiles WHERE id = ?', [id]);
      if (!existing) {
        return reply
          .status(404)
          .send({ error: { code: 'NOT_FOUND', message: 'Profile not found' } });
      }
      run('DELETE FROM device_profile_versions WHERE profile_id = ?', [id]);
      run('DELETE FROM device_profiles WHERE id = ?', [id]);
      return { success: true };
    }
  );

  fastify.post(
    '/device-profiles/:id/publish',
    {
      schema: {
        description: 'Publish device profile',
        tags: ['device-profiles'],
        params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        response: {
          200: { type: 'object', properties: { profile: { type: 'object' } } },
          404: { type: 'object', properties: { error: { type: 'object' } } },
        },
      },
      preHandler: [requirePermission(PERMISSIONS.WRITE_APPLICATIONS)],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const existing = get('SELECT * FROM device_profiles WHERE id = ?', [id]);
      if (!existing) {
        return reply
          .status(404)
          .send({ error: { code: 'NOT_FOUND', message: 'Profile not found' } });
      }
      const now = new Date().toISOString();
      const newVersion = Number(existing.version || 1) + 1;
      run(
        'UPDATE device_profiles SET status = ?, version = ?, updated_at = ?, is_active = 1 WHERE id = ?',
        ['published', newVersion, now, id]
      );
      run(
        `INSERT INTO device_profile_versions (id, profile_id, version, changes, changed_by, content) VALUES (?, ?, ?, ?, ?, ?)`,
        [`version-${randomUUID()}`, id, newVersion, 'Published', 'system', existing.content]
      );
      const row = get('SELECT * FROM device_profiles WHERE id = ?', [id]);
      return { profile: mapProfileRow(row) };
    }
  );

  fastify.post(
    '/device-profiles/:id/duplicate',
    {
      schema: {
        description: 'Duplicate device profile',
        tags: ['device-profiles'],
        params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        response: {
          201: { type: 'object', properties: { profile: { type: 'object' } } },
          404: { type: 'object', properties: { error: { type: 'object' } } },
        },
      },
      preHandler: [requirePermission(PERMISSIONS.WRITE_APPLICATIONS)],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const existing = get('SELECT * FROM device_profiles WHERE id = ?', [id]);
      if (!existing) {
        return reply
          .status(404)
          .send({ error: { code: 'NOT_FOUND', message: 'Profile not found' } });
      }
      const now = new Date().toISOString();
      const newId = `profile-${randomUUID()}`;
      run(
        `INSERT INTO device_profiles (id, name, description, status, tags, version, is_active, category, priority, applicable_devices, content, created_at, updated_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newId,
          `${existing.name} (Copy)`,
          existing.description,
          'draft',
          existing.tags,
          1,
          1,
          existing.category,
          existing.priority,
          existing.applicable_devices,
          existing.content,
          now,
          now,
          'system',
        ]
      );
      run(
        `INSERT INTO device_profile_versions (id, profile_id, version, changes, changed_by, content) VALUES (?, ?, ?, ?, ?, ?)`,
        [`version-${randomUUID()}`, newId, 1, 'Duplicated from ' + id, 'system', existing.content]
      );
      const row = get('SELECT * FROM device_profiles WHERE id = ?', [newId]);
      return reply.status(201).send({ profile: mapProfileRow(row) });
    }
  );

  fastify.get(
    '/device-profiles/:id/versions',
    {
      schema: {
        description: 'List profile versions',
        tags: ['device-profiles'],
        params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        response: {
          200: {
            type: 'object',
            properties: { versions: { type: 'array', items: { type: 'object' } } },
          },
          404: { type: 'object', properties: { error: { type: 'object' } } },
        },
      },
      preHandler: [requirePermission(PERMISSIONS.READ_APPLICATIONS)],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const existing = get('SELECT id FROM device_profiles WHERE id = ?', [id]);
      if (!existing) {
        return reply
          .status(404)
          .send({ error: { code: 'NOT_FOUND', message: 'Profile not found' } });
      }
      const rows = all(
        'SELECT * FROM device_profile_versions WHERE profile_id = ? ORDER BY version DESC',
        [id]
      );
      return { versions: rows.map(mapVersionRow) };
    }
  );

  fastify.post(
    '/device-profiles/:id/versions/:versionId/restore',
    {
      schema: {
        description: 'Restore profile version',
        tags: ['device-profiles'],
        params: {
          type: 'object',
          properties: { id: { type: 'string' }, versionId: { type: 'string' } },
          required: ['id', 'versionId'],
        },
        response: {
          200: { type: 'object', properties: { profile: { type: 'object' } } },
          404: { type: 'object', properties: { error: { type: 'object' } } },
        },
      },
      preHandler: [requirePermission(PERMISSIONS.WRITE_APPLICATIONS)],
    },
    async (request, reply) => {
      const { id, versionId } = request.params as { id: string; versionId: string };
      const existing = get('SELECT * FROM device_profiles WHERE id = ?', [id]);
      if (!existing) {
        return reply
          .status(404)
          .send({ error: { code: 'NOT_FOUND', message: 'Profile not found' } });
      }
      const version = get('SELECT * FROM device_profile_versions WHERE id = ? AND profile_id = ?', [
        versionId,
        id,
      ]);
      if (!version) {
        return reply
          .status(404)
          .send({ error: { code: 'NOT_FOUND', message: 'Version not found' } });
      }
      const now = new Date().toISOString();
      const newVersion = Number(existing.version || 1) + 1;
      run('UPDATE device_profiles SET content = ?, version = ?, updated_at = ? WHERE id = ?', [
        version.content,
        newVersion,
        now,
        id,
      ]);
      run(
        `INSERT INTO device_profile_versions (id, profile_id, version, changes, changed_by, content) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          `version-${randomUUID()}`,
          id,
          newVersion,
          `Restored from version ${version.version}`,
          'system',
          version.content,
        ]
      );
      const row = get('SELECT * FROM device_profiles WHERE id = ?', [id]);
      return { profile: mapProfileRow(row) };
    }
  );

  fastify.get(
    '/device-profiles/:id/compare',
    {
      schema: {
        description: 'Compare profile versions',
        tags: ['device-profiles'],
        params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        querystring: {
          type: 'object',
          properties: { versionId: { type: 'string' } },
          required: ['versionId'],
        },
        response: {
          200: { type: 'object', properties: { comparison: { type: 'object' } } },
          404: { type: 'object', properties: { error: { type: 'object' } } },
        },
      },
      preHandler: [requirePermission(PERMISSIONS.READ_APPLICATIONS)],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { versionId } = request.query as { versionId: string };
      const existing = get('SELECT id FROM device_profiles WHERE id = ?', [id]);
      if (!existing) {
        return reply
          .status(404)
          .send({ error: { code: 'NOT_FOUND', message: 'Profile not found' } });
      }
      const original = get(
        'SELECT * FROM device_profile_versions WHERE profile_id = ? AND version = 1',
        [id]
      );
      const modified = get(
        'SELECT * FROM device_profile_versions WHERE id = ? AND profile_id = ?',
        [versionId, id]
      );
      if (!original || !modified) {
        return reply
          .status(404)
          .send({ error: { code: 'NOT_FOUND', message: 'Version not found' } });
      }
      const originalContent = JSON.parse((original.content as string) || '{}');
      const modifiedContent = JSON.parse((modified.content as string) || '{}');
      const differences: Record<string, unknown>[] = [];
      const allKeys = new Set([...Object.keys(originalContent), ...Object.keys(modifiedContent)]);
      for (const key of allKeys) {
        const origVal = (originalContent as any)[key];
        const modVal = (modifiedContent as any)[key];
        if (origVal === undefined) {
          differences.push({
            field: key,
            originalValue: null,
            newValue: modVal,
            changeType: 'added',
          });
        } else if (modVal === undefined) {
          differences.push({
            field: key,
            originalValue: origVal,
            newValue: null,
            changeType: 'removed',
          });
        } else if (JSON.stringify(origVal) !== JSON.stringify(modVal)) {
          differences.push({
            field: key,
            originalValue: origVal,
            newValue: modVal,
            changeType: 'modified',
          });
        }
      }
      return {
        comparison: {
          original: mapVersionRow(original),
          modified: mapVersionRow(modified),
          differences,
        },
      };
    }
  );
};
