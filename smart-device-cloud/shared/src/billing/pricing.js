const zeroUsage = () => ({
  device_hour: 0,
  emulator_hour: 0,
  remote_session_min: 0,
  browser_profile: 0,
  api_call: 0,
  storage_gb: 0,
  workflow_run: 0,
  ai_token: 0,
  mcp_call: 0,
});
export const DEFAULT_RATE_CARDS = {
  free: {
    planTier: 'free',
    rates: {
      device_hour: 0,
      emulator_hour: 0,
      remote_session_min: 0,
      browser_profile: 0,
      api_call: 0,
      storage_gb: 0,
      workflow_run: 0,
      ai_token: 0,
      mcp_call: 0,
    },
    includedUnits: {
      device_hour: 10,
      emulator_hour: 5,
      remote_session_min: 60,
      browser_profile: 2,
      api_call: 1000,
      storage_gb: 1,
      workflow_run: 10,
      ai_token: 10000,
      mcp_call: 100,
    },
    currency: 'USD',
  },
  starter: {
    planTier: 'starter',
    rates: {
      device_hour: 0.05,
      emulator_hour: 0.02,
      remote_session_min: 0.01,
      browser_profile: 1,
      api_call: 0.0001,
      storage_gb: 0.02,
      workflow_run: 0.01,
      ai_token: 0.000002,
      mcp_call: 0.001,
    },
    includedUnits: {
      device_hour: 100,
      emulator_hour: 50,
      remote_session_min: 600,
      browser_profile: 10,
      api_call: 10000,
      storage_gb: 10,
      workflow_run: 100,
      ai_token: 100000,
      mcp_call: 1000,
    },
    currency: 'USD',
  },
  pro: {
    planTier: 'pro',
    rates: {
      device_hour: 0.04,
      emulator_hour: 0.015,
      remote_session_min: 0.008,
      browser_profile: 0.8,
      api_call: 0.00008,
      storage_gb: 0.018,
      workflow_run: 0.008,
      ai_token: 0.0000015,
      mcp_call: 0.0008,
    },
    includedUnits: {
      device_hour: 500,
      emulator_hour: 250,
      remote_session_min: 3000,
      browser_profile: 50,
      api_call: 100000,
      storage_gb: 50,
      workflow_run: 1000,
      ai_token: 1000000,
      mcp_call: 10000,
    },
    currency: 'USD',
  },
  enterprise: {
    planTier: 'enterprise',
    rates: {
      device_hour: 0.03,
      emulator_hour: 0.01,
      remote_session_min: 0.005,
      browser_profile: 0.5,
      api_call: 0.00005,
      storage_gb: 0.015,
      workflow_run: 0.005,
      ai_token: 0.000001,
      mcp_call: 0.0005,
    },
    includedUnits: zeroUsage(),
    currency: 'USD',
  },
};
export function getRateCard(plan) {
  return DEFAULT_RATE_CARDS[plan];
}
export function calculateUsageCost(usage, plan, rateCard = getRateCard(plan)) {
  let total = 0;
  for (const [resource, rawQuantity] of Object.entries(usage)) {
    const resourceType = resource;
    const quantity = Number(rawQuantity);
    if (!Number.isFinite(quantity) || quantity < 0)
      throw new Error(`Invalid usage for ${resource}`);
    const included = rateCard.includedUnits[resourceType] ?? 0;
    const billable = Math.max(0, quantity - included);
    total += billable * (rateCard.rates[resourceType] ?? 0);
  }
  return roundMoney(total);
}
export function calculateBill(tenantId, plan, usage, discount = 0) {
  const card = getRateCard(plan);
  const lineItems = [];
  const billableUnits = {};
  for (const [resource, rawQuantity] of Object.entries(usage)) {
    const resourceType = resource;
    const quantity = Number(rawQuantity);
    if (!Number.isFinite(quantity) || quantity < 0)
      throw new Error(`Invalid usage for ${resource}`);
    const included = card.includedUnits[resourceType] ?? 0;
    const billableQuantity = Math.max(0, quantity - included);
    const unitPrice = card.rates[resourceType] ?? 0;
    const subtotal = billableQuantity * unitPrice;
    billableUnits[resourceType] = billableQuantity;
    lineItems.push({ resourceType, quantity, included, billableQuantity, unitPrice, subtotal });
  }
  const safeDiscount = Math.min(Math.max(Number(discount) || 0, 0), 100);
  const subtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = (subtotal * safeDiscount) / 100;
  return {
    planTier: plan,
    currency: 'USD',
    usage: { ...usage },
    billableUnits,
    lineItems,
    subtotal: roundMoney(subtotal),
    discount: roundMoney(discountAmount),
    total: roundMoney(subtotal - discountAmount),
  };
}
export function roundMoney(value) {
  if (!Number.isFinite(value)) throw new Error('Money value must be finite');
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
//# sourceMappingURL=pricing.js.map
