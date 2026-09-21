import * as openidClient from 'openid-client';
import { getRedisClient, REDIS_KEYS } from '../db/redis.js';
import bcrypt from 'bcrypt';

const { Issuer, generators, Client } = openidClient as any;
import { randomUUID } from 'crypto';

export interface OAuthConfig {
  issuer: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
}

export interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export class OAuthService {
  private client: any;
  private config: OAuthConfig;

  constructor(config: OAuthConfig) {
    this.config = config;
  }

  async initialize() {
    const issuer = await Issuer.discover(this.config.issuer);
    this.client = new issuer.Client({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uris: [this.config.redirectUri],
      response_types: ['code'],
    });
  }

  async createAuthorizationUrl(state?: string): Promise<{ url: string; codeVerifier: string }> {
    if (!this.client) {
      throw new Error('OAuth client not initialized');
    }

    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);

    const url = this.client.authorizationUrl({
      scope: this.config.scope.join(' '),
      state: state || generators.state(),
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return { url, codeVerifier };
  }

  async exchangeCodeForTokens(code: string, codeVerifier: string): Promise<TokenSet> {
    if (!this.client) {
      throw new Error('OAuth client not initialized');
    }

    const tokenSet = await this.client.callback(
      this.config.redirectUri,
      { code },
      { code_verifier: codeVerifier }
    );
    return {
      accessToken: tokenSet.access_token,
      refreshToken: tokenSet.refresh_token || undefined,
      expiresAt: tokenSet.expires_in ? Date.now() + tokenSet.expires_in * 1000 : undefined,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<TokenSet> {
    if (!this.client) {
      throw new Error('OAuth client not initialized');
    }

    const tokenSet = await this.client.refresh(refreshToken);
    return {
      accessToken: tokenSet.access_token,
      refreshToken: tokenSet.refresh_token || undefined,
      expiresAt: tokenSet.expires_in ? Date.now() + tokenSet.expires_in * 1000 : undefined,
    };
  }

  async revokeToken(token: string): Promise<void> {
    if (!this.client) {
      throw new Error('OAuth client not initialized');
    }

    try {
      await this.client.revoke(token);
    } catch {
      console.error('Failed to revoke token');
    }
  }
}

export class SessionService {
  private static SESSION_PREFIX = 'session:';
  private static SESSION_TTL = 8 * 60 * 60;

  async createSession(userId: string, userAgent: string, ipAddress: string): Promise<string> {
    const sessionId = randomUUID();
    const sessionKey = `${SessionService.SESSION_PREFIX}${sessionId}`;
    const client = getRedisClient();

    await client.setEx(
      sessionKey,
      SessionService.SESSION_TTL,
      JSON.stringify({
        userId,
        userAgent,
        ipAddress,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
      })
    );

    await client.sAdd(`${SessionService.SESSION_PREFIX}user:${userId}`, sessionId);

    return sessionId;
  }

  async getSession(
    sessionId: string
  ): Promise<{ userId: string; userAgent: string; ipAddress: string } | null> {
    const client = getRedisClient();
    const data = await client.get(`${SessionService.SESSION_PREFIX}${sessionId}`);
    if (!data) return null;

    return JSON.parse(data);
  }

  async updateSessionActivity(sessionId: string): Promise<void> {
    const client = getRedisClient();
    const data = await client.get(`${SessionService.SESSION_PREFIX}${sessionId}`);
    if (!data) return;

    const session = JSON.parse(data);
    session.lastActivity = new Date().toISOString();
    await client.setEx(
      `${SessionService.SESSION_PREFIX}${sessionId}`,
      SessionService.SESSION_TTL,
      JSON.stringify(session)
    );
  }

  async revokeSession(sessionId: string): Promise<void> {
    const client = getRedisClient();
    const data = await client.get(`${SessionService.SESSION_PREFIX}${sessionId}`);
    if (data) {
      const session = JSON.parse(data);
      await client.sRem(`${SessionService.SESSION_PREFIX}user:${session.userId}`, sessionId);
    }
    await client.del(`${SessionService.SESSION_PREFIX}${sessionId}`);
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    const client = getRedisClient();
    const sessions = await client.sMembers(`${SessionService.SESSION_PREFIX}user:${userId}`);
    for (const sessionId of sessions) {
      await client.del(`${SessionService.SESSION_PREFIX}${sessionId}`);
    }
    await client.del(`${SessionService.SESSION_PREFIX}user:${userId}`);
  }

  async getUserActiveSessions(userId: string): Promise<string[]> {
    const client = getRedisClient();
    return client.sMembers(`${SessionService.SESSION_PREFIX}user:${userId}`);
  }
}

export const oauthService = new OAuthService({
  issuer: process.env.OAUTH_ISSUER || 'http://localhost:8080/realms/device-farm',
  clientId: process.env.OAUTH_CLIENT_ID || 'device-farm-api',
  clientSecret: process.env.OAUTH_CLIENT_SECRET || '',
  redirectUri: process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/api/auth/callback',
  scope: ['openid', 'profile', 'email'],
});

export const sessionService = new SessionService();
