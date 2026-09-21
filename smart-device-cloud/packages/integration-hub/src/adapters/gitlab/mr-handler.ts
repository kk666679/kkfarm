import type { IntegrationConfig, WebhookPayload } from '../../types';
import { GitLabClient } from './client';

export class GitLabMrHandler extends GitLabClient {
  async handle(
    config: IntegrationConfig,
    payload: WebhookPayload
  ): Promise<{ eventType: string; action: string }> {
    await this.test(config);
    return { eventType: payload.eventType, action: String(payload.data.action ?? 'updated') };
  }
}
