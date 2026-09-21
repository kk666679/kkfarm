import { OAuthValidator } from '@smart-device-cloud/shared/auth';
import type { McpAuthContext, McpAuthValidationResult, McpAuthMiddlewareOptions } from './types';
import { extractBearerToken } from '@smart-device-cloud/shared/auth';

export class McpOAuthValidator {
  private validator: OAuthValidator;
  private readonly requiredScopes: string[];

  constructor(opts: McpAuthMiddlewareOptions) {
    this.validator = new OAuthValidator(opts.issuer, opts.jwksUri, opts.audience);
    this.requiredScopes = opts.requiredScopes ?? [];
  }

  async validate(token: string): Promise<McpAuthValidationResult> {
    const result = await this.validator.validateToken(token);
    if (!result.valid || !result.claims) {
      return { context: null, error: result.error || 'Token validation failed' };
    }

    const claims = result.claims;
    const missingScopes = this.requiredScopes.filter(
      s => !claims.scopes.includes(s) && !claims.scopes.includes('admin:all')
    );

    if (missingScopes.length > 0) {
      return {
        context: null,
        error: `Insufficient scopes: missing ${missingScopes.join(', ')}`,
      };
    }

    const context: McpAuthContext = {
      userId: claims.sub,
      email: claims.email,
      name: claims.name,
      roles: claims.roles,
      scopes: claims.scopes,
      permissions: claims.permissions,
      ...(claims.tenantId ? { tenantId: claims.tenantId } : {}),
      token,
      authenticated: true,
    };

    return { context };
  }

  extractBearerToken(authHeader?: string): string | null {
    return extractBearerToken(authHeader);
  }
}

export { OAuthValidator, extractBearerToken };
export type { McpAuthContext, McpAuthValidationResult, McpAuthMiddlewareOptions };
