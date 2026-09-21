/**
 * tRPC App Router — INTERNAL USE ONLY
 *
 * This router is mounted at /trpc and is intended exclusively for:
 *   - Trusted internal service-to-service communication
 *   - Dashboard UI (same-origin, authenticated)
 *   - Device agents (authenticated via service tokens)
 *
 * DO NOT expose /trpc to external consumers, third-party integrations,
 * mobile clients, or partner APIs.
 *
 * External/public API surface → REST at /api/v1/*
 *
 * Boundary convention:
 *   /trpc/workflow.*     → internal workflow orchestration
 *   /trpc/workload.*     → internal workload management
 *   /trpc/tenant.*       → internal tenant context
 *   /trpc/analytics.*    → internal metrics for dashboard
 *   /trpc/billing.*      → internal billing queries
 *   /trpc/integration.*  → internal integration management
 *   /trpc/agent.*        → device-agent ↔ gateway heartbeat/registration
 *   /trpc/telemetry.*    → internal telemetry queries
 *   /trpc/ai.*           → internal AI tool invocations
 *   /trpc/browser.*      → internal browser session management
 *   /trpc/emulator.*     → internal emulator lifecycle
 *   /trpc/remote.*       → internal remote control sessions
 *   /trpc/mcp.*          → internal MCP tool dispatch
 *
 * NOTE: device.* has been removed from tRPC.
 *       Device management is an external/public surface → REST /api/v1/devices
 */
import { router } from '../trpc.js';
import { workloadRouter } from './workload.js';
import { workflowRouter } from './workflow.js';
import { integrationRouter } from './integration.js';
import { aiRouter } from './ai.js';
import { browserRouter } from './browser.js';
import { emulatorRouter } from './emulator.js';
import { remoteRouter } from './remote.js';
import { telemetryRouter } from './telemetry.js';
import { analyticsRouter } from './analytics.js';
import { billingRouter } from './billing.js';
import { tenantRouter } from './tenant.js';
import { agentRouter } from './agent.js';
import { mcpRouter } from './mcp.js';

export const appRouter = router({
  workload: workloadRouter,
  workflow: workflowRouter,
  integration: integrationRouter,
  ai: aiRouter,
  browser: browserRouter,
  emulator: emulatorRouter,
  remote: remoteRouter,
  telemetry: telemetryRouter,
  analytics: analyticsRouter,
  billing: billingRouter,
  tenant: tenantRouter,
  agent: agentRouter,
  mcp: mcpRouter,
});

export type AppRouter = typeof appRouter;
