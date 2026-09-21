export interface AcpClient {
  id: string;
  name: string;
  endpoint: string;
  agentId: string;
  capabilities: string[];
  timeoutMs?: number;
  enabled?: boolean;
}
export interface AcpMessage {
  id: string;
  type: string;
  from: string;
  to: string;
  payload: Record<string, unknown>;
  sentAt: string;
}
export declare function registerAcpClient(client: AcpClient): void;
export declare function unregisterAcpClient(id: string): boolean;
export declare function getAcpClient(id: string): AcpClient | undefined;
export declare function listAcpClients(): AcpClient[];
export declare function sendAcpMessage(
  clientId: string,
  message: Record<string, unknown>,
  token: string,
  fromAgentId?: string
): Promise<unknown>;
export declare class AcpFederationClient {
  private readonly clientId;
  private readonly token;
  private readonly agentId;
  constructor(clientId: string, token: string, agentId: string);
  send(message: Record<string, unknown>): Promise<unknown>;
}
//# sourceMappingURL=acp-federation.d.ts.map
