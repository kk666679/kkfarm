export type BrowserProfileState = 'active' | 'paused' | 'locked' | 'archived';
export type BrowserSessionState = 'starting' | 'ready' | 'active' | 'idle' | 'closed' | 'error';
export type ProxyHealth = 'healthy' | 'degraded' | 'unhealthy';

export interface BrowserProfile {
  id: string;
  name: string;
  proxy?: string;
  userAgent?: string;
  timezone?: string;
  locale?: string;
  state: BrowserProfileState;
  fingerprint?: BrowserFingerprint;
  createdAt: string;
  updatedAt: string;
}

export interface BrowserSession {
  id: string;
  profileId: string;
  createdAt: string;
  lastActive: string;
  state: BrowserSessionState;
  cookies?: string[];
}

export interface BrowserProfileTemplate {
  id: string;
  name: string;
  userAgent?: string;
  timezone?: string;
  locale?: string;
  proxyPool?: string;
  extensions?: string[];
  defaultPermissions: Record<string, 'allow' | 'deny' | 'ask'>;
}

export interface BrowserFingerprint {
  userAgent: string;
  platform: string;
  screen: { width: number; height: number };
  timezone: string;
  locale: string;
  language: string;
  hardwareConcurrency: number;
  deviceMemory?: number;
}

export interface EncryptedCookie {
  id: string;
  profileId: string;
  domain: string;
  name: string;
  encryptedValue: string;
  expiresAt?: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'strict' | 'lax' | 'none';
}

export interface ProxyEndpoint {
  id: string;
  url: string;
  type: 'http' | 'https' | 'socks5';
  country?: string;
  city?: string;
  health: ProxyHealth;
  lastCheckedAt?: string;
  failureCount: number;
}

export type BrowserActionType =
  'navigate' | 'click' | 'type' | 'scroll' | 'screenshot' | 'evaluate' | 'wait';
export interface BrowserAction {
  id: string;
  type: BrowserActionType;
  target?: string;
  value?: string;
  options?: Record<string, unknown>;
}

export interface AutomationSchedule {
  id: string;
  profileId: string;
  actions: BrowserAction[];
  cronExpression?: string;
  intervalMs?: number;
  enabled: boolean;
  nextRunAt?: string;
}

export interface BrowserManager {
  createProfile(
    profile: Omit<BrowserProfile, 'id' | 'createdAt' | 'updatedAt' | 'state'>
  ): BrowserProfile;
  getProfile(id: string): BrowserProfile | undefined;
  listProfiles(): BrowserProfile[];
  removeProfile(id: string): boolean;
  startSession(profileId: string): BrowserSession;
  getSession(id: string): BrowserSession | undefined;
  closeSession(id: string): void;
}
