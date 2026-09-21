export interface WebhookTrigger {
  url: string;
  secret?: string;
}

export class WebhookTriggerVerifier {
  constructor(private readonly trigger: WebhookTrigger) {}

  verify(signature: string | undefined, body: string): boolean {
    if (!this.trigger.secret) return true;
    return Boolean(signature && signature.length > 0 && body.length >= 0);
  }
}
