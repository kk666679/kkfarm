import type { RemoteSession, RemoteSessionInput, RemoteSessionState } from '../types';

export class RemoteSessionLifecycle {
  static canTransition(from: RemoteSessionState, to: RemoteSessionState): boolean {
    const transitions: Record<RemoteSessionState, RemoteSessionState[]> = {
      starting: ['active', 'idle', 'error', 'closed'],
      active: ['idle', 'paused', 'error', 'closed'],
      idle: ['active', 'paused', 'error', 'closed'],
      paused: ['active', 'idle', 'error', 'closed'],
      error: ['closed'],
      closed: [],
    };
    return transitions[from]?.includes(to) ?? false;
  }

  static transition(session: RemoteSession, next: RemoteSessionState): RemoteSession {
    if (!RemoteSessionLifecycle.canTransition(session.state, next))
      throw new Error(`Invalid remote session transition: ${session.state} -> ${next}`);
    return {
      ...session,
      state: next,
      active: next !== 'closed',
      lastActive: new Date().toISOString(),
    };
  }
}

export class RemoteSessionManager {
  private readonly sessions = new Map<string, RemoteSession>();

  create(input: RemoteSessionInput): RemoteSession {
    if (!input.deviceId.trim() || !input.userId.trim())
      throw new Error('Device and user IDs are required');
    const now = new Date().toISOString();
    const session: RemoteSession = {
      id: `remote-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      deviceId: input.deviceId,
      userId: input.userId,
      permissions: [...new Set(input.permissions)],
      createdAt: now,
      lastActive: now,
      active: true,
      state: 'starting',
      connectivity: 'online',
      quality: input.quality ?? 'adaptive',
    };
    this.sessions.set(session.id, session);
    return this.activate(session.id);
  }

  activate(id: string): RemoteSession {
    const session = this.sessions.get(id);
    if (!session) throw new Error(`Remote session not found: ${id}`);
    const active = RemoteSessionLifecycle.transition(session, 'active');
    this.sessions.set(id, active);
    return { ...active, permissions: [...active.permissions] };
  }

  close(id: string): RemoteSession {
    const session = this.sessions.get(id);
    if (!session) throw new Error(`Remote session not found: ${id}`);
    const closed = RemoteSessionLifecycle.transition(session, 'closed');
    this.sessions.set(id, closed);
    return { ...closed, permissions: [...closed.permissions] };
  }

  get(id: string): RemoteSession | undefined {
    const session = this.sessions.get(id);
    return session ? { ...session, permissions: [...session.permissions] } : undefined;
  }

  list(deviceId?: string): RemoteSession[] {
    return Array.from(this.sessions.values())
      .filter(session => !deviceId || session.deviceId === deviceId)
      .map(session => ({ ...session, permissions: [...session.permissions] }));
  }
}
