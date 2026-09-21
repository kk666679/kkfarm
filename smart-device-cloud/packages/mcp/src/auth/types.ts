export interface McpAuthContext {
  userId: string;
  email: string;
  name: string;
  roles: string[];
  scopes: string[];
  permissions: string[];
  tenantId?: string;
  token?: string;
  authenticated: boolean;
}

export interface McpAuthMiddlewareOptions {
  issuer: string;
  jwksUri?: string;
  audience?: string;
  requiredScopes?: string[];
}

export interface McpAuthValidationResult {
  context: McpAuthContext | null;
  error?: string;
}
