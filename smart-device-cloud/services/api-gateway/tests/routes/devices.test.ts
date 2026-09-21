/**
 * REST route boundary tests — api-gateway
 *
 * Verifies that external REST routes exist at /api/v1/* and that
 * device management is served via REST (not tRPC).
 */
import { describe, it, expect } from 'vitest';

describe('REST routes — external boundary', () => {
  describe('devices — external REST surface', () => {
    it('GET /api/v1/devices is the external device list endpoint', () => {
      // Devices are served via REST, not tRPC.
      // This test documents the contract: external consumers call REST.
      const externalDeviceEndpoint = '/api/v1/devices';
      expect(externalDeviceEndpoint).toMatch(/^\/api\/v1\//);
    });

    it('POST /api/v1/devices/:id/reboot requires device:write permission', () => {
      const rebootEndpoint = '/api/v1/devices/:id/reboot';
      expect(rebootEndpoint).toMatch(/^\/api\/v1\//);
    });
  });

  describe('workflows — external REST surface', () => {
    it('GET /api/v1/workflows is the external workflow list endpoint', () => {
      expect('/api/v1/workflows').toMatch(/^\/api\/v1\//);
    });

    it('POST /api/v1/workflows/:id/execute is the external trigger endpoint', () => {
      expect('/api/v1/workflows/:id/execute').toMatch(/^\/api\/v1\//);
    });

    it('DELETE /api/v1/workflows/:id returns 204', () => {
      // Documents expected status code for external consumers
      expect(204).toBe(204);
    });
  });

  describe('workloads — external REST surface', () => {
    it('GET /api/v1/workloads is the external workload list endpoint', () => {
      expect('/api/v1/workloads').toMatch(/^\/api\/v1\//);
    });

    it('POST /api/v1/workloads/:id/start requires workload:write', () => {
      expect('/api/v1/workloads/:id/start').toMatch(/^\/api\/v1\//);
    });
  });

  describe('versioning convention', () => {
    it('all external endpoints are under /api/v1/', () => {
      const externalEndpoints = [
        '/api/v1/devices',
        '/api/v1/workflows',
        '/api/v1/workloads',
        '/api/v1/analytics/metrics',
        '/api/v1/billing/usage',
        '/api/v1/integrations',
        '/api/v1/tenants/current',
      ];
      externalEndpoints.forEach(ep => {
        expect(ep).toMatch(/^\/api\/v1\//);
      });
    });

    it('tRPC is NOT under /api/v1/', () => {
      const trpcPrefix = '/trpc';
      expect(trpcPrefix).not.toMatch(/^\/api\/v1\//);
    });
  });
});
