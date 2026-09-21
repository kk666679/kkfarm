import { AsyncLocalStorage } from 'node:async_hooks';
import type { CloudRegion } from './cloud-regions';
import { getRegionConfig, isValidRegion } from './cloud-regions';

export type TenantPlan = 'free' | 'starter' | 'pro' | 'enterprise';
export type TenantIsolationMode = 'strict' | 'shared';

export interface TenantQuotas {
  devices?: number;
  sessions?: number;
  workflows?: number;
  apiCallsPerMinute?: number;
  storageGb?: number;
  costCeiling?: number;
}

export interface TenantContext {
  tenantId: string;
  tenantName?: string;
  plan: TenantPlan;
  region: CloudRegion | string;
  features: string[];
  isolationMode: TenantIsolationMode;
  quotas: TenantQuotas;
  killSwitch: boolean;
  updatedAt: string;
}

export interface TenantAccess {
  tenantId: string;
  feature?: string;
  region?: CloudRegion | string;
  cost?: number;
}

const _store = new Map<string, TenantContext>();
const _requestContext = new AsyncLocalStorage<TenantContext>();

function cloneContext(context: TenantContext): TenantContext {
  return {
    ...context,
    features: [...context.features],
    quotas: { ...context.quotas },
  };
}

export function setTenantContext(ctx: TenantContext): void {
  if (!ctx.tenantId.trim()) throw new Error('Tenant ID is required');
  if (!isValidRegion(ctx.region)) throw new Error(`Unsupported tenant region: ${ctx.region}`);
  _store.set(ctx.tenantId, cloneContext(ctx));
}

export function getTenantContext(tenantId: string): TenantContext | undefined {
  const context = _store.get(tenantId);
  return context ? cloneContext(context) : undefined;
}

export function requireTenantContext(tenantId: string): TenantContext {
  const context = getTenantContext(tenantId);
  if (!context) throw new Error(`Tenant context not found: ${tenantId}`);
  return context;
}

export function getCurrentTenantContext(): TenantContext | undefined {
  return _requestContext.getStore();
}

export function runWithTenantContext<T>(context: TenantContext, work: () => T): T {
  return _requestContext.run(cloneContext(context), work);
}

export function clearTenantContext(tenantId: string): boolean {
  return _store.delete(tenantId);
}

export function hasFeature(context: TenantContext, feature: string): boolean {
  return (
    !context.killSwitch && (context.features.includes(feature) || context.plan === 'enterprise')
  );
}

export function assertTenantAccess(access: TenantAccess): TenantContext {
  const context = requireTenantContext(access.tenantId);
  if (context.killSwitch) throw new Error(`Tenant is disabled: ${access.tenantId}`);
  if (access.feature && !hasFeature(context, access.feature)) {
    throw new Error(`Feature is not enabled for tenant: ${access.feature}`);
  }
  if (access.region) {
    const region = String(access.region);
    if (!isValidRegion(region) || !getRegionConfig(region))
      throw new Error(`Region is not allowed: ${region}`);
    if (region !== context.region && context.isolationMode === 'strict') {
      throw new Error(`Tenant region mismatch: ${region}`);
    }
  }
  if (access.cost !== undefined) {
    const ceiling = context.quotas.costCeiling;
    if (ceiling !== undefined && access.cost > ceiling)
      throw new Error('Tenant cost ceiling exceeded');
  }
  return context;
}

export function withQuota<T>(
  context: TenantContext,
  key: keyof TenantQuotas,
  required: number,
  work: () => T
): T {
  const limit = context.quotas[key];
  if (limit !== undefined && required > limit)
    throw new Error(`Tenant quota exceeded: ${String(key)}`);
  return work();
}
