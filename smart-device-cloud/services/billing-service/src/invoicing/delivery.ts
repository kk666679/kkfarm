import type { Invoice } from '@smart-device-cloud/shared';

export interface DeliveryResult {
  invoiceId: string;
  channel: 'email' | 'webhook';
  success: boolean;
  error?: string;
}

export async function deliverInvoice(
  invoice: Invoice,
  channel: 'email' | 'webhook',
  destination: string
): Promise<DeliveryResult> {
  try {
    if (channel === 'webhook') {
      const res = await fetch(destination, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice),
      });
      return { invoiceId: invoice.id, channel, success: res.ok };
    }
    // email delivery would integrate with SMTP here
    return { invoiceId: invoice.id, channel, success: true };
  } catch (err) {
    return {
      invoiceId: invoice.id,
      channel,
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
