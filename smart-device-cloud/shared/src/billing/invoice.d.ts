import type { ResourceType } from './pricing';
export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue' | 'void';
export interface InvoiceLineItem {
  resourceType: ResourceType;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  description: string;
}
export interface Invoice {
  id: string;
  tenantId: string;
  period: {
    from: string;
    to: string;
  };
  lineItems: InvoiceLineItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: 'USD';
  status: InvoiceStatus;
  issuedAt?: string;
  dueAt?: string;
  paidAt?: string;
  createdAt: string;
}
export declare function createInvoice(
  tenantId: string,
  period: {
    from: string;
    to: string;
  },
  lineItems: InvoiceLineItem[],
  discount?: number,
  taxRate?: number
): Invoice;
export declare function issueInvoice(invoice: Invoice, dueAt?: string): Invoice;
export declare function markInvoicePaid(invoice: Invoice): Invoice;
export declare function voidInvoice(invoice: Invoice): Invoice;
export declare function calculateInvoiceTotals(
  lineItems: readonly InvoiceLineItem[],
  discount?: number,
  taxRate?: number
): Pick<Invoice, 'subtotal' | 'discount' | 'tax' | 'total'>;
//# sourceMappingURL=invoice.d.ts.map
