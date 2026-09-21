export type PlanTier = 'free' | 'starter' | 'pro' | 'enterprise';
export type ResourceType =
  | 'device_hour'
  | 'emulator_hour'
  | 'remote_session_min'
  | 'browser_profile'
  | 'api_call'
  | 'storage_gb'
  | 'workflow_run'
  | 'ai_token'
  | 'mcp_call';
export interface RateCard {
  planTier: PlanTier;
  rates: Record<ResourceType, number>;
  includedUnits: Record<ResourceType, number>;
  currency: 'USD';
}
export interface UsageAmounts {
  [resource: string]: number;
}
export interface PricingQuote {
  planTier: PlanTier;
  currency: 'USD';
  usage: Partial<Record<ResourceType, number>>;
  billableUnits: Partial<Record<ResourceType, number>>;
  lineItems: PricingLineItem[];
  subtotal: number;
  discount: number;
  total: number;
}
export interface PricingLineItem {
  resourceType: ResourceType;
  quantity: number;
  included: number;
  billableQuantity: number;
  unitPrice: number;
  subtotal: number;
}
export declare const DEFAULT_RATE_CARDS: Record<PlanTier, RateCard>;
export declare function getRateCard(plan: PlanTier): RateCard;
export declare function calculateUsageCost(
  usage: UsageAmounts,
  plan: PlanTier,
  rateCard?: RateCard
): number;
export declare function calculateBill(
  tenantId: string,
  plan: PlanTier,
  usage: UsageAmounts,
  discount?: number
): PricingQuote;
export declare function roundMoney(value: number): number;
//# sourceMappingURL=pricing.d.ts.map
