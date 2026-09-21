"use strict";
/**
 * workforceIngest.ts — feed real fleet signals into earned résumés (HRW-1).
 *
 * The talent pool (HR-1) only means something if its résumés are built from
 * what actually happened. This module scans the shared comms inbox for the
 * clear, directly-attributable signals — `task_complete` (who finished work)
 * and `scope_violation` (who went off-lease) — and folds each into the right
 * worker's résumé via {@link recordOutcome}. It is idempotent: a per-workspace
 * watermark records processed message ids so re-running every loop tick never
 * double-counts.
 *
 * Consensus review outcomes (review_passed/failed) need reliable task→author
 * attribution and are deliberately left for a follow-up rather than guessed.
 *
 * Pure mapper (messageToOutcome) + fs scan/watermark; `now` injectable; no vscode.
 *
 * See docs/ideas/FLEET-FEDERATION-SELF-HEALING.md §9.4.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageToOutcome = messageToOutcome;
exports.ingestWorkforceSignals = ingestWorkforceSignals;
const fs = require("fs");
const path = require("path");
const workforce_1 = require("./workforce");
const fsp = fs.promises;
/**
 * Pure: map a comms message to a résumé outcome, or null. `orchestrator-loop`,
 * `supervisor`, `autobuild`, and `shared` are infrastructure senders, never
 * workers — their messages are ignored for attribution.
 */
function messageToOutcome(msg, project) {
    const INFRA = new Set(['orchestrator-loop', 'supervisor', 'autobuild', 'shared', '']);
    const from = (msg.from ?? '').trim();
    if (msg.type === 'task_complete') {
        if (INFRA.has(from)) {
            return null;
        }
        return { agentId: from, outcome: { kind: 'task_complete', ...(project ? { project } : {}) } };
    }
    if (msg.type === 'scope_violation') {
        // The offending agent is named in the payload when present, else the sender.
        const offender = typeof msg.payload?.agent === 'string' ? msg.payload.agent.trim() : from;
        if (INFRA.has(offender)) {
            return null;
        }
        return { agentId: offender, outcome: { kind: 'scope_violation' } };
    }
    return null;
}
function ingestStatePath(workspaceRoot) {
    return path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'workforce-ingest.json');
}
async function readState(file) {
    try {
        const o = JSON.parse((await fsp.readFile(file, 'utf8')).replace(/^﻿/, ''));
        return o && typeof o.processed === 'object' ? o : { processed: {} };
    }
    catch {
        return { processed: {} };
    }
}
/**
 * Scan the shared inbox for new task_complete / scope_violation messages and
 * fold each into the relevant worker's résumé. Idempotent via a per-workspace
 * watermark (message id, else filename). `homeDir` targets the worker store;
 * `project` defaults to the workspace folder name.
 */
async function ingestWorkforceSignals(workspaceRoot, opts = {}) {
    const project = opts.project ?? path.basename(workspaceRoot);
    const sharedDir = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'comms', 'inboxes', 'shared');
    const stateFile = ingestStatePath(workspaceRoot);
    const state = await readState(stateFile);
    let files;
    try {
        files = await fsp.readdir(sharedDir);
    }
    catch {
        return { ingested: 0, byAgent: {}, scanned: 0 };
    }
    const byAgent = {};
    let ingested = 0;
    let scanned = 0;
    let dirty = false;
    for (const f of files) {
        if (!f.endsWith('.json')) {
            continue;
        }
        // Cheap pre-filter: only task_complete / scope_violation filenames carry signal.
        if (!f.includes('task_complete') && !f.includes('scope_violation')) {
            continue;
        }
        scanned++;
        let msg;
        try {
            msg = JSON.parse((await fsp.readFile(path.join(sharedDir, f), 'utf8')).replace(/^﻿/, ''));
        }
        catch {
            continue;
        }
        const key = msg.id ?? f;
        if (state.processed[key]) {
            continue;
        } // already folded — idempotent
        const mapped = messageToOutcome(msg, project);
        state.processed[key] = true;
        dirty = true; // mark seen even if no outcome (don't re-read)
        if (!mapped) {
            continue;
        }
        await (0, workforce_1.recordOutcome)(mapped.agentId, mapped.outcome, { homeDir: opts.homeDir, now: opts.now });
        ingested++;
        byAgent[mapped.agentId] = (byAgent[mapped.agentId] ?? 0) + 1;
    }
    if (dirty) {
        // Cap the processed set so the watermark file can't grow without bound.
        const keys = Object.keys(state.processed);
        if (keys.length > 2000) {
            const trimmed = {};
            for (const k of keys.slice(-1500)) {
                trimmed[k] = true;
            }
            state.processed = trimmed;
        }
        state.last_run = new Date(opts.now ?? Date.now()).toISOString();
        try {
            await fsp.mkdir(path.dirname(stateFile), { recursive: true });
            await fsp.writeFile(stateFile, JSON.stringify(state, null, 2) + '\n', 'utf8');
        }
        catch { /* best-effort watermark */ }
    }
    return { ingested, byAgent, scanned };
}
//# sourceMappingURL=workforceIngest.js.map