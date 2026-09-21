import { describe, it, expect } from 'vitest';
import { calculateBill } from '../../services/billing-service/src/pricing/calculator';
import { InvoiceGenerator } from '../../services/billing-service/src/invoicing/invoice-generator';
import { applyDiscount } from '../../services/billing-service/src/pricing/discount';

describe('billing integration', () => {
  it('calculates bill with included units', () => {
    const calc = calculateBill('tenant-1', 'starter', { device_hour: 150, api_call: 5000 });
    // starter includes 100 device_hours → 50 billable at $0.05 = $2.50
    // starter includes 10000 api_calls → 0 billable
    expect(calc.total).toBeCloseTo(2.5);
  });

  it('generates and issues an invoice', () => {
    const calc = calculateBill('tenant-1', 'pro', { emulator_hour: 300 });
    const gen = new InvoiceGenerator();
    const invoice = gen.generate(calc, { from: '2026-01-01', to: '2026-01-31' });
    expect(invoice.status).toBe('draft');

    const issued = gen.markIssued(invoice.id);
    expect(issued?.status).toBe('issued');
  });

  it('applies percentage discount', () => {
    const discounted = applyDiscount(100, {
      id: 'd1',
      tenantId: 't1',
      type: 'percentage',
      value: 20,
      reason: 'promo',
    });
    expect(discounted).toBe(80);
  });
});
