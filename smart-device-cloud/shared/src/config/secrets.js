export class EnvSecretsClient {
  async get(ref) {
    if (ref.provider !== 'env') return undefined;
    return typeof process !== 'undefined' ? process.env[ref.path] : undefined;
  }
  async getRequired(ref) {
    const value = await this.get(ref);
    if (!value) {
      throw new Error(`Required secret ${ref.path} not found in environment`);
    }
    return value;
  }
  async getMetadata(_path) {
    return undefined;
  }
  async rotate(_path) {
    // No-op for env-based secrets
  }
}
export class VaultSecretsClient {
  vaultAddr;
  token;
  mount;
  constructor(vaultAddr, token, mount = 'secret') {
    this.vaultAddr = vaultAddr;
    this.token = token;
    this.mount = mount;
  }
  async get(ref) {
    if (ref.provider !== 'vault') return undefined;
    try {
      const url = `${this.vaultAddr}/v1/${this.mount}${ref.path}`;
      const res = await fetch(url, {
        headers: { 'X-Vault-Token': this.token },
      });
      if (!res.ok) return undefined;
      const body = await res.json();
      return body.data?.data?.[ref.key];
    } catch {
      return undefined;
    }
  }
  async getRequired(ref) {
    const value = await this.get(ref);
    if (!value) {
      throw new Error(`Secret not found at path: ${ref.path}/${ref.key}`);
    }
    return value;
  }
  async getMetadata(_path) {
    return undefined;
  }
  async rotate(_path) {
    // Vault KV v2 rotation
  }
}
export function createSecretsClient() {
  if (typeof process !== 'undefined' && process.env.VAULT_ADDR && process.env.VAULT_TOKEN) {
    return new VaultSecretsClient(
      process.env.VAULT_ADDR,
      process.env.VAULT_TOKEN,
      process.env.VAULT_MOUNT
    );
  }
  return new EnvSecretsClient();
}
//# sourceMappingURL=secrets.js.map
