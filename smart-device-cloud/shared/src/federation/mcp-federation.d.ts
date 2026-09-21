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
export declare function registerRemoteMcpServer(server: RemoteMcpServer): void;
export declare function unregisterRemoteMcpServer(id: string): boolean;
export declare function getRemoteMcpServer(id: string): RemoteMcpServer | undefined;
export declare function listRemoteMcpServers(): RemoteMcpServer[];
export declare function federateToolCall(
  serverId: string,
  toolName: string,
  args: Record<string, unknown>,
  token: string,
  requiredScope?: string
): Promise<FederatedToolResult>;
export declare class McpFederationClient {
  private readonly serverId;
  private readonly token;
  constructor(serverId: string, token: string);
  callTool(
    toolName: string,
    args: Record<string, unknown>,
    requiredScope?: string
  ): Promise<FederatedToolResult>;
  listServers(): RemoteMcpServer[];
}
//# sourceMappingURL=mcp-federation.d.ts.map
