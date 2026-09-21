export type DiscountType = 'percentage' | 'fixed';

export interface Discount {
  id: string;
  tenantId: string;
  type: DiscountType;
  value: number; // percent (0-100) or fixed USD
  reason: string;
  expiresAt?: string;
}

export function applyDiscount(subtotal: number, discount: Discount): number {
  if (discount.expiresAt && discount.expiresAt < new Date().toISOString()) return subtotal;
  if (discount.type === 'percentage') return subtotal * (1 - discount.value / 100);
  return Math.max(0, subtotal - discount.value);
}
