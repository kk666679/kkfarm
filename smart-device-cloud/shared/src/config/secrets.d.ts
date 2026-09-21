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
export declare class EnvSecretsClient implements SecretsClient {
  get(ref: SecretReference): Promise<string | undefined>;
  getRequired(ref: SecretReference): Promise<string>;
  getMetadata(_path: string): Promise<SecretMetadata | undefined>;
  rotate(_path: string): Promise<void>;
}
export declare class VaultSecretsClient implements SecretsClient {
  private readonly vaultAddr;
  private readonly token;
  private readonly mount;
  constructor(vaultAddr: string, token: string, mount?: string);
  get(ref: SecretReference): Promise<string | undefined>;
  getRequired(ref: SecretReference): Promise<string>;
  getMetadata(_path: string): Promise<SecretMetadata | undefined>;
  rotate(_path: string): Promise<void>;
}
export declare function createSecretsClient(): SecretsClient;
//# sourceMappingURL=secrets.d.ts.map
