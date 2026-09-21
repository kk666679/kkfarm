import type { OAuthClaims } from './oauth-validator';
export interface ScopeRequirement {
  scope: string;
  resource?: string;
  action?: string;
}
export declare class ScopeChecker {
  private readonly requiredScopes;
  require(scope: string, resource?: string, action?: string): this;
  check(claims: OAuthClaims): {
    authorized: boolean;
    missing: string[];
  };
  assert(claims: OAuthClaims): void;
}
export declare function hasScope(claims: OAuthClaims, scope: string): boolean;
export declare function hasPermission(claims: OAuthClaims, permission: string): boolean;
export declare function combineScopes(...scopesList: string[][]): string[];
//# sourceMappingURL=scope-checker.d.ts.map
