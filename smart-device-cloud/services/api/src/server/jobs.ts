import { FastifyPluginAsync } from 'fastify';
import { randomUUID } from 'node:crypto';
import { run, all, get } from '../db/database.ts';
import { CreateJobBodySchema, JobIdParamsSchema } from '../schemas/index.ts';
import { requirePermission, PERMISSIONS } from '../middleware/auth.middleware.ts';

export const jobRoutes: FastifyPluginAsync = async fastify => {
  fastify.get(
    '/jobs',
    {
      schema: {
        description: 'List scheduled jobs',
        tags: ['jobs'],
        response: { 200: { type: 'array', items: { type: 'object' } } },
      },
      preHandler: [requirePermission(PERMISSIONS.READ_WORKLOADS)],
    },
    async () => {
      return all('SELECT * FROM scheduled_jobs');
    }
  );

  fastify.post(
    '/jobs',
    {
      schema: {
        description: 'Create scheduled job',
        tags: ['jobs'],
        body: CreateJobBodySchema,
        response: { 201: { type: 'object' } },
      },
      preHandler: [requirePermission(PERMISSIONS.WRITE_WORKLOADS)],
    },
    async (request, reply) => {
      const body = request.body as any;
      const id = crypto.randomUUID();
      run(
        `INSERT INTO scheduled_jobs (id, name, cron, timezone, enabled, task_template, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          body.name,
          body.cron,
          body.timezone ?? 'UTC',
          body.enabled ? 1 : 0,
          JSON.stringify(body.taskTemplate ?? {}),
          new Date().toISOString(),
          new Date().toISOString(),
        ]
      );
      return reply.status(201).send({ id, ...body });
    }
  );

  fastify.put(
    '/jobs/:id',
    {
      schema: {
        description: 'Update scheduled job',
        tags: ['jobs'],
        params: JobIdParamsSchema,
        body: CreateJobBodySchema,
        response: { 200: { type: 'object' } },
      },
      preHandler: [requirePermission(PERMISSIONS.WRITE_WORKLOADS)],
    },
    async request => {
      const { id } = request.params as { id: string };
      const body = request.body as any;
      run(
        `UPDATE scheduled_jobs SET name = ?, cron = ?, timezone = ?, enabled = ?, task_template = ?, updated_at = ? WHERE id = ?`,
        [
          body.name,
          body.cron,
          body.timezone ?? 'UTC',
          body.enabled ? 1 : 0,
          JSON.stringify(body.taskTemplate ?? {}),
          new Date().toISOString(),
          id,
        ]
      );
      return { id, ...body };
    }
  );

  fastify.delete(
    '/jobs/:id',
    {
      schema: {
        description: 'Delete scheduled job',
        tags: ['jobs'],
        params: JobIdParamsSchema,
        response: { 200: { type: 'object' } },
      },
      preHandler: [requirePermission(PERMISSIONS.WRITE_WORKLOADS)],
    },
    async request => {
      const { id } = request.params as { id: string };
      run('DELETE FROM scheduled_jobs WHERE id = ?', [id]);
      return { success: true };
    }
  );
};
