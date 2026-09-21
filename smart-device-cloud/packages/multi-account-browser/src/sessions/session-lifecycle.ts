import type { BrowserProfile, BrowserSession, BrowserSessionState } from '../types';

export class BrowserSessionLifecycle {
  static canTransition(from: BrowserSessionState, to: BrowserSessionState): boolean {
    const transitions: Record<BrowserSessionState, BrowserSessionState[]> = {
      starting: ['ready', 'error', 'closed'],
      ready: ['active', 'idle', 'closed', 'error'],
      active: ['idle', 'closed', 'error'],
      idle: ['active', 'closed', 'error'],
      closed: [],
      error: ['closed'],
    };
    return transitions[from]?.includes(to) ?? false;
  }

  static transition(
    session: BrowserSession,
    next: BrowserSessionState,
    profile: BrowserProfile
  ): BrowserSession {
    if (!BrowserSessionLifecycle.canTransition(session.state, next))
      throw new Error(`Invalid browser session transition: ${session.state} -> ${next}`);
    return {
      ...session,
      state: next,
      lastActive: new Date().toISOString(),
      ...(session.cookies ? { cookies: [...session.cookies] } : {}),
    };
  }
}

export class BrowserSessionRecovery {
  recover(session: BrowserSession, profile: BrowserProfile): BrowserSession {
    if (session.state === 'closed' || session.state === 'error')
      throw new Error('Session cannot be recovered');
    return {
      ...session,
      state: 'ready',
      lastActive: new Date().toISOString(),
      cookies: session.cookies ? [...session.cookies] : [],
    };
  }
}

export function sessionStorageKey(sessionId: string): string {
  return `browser-session:${sessionId}`;
}
