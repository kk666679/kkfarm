"use strict";
/**
 * authoring.ts — UI-driven fleet.json / needs.json authoring (Follow-up #2).
 *
 * The fleet manifest *resolver* (architecture.ts) and the pending-tray *admit*
 * core (pending.ts) both READ + mutate `fleet.json`, but nothing ever AUTHORS a
 * starter manifest from the agents the user already has. Role election
 * (architecture.ts / needs.ts) therefore has nothing to read on a fresh project:
 * `fleet.json` is absent, so every agent resolves to `generalist` and the
 * orchestrator is only guessed from `can_orchestrate`.
 *
 * This module is the authoring floor the panel/commands call to:
 *   - scaffold a starter `fleet.json` from the currently-detected agents,
 *     MERGING with any existing manifest so a user's hand-set roles are never
 *     clobbered (existing entries preserved; only missing agents added),
 *   - upsert a single agent's manifest entry (role / agent_type / reports_to),
 *   - set the manifest `orchestrator`,
 *   - (re)generate `needs.json` so role election + the panel "what's needed"
 *     view have a vector to read.
 *
 * It is pure of `vscode` (fs + path only, via the writers it imports) so it
 * unit-tests in plain Node/Mocha, and it REUSES `pending.ts`
 * (read/writeFleetManifest, fleetPath) and `needs.ts` (gatherNeedsInput,
 * computeNeeds, writeNeeds) rather than re-implementing their persistence.
 *
 * See docs/FLEET_ARCHITECTURE.md and docs/ideas/FLEET-FEDERATION-SELF-HEALING.md.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.needsPath = exports.fleetPath = void 0;
exports.assertValidAgentId = assertValidAgentId;
exports.assertValidRole = assertValidRole;
exports.scaffoldFleetManifest = scaffoldFleetManifest;
exports.setAgentManifestEntry = setAgentManifestEntry;
exports.setManifestOrchestrator = setManifestOrchestrator;
exports.generateNeedsFile = generateNeedsFile;
const path = require("path");
const pending_1 = require("./pending");
Object.defineProperty(exports, "fleetPath", { enumerable: true, get: function () { return pending_1.fleetPath; } });
const needs_1 = require("./needs");
Object.defineProperty(exports, "needsPath", { enumerable: true, get: function () { return needs_1.needsPath; } });
const roles_1 = require("../roles");
const SCHEMA_VERSION = '1.0';
/** The fabric worker types a manifest entry's `agent_type` may carry. */
const KNOWN_AGENT_TYPES = new Set([
    'coder', 'runner', 'auditor', 'supervisor', 'assistant', 'governance',
]);
// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
/**
 * Validate an untrusted agent id. Agent ids land in `fleet.json` keys and feed
 * filename derivation elsewhere, so reject anything that could traverse a path
 * or smuggle separators. Returns the trimmed id.
 */
function assertValidAgentId(raw) {
    const id = (raw ?? '').trim();
    if (!id) {
        throw new Error('agentId is required');
    }
    // Allow only the safe id alphabet (letters, digits, dot, dash, underscore)
    // and reject path traversal / separators / whitespace. `claude-code` is ok;
    // `../x`, `a/b`, `a b`, `.`, `..` are all rejected.
    if (id === '.' || id === '..'
        || id !== path.basename(id)
        || /[\\/\s]/.test(id)
        || !/^[A-Za-z0-9._-]+$/.test(id)) {
        throw new Error(`invalid agentId "${raw}"`);
    }
    return id;
}
/**
 * Validate a role string against the canonical taxonomy. A canonical role (or a
 * recognised synonym/hint that normalizes to one) is accepted and returned as
 * its display string. The empty string is rejected (callers omit `role` instead
 * of passing ''). Throws on a value that normalizes only to `generalist`
 * WITHOUT being a generalist itself — i.e. an unrecognised label — so the UI
 * can surface "not a known role" rather than silently writing a custom chip.
 */
function assertValidRole(raw) {
    const s = (raw ?? '').trim();
    if (!s) {
        throw new Error('role must be a non-empty string');
    }
    const canonical = (0, roles_1.normalizeRole)(s);
    // `normalizeRole` maps unknowns to 'generalist'. Treat that as invalid unless
    // the caller literally asked for generalist.
    if (canonical === 'generalist' && s.toLowerCase().replace(/[^a-z]/g, '') !== 'generalist') {
        throw new Error(`unknown role "${raw}" (expected a canonical role or synonym)`);
    }
    return s;
}
/**
 * Coerce an `agent_type` hint to a known fabric type, defaulting unknown /
 * absent hints to `coder` (matching architecture.ts `resolveType`).
 */
function defaultAgentType(hint) {
    const h = (hint ?? '').trim();
    if (h && KNOWN_AGENT_TYPES.has(h)) {
        return h;
    }
    return 'coder';
}
/**
 * Derive a sensible default role for a detected agent: its registry/beacon
 * signal resolved via the canonical taxonomy. Falls back to `generalist`.
 */
function defaultRoleFor(agent) {
    return (0, roles_1.resolveAgentRole)({
        role: agent.role,
        agent_type: agent.agent_type,
        can_orchestrate: agent.can_orchestrate,
    });
}
// ---------------------------------------------------------------------------
// Scaffold (merge)
// ---------------------------------------------------------------------------
/**
 * Scaffold / refresh `fleet.json` from the currently-detected agents.
 *
 * MERGE semantics — the user is authoritative:
 *   - An agent already present in `fleet.json` is PRESERVED verbatim (its
 *     hand-set role / agent_type / reports_to are never touched).
 *   - An agent missing from `fleet.json` is ADDED with a sensible default role
 *     (its resolved canonical role) + agent_type (its fabric type, else coder).
 *   - The orchestrator is set from opts -> existing manifest -> first
 *     can_orchestrate detected agent (when autoPickOrchestrator), else unset.
 *
 * Persists via {@link writeFleetManifest} and returns the written manifest plus
 * an added/preserved summary.
 *
 * @param autoclawDir Absolute path of the workspace `.autoclaw` dir.
 * @param agents      The currently-detected agents to seed entries from.
 */
async function scaffoldFleetManifest(autoclawDir, agents, opts = {}) {
    const existing = await (0, pending_1.readFleetManifest)(autoclawDir);
    const baseAgents = { ...(existing?.agents ?? {}) };
    const outcomes = [];
    const added = [];
    const preserved = [];
    // De-dupe detected agents by id (a registry + beacon may both report one).
    const seen = new Set();
    for (const a of agents) {
        const id = assertValidAgentId(a.id);
        if (seen.has(id)) {
            continue;
        }
        seen.add(id);
        const prior = baseAgents[id];
        if (prior) {
            // Preserve the user's entry untouched.
            preserved.push(id);
            outcomes.push({
                agent_id: id,
                disposition: 'preserved',
                role: prior.role ?? 'generalist',
                ...(prior.agent_type ? { agent_type: prior.agent_type } : {}),
            });
            continue;
        }
        const role = defaultRoleFor(a);
        const agent_type = defaultAgentType(a.agent_type);
        baseAgents[id] = { role, agent_type };
        added.push(id);
        outcomes.push({ agent_id: id, disposition: 'added', role, agent_type });
    }
    // Decide the orchestrator: explicit opt -> existing -> first can_orchestrate.
    const present = new Set(Object.keys(baseAgents));
    let orchestrator = existing?.orchestrator;
    if (opts.orchestrator) {
        orchestrator = assertValidAgentId(opts.orchestrator);
    }
    else if (!orchestrator && (opts.autoPickOrchestrator ?? true)) {
        const picked = agents.find(a => a.can_orchestrate && present.has(a.id.trim()));
        if (picked) {
            orchestrator = picked.id.trim();
        }
    }
    // Drop a stale orchestrator that isn't actually in the manifest.
    if (orchestrator && !present.has(orchestrator)) {
        orchestrator = undefined;
    }
    const manifest = {
        schema_version: existing?.schema_version ?? SCHEMA_VERSION,
        ...(orchestrator ? { orchestrator } : {}),
        agents: baseAgents,
    };
    const written = await (0, pending_1.writeFleetManifest)(autoclawDir, manifest);
    const parts = [];
    parts.push(`added ${added.length}`);
    parts.push(`preserved ${preserved.length}`);
    if (orchestrator) {
        parts.push(`orchestrator=${orchestrator}`);
    }
    const summary = parts.join(', ');
    return {
        path: written,
        manifest,
        agents: outcomes,
        added,
        preserved,
        orchestrator: orchestrator ?? null,
        summary,
    };
}
/**
 * Upsert ONE agent's manifest entry (read-merge-write). Only the supplied
 * fields are changed; any other fields on an existing entry are preserved.
 * `role` is validated against the taxonomy; `reports_to` is validated as an
 * agent id. Returns the full manifest after the write.
 *
 * @param autoclawDir Absolute path of the workspace `.autoclaw` dir.
 * @param agentId     The agent whose entry to set.
 * @param patch       The fields to set (all optional, but at least one is used).
 */
async function setAgentManifestEntry(autoclawDir, agentId, patch) {
    const id = assertValidAgentId(agentId);
    const delta = {};
    if (patch.role !== undefined) {
        delta.role = assertValidRole(patch.role);
    }
    if (patch.agent_type !== undefined) {
        const t = patch.agent_type.trim();
        if (t) {
            delta.agent_type = t;
        }
    }
    if (patch.reports_to !== undefined) {
        delta.reports_to = assertValidAgentId(patch.reports_to);
    }
    const existing = await (0, pending_1.readFleetManifest)(autoclawDir);
    const base = existing ?? { schema_version: SCHEMA_VERSION, agents: {} };
    const next = {
        ...base,
        schema_version: base.schema_version ?? SCHEMA_VERSION,
        agents: {
            ...(base.agents ?? {}),
            [id]: { ...(base.agents?.[id] ?? {}), ...delta },
        },
    };
    await (0, pending_1.writeFleetManifest)(autoclawDir, next);
    return next;
}
// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------
/**
 * Set the manifest `orchestrator` field (read-merge-write). The id is validated
 * but NOT required to already be in `agents` — the resolver
 * (`resolveOrchestrator`) ignores a manifest orchestrator that isn't present,
 * so a designation made before the agent's entry exists is harmless and becomes
 * effective once that agent is admitted. Returns the manifest after the write.
 */
async function setManifestOrchestrator(autoclawDir, agentId) {
    const id = assertValidAgentId(agentId);
    const existing = await (0, pending_1.readFleetManifest)(autoclawDir);
    const base = existing ?? { schema_version: SCHEMA_VERSION, agents: {} };
    const next = {
        ...base,
        schema_version: base.schema_version ?? SCHEMA_VERSION,
        orchestrator: id,
        agents: { ...(base.agents ?? {}) },
    };
    await (0, pending_1.writeFleetManifest)(autoclawDir, next);
    return next;
}
/**
 * (Re)generate `needs.json` by REUSING the needs pipeline from needs.ts:
 *   gatherNeedsInput (fs adapter) -> computeNeeds (pure) -> writeNeeds (persist).
 *
 * This adds no needs logic of its own — it is the one-call wrapper the
 * scaffold/authoring command invokes so role election + the panel's
 * "what's needed" view always have a fresh vector to read after the user
 * authors / refreshes the fleet.
 *
 * @param autoclawDir Absolute path of the workspace `.autoclaw` dir.
 */
async function generateNeedsFile(autoclawDir, opts = {}) {
    const input = await (0, needs_1.gatherNeedsInput)(autoclawDir, {
        ...(opts.plannedLanes ? { plannedLanes: opts.plannedLanes } : {}),
        ...(opts.now !== undefined ? { now: opts.now } : {}),
        ...(opts.ttlMs !== undefined ? { ttlMs: opts.ttlMs } : {}),
    });
    const needs = (0, needs_1.computeNeeds)(input);
    const written = await (0, needs_1.writeNeeds)(autoclawDir, needs, {
        ...(opts.now !== undefined ? { now: opts.now } : {}),
    });
    // Mirror the generated_at that writeNeeds stamped into the returned vector.
    return {
        path: written,
        needs: { ...needs, generated_at: new Date(opts.now ?? Date.now()).toISOString() },
    };
}
//# sourceMappingURL=authoring.js.map