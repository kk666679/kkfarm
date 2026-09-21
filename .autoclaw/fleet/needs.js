"use strict";
/**
 * needs.ts — "What the project needs right now" (SA-1).
 *
 * Derives a small needs vector — which roles the backlog wants that the live
 * fleet doesn't currently cover, plus open lanes, staleness pressure, and
 * unclaimed findings — so an arriving agent can self-elect the role the project
 * is short on (role election, SA-2) and the panel can show a "what's needed" view.
 *
 * `computeNeeds` is a pure function over plain objects (fully unit-testable).
 * `gatherNeedsInput` is the thin fs adapter that reads the JSON sources already
 * on disk (board.json, fleet.json, reconcile-report.json, beacons); the plan
 * lanes are injected by the caller, which already parses the sprint YAMLs.
 *
 * See docs/ideas/FLEET-FEDERATION-SELF-HEALING.md §4.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.beaconsToLiveAgents = beaconsToLiveAgents;
exports.computeNeeds = computeNeeds;
exports.needsPath = needsPath;
exports.writeNeeds = writeNeeds;
exports.readNeeds = readNeeds;
exports.gatherNeedsInput = gatherNeedsInput;
const fs = require("fs");
const path = require("path");
const beacons_1 = require("./beacons");
const fsp = fs.promises;
/**
 * Pure: project beacon rows into the role-coverage census, excluding
 * DISCOVERED-but-UNTRUSTED peers (origin 'lan') — see beacons.isDiscoveredUntrusted.
 * An unauthenticated LAN peer must never count toward role coverage (it could
 * otherwise suppress legitimate hiring pressure once it carries a role hint).
 */
function beaconsToLiveAgents(beacons) {
    return beacons
        .filter(b => !(0, beacons_1.isDiscoveredUntrusted)(b))
        .map(b => ({
        agent_id: b.agent_id,
        ...(b.role ? { role: b.role } : {}),
        stale: b.stale,
    }));
}
// ---------------------------------------------------------------------------
// Pure compute
// ---------------------------------------------------------------------------
/**
 * Compute the needs vector. Pure: same inputs → same output (no clock, no fs).
 *
 * role_coverage_gap = (roles wanted by open lanes ∪ roles declared by the user)
 *                     − (roles played by a live agent with a fresh signal)
 */
function computeNeeds(input) {
    const plannedLanes = input.plannedLanes ?? [];
    const openLanes = plannedLanes.filter(l => (l.unclaimed ?? 0) > 0);
    const wanted = new Set();
    for (const l of openLanes) {
        if (l.role) {
            wanted.add(l.role.toLowerCase());
        }
    }
    for (const r of input.declaredRoles ?? []) {
        if (r) {
            wanted.add(r.toLowerCase());
        }
    }
    const covered = new Set();
    for (const a of input.liveAgents ?? []) {
        if (!a.stale && a.role) {
            covered.add(a.role.toLowerCase());
        }
    }
    const gap = [...wanted].filter(r => !covered.has(r)).sort();
    const staleness = input.staleClaims ?? [];
    const findings = input.unclaimedFindings ?? 0;
    const parts = [];
    if (gap.length) {
        parts.push(`needs ${gap.join(', ')}`);
    }
    if (openLanes.length) {
        parts.push(`${openLanes.length} open lane(s)`);
    }
    if (staleness.length) {
        parts.push(`${staleness.length} stalled claim(s)`);
    }
    if (findings) {
        parts.push(`${findings} open finding(s)`);
    }
    const summary = parts.length ? parts.join('; ') : 'fully staffed — no open needs';
    return {
        open_lanes: openLanes,
        role_coverage_gap: gap,
        staleness_pressure: staleness,
        unclaimed_findings: findings,
        summary,
    };
}
// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------
/** Path to the needs file under an `.autoclaw/` dir. */
function needsPath(autoclawDir) {
    return path.join(autoclawDir, 'orchestrator', 'needs.json');
}
/** Write the needs vector, stamping `generated_at`. `now` is injectable. */
async function writeNeeds(autoclawDir, needs, opts = {}) {
    const file = needsPath(autoclawDir);
    const stamped = {
        ...needs,
        generated_at: new Date(opts.now ?? Date.now()).toISOString(),
    };
    await fsp.mkdir(path.dirname(file), { recursive: true });
    await fsp.writeFile(file, JSON.stringify(stamped, null, 2) + '\n', 'utf8');
    return file;
}
/** Read the needs vector. Returns null if missing or malformed. */
async function readNeeds(autoclawDir) {
    try {
        const raw = await fsp.readFile(needsPath(autoclawDir), 'utf8');
        return JSON.parse(raw.replace(/^﻿/, ''));
    }
    catch {
        return null;
    }
}
async function readJson(file) {
    try {
        return JSON.parse((await fsp.readFile(file, 'utf8')).replace(/^﻿/, ''));
    }
    catch {
        return null;
    }
}
/**
 * Build a NeedsInput from the on-disk JSON sources. `plannedLanes` is injected
 * by the caller (it already parses the sprint YAMLs); everything else is read
 * here best-effort:
 *   - declaredRoles    ← fleet.json agents[].role
 *   - liveAgents       ← beacons (machine + workspace), staleness from TTL
 *   - staleClaims      ← board.json in_flight where owner_healthy === false
 *   - unclaimedFindings← reconcile-report.json drifts length
 */
async function gatherNeedsInput(autoclawDir, opts = {}) {
    const orch = path.join(autoclawDir, 'orchestrator');
    const manifest = await readJson(path.join(orch, 'fleet.json'));
    const declaredRoles = manifest?.agents
        ? Object.values(manifest.agents).map(a => a?.role).filter((r) => !!r)
        : [];
    const ttlMs = opts.ttlMs ?? beacons_1.BEACON_TTL_MS;
    const beacons = await (0, beacons_1.readAllBeacons)({
        commsDir: path.join(orch, 'comms'),
        includeStale: true,
        now: opts.now,
        ttlMs,
    });
    const liveAgents = beaconsToLiveAgents(beacons);
    const board = await readJson(path.join(orch, 'board.json'));
    const staleClaims = (board?.in_flight ?? [])
        .filter(t => t.owner_healthy === false && t.task_id)
        .map(t => ({ task_id: t.task_id, owner: t.claimed_by ?? 'unknown' }));
    const reconcile = await readJson(path.join(orch, 'reconcile-report.json'));
    const unclaimedFindings = Array.isArray(reconcile?.drifts) ? reconcile.drifts.length : 0;
    return {
        ...(opts.plannedLanes ? { plannedLanes: opts.plannedLanes } : {}),
        declaredRoles,
        liveAgents,
        staleClaims,
        unclaimedFindings,
    };
}
//# sourceMappingURL=needs.js.map