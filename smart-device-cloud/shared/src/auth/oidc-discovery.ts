import { config } from '../config/env';

export interface OidcDiscoveryDocument {
  issuer: string;
  jwks_uri: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  end_session_endpoint: string;
  response_types_supported: string[];
  token_endpoint_auth_methods_supported: string[];
  id_token_signing_alg_values_supported: string[];
  scopes_supported: string[];
  code_challenge_methods_supported: string[];
}

export class OidcDiscovery {
  private readonly issuer: string;
  private cachedDoc: OidcDiscoveryDocument | null = null;
  private cacheExpiry: number = 0;

  constructor(issuer: string = config.OAUTH_ISSUER || '') {
    this.issuer = issuer;
  }

  async discover(): Promise<OidcDiscoveryDocument | null> {
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
      const doc = (await res.json()) as OidcDiscoveryDocument;
      this.cachedDoc = doc;
      this.cacheExpiry = now + 300000; // 5 min cache
      return doc;
    } catch {
      return null;
    }
  }

  getJwksUri(): string | null {
    return this.cachedDoc?.jwks_uri ?? null;
  }

  getIssuer(): string {
    return this.issuer;
  }
}

export function createDefaultDiscovery(): OidcDiscovery {
  return new OidcDiscovery();
}
