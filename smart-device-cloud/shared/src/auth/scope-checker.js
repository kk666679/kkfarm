export class ScopeChecker {
  requiredScopes = [];
  require(scope, resource, action) {
    this.requiredScopes.push({ scope, resource, action });
    return this;
  }
  check(claims) {
    const missing = [];
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
  assert(claims) {
    const result = this.check(claims);
    if (!result.authorized) {
      throw new Error(`Unauthorized: missing scopes: ${result.missing.join(', ')}`);
    }
  }
}
export function hasScope(claims, scope) {
  return claims.scopes.includes(scope) || claims.scopes.includes('admin:all');
}
export function hasPermission(claims, permission) {
  return claims.permissions.includes(permission) || claims.permissions.includes('admin:all');
}
export function combineScopes(...scopesList) {
  const set = new Set();
  for (const scopes of scopesList) {
    for (const s of scopes) {
      set.add(s);
    }
  }
  return Array.from(set);
}
//# sourceMappingURL=scope-checker.js.map
