"use strict";
/**
 * remotePresence.ts — cross-machine fleet presence (D3 / AF-10c, last mile).
 *
 * The relay pipeline already exists end to end: `CloudRelay.fetchHeartbeats`
 * pulls `GET /v1/heartbeat`, `applyFetchedHeartbeats` caches OTHER machines'
 * rows at `.autoclaw/cloud/remote-heartbeats.json`, and the agent-card
 * renderer draws `origin:'relay'` rows with a `⌂ host` badge (CF-1/CF-2).
 * What was missing is the seam between the two: nothing converted the cached
 * rows into fleet-view agents. This module is that seam, kept pure so the
 * panel refresh can call it beside the beacon merge.
 *
 * Trust note: relay rows come from THIS account's authenticated relay (unlike
 * LAN-discovered beacons), so they merge as visible fleet members — but they
 * are presence only: no inbox path, no dispatch surface, no hooks.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.REMOTE_DROP_AFTER_MS = exports.REMOTE_STALE_AFTER_MS = void 0;
exports.remoteAgentCardId = remoteAgentCardId;
exports.remoteHeartbeatToAgent = remoteHeartbeatToAgent;
exports.mergeRemotePresence = mergeRemotePresence;
exports.REMOTE_STALE_AFTER_MS = 10 * 60000;
exports.REMOTE_DROP_AFTER_MS = 24 * 3600000;
/**
 * The card id for a remote row. Namespaced with a host fragment so a remote
 * "claude-code" can never clobber (or inherit the inbox summary / role of)
 * this machine's "claude-code" card.
 */
function remoteAgentCardId(row) {
    const frag = (row.host || 'remote').replace(/[^A-Za-z0-9]/g, '').slice(0, 8) || 'remote';
    return `${row.agent_id}@${frag}`;
}
/**
 * Convert one cached remote heartbeat into a fleet-view agent row.
 * Mirrors `beaconToAgent` in extension.ts, with `origin:'relay'` so the
 * renderer badges the host machine (CF-2) instead of "external · beacon".
 */
function remoteHeartbeatToAgent(row, opts = {}) {
    const now = opts.nowMs ?? Date.now();
    const staleAfter = opts.staleAfterMs ?? exports.REMOTE_STALE_AFTER_MS;
    const ageMs = now - new Date(row.timestamp).getTime();
    const stale = !Number.isFinite(ageMs) || ageMs > staleAfter;
    const live = stale ? 'stalled' : (row.status === 'active' || row.status === 'working' ? 'active' : 'idle');
    const hb = {
        agent_id: row.agent_id,
        timestamp: row.timestamp,
        status: live === 'active' ? 'active' : 'idle',
        current_task: row.current_task ?? null,
        sprint: row.sprint ?? null,
        ...(row.current_llm ? { current_llm: row.current_llm } : {}),
    };
    return {
        id: remoteAgentCardId(row),
        name: row.agent_id,
        extension_id: null,
        detected: true,
        inbox_path: '',
        hooks_supported: false,
        last_heartbeat: row.timestamp,
        status: live,
        live_status: live,
        heartbeat: hb,
        sessions: [hb],
        origin: 'relay',
        host: row.host,
    };
}
/**
 * Merge cached remote rows into the fleet-agent list (in the same additive
 * spirit as the beacon merge): local/beacon agents always win on card-id
 * collision, ancient rows are dropped, and the input array is returned with
 * remote rows appended. Never throws — a malformed row is skipped.
 */
function mergeRemotePresence(fleetAgents, remoteRows, opts = {}) {
    const now = opts.nowMs ?? Date.now();
    const dropAfter = opts.dropAfterMs ?? exports.REMOTE_DROP_AFTER_MS;
    const knownIds = new Set(fleetAgents.map((a) => a.id));
    let added = 0;
    for (const row of remoteRows) {
        if (!row || typeof row.agent_id !== 'string' || row.agent_id.length === 0) {
            continue;
        }
        const ageMs = now - new Date(row.timestamp).getTime();
        if (!Number.isFinite(ageMs) || ageMs > dropAfter) {
            continue;
        }
        const id = remoteAgentCardId(row);
        if (knownIds.has(id)) {
            continue;
        }
        knownIds.add(id);
        fleetAgents.push(remoteHeartbeatToAgent(row, opts));
        added++;
    }
    return { added };
}
//# sourceMappingURL=remotePresence.js.map