import type { PaymentIntent, PaymentStatus } from './provider-stripe';

export class ManualPaymentProvider {
  private readonly intents = new Map<string, PaymentIntent>();

  async createPaymentIntent(
    invoiceId: string,
    tenantId: string,
    amount: number
  ): Promise<PaymentIntent> {
    const intent: PaymentIntent = {
      id: `manual-${Date.now()}`,
      invoiceId,
      tenantId,
      amount,
      currency: 'USD',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.intents.set(intent.id, intent);
    return intent;
  }

  markPaid(paymentIntentId: string): PaymentStatus {
    const intent = this.intents.get(paymentIntentId);
    if (!intent) return 'failed';
    intent.status = 'succeeded';
    return 'succeeded';
  }
}
