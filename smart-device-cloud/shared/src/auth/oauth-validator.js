import { jwtVerify, createRemoteJWKSet } from 'jose';
import { config } from '../config/env';
export class OAuthValidator {
  jwksClient;
  issuer;
  expectedAudience;
  constructor(issuer = config.OAUTH_ISSUER || '', jwksUri, audience) {
    this.issuer = issuer;
    this.expectedAudience = audience;
    if (jwksUri) {
      this.jwksClient = createRemoteJWKSet(new URL(jwksUri));
    }
  }
  async validateToken(token) {
    if (!token) {
      return { valid: false, error: 'Missing token' };
    }
    if (!this.issuer) {
      return { valid: false, error: 'No OAuth issuer configured' };
    }
    try {
      const secret = config.JWT_SECRET;
      let result;
      if (this.jwksClient) {
        result = await jwtVerify(token, this.jwksClient, {
          issuer: this.issuer,
          audience: this.expectedAudience,
        });
      } else if (secret) {
        result = await jwtVerify(token, new TextEncoder().encode(secret), {
          issuer: this.issuer,
          audience: this.expectedAudience,
        });
      } else {
        return { valid: false, error: 'No JWKS client or secret configured' };
      }
      const payload = result.payload;
      const claims = {
        sub: payload.sub || '',
        email: payload.email || '',
        name: payload.name || '',
        roles: payload.roles || [],
        scopes: payload.scope?.split(' ') || [],
        permissions: payload.permissions || [],
        tenantId: payload.tenant_id,
        exp: payload.exp,
        iat: payload.iat,
        iss: payload.iss,
      };
      return { valid: true, claims };
    } catch (err) {
      return {
        valid: false,
        error: err instanceof Error ? err.message : 'Token verification failed',
      };
    }
  }
}
export function extractBearerToken(authHeader) {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0]?.toLowerCase() === 'bearer') {
    return parts[1] || null;
  }
  return null;
}
//# sourceMappingURL=oauth-validator.js.map
