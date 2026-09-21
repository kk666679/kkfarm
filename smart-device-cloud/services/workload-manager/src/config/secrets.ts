import { createSecretsClient } from '@smart-device-cloud/shared/config';
import type { SecretsClient, SecretReference } from '@smart-device-cloud/shared/config';

export class WorkloadSecretsClient implements SecretsClient {
  private readonly delegate: SecretsClient;

  constructor(secretsClient?: SecretsClient) {
    this.delegate = secretsClient ?? createSecretsClient();
  }

  async get(ref: SecretReference): Promise<string | undefined> {
    return this.delegate.get(ref);
  }

  async getRequired(ref: SecretReference): Promise<string> {
    return this.delegate.getRequired(ref);
  }

  async getRedisUrl(): Promise<string | undefined> {
    return this.get({ provider: 'vault', path: 'redis/url', key: 'url' });
  }

  async getMetadata(path: string) {
    return this.delegate.getMetadata(path);
  }

  async rotate(path: string): Promise<void> {
    await this.delegate.rotate(path);
  }
}

export const workloadSecrets = new WorkloadSecretsClient();
