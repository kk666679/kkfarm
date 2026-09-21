import WebSocket from 'ws';
import type { Adapter, AdapterRequestOptions } from './base.adapter.js';

export class AutoClawAdapter implements Adapter {
  readonly name = 'autoclaw';
  private ws: WebSocket | null = null;
  private readonly pending = new Map<string, (value: unknown) => void>();

  constructor(
    private readonly url: string,
    private readonly token: string | null
  ) {
    this.connect();
  }

  private connect(): void {
    const opts = this.token ? { headers: { Authorization: `Bearer ${this.token}` } } : {};
    this.ws = new WebSocket(this.url, opts);
    this.ws.on('open', () => console.log('[autoclaw] connected'));
    this.ws.on('close', () => setTimeout(() => this.connect(), 5000));
    this.ws.on('message', data => {
      const msg = JSON.parse(data.toString());
      const resolver = this.pending.get(msg.runId);
      if (resolver) {
        resolver(msg);
        this.pending.delete(msg.runId);
      }
    });
  }

  async health(): Promise<{ healthy: boolean }> {
    return { healthy: this.ws?.readyState === WebSocket.OPEN };
  }

  async request<T>(path: string, options: AdapterRequestOptions = {}): Promise<T> {
    const id = crypto.randomUUID();
    return new Promise<T>(resolve => {
      this.pending.set(id, resolve as (v: unknown) => void);
      this.ws?.send(JSON.stringify({ runId: id, path, ...options }));
    });
  }
}
