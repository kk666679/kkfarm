import type { BrowserProfile, BrowserSession } from '../types';

export class BrowserSessionIsolation {
  private readonly profileSessions = new Map<string, Set<string>>();

  register(session: BrowserSession, profile: BrowserProfile): void {
    const sessions = this.profileSessions.get(profile.id) ?? new Set<string>();
    sessions.add(session.id);
    this.profileSessions.set(profile.id, sessions);
  }

  sessionsFor(profileId: string): string[] {
    return Array.from(this.profileSessions.get(profileId) ?? []);
  }

  assertExclusive(session: BrowserSession, profile: BrowserProfile): void {
    const sessions = this.sessionsFor(profile.id);
    if (sessions.some(id => id !== session.id))
      throw new Error('Browser profile is already in use');
  }

  unregister(session: BrowserSession): void {
    const sessions = this.profileSessions.get(session.profileId);
    sessions?.delete(session.id);
  }
}
