import type { Invoice } from '@smart-device-cloud/shared';

/** Renders a plain-text invoice summary (PDF rendering requires a runtime PDF lib). */
export function renderInvoiceText(invoice: Invoice): string {
  const lines = [
    `Invoice: ${invoice.id}`,
    `Tenant:  ${invoice.tenantId}`,
    `Period:  ${invoice.period.from} — ${invoice.period.to}`,
    `Status:  ${invoice.status}`,
    '',
    'Line Items:',
    ...invoice.lineItems.map(l => `  ${l.description.padEnd(50)} $${l.subtotal.toFixed(2)}`),
    '',
    `Subtotal: $${invoice.subtotal.toFixed(2)}`,
    `Discount: -$${invoice.discount.toFixed(2)}`,
    `Tax:      $${invoice.tax.toFixed(2)}`,
    `Total:    $${invoice.total.toFixed(2)} ${invoice.currency}`,
  ];
  return lines.join('\n');
}
