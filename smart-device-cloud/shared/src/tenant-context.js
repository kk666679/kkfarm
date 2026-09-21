import { AsyncLocalStorage } from 'node:async_hooks';
import { getRegionConfig, isValidRegion } from './cloud-regions';
const _store = new Map();
const _requestContext = new AsyncLocalStorage();
function cloneContext(context) {
  return {
    ...context,
    features: [...context.features],
    quotas: { ...context.quotas },
  };
}
export function setTenantContext(ctx) {
  if (!ctx.tenantId.trim()) throw new Error('Tenant ID is required');
  if (!isValidRegion(ctx.region)) throw new Error(`Unsupported tenant region: ${ctx.region}`);
  _store.set(ctx.tenantId, cloneContext(ctx));
}
export function getTenantContext(tenantId) {
  const context = _store.get(tenantId);
  return context ? cloneContext(context) : undefined;
}
export function requireTenantContext(tenantId) {
  const context = getTenantContext(tenantId);
  if (!context) throw new Error(`Tenant context not found: ${tenantId}`);
  return context;
}
export function getCurrentTenantContext() {
  return _requestContext.getStore();
}
export function runWithTenantContext(context, work) {
  return _requestContext.run(cloneContext(context), work);
}
export function clearTenantContext(tenantId) {
  return _store.delete(tenantId);
}
export function hasFeature(context, feature) {
  return (
    !context.killSwitch && (context.features.includes(feature) || context.plan === 'enterprise')
  );
}
export function assertTenantAccess(access) {
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
export function withQuota(context, key, required, work) {
  const limit = context.quotas[key];
  if (limit !== undefined && required > limit)
    throw new Error(`Tenant quota exceeded: ${String(key)}`);
  return work();
}
//# sourceMappingURL=tenant-context.js.map
