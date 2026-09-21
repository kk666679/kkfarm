import { FastifyPluginAsync } from 'fastify';
import { randomUUID } from 'node:crypto';
import { run, all, get } from '../db/database.ts';
import type { TaskQueue } from '../workers/task-queue.ts';
import { CreateTaskBodySchema, TaskIdParamsSchema, TaskTypeSchema } from '../schemas/index.ts';
import { requirePermission, PERMISSIONS } from '../middleware/auth.middleware.ts';

export const taskRoutes: FastifyPluginAsync = async fastify => {
  fastify.get(
    '/tasks',
    {
      schema: {
        description: 'List tasks',
        tags: ['tasks'],
        response: { 200: { type: 'array', items: { type: 'object' } } },
      },
      preHandler: [requirePermission(PERMISSIONS.READ_WORKLOADS)],
    },
    async () => {
      return all('SELECT * FROM tasks ORDER BY created_at DESC');
    }
  );

  fastify.post(
    '/tasks',
    {
      schema: {
        description: 'Create task',
        tags: ['tasks'],
        body: CreateTaskBodySchema,
        response: { 201: { type: 'object' } },
      },
      preHandler: [requirePermission(PERMISSIONS.WRITE_WORKLOADS)],
    },
    async (request, reply) => {
      const body = request.body as any;
      const id = crypto.randomUUID();
      run(
        `INSERT INTO tasks (id, type, priority, payload, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          body.type,
          body.priority ?? 0,
          JSON.stringify(body.payload ?? {}),
          new Date().toISOString(),
          new Date().toISOString(),
        ]
      );
      return reply.status(201).send({
        id,
        type: body.type,
        status: 'queued',
        priority: body.priority ?? 0,
        payload: body.payload ?? {},
      });
    }
  );

  fastify.get(
    '/tasks/:id',
    {
      schema: {
        description: 'Get task',
        tags: ['tasks'],
        params: TaskIdParamsSchema,
        response: { 200: { type: 'object' } },
      },
      preHandler: [requirePermission(PERMISSIONS.READ_WORKLOADS)],
    },
    async request => {
      const { id } = request.params as { id: string };
      const task = get('SELECT * FROM tasks WHERE id = ?', [id]);
      if (!task) {
        throw new Error('Task not found');
      }
      return task;
    }
  );

  fastify.delete(
    '/tasks/:id',
    {
      schema: {
        description: 'Cancel task',
        tags: ['tasks'],
        params: TaskIdParamsSchema,
        response: { 200: { type: 'object' } },
      },
      preHandler: [requirePermission(PERMISSIONS.WRITE_WORKLOADS)],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      run('UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?', [
        'cancelled',
        new Date().toISOString(),
        id,
      ]);
      return { success: true };
    }
  );
};
