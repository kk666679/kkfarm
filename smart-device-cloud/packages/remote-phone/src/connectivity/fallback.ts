import type { RemoteSession } from '../types';

export class ConnectivityFallback {
  fallback(session: RemoteSession): RemoteSession {
    if (session.connectivity === 'online') return session;
    return {
      ...session,
      quality: 'low',
      connectivity: session.connectivity === 'offline' ? 'degraded' : session.connectivity,
      lastActive: new Date().toISOString(),
    };
  }
}
