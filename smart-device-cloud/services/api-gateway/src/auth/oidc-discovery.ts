import type { GatewayConfig } from '../config.js';

export async function discoverOIDC(config: GatewayConfig) {
  const res = await fetch(`${config.jwtIssuer}/.well-known/openid-configuration`);
  return res.json();
}
