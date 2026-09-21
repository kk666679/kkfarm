export interface JwtClaims {
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
export interface TokenRequest {
  grant_type: 'client_credentials' | 'authorization_code' | 'refresh_token';
  client_id: string;
  client_secret: string;
  scope?: string;
  code?: string;
  redirect_uri?: string;
  refresh_token?: string;
}
export interface TokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}
export interface ClientCredentials {
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  scopes: string[];
}
export type OAuthScope =
  'device:read' | 'device:write' | 'workflow:execute' | 'integration:manage' | 'admin:all';
export declare const SCOPES: {
  readonly DEVICE_READ: 'device:read';
  readonly DEVICE_WRITE: 'device:write';
  readonly WORKFLOW_EXECUTE: 'workflow:execute';
  readonly INTEGRATION_MANAGE: 'integration:manage';
  readonly ADMIN_ALL: 'admin:all';
};
//# sourceMappingURL=claims.d.ts.map
