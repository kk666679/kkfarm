export interface AcpSdkConfig {
  endpoint: string;
  agentId: string;
  token: string;
}

export class AcpSdkClient {
  constructor(private readonly config: AcpSdkConfig) {}

  async sendMessage(message: Record<string, unknown>): Promise<unknown> {
    const res = await fetch(`${this.config.endpoint}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.config.token}` },
      body: JSON.stringify({ agentId: this.config.agentId, ...message }),
    });
    if (!res.ok) throw new Error(`ACP HTTP ${res.status}`);
    return res.json();
  }

  async getStatus(): Promise<unknown> {
    const res = await fetch(`${this.config.endpoint}/agents/${this.config.agentId}`, {
      headers: { Authorization: `Bearer ${this.config.token}` },
    });
    if (!res.ok) throw new Error(`ACP HTTP ${res.status}`);
    return res.json();
  }
}
