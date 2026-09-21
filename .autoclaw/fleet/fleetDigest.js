"use strict";
/**
 * fleetDigest.ts — FLEET-DIGEST: one small, stable file an agent reads each
 * SYNC instead of re-walking beacons + every inbox + claims + board.json.
 *
 * Today a joining or looping agent must re-derive the whole fleet picture on
 * every cycle: read the registry, walk all heartbeats, scan every inbox + the
 * shared inbox + `_state/`, read the claims directory, and parse `board.json`.
 * FLEET-DIGEST collapses that into a single canonical artifact
 * (`fleet-status.json`) the orchestrator/panel writes once and every agent
 * reads once.
 *
 * Design constraints (so it stays unit-testable like `webview-render.ts`):
 *   - PURE. No `vscode` import, no `fs`, no network, no top-level side effects.
 *   - Deterministic. `buildFleetDigest` takes the timestamp as an ARGUMENT — it
 *     never calls `Date.now()` itself. Same input + same timestamp ⇒ byte-for-byte
 *     identical output.
 *   - DERIVED, not parallel. The digest is computed from the SAME render model the
 *     Fleet panel already builds (`FleetDashboardModel`, optionally carrying the
 *     orchestrator `board` the panel attaches as `{ ...model, board }`). There is
 *     no second data path to drift against.
 *
 * The writer (a later, separate stage) gathers the model exactly as the panel
 * does, calls {@link buildFleetDigest} + {@link serializeFleetDigest}, and writes
 * the result to {@link FLEET_STATUS_REL_PATH}.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FLEET_STATUS_REL_PATH = exports.FLEET_DIGEST_SCHEMA_VERSION = void 0;
exports.buildFleetDigest = buildFleetDigest;
exports.rollupFleet = rollupFleet;
exports.serializeFleetDigest = serializeFleetDigest;
// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
/**
 * Schema version of the digest envelope. Pinned — bump only on a
 * breaking shape change so readers can guard on it.
 */
exports.FLEET_DIGEST_SCHEMA_VERSION = 1;
/**
 * Workspace-relative path the digest is written to. A single file an agent
 * reads each SYNC in place of re-walking the whole comms tree.
 */
exports.FLEET_STATUS_REL_PATH = '.autoclaw/orchestrator/comms/fleet-status.json';
// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------
/**
 * Read an optional `current_llm`/`currentLlm` off a panel card without widening
 * the public card type. The panel's `AgentCard` does not declare a model field
 * today, but the model the writer hands us may carry one (e.g. from the agent's
 * heartbeat). Read it defensively and omit it when absent.
 */
function readCurrentLlm(card) {
    if (!card || typeof card !== 'object') {
        return undefined;
    }
    const c = card;
    const v = c.current_llm ?? c.currentLlm;
    return typeof v === 'string' && v.length > 0 ? v : undefined;
}
/** Normalize a number|string timestamp to a stable ISO string. */
function toIso(timestamp) {
    if (typeof timestamp === 'string') {
        return timestamp;
    }
    return new Date(timestamp).toISOString();
}
/**
 * Derive a short, stable fleet-phase label from already-computed counts. Kept
 * coarse on purpose so it doesn't churn on every heartbeat.
 *
 *  - `idle`        — no tracked agents.
 *  - `reviewing`   — at least one review is open.
 *  - `working`     — at least one agent is live and tasks are in flight.
 *  - `waiting`     — agents present but nothing in flight and no reviews.
 */
function deriveCycle(agentCount, inFlight, awaitingReview) {
    if (agentCount === 0) {
        return 'idle';
    }
    if (awaitingReview > 0) {
        return 'reviewing';
    }
    if (inFlight > 0) {
        return 'working';
    }
    return 'waiting';
}
/**
 * Collapse the Fleet panel's render model into a small, stable digest.
 *
 * Pure + deterministic: the caller passes `timestamp` (no `Date.now()` here),
 * so the same `(model, timestamp)` pair always yields the same object.
 *
 * @param model     The panel render model, optionally carrying the orchestrator
 *                  `board` (the same shape `managerPanel.refresh` posts).
 * @param timestamp ISO string or epoch-ms the digest was generated at.
 */
function buildFleetDigest(model, timestamp) {
    const cards = model.cards ?? [];
    const board = model.board;
    // Per-agent "done, awaiting review" = reviews this agent authored.
    const doneByAgent = new Map();
    for (const r of board?.awaiting_review ?? []) {
        if (!r?.author) {
            continue;
        }
        doneByAgent.set(r.author, (doneByAgent.get(r.author) ?? 0) + 1);
    }
    // Claims rollup is derived from the same per-card claimed-task lists the panel
    // already resolved — no separate read of the claims directory.
    const byAgent = {};
    let claimsTotal = 0;
    const agents = cards.map(card => {
        const claimed = card.detail?.claimedTasks ?? [];
        const inflight = claimed.length;
        if (inflight > 0) {
            byAgent[card.agentId] = inflight;
            claimsTotal += inflight;
        }
        const currentLlm = readCurrentLlm(card);
        const agent = {
            id: card.agentId,
            status: card.state,
            role: card.role ?? '',
            inflight,
            done: doneByAgent.get(card.agentId) ?? 0,
        };
        if (currentLlm !== undefined) {
            agent.current_llm = currentLlm;
        }
        return agent;
    });
    // Stable order so the serialized digest is deterministic regardless of the
    // model's card ordering.
    agents.sort((a, b) => a.id.localeCompare(b.id));
    const lanes = {
        claimable: board?.claimable?.length ?? 0,
        in_flight: board?.in_flight?.length ?? 0,
        awaiting_review: board?.awaiting_review?.length ?? 0,
        stuck: board?.stuck?.length ?? 0,
    };
    // Review-queue + WIP gate (CP-3.3) — board-derived, so it stays a projection of
    // one data path. `wip_gate` is set on the board by the loop when it gates.
    const awaiting = board?.awaiting_review ?? [];
    const gate = board?.wip_gate;
    const reviewQueue = {
        depth: awaiting.length,
        delivered_unreviewed: awaiting.filter((r) => (r.votes_received ?? 0) === 0).length,
        oldest_age_ms: awaiting.reduce((m, r) => Math.max(m, r.age_ms ?? 0), 0),
        gated: gate?.gated ?? false,
        ...(gate?.cap !== undefined ? { wip_cap: gate.cap } : {}),
        ...(gate?.gated && gate.reason ? { gate_reason: gate.reason } : {}),
    };
    // Live count: prefer the panel's already-computed presence rollup.
    const liveCount = model.presence?.working ?? 0;
    const generatedAt = toIso(timestamp);
    const digest = {
        schema_version: exports.FLEET_DIGEST_SCHEMA_VERSION,
        generated_at: generatedAt,
        self_agent_id: model.selfAgentId ?? '',
        cycle: deriveCycle(agents.length, lanes.in_flight, lanes.awaiting_review),
        agent_count: agents.length,
        live_count: liveCount,
        awaiting_you: (model.awaitingYou ?? []).length,
        agents,
        claims: { total: claimsTotal, by_agent: sortObjectKeys(byAgent) },
        lanes,
        review_queue: reviewQueue,
    };
    // Optional CP-3.3 additions — attached only when the writer supplied them, so
    // the digest stays valid (and schema_version stays 1) on hosts without them.
    if (model.decisions) {
        digest.decisions = { total: model.decisions.total, recent: model.decisions.recent };
    }
    // Cost: derive from the panel's existing CostLedgerView; emit only when the
    // ledger has recorded something, so idle digests stay noise-free.
    const ledger = model.cost;
    if (ledger && (ledger.totalTokens > 0 || ledger.totalWallMs > 0)) {
        const actions = (ledger.perAgent ?? []).reduce((n, r) => n + (r.actionCount ?? 0), 0);
        digest.cost = {
            total_tokens: ledger.totalTokens,
            total_wall_ms: ledger.totalWallMs,
            ...(actions > 0 ? { actions } : {}),
        };
    }
    if (model.spine) {
        const spine = { indexed_events: model.spine.indexed_events };
        if (model.spine.last_event_at) {
            spine.last_event_at = model.spine.last_event_at;
            // Derive staleness from the (caller-supplied) generation time — deterministic.
            const lag = new Date(generatedAt).getTime() - new Date(model.spine.last_event_at).getTime();
            if (Number.isFinite(lag)) {
                spine.lag_ms = Math.max(0, lag);
            }
        }
        if (model.spine.backfill_pending !== undefined) {
            spine.backfill_pending = model.spine.backfill_pending;
        }
        digest.spine = spine;
    }
    return digest;
}
/**
 * Roll up per-project digests into one program-plane view. Pure + deterministic:
 * `timestamp` is supplied (no `Date.now()`), and projects are emitted in id order
 * so the same inputs always serialize identically.
 *
 * @param inputs    `{ id, digest }` per project.
 * @param timestamp ISO string or epoch-ms the rollup was generated at.
 */
function rollupFleet(inputs, timestamp) {
    const lanes = { claimable: 0, in_flight: 0, awaiting_review: 0, stuck: 0 };
    let agentCount = 0, liveCount = 0, awaitingYou = 0, reviewDepth = 0, oldestAge = 0, gatedProjects = 0;
    let costTokens = 0, costWallMs = 0, anyCost = false;
    const projects = inputs
        .map(({ id, digest }) => {
        lanes.claimable += digest.lanes.claimable;
        lanes.in_flight += digest.lanes.in_flight;
        lanes.awaiting_review += digest.lanes.awaiting_review;
        lanes.stuck += digest.lanes.stuck;
        agentCount += digest.agent_count;
        liveCount += digest.live_count;
        awaitingYou += digest.awaiting_you;
        reviewDepth += digest.review_queue.depth;
        oldestAge = Math.max(oldestAge, digest.review_queue.oldest_age_ms);
        if (digest.review_queue.gated) {
            gatedProjects += 1;
        }
        if (digest.cost) {
            costTokens += digest.cost.total_tokens;
            costWallMs += digest.cost.total_wall_ms;
            anyCost = true;
        }
        return {
            id,
            self_agent_id: digest.self_agent_id,
            cycle: digest.cycle,
            agent_count: digest.agent_count,
            live_count: digest.live_count,
            review_depth: digest.review_queue.depth,
            gated: digest.review_queue.gated,
        };
    })
        .sort((a, b) => a.id.localeCompare(b.id));
    const rollup = {
        schema_version: exports.FLEET_DIGEST_SCHEMA_VERSION,
        generated_at: toIso(timestamp),
        project_count: projects.length,
        agent_count: agentCount,
        live_count: liveCount,
        awaiting_you: awaitingYou,
        lanes,
        review_queue: { depth: reviewDepth, oldest_age_ms: oldestAge, gated_projects: gatedProjects },
        projects,
    };
    if (anyCost) {
        rollup.cost = { total_tokens: costTokens, total_wall_ms: costWallMs };
    }
    return rollup;
}
// ---------------------------------------------------------------------------
// Serializer
// ---------------------------------------------------------------------------
/** Return a new object whose keys are sorted, for stable JSON output. */
function sortObjectKeys(obj) {
    const out = {};
    for (const k of Object.keys(obj).sort()) {
        out[k] = obj[k];
    }
    return out;
}
/**
 * Canonical JSON serialization of a digest: keys sorted recursively, 2-space
 * indent, and a trailing newline. Two structurally-equal digests always
 * serialize to the identical string, so writers can no-op on an unchanged
 * digest and readers can diff cleanly.
 */
function serializeFleetDigest(digest) {
    return JSON.stringify(digest, sortedReplacer, 2) + '\n';
}
/**
 * A `JSON.stringify` replacer that emits object keys in sorted order. Arrays
 * are passed through unchanged (their order is meaningful and already stable).
 */
function sortedReplacer(_key, value) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        const src = value;
        const out = {};
        for (const k of Object.keys(src).sort()) {
            out[k] = src[k];
        }
        return out;
    }
    return value;
}
//# sourceMappingURL=fleetDigest.js.map