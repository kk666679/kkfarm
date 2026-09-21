import type { IntegrationConfig, IntegrationDelivery, WebhookPayload } from '../types';

export interface IntegrationAdapter {
  readonly type: string;
  send(config: IntegrationConfig, payload: WebhookPayload): Promise<IntegrationDelivery>;
  test(config: IntegrationConfig): Promise<boolean>;
}

export abstract class BaseIntegrationAdapter implements IntegrationAdapter {
  abstract readonly type: string;

  protected redact(config: IntegrationConfig): IntegrationConfig {
    if (!config.credentials) return config;
    const redactedCredentials = {
      ...(config.credentials.token ? { token: '***' } : {}),
      ...(config.credentials.apiKey ? { apiKey: '***' } : {}),
      ...(config.credentials.secret ? { secret: '***' } : {}),
      ...(config.credentials.password ? { password: '***' } : {}),
    };

    return { ...config, credentials: redactedCredentials };
  }

  abstract send(config: IntegrationConfig, payload: WebhookPayload): Promise<IntegrationDelivery>;
  abstract test(config: IntegrationConfig): Promise<boolean>;
}
