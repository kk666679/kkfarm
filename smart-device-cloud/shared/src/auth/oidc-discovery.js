import { config } from '../config/env';
export class OidcDiscovery {
  issuer;
  cachedDoc = null;
  cacheExpiry = 0;
  constructor(issuer = config.OAUTH_ISSUER || '') {
    this.issuer = issuer;
  }
  async discover() {
    if (!this.issuer) return null;
    const now = Date.now();
    if (this.cachedDoc && now < this.cacheExpiry) {
      return this.cachedDoc;
    }
    try {
      const wellKnownUrl = `${this.issuer.replace(/\/$/, '')}/.well-known/openid-configuration`;
      const res = await fetch(wellKnownUrl, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) return null;
      const doc = await res.json();
      this.cachedDoc = doc;
      this.cacheExpiry = now + 300000; // 5 min cache
      return doc;
    } catch {
      return null;
    }
  }
  getJwksUri() {
    return this.cachedDoc?.jwks_uri ?? null;
  }
  getIssuer() {
    return this.issuer;
  }
}
export function createDefaultDiscovery() {
  return new OidcDiscovery();
}
//# sourceMappingURL=oidc-discovery.js.map
