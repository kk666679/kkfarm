export interface RemoteMcpServer {
  id: string;
  name: string;
  endpoint: string;
  protocolVersion: string;
  scopes: string[];
  trustLevel: 'full' | 'partial' | 'untrusted';
  capabilities?: string[];
  timeoutMs?: number;
  enabled?: boolean;
}

export interface FederatedToolResult {
  serverId: string;
  toolName: string;
  result: unknown;
  durationMs: number;
}

const _registry = new Map<string, RemoteMcpServer>();
let requestId = 0;

export function registerRemoteMcpServer(server: RemoteMcpServer): void {
  if (!server.id.trim() || !server.endpoint.startsWith('https://'))
    throw new Error('Remote MCP server requires an HTTPS endpoint');
  _registry.set(server.id, {
    ...server,
    scopes: [...server.scopes],
    capabilities: server.capabilities ? [...server.capabilities] : undefined,
    enabled: server.enabled ?? true,
  });
}

export function unregisterRemoteMcpServer(id: string): boolean {
  return _registry.delete(id);
}

export function getRemoteMcpServer(id: string): RemoteMcpServer | undefined {
  const server = _registry.get(id);
  return server
    ? {
        ...server,
        scopes: [...server.scopes],
        capabilities: server.capabilities ? [...server.capabilities] : undefined,
      }
    : undefined;
}

export function listRemoteMcpServers(): RemoteMcpServer[] {
  return Array.from(_registry.values()).map(server => ({
    ...server,
    scopes: [...server.scopes],
    capabilities: server.capabilities ? [...server.capabilities] : undefined,
  }));
}

export async function federateToolCall(
  serverId: string,
  toolName: string,
  args: Record<string, unknown>,
  token: string,
  requiredScope?: string
): Promise<FederatedToolResult> {
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
      signal: controller.signal as globalThis.AbortSignal,
    });
    if (!response.ok) throw new Error(`Federation call failed: ${response.status}`);
    const payload = (await response.json()) as { error?: { message?: string }; result?: unknown };
    if (payload.error) throw new Error(payload.error.message ?? 'Remote MCP tool failed');
    return { serverId, toolName, result: payload.result, durationMs: Date.now() - started };
  } finally {
    clearTimeout(timer);
  }
}

export class McpFederationClient {
  constructor(
    private readonly serverId: string,
    private readonly token: string
  ) {}

  callTool(
    toolName: string,
    args: Record<string, unknown>,
    requiredScope?: string
  ): Promise<FederatedToolResult> {
    return federateToolCall(this.serverId, toolName, args, this.token, requiredScope);
  }

  listServers(): RemoteMcpServer[] {
    return listRemoteMcpServers();
  }
}
