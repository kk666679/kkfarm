import { FastifyPluginAsync } from 'fastify';
import { all, get } from '../db/database.ts';
import { EventsQuerySchema } from '../schemas/index.ts';
import { requirePermission, PERMISSIONS } from '../middleware/auth.middleware.ts';

export const metricsRoutes: FastifyPluginAsync = async fastify => {
  fastify.get(
    '/metrics',
    {
      schema: {
        description: 'Get system metrics',
        tags: ['metrics'],
        response: {
          200: {
            type: 'object',
            properties: {
              devices: { type: 'object' },
              tasks: { type: 'object' },
              generatedAt: { type: 'string' },
            },
          },
        },
      },
      preHandler: [requirePermission(PERMISSIONS.READ_ANALYTICS)],
    },
    async () => {
      const deviceRows = all('SELECT status, COUNT(*) as count FROM devices GROUP BY status');
      const devices = {
        total: 0,
        online: 0,
        offline: 0,
        busy: 0,
        error: 0,
        starting: 0,
        stopping: 0,
      };
      for (const row of deviceRows as any[]) {
        devices.total += row.count;
        const key = row.status as keyof typeof devices;
        if (key in devices) {
          devices[key] = row.count;
        }
      }

      const taskRows = all(
        'SELECT status, COUNT(*) as count, AVG(COALESCE(julianday(completed_at) - julianday(started_at), 0)) as avg_duration FROM tasks GROUP BY status'
      );
      const tasks = {
        total: 0,
        queued: 0,
        running: 0,
        completed: 0,
        failed: 0,
        cancelled: 0,
        averageDurationSeconds: 0,
        successRate: 0,
      };
      let completedCount = 0;
      let failedCount = 0;
      let totalDurationSeconds = 0;
      let durationWeight = 0;
      for (const row of taskRows as any[]) {
        tasks.total += row.count;
        const key = row.status as keyof typeof tasks;
        if (
          key in tasks &&
          key !== 'total' &&
          key !== 'averageDurationSeconds' &&
          key !== 'successRate'
        ) {
          (tasks as any)[key] = row.count;
        }
        if (row.status === 'completed') {
          completedCount += row.count;
          if (row.avg_duration) {
            totalDurationSeconds += Number(row.avg_duration) * 86400;
            durationWeight += 1;
          }
        }
        if (row.status === 'failed') {
          failedCount += row.count;
        }
      }
      if (durationWeight > 0) {
        tasks.averageDurationSeconds = Number((totalDurationSeconds / durationWeight).toFixed(2));
      }
      const totalFinished = completedCount + failedCount;
      tasks.successRate =
        totalFinished > 0 ? Number(((completedCount / totalFinished) * 100).toFixed(2)) : 0;

      return {
        devices,
        tasks,
        generatedAt: new Date().toISOString(),
      };
    }
  );

  fastify.get(
    '/events',
    {
      schema: {
        description: 'Get task events',
        tags: ['events'],
        querystring: EventsQuerySchema,
        response: {
          200: {
            type: 'object',
            properties: {
              events: { type: 'array', items: { type: 'object' } },
            },
          },
        },
      },
      preHandler: [requirePermission(PERMISSIONS.READ_WORKLOADS)],
    },
    async request => {
      const since = (request.query as any)?.since as string | undefined;
      let query = 'SELECT * FROM task_events';
      const params: any[] = [];
      if (since) {
        query += ' WHERE timestamp > ?';
        params.push(since);
      }
      query += ' ORDER BY timestamp DESC LIMIT 200';
      const rows = all(query, params);
      return {
        events: rows.map((row: any) => ({
          id: row.id,
          taskId: row.task_id,
          event: row.event,
          data: JSON.parse(row.data || '{}'),
          timestamp: row.timestamp,
        })),
      };
    }
  );
};
