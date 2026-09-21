import type { ConnectivityState, RemoteSession } from '../types';

export class ConnectivityOptimizer {
  optimize(session: RemoteSession, latencyMs: number, packetLossPercent: number): RemoteSession {
    const connectivity: ConnectivityState =
      latencyMs > 500 || packetLossPercent > 10
        ? 'offline'
        : latencyMs > 200 || packetLossPercent > 4
          ? 'degraded'
          : 'online';
    return { ...session, connectivity, lastActive: new Date().toISOString() };
  }
}
