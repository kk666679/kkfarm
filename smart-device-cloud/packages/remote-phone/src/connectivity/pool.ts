import type { ConnectivityState, RemoteSession } from '../types';

export class ConnectivityPool {
  private readonly connections = new Map<string, ConnectivityState>();

  add(id: string, state: ConnectivityState = 'online'): void {
    this.connections.set(id, state);
  }

  healthy(): string[] {
    return Array.from(this.connections.entries())
      .filter(([, state]) => state === 'online')
      .map(([id]) => id);
  }

  setState(id: string, state: ConnectivityState): void {
    this.connections.set(id, state);
  }

  select(session: RemoteSession): string {
    const healthy = this.healthy();
    if (healthy.length === 0) throw new Error('No remote connectivity available');
    return healthy[0] ?? session.deviceId;
  }
}
