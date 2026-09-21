import type { FastifyInstance } from 'fastify';

export async function registerHealth(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => ({
    status: 'ok',
    version: process.env.npm_package_version ?? '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }));

  app.get('/ready', async (req, reply) => {
    const adapters = app.adapters;
    const health = await Promise.all(
      Object.entries(adapters).map(
        async ([name, adapter]) => [name, await adapter.health()] as const
      )
    );
    const allHealthy = health.every(([, h]) => h.healthy);

    return reply.code(allHealthy ? 200 : 503).send({
      ready: allHealthy,
      adapters: Object.fromEntries(health),
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/metrics', async (req, reply) => {
    const { metricsRegistry } = await import('../observability/metrics.js');
    reply.header('Content-Type', 'text/plain; version=0.0.4');
    return metricsRegistry.metrics();
  });
}
