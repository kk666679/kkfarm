import { BrowserFingerprintGenerator } from './profiles/fingerprint';
import { BrowserProfileStore, BrowserProfileTemplateEngine } from './profiles/profile-store';
import { BrowserSessionIsolation } from './sessions/isolation';
import { BrowserSessionLifecycle, BrowserSessionRecovery } from './sessions/session-lifecycle';
import { InMemoryCookieCipher } from './cookies/encrypted-store';
import { CookieSync } from './cookies/sync';
import { ProxyPool } from './proxy/pool';
import { ProxyRotator } from './proxy/rotation';
import { BrowserAutomationRunner } from './automation/runner';
import { AutomationScheduler } from './automation/action-library';
import type { BrowserAction, BrowserManager, BrowserProfile, BrowserSession } from './types';

export * from './types';
export * from './profiles/profile-store';
export * from './profiles/fingerprint';
export * from './sessions/session-lifecycle';
export * from './sessions/isolation';
export * from './cookies/encrypted-store';
export * from './cookies/sync';
export * from './proxy/pool';
export * from './proxy/rotation';
export * from './proxy/health-check';
export * from './proxy/vault-client';
export * from './automation/runner';
export * from './automation/action-library';
export * from './automation/scheduling';
export * from './observability/tracer';
export * from './observability/metrics';

let sequence = 0;

function nextId(prefix: string): string {
  sequence += 1;
  return `${prefix}-${Date.now()}-${sequence}`;
}

export class InMemoryBrowserManager implements BrowserManager {
  readonly profiles = new Map<string, BrowserProfile>();
  readonly sessions = new Map<string, BrowserSession>();
  readonly profileStore: BrowserProfileStore;
  readonly templateEngine: BrowserProfileTemplateEngine;
  readonly fingerprintGenerator: BrowserFingerprintGenerator;
  readonly sessionIsolation: BrowserSessionIsolation;
  readonly sessionRecovery: BrowserSessionRecovery;
  readonly cookieSync: CookieSync;
  readonly proxyPool: ProxyPool;
  readonly proxyRotator: ProxyRotator;
  readonly automationScheduler: AutomationScheduler;
  private readonly automationRunner: BrowserAutomationRunner;

  constructor() {
    this.profileStore = new BrowserProfileStore();
    this.templateEngine = new BrowserProfileTemplateEngine();
    this.fingerprintGenerator = new BrowserFingerprintGenerator();
    this.sessionIsolation = new BrowserSessionIsolation();
    this.sessionRecovery = new BrowserSessionRecovery();
    this.cookieSync = new CookieSync(new InMemoryCookieCipher());
    this.proxyPool = new ProxyPool();
    this.proxyRotator = new ProxyRotator();
    this.automationScheduler = new AutomationScheduler();
    this.automationRunner = new BrowserAutomationRunner(async () => undefined);
  }

  createProfile(
    profile: Omit<BrowserProfile, 'id' | 'createdAt' | 'updatedAt' | 'state'>
  ): BrowserProfile {
    if (!profile.name.trim()) throw new Error('Browser profile name is required');
    const now = new Date().toISOString();
    const created: BrowserProfile = {
      ...profile,
      id: nextId('profile'),
      state: 'active',
      createdAt: now,
      updatedAt: now,
    };
    created.fingerprint = this.fingerprintGenerator.generate(created);
    this.profiles.set(created.id, created);
    this.profileStore.save(created);
    return {
      ...created,
      ...(created.fingerprint ? { fingerprint: { ...created.fingerprint } } : {}),
    };
  }

  getProfile(id: string): BrowserProfile | undefined {
    const profile = this.profiles.get(id);
    return profile
      ? { ...profile, ...(profile.fingerprint ? { fingerprint: { ...profile.fingerprint } } : {}) }
      : undefined;
  }

  listProfiles(): BrowserProfile[] {
    return this.profileStore.list().map(profile => ({
      ...profile,
      ...(profile.fingerprint ? { fingerprint: { ...profile.fingerprint } } : {}),
    }));
  }

  removeProfile(id: string): boolean {
    if (
      Array.from(this.sessions.values()).some(
        session => session.profileId === id && session.state !== 'closed'
      )
    )
      throw new Error('Cannot remove a profile with an active session');
    const removed = this.profiles.delete(id);
    if (removed) this.profileStore.delete(id);
    return removed;
  }

  startSession(profileId: string): BrowserSession {
    const profile = this.profiles.get(profileId);
    if (!profile) throw new Error(`Profile not found: ${profileId}`);
    const existing = Array.from(this.sessions.values()).find(
      session => session.profileId === profileId && session.state !== 'closed'
    );
    if (existing) throw new Error('Browser profile already has an active session');
    const now = new Date().toISOString();
    const session: BrowserSession = {
      id: nextId('session'),
      profileId,
      createdAt: now,
      lastActive: now,
      state: 'starting',
    };
    this.sessions.set(session.id, session);
    this.sessionIsolation.register(session, profile);
    const ready = BrowserSessionLifecycle.transition(session, 'ready', profile);
    this.sessions.set(ready.id, ready);
    return { ...ready, ...(ready.cookies ? { cookies: [...ready.cookies] } : {}) };
  }

  getSession(id: string): BrowserSession | undefined {
    const session = this.sessions.get(id);
    return session
      ? { ...session, ...(session.cookies ? { cookies: [...session.cookies] } : {}) }
      : undefined;
  }

  closeSession(id: string): void {
    const session = this.sessions.get(id);
    if (!session) return;
    if (session.state !== 'closed') {
      const profile = this.profiles.get(session.profileId);
      if (profile) this.sessionIsolation.unregister(session);
      const closed = BrowserSessionLifecycle.transition(
        session,
        'closed',
        profile ?? {
          ...session,
          id: session.profileId,
          name: session.profileId,
          state: 'active',
          createdAt: session.createdAt,
          updatedAt: session.lastActive,
        }
      );
      this.sessions.set(id, closed);
    }
  }

  recoverSession(id: string): BrowserSession | undefined {
    const session = this.sessions.get(id);
    const profile = session ? this.profiles.get(session.profileId) : undefined;
    if (!session || !profile) return undefined;
    const recovered = this.sessionRecovery.recover(session, profile);
    this.sessions.set(id, recovered);
    return { ...recovered, ...(recovered.cookies ? { cookies: [...recovered.cookies] } : {}) };
  }

  async storeCookie(
    profileId: string,
    cookie: {
      domain: string;
      name: string;
      value: string;
      expiresAt?: string;
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: 'strict' | 'lax' | 'none';
    }
  ): Promise<void> {
    const profile = this.profiles.get(profileId);
    if (!profile) throw new Error(`Profile not found: ${profileId}`);
    await this.cookieSync.put(
      profileId,
      {
        profileId,
        domain: cookie.domain,
        name: cookie.name,
        ...(cookie.expiresAt ? { expiresAt: cookie.expiresAt } : {}),
        secure: cookie.secure ?? false,
        httpOnly: cookie.httpOnly ?? false,
        sameSite: cookie.sameSite ?? 'lax',
      },
      cookie.value
    );
  }

  addProxy(proxy: Parameters<ProxyPool['add']>[0]): void {
    this.proxyPool.add(proxy);
  }

  rotateProxy(): ReturnType<ProxyRotator['next']> {
    return this.proxyRotator.next(this.proxyPool.available());
  }

  schedule(profileId: string, id: string, actions: BrowserAction[], intervalMs?: number): void {
    this.automationScheduler.register({
      id,
      profileId,
      actions,
      ...(intervalMs !== undefined ? { intervalMs } : {}),
      enabled: true,
    });
  }

  async runAutomation(
    sessionId: string
  ): Promise<{ sessionId: string; completed: number; failed: number }> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Browser session not found: ${sessionId}`);
    const schedules = this.automationScheduler
      .due()
      .filter(schedule => schedule.profileId === session.profileId);
    const actions = schedules.flatMap(schedule => schedule.actions);
    return this.automationRunner.run(session, actions);
  }
}

export default {
  InMemoryBrowserManager,
  BrowserProfileStore,
  BrowserProfileTemplateEngine,
  BrowserSessionLifecycle,
  BrowserSessionIsolation,
  CookieSync,
  ProxyPool,
  BrowserAutomationRunner,
};
