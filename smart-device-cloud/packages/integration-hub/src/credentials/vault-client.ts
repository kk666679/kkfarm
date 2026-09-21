export interface CredentialSecret {
  id: string;
  value: string;
  expiresAt?: string;
}

export class IntegrationVaultClient {
  private readonly secrets = new Map<string, CredentialSecret>();

  put(secret: CredentialSecret): void {
    if (!secret.id.trim() || !secret.value)
      throw new Error('Credential secret ID and value are required');
    this.secrets.set(secret.id, { ...secret });
  }

  get(id: string): string | undefined {
    const secret = this.secrets.get(id);
    if (!secret) return undefined;
    if (secret.expiresAt && new Date(secret.expiresAt).getTime() <= Date.now())
      throw new Error('Credential secret has expired');
    return secret.value;
  }

  rotate(id: string, value: string): void {
    const current = this.secrets.get(id);
    if (!current) throw new Error(`Credential secret not found: ${id}`);
    this.secrets.set(id, { ...current, value });
  }
}
