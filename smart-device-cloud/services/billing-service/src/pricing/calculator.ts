import { getRateCard } from '@smart-device-cloud/shared';
import type { PlanTier, ResourceType } from '@smart-device-cloud/shared';

export interface BillingCalculation {
  tenantId: string;
  planTier: PlanTier;
  lineItems: {
    resourceType: ResourceType;
    quantity: number;
    billableQuantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  total: number;
}

export function calculateBill(
  tenantId: string,
  planTier: PlanTier,
  usage: Partial<Record<ResourceType, number>>
): BillingCalculation {
  const card = getRateCard(planTier);
  const lineItems = (Object.entries(usage) as [ResourceType, number][]).map(
    ([resourceType, quantity]) => {
      const included = card.includedUnits[resourceType] ?? 0;
      const billableQuantity = Math.max(0, quantity - included);
      const unitPrice = card.rates[resourceType] ?? 0;
      return {
        resourceType,
        quantity,
        billableQuantity,
        unitPrice,
        subtotal: billableQuantity * unitPrice,
      };
    }
  );
  return { tenantId, planTier, lineItems, total: lineItems.reduce((s, l) => s + l.subtotal, 0) };
}
