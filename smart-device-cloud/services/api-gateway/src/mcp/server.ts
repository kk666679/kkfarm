import type { FastifyInstance } from 'fastify';

export async function createMcpServer(app: FastifyInstance) {
  const upstreamServers = app.gatewayConfig.mcpServers;

  return {
    async handleRequest(rawReq: any, rawRes: any, body: any) {
      const method = body?.method;

      if (method === 'server/discover') {
        return send(rawRes, {
          jsonrpc: '2.0',
          id: body.id,
          result: {
            protocolVersion: '2026-07-28',
            serverInfo: { name: 'sdc-gateway', version: '1.0.0' },
            capabilities: { tools: { listChanged: true } },
          },
        });
      }

      if (method === 'tools/list') {
        const tools: unknown[] = [];
        for (const [serverName, url] of Object.entries(upstreamServers)) {
          try {
            const res = await fetch(`${url}/mcp`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${app.gatewayConfig.mcpToken}`,
              },
              body: JSON.stringify({ method: 'tools/list' }),
            });
            const data = (await res.json()) as { result?: { tools?: unknown[] } };
            for (const tool of data.result?.tools ?? []) {
              tools.push({ ...(tool as object), name: `${serverName}.${(tool as any).name}` });
            }
          } catch (error) {
            app.log.warn({ serverName, error }, 'MCP federation failed');
          }
        }
        return send(rawRes, { jsonrpc: '2.0', id: body.id, result: { tools } });
      }

      return send(rawRes, {
        jsonrpc: '2.0',
        id: body.id,
        error: { code: -32601, message: `Unknown method: ${method}` },
      });
    },
  };
}

function send(res: any, payload: unknown) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}
