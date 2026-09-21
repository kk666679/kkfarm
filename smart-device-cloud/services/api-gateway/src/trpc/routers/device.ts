/**
 * device — REMOVED from tRPC.
 *
 * Device management is an external/public API surface.
 * Use REST: GET /api/v1/devices, GET /api/v1/devices/:id, POST /api/v1/devices/:id/reboot
 *
 * This file is kept as a stub so existing imports don't break during migration.
 * @deprecated Use REST /api/v1/devices instead.
 */
import { router } from '../trpc.js';

export const deviceRouter = router({});
