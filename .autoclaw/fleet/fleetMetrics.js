"use strict";
/**
 * fleetMetrics.ts — LANE C: per-agent metrics rollup from the LLM cost ledger.
 *
 * Surfaces real per-agent token + dollar figures (tokensIn / tokensOut /
 * tokensTotal / costUsd / dispatches) plus a fleet total, so the sidebar agent
 * card and the wide Manager can show a compact metrics line instead of guessing.
 *
 * Data source — IMPORTANT, three ledgers live in this tree and only ONE is right:
 *   - `.autoclaw/llm/cost-ledger.jsonl`         ← THIS module reads this one.
 *   - `.autoclaw/orchestrator/cost-ledger.jsonl`  (read by fleetData.readCostLedger;
 *                                                  single-number tokens + wallMs, has
 *                                                  agentId — DIFFERENT shape, do not mix.)
 *   - `.autoclaw/mcp/…`                           (MCP call ledger — unrelated.)
 *
 * The LLM ledger is written by {@link ../llm/costLedger.CostLedger} as `LedgerRow`
 * objects: `{ timestamp, provider, model, operation, tokens:{input,output},
 * costCents (INTEGER CENTS), runId?, sessionId?, callerPersonaId? }`. Two facts
 * drive everything below:
 *   1. `costCents` is **cents**, not dollars — `costUsd = costCents / 100`. A
 *      naive cents→dollars miss is a 100x error. Local-only fleets legitimately
 *      show $0.00 (local models cost 0 cents); that is NOT "broken".
 *   2. The row carries **no agentId**. We attribute each row to an agent via the
 *      caller's persona id / session id / run id (see {@link MetricsAttribution}).
 *      Rows that resolve to no known agent fall into an `unattributed` bucket —
 *      kept and surfaced, never dropped, so totals always reconcile. The single
 *      biggest correctness risk here is attribution: in a single-agent setup with
 *      no session id on the rows, everything lands in `unattributed` and per-agent
 *      rows read zero. That is expected, not a bug.
 *
 * Design constraints (so it stays unit-testable like {@link ../fleet/fleetDigest}):
 *   - PURE core. `buildAgentMetrics` takes ALREADY-PARSED rows + an attribution
 *     hint map + the timestamp as ARGUMENTS — no `vscode`, no `Date.now()`, no
 *     hidden state. Same `(rows, attribution, timestamp)` ⇒ identical output.
 *   - One thin fs reader ({@link readLlmLedgerRows}) is provided for the extension
 *     host's convenience. It is `fs`-only (no `vscode`) and swallows every error
 *     the same way `costLedger.readAll` does, so it is still exercised by unit
 *     tests against ephemeral ledger files. The pure builder never touches disk.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLM_COST_LEDGER_REL_PATH = exports.UNATTRIBUTED_AGENT_ID = exports.FLEET_TOTAL_AGENT_ID = void 0;
exports.formatTokens = formatTokens;
exports.formatUsd = formatUsd;
exports.buildAgentMetrics = buildAgentMetrics;
exports.readLlmLedgerRows = readLlmLedgerRows;
exports.gatherAgentMetrics = gatherAgentMetrics;
const fs = require("fs");
const path = require("path");
// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
/** Sentinel agent id for the fleet-wide total row. */
exports.FLEET_TOTAL_AGENT_ID = '__fleet__';
/** Bucket id rows land in when no agent can be attributed. */
exports.UNATTRIBUTED_AGENT_ID = 'unattributed';
/**
 * Workspace-relative path of the LLM cost ledger this module reads. Mirrors the
 * path {@link ../llm/costLedger.CostLedger} appends to.
 */
exports.LLM_COST_LEDGER_REL_PATH = '.autoclaw/llm/cost-ledger.jsonl';
// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
/** Normalize a number|string timestamp to a stable ISO string. */
function toIso(timestamp) {
    if (typeof timestamp === 'string') {
        return timestamp;
    }
    return new Date(timestamp).toISOString();
}
/** Coerce an unknown to a finite number, defaulting non-numbers/NaN to 0. */
function num(v) {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : 0;
}
/** Round to cents (2 dp) without floating-point drift creeping in. */
function round2(n) {
    return Math.round(n * 100) / 100;
}
/** Fresh zeroed accumulator for an agent id. */
function emptyMetrics(agentId) {
    return { agentId, tokensIn: 0, tokensOut: 0, tokensTotal: 0, costUsd: 0, dispatches: 0 };
}
/**
 * Compact a token count to a human label: `840`, `12.3k`, `1.2M`. Used by the
 * renderers (sidebar pip + dashboard) so the two views format identically. Pure
 * + locale-free so unit tests can pin the exact string.
 */
function formatTokens(tokens) {
    const n = num(tokens);
    const abs = Math.abs(n);
    if (abs < 1000) {
        return String(Math.round(n));
    }
    if (abs < 1000000) {
        return trimZero(n / 1000) + 'k';
    }
    return trimZero(n / 1000000) + 'M';
}
/** One decimal place, but drop a trailing `.0` (`1.0k` → `1k`). */
function trimZero(n) {
    const s = n.toFixed(1);
    return s.endsWith('.0') ? s.slice(0, -2) : s;
}
/**
 * Format a dollar amount for the dashboard: `$0.00`, `$1.20`, `$14.50`. Kept
 * here next to {@link formatTokens} so both views agree on currency rendering.
 */
function formatUsd(usd) {
    return '$' + num(usd).toFixed(2);
}
/**
 * Resolve the agent a ledger row belongs to, or {@link UNATTRIBUTED_AGENT_ID}.
 * Resolution order matches the doc on {@link MetricsAttribution}.
 */
function attribute(row, attribution) {
    const known = attribution.known;
    const bySession = attribution.bySession;
    const byPersona = attribution.byPersona;
    const persona = row.callerPersonaId;
    if (persona) {
        // 1. callerPersonaId is itself a known agent id.
        if (known.has(persona)) {
            return persona;
        }
        // 2. callerPersonaId → mapped agent.
        if (byPersona[persona]) {
            return byPersona[persona];
        }
    }
    // 3. sessionId → mapped agent.
    const session = row.sessionId;
    if (session && bySession[session]) {
        return bySession[session];
    }
    // 4. runId is frequently a persona dispatch / session id — try both maps.
    const run = row.runId;
    if (run) {
        if (known.has(run)) {
            return run;
        }
        if (byPersona[run]) {
            return byPersona[run];
        }
        if (bySession[run]) {
            return bySession[run];
        }
    }
    return exports.UNATTRIBUTED_AGENT_ID;
}
// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------
/**
 * Roll up parsed LLM-ledger rows into per-agent metrics + a fleet total.
 *
 * Pure + deterministic: the caller passes `timestamp` (no `Date.now()` here),
 * so the same `(rows, attribution, timestamp)` triple always yields the same
 * object. Tolerant of garbage input — non-object rows are skipped, missing /
 * NaN tokens + costs coerce to 0, and an empty `rows` array yields a fully
 * zeroed total.
 *
 * @param rows        Already-parsed ledger rows (see {@link readLlmLedgerRows}).
 * @param attribution sessionId/persona → agent maps + the known-agents set.
 * @param timestamp   ISO string or epoch-ms the rollup was generated at.
 */
function buildAgentMetrics(rows, attribution, timestamp) {
    // Pre-resolve the known-agents set once; reused inside attribute().
    const resolved = {
        known: new Set((attribution?.knownAgents ?? []).filter((a) => typeof a === 'string' && a.length > 0)),
        bySession: attribution?.bySession ?? {},
        byPersona: attribution?.byPersona ?? {},
    };
    const byAgent = new Map();
    const total = emptyMetrics(exports.FLEET_TOTAL_AGENT_ID);
    const unattributed = emptyMetrics(exports.UNATTRIBUTED_AGENT_ID);
    for (const raw of Array.isArray(rows) ? rows : []) {
        // Skip non-object / null rows — never throw on bad input.
        if (!raw || typeof raw !== 'object') {
            continue;
        }
        const row = raw;
        const tokensIn = Math.max(0, num(row.tokens?.input));
        const tokensOut = Math.max(0, num(row.tokens?.output));
        // costCents is integer cents; coerce, floor negatives to 0, → USD.
        const usd = Math.max(0, num(row.costCents)) / 100;
        const agentId = attribute(row, resolved);
        const bucket = agentId === exports.UNATTRIBUTED_AGENT_ID
            ? unattributed
            : (byAgent.get(agentId) ?? byAgent.set(agentId, emptyMetrics(agentId)).get(agentId));
        bucket.tokensIn += tokensIn;
        bucket.tokensOut += tokensOut;
        bucket.dispatches += 1;
        bucket.costUsd += usd;
        total.tokensIn += tokensIn;
        total.tokensOut += tokensOut;
        total.dispatches += 1;
        total.costUsd += usd;
    }
    // Finalize derived + rounded fields on every bucket.
    const perAgent = [...byAgent.values()];
    for (const m of [...perAgent, total, unattributed]) {
        m.tokensTotal = m.tokensIn + m.tokensOut;
        m.costUsd = round2(m.costUsd);
    }
    // Deterministic order: biggest spend first, then biggest token use, then id.
    perAgent.sort((a, b) => b.costUsd - a.costUsd ||
        b.tokensTotal - a.tokensTotal ||
        a.agentId.localeCompare(b.agentId));
    return {
        perAgent,
        total: total,
        unattributed,
        generatedAt: toIso(timestamp),
    };
}
// ---------------------------------------------------------------------------
// Thin fs reader (fs-only, vscode-free — still unit-testable on temp files)
// ---------------------------------------------------------------------------
/**
 * Read + parse the LLM cost ledger at `<workspaceRoot>/.autoclaw/llm/cost-ledger.jsonl`.
 *
 * Best-effort and totally non-throwing, mirroring `costLedger.readAll`:
 *   - Missing file ⇒ `[]` (callers then build a zeroed rollup).
 *   - A leading UTF-8 BOM is stripped.
 *   - Blank lines are skipped; a malformed JSON line is skipped (not fatal).
 *
 * The ledger is append-only and unrotated on the LLM side, so `limit` keeps the
 * read bounded on a long-lived workspace: when set, only the **last** `limit`
 * non-blank lines are parsed (the most recent activity), mirroring the MCP
 * ledger's `readRecent(limit)`. Omit `limit` to read everything.
 */
async function readLlmLedgerRows(workspaceRoot, limit) {
    const file = path.join(workspaceRoot, '.autoclaw', 'llm', 'cost-ledger.jsonl');
    let raw;
    try {
        raw = await fs.promises.readFile(file, 'utf8');
    }
    catch {
        // Missing/unreadable ledger ⇒ no rows. Never throw.
        return [];
    }
    // Strip a leading BOM if present, then split on either newline style.
    if (raw.charCodeAt(0) === 0xfeff) {
        raw = raw.slice(1);
    }
    let lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (typeof limit === 'number' && limit >= 0 && lines.length > limit) {
        lines = lines.slice(lines.length - limit);
    }
    const out = [];
    for (const line of lines) {
        try {
            const parsed = JSON.parse(line);
            if (parsed && typeof parsed === 'object') {
                out.push(parsed);
            }
        }
        catch {
            /* skip malformed line */
        }
    }
    return out;
}
/**
 * Convenience: read the ledger and roll it up in one call. Equivalent to
 * `buildAgentMetrics(await readLlmLedgerRows(root, limit), attribution, ts)`.
 * Returns a fully-zeroed rollup when the ledger is missing.
 */
async function gatherAgentMetrics(workspaceRoot, attribution, timestamp, limit) {
    const rows = await readLlmLedgerRows(workspaceRoot, limit);
    return buildAgentMetrics(rows, attribution, timestamp);
}
//# sourceMappingURL=fleetMetrics.js.map