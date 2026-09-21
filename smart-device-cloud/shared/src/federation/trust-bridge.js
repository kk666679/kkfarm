const _trust = new Map();
const levels = ['untrusted', 'partial', 'full'];
export function establishTrust(entry) {
  if (!entry.peerId.trim()) throw new Error('Trust peer ID is required');
  if (entry.expiresAt && new Date(entry.expiresAt).getTime() <= Date.now())
    throw new Error('Trust entry is already expired');
  const trustEntry = {
    ...entry,
    allowedScopes: [...entry.allowedScopes],
    createdAt: entry.createdAt ?? new Date().toISOString(),
  };
  _trust.set(trustEntry.peerId, trustEntry);
  return { ...trustEntry, allowedScopes: [...trustEntry.allowedScopes] };
}
export function getTrust(peerId) {
  const entry = _trust.get(peerId);
  return entry ? { ...entry, allowedScopes: [...entry.allowedScopes] } : undefined;
}
export function isTrusted(peerId, minLevel = 'partial') {
  const entry = _trust.get(peerId);
  if (!entry) return false;
  if (entry.expiresAt && new Date(entry.expiresAt).getTime() <= Date.now()) return false;
  return levels.indexOf(entry.trustLevel) >= levels.indexOf(minLevel);
}
export function hasScope(peerId, scope) {
  const entry = _trust.get(peerId);
  return Boolean(entry && isTrusted(peerId, 'partial') && entry.allowedScopes.includes(scope));
}
export function authorize(peerId, scopes) {
  const entry = _trust.get(peerId);
  return Boolean(
    entry &&
    isTrusted(peerId, 'partial') &&
    scopes.every(scope => entry.allowedScopes.includes(scope))
  );
}
export function revokeTrust(peerId) {
  return _trust.delete(peerId);
}
export function listTrustEntries() {
  return Array.from(_trust.values()).map(entry => ({
    ...entry,
    allowedScopes: [...entry.allowedScopes],
  }));
}
//# sourceMappingURL=trust-bridge.js.map
