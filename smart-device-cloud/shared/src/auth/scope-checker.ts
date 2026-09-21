import type { OAuthClaims } from './oauth-validator';

export interface ScopeRequirement {
  scope: string;
  resource?: string;
  action?: string;
}

export class ScopeChecker {
  private readonly requiredScopes: ScopeRequirement[] = [];

  require(scope: string, resource?: string, action?: string): this {
    this.requiredScopes.push({ scope, resource, action });
    return this;
  }

  check(claims: OAuthClaims): { authorized: boolean; missing: string[] } {
    const missing: string[] = [];

    for (const req of this.requiredScopes) {
      const hasScope = claims.scopes.includes(req.scope);
      if (!hasScope) {
        missing.push(req.scope);
      }
    }

    if (claims.scopes.includes('admin:all')) {
      return { authorized: true, missing: [] };
    }

    return { authorized: missing.length === 0, missing };
  }

  assert(claims: OAuthClaims): void {
    const result = this.check(claims);
    if (!result.authorized) {
      throw new Error(`Unauthorized: missing scopes: ${result.missing.join(', ')}`);
    }
  }
}

export function hasScope(claims: OAuthClaims, scope: string): boolean {
  return claims.scopes.includes(scope) || claims.scopes.includes('admin:all');
}

export function hasPermission(claims: OAuthClaims, permission: string): boolean {
  return claims.permissions.includes(permission) || claims.permissions.includes('admin:all');
}

export function combineScopes(...scopesList: string[][]): string[] {
  const set = new Set<string>();
  for (const scopes of scopesList) {
    for (const s of scopes) {
      set.add(s);
    }
  }
  return Array.from(set);
}
