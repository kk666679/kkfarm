const _registry = new Map();
let requestId = 0;
export function registerRemoteMcpServer(server) {
  if (!server.id.trim() || !server.endpoint.startsWith('https://'))
    throw new Error('Remote MCP server requires an HTTPS endpoint');
  _registry.set(server.id, {
    ...server,
    scopes: [...server.scopes],
    capabilities: server.capabilities ? [...server.capabilities] : undefined,
    enabled: server.enabled ?? true,
  });
}
export function unregisterRemoteMcpServer(id) {
  return _registry.delete(id);
}
export function getRemoteMcpServer(id) {
  const server = _registry.get(id);
  return server
    ? {
        ...server,
        scopes: [...server.scopes],
        capabilities: server.capabilities ? [...server.capabilities] : undefined,
      }
    : undefined;
}
export function listRemoteMcpServers() {
  return Array.from(_registry.values()).map(server => ({
    ...server,
    scopes: [...server.scopes],
    capabilities: server.capabilities ? [...server.capabilities] : undefined,
  }));
}
export async function federateToolCall(serverId, toolName, args, token, requiredScope) {
  const server = _registry.get(serverId);
  if (!server) throw new Error(`Remote MCP server not found: ${serverId}`);
  if (server.enabled === false) throw new Error(`Remote MCP server is disabled: ${serverId}`);
  if (requiredScope && !server.scopes.includes(requiredScope))
    throw new Error(`Remote MCP server lacks scope: ${requiredScope}`);
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), server.timeoutMs ?? 10000);
  requestId += 1;
  try {
    const response = await fetch(server.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: requestId,
        method: 'tools/call',
        params: { name: toolName, arguments: args },
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Federation call failed: ${response.status}`);
    const payload = await response.json();
    if (payload.error) throw new Error(payload.error.message ?? 'Remote MCP tool failed');
    return { serverId, toolName, result: payload.result, durationMs: Date.now() - started };
  } finally {
    clearTimeout(timer);
  }
}
export class McpFederationClient {
  serverId;
  token;
  constructor(serverId, token) {
    this.serverId = serverId;
    this.token = token;
  }
  callTool(toolName, args, requiredScope) {
    return federateToolCall(this.serverId, toolName, args, this.token, requiredScope);
  }
  listServers() {
    return listRemoteMcpServers();
  }
}
//# sourceMappingURL=mcp-federation.js.map
