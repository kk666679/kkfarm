import type { FastifyInstance, FastifyRequest } from 'fastify';
import client from 'prom-client';
import { all } from '../db/database.ts';

export function registerPrometheusRoute(app: FastifyInstance) {
  app.get('/metrics', { logLevel: 'info' }, async (_request, reply) => {
    reply.header('Content-Type', client.register.contentType);
    return reply.send(await client.register.metrics());
  });
}

export function trackHttpMetrics(app: FastifyInstance) {
  const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  });

  app.addHook('onResponse', async (request, reply) => {
    const route = (request as any).routerPath || request.url;
    httpRequestDuration.observe(
      {
        method: request.method,
        route,
        status_code: reply.statusCode,
      },
      (reply.elapsedTime ?? 0) / 1000
    );
  });
}

const deviceGauge = new client.Gauge({
  name: 'devices_total',
  help: 'Total number of devices',
  labelNames: ['status'],
});

const taskGauge = new client.Gauge({
  name: 'tasks_total',
  help: 'Total number of tasks',
  labelNames: ['status'],
});

export function updateDeviceMetrics(devices: Array<{ status: string }>) {
  const counts: Record<string, number> = {};
  for (const d of devices) {
    counts[d.status] = (counts[d.status] || 0) + 1;
  }
  for (const [status, count] of Object.entries(counts)) {
    deviceGauge.set({ status }, count);
  }
  deviceGauge.set({}, devices.length);
}

export function updateTaskMetrics(tasks: Array<{ status: string }>) {
  const counts: Record<string, number> = {};
  for (const t of tasks) {
    counts[t.status] = (counts[t.status] || 0) + 1;
  }
  for (const [status, count] of Object.entries(counts)) {
    taskGauge.set({ status }, count);
  }
  taskGauge.set({}, tasks.length);
}
