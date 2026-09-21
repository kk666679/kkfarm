export interface OAuthAuthorizationRequest {
  clientId: string;
  redirectUri: string;
  scopes: string[];
  state: string;
}

export interface OAuthToken {
  accessToken: string;
  tokenType: 'Bearer';
  expiresAt: string;
  scopes: string[];
}

export class RemoteOAuthClient {
  constructor(
    private readonly authorize: (request: OAuthAuthorizationRequest) => Promise<string>
  ) {}

  async authorizeDevice(request: OAuthAuthorizationRequest): Promise<string> {
    if (
      !request.clientId.trim() ||
      !request.redirectUri.startsWith('https://') ||
      request.scopes.length === 0
    )
      throw new Error('Invalid OAuth authorization request');
    return this.authorize(request);
  }

  isExpired(token: OAuthToken, now = new Date()): boolean {
    return new Date(token.expiresAt).getTime() <= now.getTime();
  }
}
