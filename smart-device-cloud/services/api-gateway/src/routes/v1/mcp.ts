import type { FastifyPluginAsync } from 'fastify';
import type { McpAdapter } from '../../adapters/mcp.adapter.js';

export const mcpFacadeRoutes: FastifyPluginAsync = async app => {
  app.get('/mcp/tools', { preHandler: [app.authenticate] }, async req => {
    return (app.adapters.mcp as McpAdapter).listTools();
  });

  app.post('/mcp/:server/:tool', { preHandler: [app.authenticate] }, async req => {
    const { server, tool } = req.params as { server: string; tool: string };
    return app.adapters.mcp.request(`/${server}/${tool}`, {
      method: 'POST',
      body: req.body,
      requestId: req.id,
    });
  });
};
