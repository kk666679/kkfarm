import type { WebSocket } from 'ws';

export class ConnectionManager {
  private readonly connections = new Map<string, WebSocket>();

  add(id: string, ws: WebSocket): void {
    this.connections.set(id, ws);
  }

  remove(id: string): void {
    this.connections.delete(id);
  }

  get(id: string): WebSocket | undefined {
    return this.connections.get(id);
  }

  count(): number {
    return this.connections.size;
  }
}
