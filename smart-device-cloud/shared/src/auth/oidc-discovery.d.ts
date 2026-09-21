export interface OidcDiscoveryDocument {
  issuer: string;
  jwks_uri: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  end_session_endpoint: string;
  response_types_supported: string[];
  token_endpoint_auth_methods_supported: string[];
  id_token_signing_alg_values_supported: string[];
  scopes_supported: string[];
  code_challenge_methods_supported: string[];
}
export declare class OidcDiscovery {
  private readonly issuer;
  private cachedDoc;
  private cacheExpiry;
  constructor(issuer?: string);
  discover(): Promise<OidcDiscoveryDocument | null>;
  getJwksUri(): string | null;
  getIssuer(): string;
}
export declare function createDefaultDiscovery(): OidcDiscovery;
//# sourceMappingURL=oidc-discovery.d.ts.map
