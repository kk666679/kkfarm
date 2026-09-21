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
export declare class OAuthValidator {
  private jwksClient?;
  private readonly issuer;
  private readonly expectedAudience?;
  constructor(issuer?: string, jwksUri?: string, audience?: string);
  validateToken(token: string): Promise<OAuthValidationResult>;
}
export type SecretOrKey = Uint8Array | string;
export declare function extractBearerToken(authHeader?: string): string | null;
//# sourceMappingURL=oauth-validator.d.ts.map
