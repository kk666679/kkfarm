export type TrustLevel = 'full' | 'partial' | 'untrusted';

export interface TrustEntry {
  peerId: string;
  peerType: 'mcp' | 'acp' | 'service';
  trustLevel: TrustLevel;
  allowedScopes: string[];
  publicKeyJwks?: string;
  expiresAt?: string;
  createdAt: string;
}

const _trust = new Map<string, TrustEntry>();
const levels: TrustLevel[] = ['untrusted', 'partial', 'full'];

export function establishTrust(
  entry: Omit<TrustEntry, 'createdAt'> & Partial<Pick<TrustEntry, 'createdAt'>>
): TrustEntry {
  if (!entry.peerId.trim()) throw new Error('Trust peer ID is required');
  if (entry.expiresAt && new Date(entry.expiresAt).getTime() <= Date.now())
    throw new Error('Trust entry is already expired');
  const trustEntry: TrustEntry = {
    ...entry,
    allowedScopes: [...entry.allowedScopes],
    createdAt: entry.createdAt ?? new Date().toISOString(),
  };
  _trust.set(trustEntry.peerId, trustEntry);
  return { ...trustEntry, allowedScopes: [...trustEntry.allowedScopes] };
}

export function getTrust(peerId: string): TrustEntry | undefined {
  const entry = _trust.get(peerId);
  return entry ? { ...entry, allowedScopes: [...entry.allowedScopes] } : undefined;
}

export function isTrusted(peerId: string, minLevel: TrustLevel = 'partial'): boolean {
  const entry = _trust.get(peerId);
  if (!entry) return false;
  if (entry.expiresAt && new Date(entry.expiresAt).getTime() <= Date.now()) return false;
  return levels.indexOf(entry.trustLevel) >= levels.indexOf(minLevel);
}

export function hasScope(peerId: string, scope: string): boolean {
  const entry = _trust.get(peerId);
  return Boolean(entry && isTrusted(peerId, 'partial') && entry.allowedScopes.includes(scope));
}

export function authorize(peerId: string, scopes: readonly string[]): boolean {
  const entry = _trust.get(peerId);
  return Boolean(
    entry &&
    isTrusted(peerId, 'partial') &&
    scopes.every(scope => entry.allowedScopes.includes(scope))
  );
}

export function revokeTrust(peerId: string): boolean {
  return _trust.delete(peerId);
}

export function listTrustEntries(): TrustEntry[] {
  return Array.from(_trust.values()).map(entry => ({
    ...entry,
    allowedScopes: [...entry.allowedScopes],
  }));
}
