import type { CredentialSecret } from './vault-client';

export class CredentialRotationPolicy {
  constructor(private readonly maxAgeDays: number) {}

  shouldRotate(secret: CredentialSecret, now = new Date()): boolean {
    if (!secret.expiresAt) return true;
    const expiresAt = new Date(secret.expiresAt).getTime();
    const renewalWindow = this.maxAgeDays * 24 * 60 * 60 * 1000;
    return expiresAt - now.getTime() <= renewalWindow;
  }
}
