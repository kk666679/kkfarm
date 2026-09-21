import { createInvoice } from '@smart-device-cloud/shared';
import type { Invoice, InvoiceLineItem } from '@smart-device-cloud/shared';
import type { BillingCalculation } from '../pricing/calculator';

export class InvoiceGenerator {
  private readonly invoices = new Map<string, Invoice>();

  generate(calc: BillingCalculation, period: { from: string; to: string }, discount = 0): Invoice {
    const lineItems: InvoiceLineItem[] = calc.lineItems.map(l => ({
      resourceType: l.resourceType,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      subtotal: l.subtotal,
      description: `${l.resourceType} usage (${l.billableQuantity} billable units)`,
    }));
    const invoice = createInvoice(calc.tenantId, period, lineItems, discount);
    this.invoices.set(invoice.id, invoice);
    return invoice;
  }

  get(id: string): Invoice | undefined {
    return this.invoices.get(id);
  }

  listByTenant(tenantId: string): Invoice[] {
    return Array.from(this.invoices.values()).filter(i => i.tenantId === tenantId);
  }

  markIssued(id: string): Invoice | undefined {
    const inv = this.invoices.get(id);
    if (!inv) return undefined;
    inv.status = 'issued';
    inv.issuedAt = new Date().toISOString();
    return inv;
  }

  markPaid(id: string): Invoice | undefined {
    const inv = this.invoices.get(id);
    if (!inv) return undefined;
    inv.status = 'paid';
    inv.paidAt = new Date().toISOString();
    return inv;
  }
}
