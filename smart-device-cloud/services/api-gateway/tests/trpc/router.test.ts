/**
 * tRPC router boundary tests — api-gateway
 *
 * Verifies:
 * 1. device.* is NOT on tRPC (external → REST /api/v1/devices)
 * 2. Internal routers (workflow, workload, tenant, analytics, billing, integration, agent, telemetry) are present
 * 3. Each internal router exposes the expected procedures
 */
import { describe, it, expect } from 'vitest';
import { appRouter } from '../../src/trpc/routers/_app.js';

describe('tRPC router — api-gateway internal boundary', () => {
  const procedures = Object.keys(appRouter._def.procedures);

  describe('device.* removed from tRPC', () => {
    it('does not expose device.list', () => {
      expect(procedures.filter(p => p.startsWith('device.'))).toHaveLength(0);
    });
  });

  describe('internal routers present', () => {
    it('exposes workflow procedures', () => {
      expect(procedures).toContain('workflow.list');
      expect(procedures).toContain('workflow.byId');
      expect(procedures).toContain('workflow.execute');
      expect(procedures).toContain('workflow.status');
    });

    it('exposes workload procedures', () => {
      expect(procedures).toContain('workload.list');
      expect(procedures).toContain('workload.byId');
      expect(procedures).toContain('workload.start');
      expect(procedures).toContain('workload.stop');
    });

    it('exposes tenant procedures', () => {
      expect(procedures).toContain('tenant.current');
      expect(procedures).toContain('tenant.byId');
      expect(procedures).toContain('tenant.updateLimits');
    });

    it('exposes analytics procedures', () => {
      expect(procedures).toContain('analytics.metrics');
      expect(procedures).toContain('analytics.deviceUtilization');
    });

    it('exposes billing procedures', () => {
      expect(procedures).toContain('billing.usage');
      expect(procedures).toContain('billing.invoices');
    });

    it('exposes integration procedures', () => {
      expect(procedures).toContain('integration.list');
      expect(procedures).toContain('integration.create');
      expect(procedures).toContain('integration.delete');
    });

    it('exposes agent procedures', () => {
      expect(procedures).toContain('agent.heartbeat');
      expect(procedures).toContain('agent.register');
    });

    it('exposes telemetry procedures', () => {
      expect(procedures).toContain('telemetry.deviceMetrics');
      expect(procedures).toContain('telemetry.fleetSummary');
    });
  });
});
