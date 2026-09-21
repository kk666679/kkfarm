export interface SecretReference {
  provider: 'vault' | 'aws-secrets-manager' | 'env';
  path: string;
  key: string;
}

export interface SecretVersion {
  value: string;
  version: string;
  createdAt: string;
}

export interface SecretMetadata {
  path: string;
  version: string;
  createdAt: string;
  updatedAt?: string;
  rotationInterval?: string;
}

export interface SecretsClient {
  get(ref: SecretReference): Promise<string | undefined>;
  getRequired(ref: SecretReference): Promise<string>;
  getMetadata(path: string): Promise<SecretMetadata | undefined>;
  rotate(path: string): Promise<void>;
}

export class EnvSecretsClient implements SecretsClient {
  async get(ref: SecretReference): Promise<string | undefined> {
    if (ref.provider !== 'env') return undefined;
    return typeof process !== 'undefined' ? process.env[ref.path] : undefined;
  }

  async getRequired(ref: SecretReference): Promise<string> {
    const value = await this.get(ref);
    if (!value) {
      throw new Error(`Required secret ${ref.path} not found in environment`);
    }
    return value;
  }

  async getMetadata(_path: string): Promise<SecretMetadata | undefined> {
    return undefined;
  }

  async rotate(_path: string): Promise<void> {
    // No-op for env-based secrets
  }
}

export class VaultSecretsClient implements SecretsClient {
  private readonly vaultAddr: string;
  private readonly token: string;
  private readonly mount: string;

  constructor(vaultAddr: string, token: string, mount: string = 'secret') {
    this.vaultAddr = vaultAddr;
    this.token = token;
    this.mount = mount;
  }

  async get(ref: SecretReference): Promise<string | undefined> {
    if (ref.provider !== 'vault') return undefined;
    try {
      const url = `${this.vaultAddr}/v1/${this.mount}${ref.path}`;
      const res = await fetch(url, {
        headers: { 'X-Vault-Token': this.token },
      });
      if (!res.ok) return undefined;
      const body = (await res.json()) as { data?: { data?: Record<string, string> } };
      return body.data?.data?.[ref.key];
    } catch {
      return undefined;
    }
  }

  async getRequired(ref: SecretReference): Promise<string> {
    const value = await this.get(ref);
    if (!value) {
      throw new Error(`Secret not found at path: ${ref.path}/${ref.key}`);
    }
    return value;
  }

  async getMetadata(_path: string): Promise<SecretMetadata | undefined> {
    return undefined;
  }

  async rotate(_path: string): Promise<void> {
    // Vault KV v2 rotation
  }
}

export function createSecretsClient(): SecretsClient {
  if (typeof process !== 'undefined' && process.env.VAULT_ADDR && process.env.VAULT_TOKEN) {
    return new VaultSecretsClient(
      process.env.VAULT_ADDR,
      process.env.VAULT_TOKEN,
      process.env.VAULT_MOUNT
    );
  }
  return new EnvSecretsClient();
}
