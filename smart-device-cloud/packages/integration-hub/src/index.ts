/**
 * Smart Device Cloud Integration Hub.
 *
 * Owns external integration registry, credential handling, and webhook dispatch.
 */

import type {
  IntegrationConfig,
  WebhookPayload,
  WebhookValidationResult,
} from '@smart-device-cloud/shared';

export type IntegrationType = 'slack' | 'jira' | 'gitlab' | 'datadog' | 'webhook';

export type { IntegrationConfig };

export interface IntegrationRegistry {
  register(config: IntegrationConfig): void;
  get(id: string): IntegrationConfig | undefined;
  list(): IntegrationConfig[];
  remove(id: string): void;
}

export class InMemoryIntegrationRegistry implements IntegrationRegistry {
  private readonly integrations = new Map<string, IntegrationConfig>();

  register(config: IntegrationConfig): void {
    this.integrations.set(config.id, config);
  }

  get(id: string): IntegrationConfig | undefined {
    return this.integrations.get(id);
  }

  list(): IntegrationConfig[] {
    return Array.from(this.integrations.values());
  }

  remove(id: string): void {
    this.integrations.delete(id);
  }
}

export async function dispatchWebhook(
  url: string,
  payload: WebhookPayload,
  signal?: AbortSignal
): Promise<{ ok: boolean; status?: number }> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      ...(signal ? { signal } : {}),
    });
    return { ok: response.ok, status: response.status };
  } catch {
    return { ok: false };
  }
}

export interface WebhookValidator {
  validate(payload: WebhookPayload): Promise<WebhookValidationResult>;
}

export class SignatureWebhookValidator implements WebhookValidator {
  constructor(private readonly secret: string) {}

  async validate(payload: WebhookPayload): Promise<WebhookValidationResult> {
    if (!this.secret) {
      return { valid: false, event: payload };
    }
    const expected = await this.sign(payload);
    const actual = payload.signature;
    const valid = !!actual && this.timingSafeEqual(expected, actual);
    return { valid, event: payload };
  }

  private async sign(payload: WebhookPayload): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(JSON.stringify(payload))
    );
    return Array.from(new Uint8Array(signature))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  private timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
      diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
  }
}

export default {
  InMemoryIntegrationRegistry,
  SignatureWebhookValidator,
  dispatchWebhook,
};
