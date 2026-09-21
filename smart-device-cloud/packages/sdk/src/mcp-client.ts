export interface McpSdkConfig {
  endpoint: string;
  token: string;
}

export class McpSdkClient {
  constructor(private readonly config: McpSdkConfig) {}

  private async rpc<T>(method: string, params?: Record<string, unknown>): Promise<T> {
    const res = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.config.token}` },
      body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
    });
    if (!res.ok) throw new Error(`MCP HTTP ${res.status}`);
    const data = (await res.json()) as { result?: T; error?: { message: string } };
    if (data.error) throw new Error(data.error.message);
    return data.result as T;
  }

  discover() {
    return this.rpc<unknown>('server/discover');
  }

  listTools() {
    return this.rpc<{ tools: unknown[] }>('tools/list');
  }

  callTool(name: string, args: Record<string, unknown>) {
    return this.rpc<unknown>('tools/call', { name, arguments: args });
  }
}
