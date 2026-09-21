"use strict";
/**
 * metrics.ts — Fleet-level latency + throughput metrics for the AutoClaw panel.
 *
 * Inspired by zippy-mcp-kit's p50/p95/p99 instrumentation pattern.
 * Records task durations and computes percentiles from a rolling window.
 *
 * Usage:
 *   import { recordTaskDuration, getFleetMetrics } from './metrics';
 *   recordTaskDuration('task-id', 'agent-1', 45_000);
 *   const m = getFleetMetrics();
 *   m.p50_ms, m.p95_ms, m.p99_ms, m.throughput_per_hour
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordTaskDuration = recordTaskDuration;
exports.getFleetMetrics = getFleetMetrics;
exports.resetMetrics = resetMetrics;
exports.setMetricsWindowMs = setMetricsWindowMs;
// ---------------------------------------------------------------------------
// Rolling window store
// ---------------------------------------------------------------------------
const DEFAULT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_SAMPLES = 10000;
let samples = [];
let windowMs = DEFAULT_WINDOW_MS;
// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
/**
 * Record a completed task's duration. Call after a task finishes (or fails).
 */
function recordTaskDuration(taskId, agentId, durationMs) {
    if (durationMs < 0) {
        return;
    }
    samples.push({ task_id: taskId, agent_id: agentId, duration_ms: durationMs, recorded_at: Date.now() });
    if (samples.length > MAX_SAMPLES) {
        samples = samples.slice(samples.length - MAX_SAMPLES);
    }
}
/**
 * Compute fleet metrics over the rolling time window.
 * Returns null when no samples are available.
 */
function getFleetMetrics(overrideWindowMs) {
    var _a;
    const win = overrideWindowMs ?? windowMs;
    const cutoff = Date.now() - win;
    const window = samples.filter(s => s.recorded_at >= cutoff);
    if (window.length === 0) {
        return null;
    }
    const durations = window.map(s => s.duration_ms).sort((a, b) => a - b);
    const n = durations.length;
    const p50 = percentile(durations, 0.50);
    const p95 = percentile(durations, 0.95);
    const p99 = percentile(durations, 0.99);
    const min = durations[0];
    const max = durations[n - 1];
    const mean = durations.reduce((a, b) => a + b, 0) / n;
    const oldestAt = window.reduce((a, s) => Math.min(a, s.recorded_at), Infinity);
    const newestAt = window.reduce((a, s) => Math.max(a, s.recorded_at), 0);
    const spanMs = Math.max(newestAt - oldestAt, 1);
    const throughputPerHour = n > 1 ? (n / spanMs) * 3600000 : 0;
    // Per-agent breakdown
    const byAgent = {};
    for (const s of window) {
        (byAgent[_a = s.agent_id] ?? (byAgent[_a] = [])).push(s.duration_ms);
    }
    const byAgentResult = {};
    for (const [agentId, d] of Object.entries(byAgent)) {
        d.sort((a, b) => a - b);
        byAgentResult[agentId] = { p50_ms: percentile(d, 0.50), count: d.length };
    }
    return {
        sample_count: n,
        p50_ms: p50,
        p95_ms: p95,
        p99_ms: p99,
        min_ms: min,
        max_ms: max,
        mean_ms: mean,
        throughput_per_hour: throughputPerHour,
        window_start: new Date(oldestAt).toISOString(),
        window_end: new Date(newestAt).toISOString(),
        by_agent: byAgentResult,
    };
}
/**
 * Reset all samples (used in tests and on extension deactivation).
 */
function resetMetrics() {
    samples = [];
}
/**
 * Set the rolling window duration (default: 1 hour).
 */
function setMetricsWindowMs(ms) {
    windowMs = ms;
}
// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function percentile(sorted, p) {
    if (sorted.length === 0) {
        return 0;
    }
    if (sorted.length === 1) {
        return sorted[0];
    }
    const idx = p * (sorted.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi) {
        return sorted[lo];
    }
    const frac = idx - lo;
    return sorted[lo] * (1 - frac) + sorted[hi] * frac;
}
//# sourceMappingURL=metrics.js.map