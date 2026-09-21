import type { WebhookPayload, WebhookValidationResult } from '../types';

export class SignatureWebhookValidator {
  constructor(
    private readonly secret: string,
    private readonly toleranceMs = 5 * 60 * 1000
  ) {}

  async validate(payload: WebhookPayload): Promise<WebhookValidationResult> {
    if (!this.secret) return { valid: false, event: payload, reason: 'Webhook secret is required' };
    if (!payload.signature)
      return { valid: false, event: payload, reason: 'Webhook signature is missing' };
    const ageMs = Math.abs(Date.now() - new Date(payload.timestamp).getTime());
    if (ageMs > this.toleranceMs)
      return {
        valid: false,
        event: payload,
        reason: 'Webhook timestamp is outside the tolerance window',
      };
    const expected = await this.sign(payload);
    return { valid: this.timingSafeEqual(expected, payload.signature), event: payload };
  }

  private async sign(payload: WebhookPayload): Promise<string> {
    const body = JSON.stringify({
      id: payload.id,
      eventType: payload.eventType,
      timestamp: payload.timestamp,
      data: payload.data,
    });
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(this.secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
    return Array.from(new Uint8Array(signature))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  private timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let index = 0; index < a.length; index += 1)
      diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
    return diff === 0;
  }
}
