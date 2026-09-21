/**
 * REST /api/v1/workloads — EXTERNAL/PUBLIC
 *
 * Consumed by: third-party integrations, mobile clients, partner APIs, SDK.
 * Authentication: Bearer token (OAuth 2.0 / API key).
 * Versioning: /api/v1/
 */
import type { FastifyPluginAsync } from 'fastify';

export const workloadRoutes: FastifyPluginAsync = async app => {
  // GET /api/v1/workloads
  app.get('/workloads', { preHandler: [app.authenticate] }, async req => {
    const { status, limit, offset } = (req.query ?? {}) as Record<string, string>;
    return app.adapters.workload.request('/workloads', {
      query: { ...(status && { status }), limit: limit ?? '50', offset: offset ?? '0' },
      requestId: req.id,
    });
  });

  // GET /api/v1/workloads/:id
  app.get('/workloads/:id', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      return await app.adapters.workload.request(`/workloads/${id}`, { requestId: req.id });
    } catch {
      return reply.code(404).send({
        type: 'https://api.sdc.dev/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: `Workload ${id} not found`,
        requestId: req.id,
      });
    }
  });

  // POST /api/v1/workloads
  app.post(
    '/workloads',
    { preHandler: [app.authenticate, app.requirePermission('workload:write')] },
    async (req, reply) => {
      const result = await app.adapters.workload.request('/workloads', {
        method: 'POST',
        body: req.body,
        requestId: req.id,
      });
      return reply.code(201).send(result);
    }
  );

  // POST /api/v1/workloads/:id/start
  app.post(
    '/workloads/:id/start',
    { preHandler: [app.authenticate, app.requirePermission('workload:write')] },
    async req => {
      const { id } = req.params as { id: string };
      return app.adapters.workload.request(`/workloads/${id}/start`, {
        method: 'POST',
        requestId: req.id,
      });
    }
  );

  // POST /api/v1/workloads/:id/stop
  app.post(
    '/workloads/:id/stop',
    { preHandler: [app.authenticate, app.requirePermission('workload:write')] },
    async req => {
      const { id } = req.params as { id: string };
      return app.adapters.workload.request(`/workloads/${id}/stop`, {
        method: 'POST',
        requestId: req.id,
      });
    }
  );

  // DELETE /api/v1/workloads/:id
  app.delete(
    '/workloads/:id',
    { preHandler: [app.authenticate, app.requirePermission('workload:write')] },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      await app.adapters.workload.request(`/workloads/${id}`, {
        method: 'DELETE',
        requestId: req.id,
      });
      return reply.code(204).send();
    }
  );
};
