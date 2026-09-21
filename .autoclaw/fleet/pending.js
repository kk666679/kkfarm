"use strict";
/**
 * pending.ts — the pending-tray + admit core (FF-3).
 *
 * A "pending" agent is one that has checked in with a fresh beacon but is NOT
 * yet declared in the user's fleet.json — i.e. it has *joined* (visible) but not
 * been *admitted* (given an authoritative role + trust). The panel renders these
 * in a tray; the user clicks Admit (write it into fleet.json) or Decline (revoke
 * its invite + drop the beacon). Under an auto-admit policy the orchestrator
 * admits matching types without a click (see invites.admitDecision).
 *
 * This module is the pure + fs core the panel/commands call. Rendering lives in
 * the webview; command wiring lives in extension.ts.
 *
 * See docs/ideas/FLEET-FEDERATION-SELF-HEALING.md §2.2.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computePendingAgents = computePendingAgents;
exports.admitToFleet = admitToFleet;
exports.fleetPath = fleetPath;
exports.readFleetManifest = readFleetManifest;
exports.writeFleetManifest = writeFleetManifest;
exports.admitAgent = admitAgent;
const fs = require("fs");
const path = require("path");
const beacons_1 = require("./beacons");
const fsp = fs.promises;
/**
 * Pure: agents present as a FRESH beacon but absent from fleet.json. Suggested
 * role/type + trust come from a matching consumed invite first, then the
 * beacon's self-declared hints. Stale beacons are not pending (they're gone).
 */
function computePendingAgents(beacons, manifest, invites = []) {
    const declared = new Set(Object.keys(manifest?.agents ?? {}));
    const inviteByAgent = new Map();
    for (const inv of invites) {
        if (inv.consumed_by?.agent_id) {
            inviteByAgent.set(inv.consumed_by.agent_id, inv);
        }
    }
    const out = [];
    const seen = new Set();
    for (const b of beacons) {
        if (b.stale) {
            continue;
        }
        // T0 trust ceiling: a LAN-DISCOVERED peer is observe-only telemetry, NOT an
        // admittable agent — it is unauthenticated until T2. Never offer it in the
        // pending-admit tray (discovery is informational, not an admission path).
        if ((0, beacons_1.isDiscoveredUntrusted)(b)) {
            continue;
        }
        if (declared.has(b.agent_id)) {
            continue;
        }
        if (seen.has(b.agent_id)) {
            continue;
        }
        seen.add(b.agent_id);
        const inv = inviteByAgent.get(b.agent_id);
        out.push({
            agent_id: b.agent_id,
            ...(b.session_id ? { session_id: b.session_id } : {}),
            ...(b.host ? { host: b.host } : {}),
            suggested_role: inv?.suggested_role ?? b.role,
            suggested_agent_type: inv?.suggested_agent_type ?? b.agent_type,
            ...(inv ? { via_invite: inv.token } : {}),
            trust: inv?.trust ?? 'off',
        });
    }
    return out.sort((a, b) => a.agent_id.localeCompare(b.agent_id));
}
/**
 * Pure: return a new manifest with `agentId` admitted (added/updated). The
 * orchestrator and other agents are preserved.
 */
function admitToFleet(manifest, agentId, decl) {
    const base = manifest ?? { schema_version: '1.0', agents: {} };
    return {
        ...base,
        agents: {
            ...(base.agents ?? {}),
            [agentId]: { ...(base.agents?.[agentId] ?? {}), ...decl },
        },
    };
}
// ---------------------------------------------------------------------------
// fs helpers
// ---------------------------------------------------------------------------
/** Path to fleet.json under an `.autoclaw/` dir. */
function fleetPath(autoclawDir) {
    return path.join(autoclawDir, 'orchestrator', 'fleet.json');
}
/** Read fleet.json. Returns null if missing or malformed. */
async function readFleetManifest(autoclawDir) {
    try {
        const raw = await fsp.readFile(fleetPath(autoclawDir), 'utf8');
        return JSON.parse(raw.replace(/^﻿/, ''));
    }
    catch {
        return null;
    }
}
/** Write fleet.json. */
async function writeFleetManifest(autoclawDir, manifest) {
    const file = fleetPath(autoclawDir);
    await fsp.mkdir(path.dirname(file), { recursive: true });
    await fsp.writeFile(file, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    return file;
}
/** Read-modify-write: admit an agent into fleet.json. Returns the new manifest. */
async function admitAgent(autoclawDir, agentId, decl) {
    const current = await readFleetManifest(autoclawDir);
    const next = admitToFleet(current, agentId, decl);
    await writeFleetManifest(autoclawDir, next);
    return next;
}
//# sourceMappingURL=pending.js.map