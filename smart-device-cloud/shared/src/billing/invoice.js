let sequence = 0;
function money(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
export function createInvoice(tenantId, period, lineItems, discount = 0, taxRate = 0) {
  if (!tenantId.trim()) throw new Error('Tenant ID is required');
  const normalizedItems = lineItems.map(item => {
    if (
      !Number.isFinite(item.quantity) ||
      item.quantity < 0 ||
      !Number.isFinite(item.unitPrice) ||
      item.unitPrice < 0
    ) {
      throw new Error('Invoice line item values must be non-negative');
    }
    return {
      ...item,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: money(item.quantity * item.unitPrice),
    };
  });
  const safeDiscount = Math.min(
    Math.max(money(discount), 0),
    normalizedItems.reduce((sum, item) => sum + item.subtotal, 0)
  );
  const tax = money(
    (normalizedItems.reduce((sum, item) => sum + item.subtotal, 0) - safeDiscount) *
      Number(taxRate || 0)
  );
  const subtotal = money(normalizedItems.reduce((sum, item) => sum + item.subtotal, 0));
  sequence += 1;
  return {
    id: `inv-${Date.now()}-${sequence}`,
    tenantId,
    period,
    lineItems: normalizedItems,
    subtotal,
    discount: safeDiscount,
    tax,
    total: money(subtotal - safeDiscount + tax),
    currency: 'USD',
    status: 'draft',
    createdAt: new Date().toISOString(),
  };
}
export function issueInvoice(
  invoice,
  dueAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
) {
  if (invoice.status !== 'draft')
    throw new Error(`Invoice cannot be issued from ${invoice.status}`);
  return { ...invoice, status: 'issued', issuedAt: new Date().toISOString(), dueAt };
}
export function markInvoicePaid(invoice) {
  if (invoice.status === 'void') throw new Error('Void invoice cannot be paid');
  return { ...invoice, status: 'paid', paidAt: new Date().toISOString(), dueAt: invoice.dueAt };
}
export function voidInvoice(invoice) {
  if (invoice.status === 'paid') throw new Error('Paid invoice cannot be voided');
  return { ...invoice, status: 'void' };
}
export function calculateInvoiceTotals(lineItems, discount = 0, taxRate = 0) {
  const subtotal = money(
    lineItems.reduce((sum, item) => sum + money(item.quantity * item.unitPrice), 0)
  );
  const safeDiscount = money(Math.min(Math.max(discount, 0), subtotal));
  const tax = money((subtotal - safeDiscount) * Number(taxRate || 0));
  return { subtotal, discount: safeDiscount, tax, total: money(subtotal - safeDiscount + tax) };
}
//# sourceMappingURL=invoice.js.map
