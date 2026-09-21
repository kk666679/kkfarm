import type { Adapter, AdapterRequestOptions } from './base.adapter.js';

export class McpAdapter implements Adapter {
  readonly name = 'mcp';

  constructor(
    private readonly servers: Record<string, string>,
    private readonly token: string
  ) {}

  async health(): Promise<{ healthy: boolean; details?: unknown }> {
    const results = await Promise.all(
      Object.entries(this.servers).map(async ([name, url]) => {
        try {
          const res = await fetch(`${url}/health`, {
            signal: AbortSignal.timeout(2000) as globalThis.AbortSignal,
          });
          return [name, res.ok] as const;
        } catch {
          return [name, false] as const;
        }
      })
    );
    return {
      healthy: results.every(([, ok]) => ok),
      details: Object.fromEntries(results),
    };
  }

  async request<T>(path: string, options: AdapterRequestOptions = {}): Promise<T> {
    const [, server, ...rest] = path.split('/');
    const baseUrl = this.servers[server ?? ''];
    if (!baseUrl) throw new Error(`Unknown MCP server: ${server}`);

    const res = await fetch(`${baseUrl}/mcp/${rest.join('/')}`, {
      method: options.method ?? 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    return (await res.json()) as T;
  }

  async listTools(): Promise<unknown> {
    const results = await Promise.all(
      Object.entries(this.servers).map(async ([name, url]) => {
        const res = await fetch(`${url}/mcp/tools`);
        return { server: name, tools: await res.json() };
      })
    );
    return results;
  }
}
