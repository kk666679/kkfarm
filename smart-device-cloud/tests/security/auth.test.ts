import { describe, it, expect } from 'vitest';
import { isTrusted, establishTrust, revokeTrust } from '../../shared/src/federation/trust-bridge';
import { extractBearerToken } from '../../shared/src/auth/oauth-validator';

describe('auth security', () => {
  it('extracts bearer token from Authorization header', () => {
    expect(extractBearerToken('Bearer my-token')).toBe('my-token');
    expect(extractBearerToken('Basic abc')).toBeNull();
    expect(extractBearerToken(undefined)).toBeNull();
  });

  it('rejects missing bearer token', () => {
    expect(extractBearerToken('')).toBeNull();
  });
});

describe('trust bridge', () => {
  it('establishes and checks trust', () => {
    establishTrust({
      peerId: 'peer-1',
      peerType: 'mcp',
      trustLevel: 'full',
      allowedScopes: ['device:read'],
    });
    expect(isTrusted('peer-1', 'full')).toBe(true);
    expect(isTrusted('peer-1', 'partial')).toBe(true);
  });

  it('revokes trust', () => {
    establishTrust({
      peerId: 'peer-2',
      peerType: 'service',
      trustLevel: 'partial',
      allowedScopes: [],
    });
    revokeTrust('peer-2');
    expect(isTrusted('peer-2')).toBe(false);
  });

  it('rejects unknown peer', () => {
    expect(isTrusted('unknown-peer')).toBe(false);
  });
});
