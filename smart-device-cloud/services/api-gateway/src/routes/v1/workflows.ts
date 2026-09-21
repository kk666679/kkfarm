/**
 * REST /api/v1/workflows — EXTERNAL/PUBLIC
 *
 * Consumed by: third-party integrations, mobile clients, partner APIs, SDK.
 * Authentication: Bearer token (OAuth 2.0 / API key).
 * Versioning: /api/v1/
 */
import type { FastifyPluginAsync } from 'fastify';

export const workflowRoutes: FastifyPluginAsync = async app => {
  // GET /api/v1/workflows
  app.get('/workflows', { preHandler: [app.authenticate] }, async req => {
    const { status, limit, offset } = (req.query ?? {}) as Record<string, string>;
    return app.adapters.internal.request('/workflows', {
      query: {
        ...(status && { status }),
        limit: limit ?? '50',
        offset: offset ?? '0',
      },
      requestId: req.id,
    });
  });

  // GET /api/v1/workflows/:id
  app.get('/workflows/:id', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      return await app.adapters.internal.request(`/workflows/${id}`, { requestId: req.id });
    } catch {
      return reply.code(404).send({
        type: 'https://api.sdc.dev/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: `Workflow ${id} not found`,
        requestId: req.id,
      });
    }
  });

  // POST /api/v1/workflows
  app.post(
    '/workflows',
    { preHandler: [app.authenticate, app.requirePermission('workflow:write')] },
    async (req, reply) => {
      const result = await app.adapters.internal.request('/workflows', {
        method: 'POST',
        body: req.body,
        requestId: req.id,
      });
      return reply.code(201).send(result);
    }
  );

  // PATCH /api/v1/workflows/:id
  app.patch(
    '/workflows/:id',
    { preHandler: [app.authenticate, app.requirePermission('workflow:write')] },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      try {
        return await app.adapters.internal.request(`/workflows/${id}`, {
          method: 'PATCH',
          body: req.body,
          requestId: req.id,
        });
      } catch {
        return reply.code(404).send({
          type: 'https://api.sdc.dev/errors/not-found',
          title: 'Not Found',
          status: 404,
          detail: `Workflow ${id} not found`,
          requestId: req.id,
        });
      }
    }
  );

  // DELETE /api/v1/workflows/:id
  app.delete(
    '/workflows/:id',
    { preHandler: [app.authenticate, app.requirePermission('workflow:write')] },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      await app.adapters.internal.request(`/workflows/${id}`, {
        method: 'DELETE',
        requestId: req.id,
      });
      return reply.code(204).send();
    }
  );

  // POST /api/v1/workflows/:id/execute
  app.post(
    '/workflows/:id/execute',
    { preHandler: [app.authenticate, app.requirePermission('workflow:execute')] },
    async req => {
      const { id } = req.params as { id: string };
      return app.adapters.internal.request(`/workflows/${id}/execute`, {
        method: 'POST',
        body: req.body,
        requestId: req.id,
      });
    }
  );

  // GET /api/v1/workflows/:id/executions
  app.get('/workflows/:id/executions', { preHandler: [app.authenticate] }, async req => {
    const { id } = req.params as { id: string };
    const { limit, offset } = (req.query ?? {}) as Record<string, string>;
    return app.adapters.internal.request(`/workflows/${id}/executions`, {
      query: { limit: limit ?? '50', offset: offset ?? '0' },
      requestId: req.id,
    });
  });
};
