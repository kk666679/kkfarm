import fp from 'fastify-plugin';
import { metricsRegistry, httpDuration, httpTotal } from '../observability/metrics.js';

export default fp(async app => {
  app.addHook('onResponse', async (req, reply) => {
    const labels = {
      method: req.method,
      route: req.routeOptions?.url ?? req.url,
      status: String(reply.statusCode),
    };
    httpTotal.inc(labels);
    httpDuration.observe(labels, reply.elapsedTime / 1000);
  });

  app.decorate('metrics', {
    increment: (name: string, labels?: Record<string, string>) => {
      const counter = (metricsRegistry as any).getSingleMetric(name);
      counter?.inc(labels ?? {});
    },
  });
});

declare module 'fastify' {
  interface FastifyInstance {
    metrics: {
      increment: (name: string, labels?: Record<string, string>) => void;
    };
  }
}
