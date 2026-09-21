import { ScopeChecker, hasScope, hasPermission } from '@smart-device-cloud/shared/auth';
import type { McpAuthContext } from './types';

export class McpScopeChecker {
  private checker: ScopeChecker;

  constructor() {
    this.checker = new ScopeChecker();
  }

  require(scope: string, resource?: string, action?: string): this {
    this.checker.require(scope, resource, action);
    return this;
  }

  check(context: McpAuthContext): { authorized: boolean; missing: string[] } {
    const claims = {
      sub: context.userId,
      email: context.email,
      name: context.name,
      roles: context.roles,
      scopes: context.scopes,
      permissions: context.permissions,
      ...(context.tenantId ? { tenantId: context.tenantId } : {}),
    };
    return this.checker.check(claims);
  }

  assert(context: McpAuthContext): void {
    const claims = {
      sub: context.userId,
      email: context.email,
      name: context.name,
      roles: context.roles,
      scopes: context.scopes,
      permissions: context.permissions,
      ...(context.tenantId ? { tenantId: context.tenantId } : {}),
    };
    this.checker.assert(claims);
  }

  hasScope(context: McpAuthContext, scope: string): boolean {
    return hasScope(
      {
        sub: context.userId,
        email: context.email,
        name: context.name,
        roles: context.roles,
        scopes: context.scopes,
        permissions: context.permissions,
      },
      scope
    );
  }

  hasPermission(context: McpAuthContext, permission: string): boolean {
    return hasPermission(
      {
        sub: context.userId,
        email: context.email,
        name: context.name,
        roles: context.roles,
        scopes: context.scopes,
        permissions: context.permissions,
      },
      permission
    );
  }
}

export { ScopeChecker, hasScope, hasPermission };
