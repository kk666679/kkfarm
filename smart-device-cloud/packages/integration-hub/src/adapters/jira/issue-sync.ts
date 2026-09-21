import type { IntegrationConfig, WebhookPayload } from '../../types';
import { JiraClient } from './client';

export class JiraIssueSync extends JiraClient {
  async sync(
    config: IntegrationConfig,
    payload: WebhookPayload,
    issueKey?: string
  ): Promise<{ issueKey?: string; status: string }> {
    await this.test(config);
    return { ...(issueKey ? { issueKey } : {}), status: payload.eventType };
  }
}
