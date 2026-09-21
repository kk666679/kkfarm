export interface SecretReference {
  id: string;
  secretName: string;
  version?: string;
}

export class ProxyVaultClient {
  constructor(
    private readonly readSecret: (name: string, version?: string) => Promise<Record<string, string>>
  ) {}

  async get(reference: SecretReference): Promise<Record<string, string>> {
    return this.readSecret(reference.secretName, reference.version);
  }
}
