"use strict";
/**
 * evictReconcile.ts — the "command layer" follow-through evict.ts delegates.
 *
 * The SAFE-CORE evict transaction (evict.ts Steps 2–4) deliberately only
 * RECORDS what it released: re-dispatch and consensus math belong to the layer
 * that owns the board. Until now that layer did not exist, so (triage items
 * #1/#2, known-issues-triage.md):
 *   - an evicted agent's released tasks stranded silently (no re-dispatch
 *     doorbell, no finding per blocked dependent);
 *   - open consensus items could deadlock (the evictee stayed in the declared
 *     panel; the 2/3 threshold was never recomputed over survivors).
 *
 * This module is that layer, called by BOTH evict entry points (the palette
 * command and the `evict` control verb) right after `evictAgent` returns:
 *
 *   1. `reassign` doorbell per released task → shared/ (the existing LANE-B
 *      message the board's dispatch path listens for — never a second path).
 *   2. `finding_report` per blocked dependent → shared/ (visible stall chain).
 *   3. Survivor recompute: one `resolvePendingConsensus` pass where everyone
 *      EXCEPT the evictee counts as present (grace 0) — so majority-rule items
 *      the evictee owed a ballot on resolve over the surviving panel now, not
 *      after the liveness grace window. **Unanimous-rule stubs are NEVER
 *      auto-shrunk** (security invariant): those raise a finding instead.
 *
 * Pure-ish: all sends + the tally pass are injectable for tests.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconcileAfterEvict = reconcileAfterEvict;
const fs = require("fs");
const path = require("path");
const comms_1 = require("../comms");
const consensusTally_1 = require("../orchestrator/consensusTally");
function readStubs(activeDir) {
    let names = [];
    try {
        names = fs.readdirSync(activeDir).filter((n) => n.endsWith('.json'));
    }
    catch {
        return [];
    }
    const stubs = [];
    for (const n of names) {
        try {
            const obj = JSON.parse(fs.readFileSync(path.join(activeDir, n), 'utf8').replace(/^﻿/, ''));
            // Stub = has task_id, no top-level string vote (consensusActiveScan rule).
            if (typeof obj.task_id === 'string' && typeof obj.vote !== 'string') {
                stubs.push(obj);
            }
        }
        catch { /* skip unreadable */ }
    }
    return stubs;
}
/**
 * Run the post-evict follow-through for one completed evict intent.
 * Best-effort per step; never throws (an evict that succeeded must not be
 * reported as failed because a doorbell write hiccuped).
 */
async function reconcileAfterEvict(workspaceRoot, intent, opts = {}) {
    const commsDir = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'comms');
    const now = (opts.now ?? new Date()).toISOString();
    const from = opts.fromAgent ?? intent.requested_by ?? 'orchestrator-loop';
    const send = opts.send ?? comms_1.sendMessage;
    const result = { redispatched: [], findings: 0, consensusResolved: [], unanimousSurfaced: [] };
    // 1. Re-dispatch doorbell per released task (the board's existing listener).
    for (const taskId of intent.released_tasks ?? []) {
        try {
            await send(commsDir, {
                id: (0, comms_1.generateMessageId)(), from, to: 'shared', type: 'reassign',
                timestamp: now, task_id: taskId, requires_response: false,
                payload: {
                    reason: `claim released by evict of ${intent.target_agent_id} (intent ${intent.intent_id})`,
                    evicted_agent: intent.target_agent_id,
                },
            });
            result.redispatched.push(taskId);
        }
        catch { /* best-effort per task */ }
    }
    // 2. One finding per blocked dependent — the stalled chain must be visible.
    for (const dep of intent.blocked_dependents ?? []) {
        try {
            await send(commsDir, {
                id: (0, comms_1.generateMessageId)(), from, to: 'shared', type: 'finding_report',
                timestamp: now, task_id: dep, requires_response: false,
                payload: {
                    severity: 'warning',
                    finding: `task ${dep} depends on work released by the evict of ${intent.target_agent_id} — its dependency chain is stalled until the released task is re-claimed`,
                    evict_intent: intent.intent_id,
                },
            });
            result.findings++;
        }
        catch { /* best-effort */ }
    }
    // 3. Survivor recompute over the stubs the evictee sat on.
    const activeDir = path.join(commsDir, 'consensus', 'active');
    const stubs = readStubs(activeDir).filter((s) => (s.reviewers ?? []).includes(intent.target_agent_id));
    if (stubs.length > 0) {
        const unanimous = stubs.filter((s) => s.rule === 'unanimous');
        const majority = stubs.filter((s) => s.rule !== 'unanimous');
        // Security invariant: a unanimous panel is never shrunk by machinery.
        for (const s of unanimous) {
            try {
                await send(commsDir, {
                    id: (0, comms_1.generateMessageId)(), from, to: 'shared', type: 'finding_report',
                    timestamp: now, task_id: s.task_id, requires_response: false,
                    payload: {
                        severity: 'high',
                        finding: `unanimous-rule consensus ${s.task_id} lists evicted reviewer ${intent.target_agent_id} — a human must re-select the panel (security quorums are never auto-shrunk)`,
                        evict_intent: intent.intent_id,
                    },
                });
                result.findings++;
                result.unanimousSurfaced.push(s.task_id);
            }
            catch { /* best-effort */ }
        }
        if (majority.length > 0) {
            // Everyone except the evictee counts as present, grace 0 ⇒ exactly one
            // reviewer (the evictee) is liveness-dropped; survivors' votes decide.
            const everyoneElse = new Set();
            for (const s of majority) {
                for (const r of s.reviewers ?? []) {
                    if (r !== intent.target_agent_id) {
                        everyoneElse.add(r);
                    }
                }
            }
            try {
                const tally = await (opts.tally ?? consensusTally_1.resolvePendingConsensus)({
                    workspaceRoot, resolvedBy: `evict-reconcile:${from}`,
                    activeReviewers: everyoneElse, livenessGraceMs: 0,
                });
                const mine = new Set(majority.map((s) => s.task_id));
                result.consensusResolved = tally.resolved.map((r) => r.task_id).filter((t) => mine.has(t));
            }
            catch { /* the loop's next tick retries the tally anyway */ }
        }
    }
    return result;
}
//# sourceMappingURL=evictReconcile.js.map