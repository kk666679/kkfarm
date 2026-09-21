"use strict";
/**
 * beacons.ts — the universal cross-tool agent check-in.
 *
 * A "beacon" is one JSON file that any agent — a different IDE (Kiro, Cursor),
 * a headless runner (Hermes, openclaw, AutoGPT), or a shell one-liner — writes
 * to announce presence without the VS Code extension. Beacons let the fleet
 * panel show agents working from other tools / workspaces / machines.
 *
 * Two homes (see docs/FLEET_ARCHITECTURE.md §4):
 *   - workspace: <ws>/.autoclaw/orchestrator/comms/beacons/<id>[-<session>].json
 *   - machine:   ~/.autoclaw/beacons/<id>[-<session>].json
 *
 * The shape is a superset of the comms Heartbeat, so a beacon doubles as a
 * heartbeat. This module is pure of vscode; it touches fs only for read/write
 * of the beacon files themselves.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BEACON_TTL_MS = void 0;
exports.machineBeaconDir = machineBeaconDir;
exports.workspaceBeaconDir = workspaceBeaconDir;
exports.workspaceSlug = workspaceSlug;
exports.isDiscoveredUntrusted = isDiscoveredUntrusted;
exports.isValidBeacon = isValidBeacon;
exports.normalizeBeacon = normalizeBeacon;
exports.readBeacons = readBeacons;
exports.readAllBeacons = readAllBeacons;
exports.writeBeacon = writeBeacon;
const fs = require("fs");
const os = require("os");
const path = require("path");
const fsp = fs.promises;
/** Default freshness window — a beacon older than this reads as stale. */
exports.BEACON_TTL_MS = 5 * 60000;
// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------
/** The machine-global beacon directory (`~/.autoclaw/beacons`). */
function machineBeaconDir(homeDir = os.homedir()) {
    return path.join(homeDir, '.autoclaw', 'beacons');
}
/** A workspace's beacon directory. */
function workspaceBeaconDir(commsDir) {
    return path.join(commsDir, 'beacons');
}
/** Derive a stable workspace slug from an absolute path (folder basename). */
function workspaceSlug(workspacePath) {
    if (!workspacePath) {
        return '';
    }
    // Split on both POSIX and Windows separators so the slug is identical
    // regardless of host OS (Node's path.basename is platform-specific).
    const trimmed = workspacePath.replace(/[\\/]+$/, '');
    const segs = trimmed.split(/[\\/]+/);
    const base = segs[segs.length - 1] ?? '';
    return base.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
}
/** Sanitize an id/session fragment for use in a filename. */
function safeFrag(s) {
    return s.replace(/[^A-Za-z0-9_-]/g, '_');
}
// ---------------------------------------------------------------------------
// Normalize
// ---------------------------------------------------------------------------
/**
 * True when a beacon is DISCOVERED-but-UNTRUSTED presence — currently any
 * LAN-discovered peer (origin 'lan'). Such a peer is unauthenticated until T2
 * (mTLS/SVID/biscuit) and MUST be excluded from every trust / admit / joined /
 * census sink: the pending-admit tray (fleet/pending.ts), the panel fleet roster
 * (extension.ts beaconToAgent merge), and the role-coverage census
 * (fleet/needs.ts). It is observe-only telemetry — the roster never
 * executes / dispatches / hires on it.
 *
 * This is the SINGLE source of truth for "which beacon origins are untrusted":
 * grep `isDiscoveredUntrusted` to find every trust sink, and add a new untrusted
 * origin HERE (not at each call site) so a future sink can never silently leak.
 */
function isDiscoveredUntrusted(b) {
    return b.origin === 'lan';
}
/** True if `b` has the minimum fields to be a usable beacon. */
function isValidBeacon(b) {
    if (!b || typeof b !== 'object') {
        return false;
    }
    const o = b;
    return typeof o.agent_id === 'string' && o.agent_id.length > 0
        && typeof o.timestamp === 'string' && o.timestamp.length > 0;
}
/** Enrich a raw beacon into a BeaconRow (origin, workspace_id, staleness). */
function normalizeBeacon(b, now, ttlMs = exports.BEACON_TTL_MS) {
    const t = new Date(b.timestamp).getTime();
    const age = Number.isFinite(t) ? Math.max(0, now - t) : Number.POSITIVE_INFINITY;
    return {
        ...b,
        origin: b.origin ?? 'beacon',
        workspace_id: b.workspace_id || workspaceSlug(b.workspace) || '',
        age_ms: age,
        stale: age > ttlMs,
    };
}
// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------
/**
 * Read every beacon in a directory, normalized and (by default) with stale
 * ones dropped. Missing dir → []. Malformed files are skipped silently.
 */
async function readBeacons(dir, opts = {}) {
    const now = opts.now ?? Date.now();
    const ttlMs = opts.ttlMs ?? exports.BEACON_TTL_MS;
    let files;
    try {
        files = await fsp.readdir(dir);
    }
    catch {
        return [];
    }
    const rows = [];
    for (const f of files) {
        if (!f.endsWith('.json')) {
            continue;
        }
        try {
            const raw = await fsp.readFile(path.join(dir, f), 'utf8');
            const parsed = JSON.parse(raw.replace(/^﻿/, ''));
            if (!isValidBeacon(parsed)) {
                continue;
            }
            const row = normalizeBeacon(parsed, now, ttlMs);
            if (row.stale && !opts.includeStale) {
                continue;
            }
            rows.push(row);
        }
        catch {
            /* skip malformed */
        }
    }
    return rows;
}
/**
 * Read both machine-global and workspace beacons, deduped by
 * (agent_id, session_id) keeping the freshest. `commsDir` may be omitted to
 * read only the machine dir.
 */
async function readAllBeacons(opts = {}) {
    const dirs = [machineBeaconDir(opts.homeDir)];
    if (opts.commsDir) {
        dirs.push(workspaceBeaconDir(opts.commsDir));
    }
    const all = [];
    for (const d of dirs) {
        all.push(...await readBeacons(d, opts));
    }
    // Dedup: freshest wins per (agent_id|session_id).
    const best = new Map();
    for (const r of all) {
        const key = `${r.agent_id}|${r.session_id ?? ''}`;
        const prev = best.get(key);
        if (!prev || r.age_ms < prev.age_ms) {
            best.set(key, r);
        }
    }
    return Array.from(best.values());
}
// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------
/**
 * Write a beacon so internal runners / helpers don't hand-roll the format.
 * `scope: 'machine'` writes to ~/.autoclaw/beacons; 'workspace' needs commsDir.
 * Returns the path written.
 */
async function writeBeacon(beacon, opts = {}) {
    const scope = opts.scope ?? 'machine';
    const dir = scope === 'workspace' && opts.commsDir
        ? workspaceBeaconDir(opts.commsDir)
        : machineBeaconDir(opts.homeDir);
    await fsp.mkdir(dir, { recursive: true });
    const frag = beacon.session_id ? `${safeFrag(beacon.agent_id)}-${safeFrag(beacon.session_id)}` : safeFrag(beacon.agent_id);
    const file = path.join(dir, `${frag}.json`);
    const body = {
        ...beacon,
        origin: beacon.origin ?? 'beacon',
        workspace_id: beacon.workspace_id || workspaceSlug(beacon.workspace) || undefined,
    };
    await fsp.writeFile(file, JSON.stringify(body, null, 2), 'utf8');
    return file;
}
//# sourceMappingURL=beacons.js.map