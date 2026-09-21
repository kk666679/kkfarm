import { jwtVerify, type JWTPayload, createRemoteJWKSet } from 'jose';
import { config } from '../config/env';

export interface OAuthClaims {
  sub: string;
  email: string;
  name: string;
  roles: string[];
  scopes: string[];
  permissions: string[];
  tenantId?: string;
  exp?: number;
  iat?: number;
  iss?: string;
}

export interface OAuthValidationResult {
  valid: boolean;
  claims?: OAuthClaims;
  error?: string;
}

export class OAuthValidator {
  private jwksClient?: ReturnType<typeof createRemoteJWKSet>;
  private readonly issuer: string;
  private readonly expectedAudience?: string;

  constructor(issuer: string = config.OAUTH_ISSUER || '', jwksUri?: string, audience?: string) {
    this.issuer = issuer;
    this.expectedAudience = audience;
    if (jwksUri) {
      this.jwksClient = createRemoteJWKSet(new URL(jwksUri));
    }
  }

  async validateToken(token: string): Promise<OAuthValidationResult> {
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

      const payload = result.payload as JWTPayload;
      const claims: OAuthClaims = {
        sub: payload.sub || '',
        email: (payload.email as string) || '',
        name: (payload.name as string) || '',
        roles: (payload.roles as string[]) || [],
        scopes: (payload.scope as string)?.split(' ') || [],
        permissions: (payload.permissions as string[]) || [],
        tenantId: payload.tenant_id as string | undefined,
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

export type SecretOrKey = Uint8Array | string;

export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0]?.toLowerCase() === 'bearer') {
    return parts[1] || null;
  }
  return null;
}
