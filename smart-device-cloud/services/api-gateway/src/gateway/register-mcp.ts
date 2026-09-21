import type { FastifyInstance } from 'fastify';

export async function registerMcp(app: FastifyInstance, opts: { prefix: string }): Promise<void> {
  const { createMcpServer } = await import('../mcp/server.js');
  const mcp = await createMcpServer(app);

  app.post(opts.prefix, async (req, reply) => {
    return mcp.handleRequest(req.raw, reply.raw, req.body);
  });

  app.get(`${opts.prefix}/health`, async () => ({
    status: 'ok',
    spec: '2026-07-28',
    stateless: true,
  }));
}
