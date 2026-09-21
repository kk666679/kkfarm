import type { FastifyInstance } from 'fastify';
import type { GatewayConfig } from '../config.js';
import { AdapterRegistry } from '../adapters/adapter-registry.js';
import { InternalAdapter } from '../adapters/internal.adapter.js';
import { TelemetryAdapter } from '../adapters/telemetry.adapter.js';
import { WorkloadAdapter } from '../adapters/workload.adapter.js';
import { AnalyticsAdapter } from '../adapters/analytics.adapter.js';
import { DeviceAgentAdapter } from '../adapters/device-agent.adapter.js';
import { BillingAdapter } from '../adapters/billing.adapter.js';
import { McpAdapter } from '../adapters/mcp.adapter.js';
import { AutoClawAdapter } from '../adapters/autoclaw.adapter.js';
import { FarmsAdapter } from '../adapters/farms.adapter.js';

export interface GatewayAdapters {
  internal: InternalAdapter;
  telemetry: TelemetryAdapter;
  workload: WorkloadAdapter;
  analytics: AnalyticsAdapter;
  deviceAgent: DeviceAgentAdapter;
  billing: BillingAdapter;
  mcp: McpAdapter;
  autoclaw: AutoClawAdapter;
  farms?: FarmsAdapter;
}

export async function registerAdapters(config: GatewayConfig): Promise<GatewayAdapters> {
  const registry = new AdapterRegistry();

  registry.register('internal', new InternalAdapter());
  registry.register('telemetry', new TelemetryAdapter(config.telemetryUrl, null));
  registry.register('workload', new WorkloadAdapter(config.workloadUrl, null));
  registry.register('analytics', new AnalyticsAdapter(config.analyticsUrl, null));
  registry.register('deviceAgent', new DeviceAgentAdapter(config.deviceAgentUrl, null));
  registry.register('billing', new BillingAdapter(config.billingUrl, null));
  registry.register('mcp', new McpAdapter(config.mcpServers, config.mcpToken));
  registry.register('autoclaw', new AutoClawAdapter(config.autoclawWs, null));

  if (config.farmsUrl) {
    registry.register('farms', new FarmsAdapter(config.farmsUrl, null));
  }

  return registry.asObject() as unknown as GatewayAdapters;
}
