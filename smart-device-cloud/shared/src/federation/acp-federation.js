const _clients = new Map();
let messageId = 0;
export function registerAcpClient(client) {
  if (!client.id.trim() || !client.endpoint.startsWith('https://'))
    throw new Error('ACP client requires an HTTPS endpoint');
  _clients.set(client.id, {
    ...client,
    capabilities: [...client.capabilities],
    enabled: client.enabled ?? true,
  });
}
export function unregisterAcpClient(id) {
  return _clients.delete(id);
}
export function getAcpClient(id) {
  const client = _clients.get(id);
  return client ? { ...client, capabilities: [...client.capabilities] } : undefined;
}
export function listAcpClients() {
  return Array.from(_clients.values()).map(client => ({
    ...client,
    capabilities: [...client.capabilities],
  }));
}
export async function sendAcpMessage(clientId, message, token, fromAgentId) {
  const client = _clients.get(clientId);
  if (!client) throw new Error(`ACP client not found: ${clientId}`);
  if (client.enabled === false) throw new Error(`ACP client is disabled: ${clientId}`);
  messageId += 1;
  const envelope = {
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
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`ACP message failed: ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timer);
  }
}
export class AcpFederationClient {
  clientId;
  token;
  agentId;
  constructor(clientId, token, agentId) {
    this.clientId = clientId;
    this.token = token;
    this.agentId = agentId;
  }
  send(message) {
    return sendAcpMessage(this.clientId, message, this.token, this.agentId);
  }
}
//# sourceMappingURL=acp-federation.js.map
