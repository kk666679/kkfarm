"use strict";
/**
 * recallDispatch.ts — deliver recall plans + the roster-gated sweep (HRW-3).
 *
 * HR-4 (recall.ts) PLANS who to call in; this module ACTS on the plan over the
 * filesystem lane: a `recall` writes a `task_assign` doorbell into the target
 * agent's inbox; a `hire`/`gap` surfaces a `finding_report` (a fresh spawn is
 * the runner layer's job). `runRecallSweep` ties it to a standing roster — it is
 * a no-op unless `.autoclaw/orchestrator/roster.json` exists, so it costs
 * nothing on a project that hasn't opted in.
 *
 * fs lane; `now` injectable; no vscode.
 *
 * See docs/ideas/FLEET-FEDERATION-SELF-HEALING.md §9.5.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatchRecallActions = dispatchRecallActions;
exports.liveByRoleFromDisk = liveByRoleFromDisk;
exports.runRecallSweep = runRecallSweep;
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const recall_1 = require("./recall");
const architecture_1 = require("./architecture");
const fsp = fs.promises;
/** Live presence is "fresh" within this window (mirrors the loop's HEALTHY band). */
const LIVE_TTL_MS = 5 * 60000;
function commsDir(workspaceRoot) {
    return path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'comms');
}
function fileTs(d) {
    return d.toISOString().replace(/[:.]/g, '-');
}
async function writeMessage(dir, name, body) {
    await fsp.mkdir(dir, { recursive: true });
    await fsp.writeFile(path.join(dir, name), JSON.stringify(body, null, 2) + '\n', 'utf8');
}
/**
 * Deliver a recall plan over the filesystem lane. Returns what was sent.
 *  - recall → a `task_assign` recall message into `inboxes/<agent_id>/`
 *  - hire   → a `finding_report` to `shared` (spawn-fresh is the runner layer's job)
 *  - gap    → a `finding_report` to `shared` (unfillable — needs attention)
 */
async function dispatchRecallActions(workspaceRoot, actions, opts = {}) {
    const now = new Date(opts.now ?? Date.now());
    const project = opts.project ?? path.basename(workspaceRoot);
    const from = opts.from ?? 'supervisor';
    const comms = commsDir(workspaceRoot);
    const shared = path.join(comms, 'inboxes', 'shared');
    const summary = { recalled: [], hires: [], gaps: [] };
    for (const action of actions) {
        const frag = crypto.randomBytes(3).toString('hex');
        if (action.kind === 'recall') {
            const msg = (0, recall_1.recallMessage)(action.agent_id, action.role, {
                project, from, timestamp: now.toISOString(),
            });
            msg.id = `msg-${crypto.randomUUID()}`;
            await writeMessage(path.join(comms, 'inboxes', action.agent_id), `${fileTs(now)}-task_assign-${from}-${frag}.json`, msg);
            summary.recalled.push({ agent_id: action.agent_id, role: action.role });
        }
        else {
            const finding = {
                id: `msg-${crypto.randomUUID()}`, from, to: 'shared', type: 'finding_report',
                timestamp: now.toISOString(), requires_response: action.kind === 'gap',
                payload: action.kind === 'hire'
                    ? { recall: 'hire', role: action.role, template_id: action.template_id,
                        finding: `Roster vacancy for "${action.role}": hire fresh from template ${action.template_id} (runner spawn pending).` }
                    : { recall: 'gap', role: action.role,
                        finding: `Roster vacancy for "${action.role}" is UNFILLABLE — no available worker and no template. Needs attention.` },
            };
            await writeMessage(shared, `${fileTs(now)}-finding_report-${from}-${frag}.json`, finding);
            if (action.kind === 'hire') {
                summary.hires.push({ template_id: action.template_id, role: action.role });
            }
            else {
                summary.gaps.push({ role: action.role });
            }
        }
    }
    return summary;
}
// ---------------------------------------------------------------------------
// Live role census + roster-gated sweep
// ---------------------------------------------------------------------------
/**
 * Count live agents per role from primary heartbeats + the fleet.json role map.
 * "Live" = a heartbeat fresher than {@link LIVE_TTL_MS}. Agents with no declared
 * role count as `generalist`.
 */
async function liveByRoleFromDisk(workspaceRoot, opts = {}) {
    const now = opts.now ?? Date.now();
    const ttl = opts.ttlMs ?? LIVE_TTL_MS;
    const comms = commsDir(workspaceRoot);
    const manifest = await fsp.readFile(path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'fleet.json'), 'utf8')
        .then(architecture_1.parseFleetManifest).catch(() => null);
    const roleOf = (id) => manifest?.agents?.[id]?.role ?? 'generalist';
    const hbDir = path.join(comms, 'heartbeats');
    let files;
    try {
        files = await fsp.readdir(hbDir);
    }
    catch {
        return {};
    }
    const seen = new Set();
    const counts = {};
    for (const f of files) {
        if (!f.endsWith('.json')) {
            continue;
        }
        // Primary heartbeats only (skip session sidecars: >2 dash-separated segments).
        if (f.replace(/\.json$/, '').split('-').length > 2) {
            continue;
        }
        try {
            const hb = JSON.parse((await fsp.readFile(path.join(hbDir, f), 'utf8')).replace(/^﻿/, ''));
            if (!hb.agent_id || !hb.timestamp || seen.has(hb.agent_id)) {
                continue;
            }
            if (now - new Date(hb.timestamp).getTime() > ttl) {
                continue;
            }
            seen.add(hb.agent_id);
            const role = roleOf(hb.agent_id).toLowerCase();
            counts[role] = (counts[role] ?? 0) + 1;
        }
        catch { /* skip malformed */ }
    }
    return counts;
}
async function readRoster(workspaceRoot) {
    try {
        const o = JSON.parse((await fsp.readFile(path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'roster.json'), 'utf8')).replace(/^﻿/, ''));
        return o && o.want && typeof o.want === 'object' ? o : null;
    }
    catch {
        return null;
    }
}
/**
 * Roster-gated recall sweep: if `roster.json` exists, compute the live role
 * census, plan recall against the talent pool + templates, and dispatch it.
 * No roster ⇒ `{ skipped: true }` (zero cost). Safe to call every loop tick.
 */
async function runRecallSweep(workspaceRoot, opts = {}) {
    const roster = await readRoster(workspaceRoot);
    if (!roster) {
        return { skipped: true, reason: 'no roster.json' };
    }
    const live = await liveByRoleFromDisk(workspaceRoot, { now: opts.now });
    const plan = await (0, recall_1.planRecallFromDisk)(roster, live, opts.homeDir);
    if (plan.length === 0) {
        return { skipped: true, reason: 'establishment staffed' };
    }
    const dispatched = await dispatchRecallActions(workspaceRoot, plan, { now: opts.now, project: roster.project });
    return { skipped: false, dispatched };
}
//# sourceMappingURL=recallDispatch.js.map