export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export interface PaymentIntent {
  id: string;
  invoiceId: string;
  tenantId: string;
  amount: number;
  currency: 'USD';
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  createdAt: string;
}

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
}

export class StripePaymentProvider {
  constructor(private readonly config: StripeConfig) {}

  async createPaymentIntent(
    invoiceId: string,
    tenantId: string,
    amount: number
  ): Promise<PaymentIntent> {
    // In production: call Stripe API with this.config.secretKey
    return {
      id: `pi-${Date.now()}`,
      invoiceId,
      tenantId,
      amount,
      currency: 'USD',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentStatus> {
    // In production: confirm via Stripe API
    void paymentIntentId;
    return 'succeeded';
  }
}
