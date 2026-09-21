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

const _clients = new Map<string, AcpClient>();
let messageId = 0;

export function registerAcpClient(client: AcpClient): void {
  if (!client.id.trim() || !client.endpoint.startsWith('https://'))
    throw new Error('ACP client requires an HTTPS endpoint');
  _clients.set(client.id, {
    ...client,
    capabilities: [...client.capabilities],
    enabled: client.enabled ?? true,
  });
}

export function unregisterAcpClient(id: string): boolean {
  return _clients.delete(id);
}

export function getAcpClient(id: string): AcpClient | undefined {
  const client = _clients.get(id);
  return client ? { ...client, capabilities: [...client.capabilities] } : undefined;
}

export function listAcpClients(): AcpClient[] {
  return Array.from(_clients.values()).map(client => ({
    ...client,
    capabilities: [...client.capabilities],
  }));
}

export async function sendAcpMessage(
  clientId: string,
  message: Record<string, unknown>,
  token: string,
  fromAgentId?: string
): Promise<unknown> {
  const client = _clients.get(clientId);
  if (!client) throw new Error(`ACP client not found: ${clientId}`);
  if (client.enabled === false) throw new Error(`ACP client is disabled: ${clientId}`);
  messageId += 1;
  const envelope: AcpMessage = {
    id: `acp-${Date.now()}-${messageId}`,
    type: String(message.type ?? 'message'),
    from: fromAgentId ?? client.agentId,
    to: client.agentId,
    payload: { ...message },
    sentAt: new Date().toISOString(),
  };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), client.timeoutMs ?? 10000);
  try {
    const response = await fetch(`${client.endpoint}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(envelope),
      signal: controller.signal as globalThis.AbortSignal,
    });
    if (!response.ok) throw new Error(`ACP message failed: ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

export class AcpFederationClient {
  constructor(
    private readonly clientId: string,
    private readonly token: string,
    private readonly agentId: string
  ) {}

  send(message: Record<string, unknown>): Promise<unknown> {
    return sendAcpMessage(this.clientId, message, this.token, this.agentId);
  }
}
