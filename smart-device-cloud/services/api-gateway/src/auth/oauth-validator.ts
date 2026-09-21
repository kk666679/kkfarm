import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import type { GatewayConfig } from '../config.js';

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

export async function verifyJWT(token: string, config: GatewayConfig): Promise<JWTPayload> {
  if (!jwks) jwks = createRemoteJWKSet(new URL(config.jwksUri));
  const { payload } = await jwtVerify(token, jwks, {
    issuer: config.jwtIssuer,
    audience: config.jwtAudience,
  });
  return payload;
}
