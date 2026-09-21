import type { McpServerCapabilities, McpServerInfo } from '../types';
import type { McpOAuthValidator } from '../auth/oauth-validator';
import type { McpToolRegistry } from '../tools/registry';
import type { ExtensionRegistry } from '../extensions/registry';
import { MCP_PROTOCOL_VERSION } from '../discovery/protocol-version';

export interface McpServerConfig {
  serverInfo: McpServerInfo;
  capabilities: McpServerCapabilities;
  auth: McpOAuthValidator;
  toolRegistry: McpToolRegistry;
  extensions: ExtensionRegistry;
  requireAuth: boolean;
  requireTls: boolean;
  maxRequestSize: number;
  requestTimeoutMs: number;
  instanceId: string;
}

export class McpServer {
  readonly config: Readonly<McpServerConfig>;

  constructor(config: McpServerConfig) {
    this.config = {
      ...config,
      requireAuth: config.requireAuth ?? true,
      requireTls: config.requireTls ?? false,
      maxRequestSize: config.maxRequestSize ?? 1024 * 1024,
      requestTimeoutMs: config.requestTimeoutMs ?? 30000,
      instanceId: config.instanceId ?? `mcp-${Date.now()}`,
    } as McpServerConfig;
  }

  get serverInfo(): McpServerInfo {
    return this.config.serverInfo;
  }

  get capabilities(): McpServerCapabilities {
    return this.config.capabilities;
  }

  get protocolVersion(): string {
    return MCP_PROTOCOL_VERSION;
  }

  get tools() {
    return this.config.toolRegistry;
  }

  get auth() {
    return this.config.auth;
  }

  get extensions() {
    return this.config.extensions;
  }

  listTools() {
    return this.config.toolRegistry.list();
  }

  async handleRequest(request: unknown): Promise<unknown> {
    const { jsonrpc, id, method, params } = request as {
      jsonrpc: string;
      id?: string | number | null;
      method?: string;
      params?: Record<string, unknown>;
    };

    if (jsonrpc !== '2.0') {
      return { jsonrpc: '2.0', id, error: { code: -32600, message: 'Invalid Request' } };
    }

    const requestId = id ?? null;

    if (!method) {
      return {
        jsonrpc: '2.0',
        id: requestId,
        error: { code: -32600, message: 'Invalid Request: missing method' },
      };
    }

    switch (method) {
      case 'initialize':
        return this.handleInitialize(requestId);
      case 'tools/list':
        return this.handleListTools(requestId);
      case 'tools/call':
        return await this.handleToolCall(requestId, params);
      case 'server/discover':
        return this.handleDiscover(requestId);
      default:
        return {
          jsonrpc: '2.0',
          id: requestId,
          error: { code: -32601, message: `Method not found: ${method}` },
        };
    }
  }

  private handleInitialize(id: string | number | null) {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: this.protocolVersion,
        serverInfo: this.serverInfo,
        capabilities: this.capabilities,
      },
    };
  }

  private handleListTools(id: string | number | null) {
    const tools = this.listTools();
    return {
      jsonrpc: '2.0',
      id,
      result: {
        tools: tools.map(t => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
          annotations: t.annotations,
        })),
      },
    };
  }

  private async handleToolCall(
    id: string | number | null,
    params: Record<string, unknown> | undefined
  ) {
    if (!params || typeof params.name !== 'string') {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32602, message: 'Missing tool name in params' },
      };
    }

    const toolName = params.name;
    const tool = this.config.toolRegistry.get(toolName);
    if (!tool) {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32602, message: `Tool not found: ${toolName}` },
      };
    }

    const requiredScopes = this.config.toolRegistry.getRequiredScopes(toolName);
    if (this.config.requireAuth && requiredScopes.length > 0) {
      const context = params.__authContext as { scopes?: string[] };
      if (context?.scopes) {
        const missing = requiredScopes.filter(s => !context.scopes!.includes(s));
        if (missing.length > 0) {
          return {
            jsonrpc: '2.0',
            id,
            error: { code: -32008, message: `Insufficient scopes: missing ${missing.join(', ')}` },
          };
        }
      }
    }

    try {
      const arguments_ = (params.arguments ?? {}) as Record<string, unknown>;
      const result = await tool.execute(arguments_, {
        ...((params as { __userId?: string }).__userId
          ? { userId: (params as { __userId?: string }).__userId }
          : {}),
        ...((params as { __tenantId?: string }).__tenantId
          ? { tenantId: (params as { __tenantId?: string }).__tenantId }
          : {}),
      });

      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(result) }],
          isError: false,
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { jsonrpc: '2.0', id, error: { code: -32005, message } };
    }
  }

  private handleDiscover(id: string | number | null) {
    const tools = this.listTools();
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: this.protocolVersion,
        serverInfo: this.serverInfo,
        capabilities: this.capabilities,
        tools: tools.map(t => ({
          name: t.name,
          description: t.description,
          annotations: t.annotations,
          requiredScopes: t.requiredScopes,
        })),
        extensions: [],
      },
    };
  }
}

export function createServer(config: McpServerConfig): McpServer {
  return new McpServer(config);
}
