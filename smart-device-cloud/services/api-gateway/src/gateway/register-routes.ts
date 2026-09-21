import type { FastifyInstance } from 'fastify';
import { deviceRoutes } from '../routes/v1/devices.js';
import { workloadRoutes } from '../routes/v1/workloads.js';
import { workflowRoutes } from '../routes/v1/workflows.js';
import { integrationRoutes } from '../routes/v1/integrations.js';
import { aiRoutes } from '../routes/v1/ai.js';
import { browserRoutes } from '../routes/v1/browsers.js';
import { emulatorRoutes } from '../routes/v1/emulators.js';
import { remoteRoutes } from '../routes/v1/remote.js';
import { telemetryRoutes } from '../routes/v1/telemetry.js';
import { analyticsRoutes } from '../routes/v1/analytics.js';
import { billingRoutes } from '../routes/v1/billing.js';
import { tenantRoutes } from '../routes/v1/tenants.js';
import { mcpFacadeRoutes } from '../routes/v1/mcp.js';

export async function registerRoutes(
  app: FastifyInstance,
  opts: { prefix: string }
): Promise<void> {
  await app.register(
    async v1 => {
      await v1.register(deviceRoutes);
      await v1.register(workloadRoutes);
      await v1.register(workflowRoutes);
      await v1.register(integrationRoutes);
      await v1.register(aiRoutes);
      await v1.register(browserRoutes);
      await v1.register(emulatorRoutes);
      await v1.register(remoteRoutes);
      await v1.register(telemetryRoutes);
      await v1.register(analyticsRoutes);
      await v1.register(billingRoutes);
      await v1.register(tenantRoutes);
      await v1.register(mcpFacadeRoutes);
    },
    { prefix: opts.prefix }
  );
}
