import type { RemoteSession, StreamQuality } from '../types';

export class StreamQualityAdapter {
  adjust(session: RemoteSession, latencyMs: number, packetLossPercent: number): StreamQuality {
    if (latencyMs > 250 || packetLossPercent > 5) return 'low';
    if (latencyMs > 120 || packetLossPercent > 2) return 'medium';
    return 'high';
  }

  apply(session: RemoteSession, latencyMs: number, packetLossPercent: number): RemoteSession {
    if (session.quality !== 'adaptive') return session;
    return {
      ...session,
      quality: this.adjust(session, latencyMs, packetLossPercent),
      lastActive: new Date().toISOString(),
    };
  }
}
