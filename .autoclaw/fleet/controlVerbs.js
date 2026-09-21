"use strict";
/**
 * controlVerbs.ts - CP-4.2 verb executors for acked control commands.
 *
 * Every executor follows the same contract: it assumes the caller already ran
 * the CP-4.1 preflight ({@link evaluateControlAck}) and is responsible for
 * writing the final ack file (controlIo.ts owns that). Executors are pure
 * cores with thin fs/comms IO — no vscode, deterministic under an injected
 * timestamp, and they NEVER write acks themselves.
 *
 * Verb → action (spec §3.5 table):
 * - `review_decision` → loop-tally vote via writeConsensusVote (landed first).
 * - `nudge` / `handoff_request` → a `question` message into the target inbox.
 * - `pause` / `resume` → the dispatch-pause flag file contract below (the
 *   loop consults {@link isDispatchPaused}; wiring is a host follow-up).
 * - `reassign` → release the target-owned claim file + `task_assignment` to
 *   the new assignee (+ a `reassign` notice to the prior owner).
 * - `evict` → SAFE-CORE {@link evictAgent} (graceful ONLY); the ack result is
 *   DERIVED from the intent record's state, never independently stamped.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyReviewDecisionControlCommand = applyReviewDecisionControlCommand;
exports.applyNudgeControlCommand = applyNudgeControlCommand;
exports.applyHandoffRequestControlCommand = applyHandoffRequestControlCommand;
exports.dispatchPauseFile = dispatchPauseFile;
exports.readDispatchPauseFlag = readDispatchPauseFlag;
exports.isDispatchPaused = isDispatchPaused;
exports.applyDispatchPauseControlCommand = applyDispatchPauseControlCommand;
exports.applyDispatchResumeControlCommand = applyDispatchResumeControlCommand;
exports.applyReassignControlCommand = applyReassignControlCommand;
exports.applyEvictControlCommand = applyEvictControlCommand;
const fs = require("fs");
const path = require("path");
const voteWriter_1 = require("../orchestrator/voteWriter");
const comms_1 = require("../comms");
const evict_1 = require("./evict");
const fsp = fs.promises;
function asRecord(value) {
    return value && typeof value === 'object' ? value : null;
}
function asString(value) {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}
function taskIdFromCommand(command) {
    const target = command.target;
    if (typeof target === 'string') {
        return asString(target);
    }
    const targetRecord = asRecord(target);
    const payloadRecord = asRecord(command.payload);
    return asString(targetRecord?.task_id) ?? asString(payloadRecord?.task_id);
}
function voteFromCommand(command) {
    const payload = asRecord(command.payload);
    return asString(payload?.vote) ?? asString(payload?.decision);
}
function commentFromCommand(command) {
    const payload = asRecord(command.payload);
    return asString(payload?.comment)
        ?? asString(payload?.comments)
        ?? command.reason
        ?? '';
}
/**
 * Execute the `review_decision` control verb by writing the reviewer/human vote
 * into the loop-tally consensus active directory. The caller is responsible for
 * running evaluateControlAck first and writing the final ack file.
 */
async function applyReviewDecisionControlCommand(command, opts) {
    if (command.type !== 'review_decision') {
        return {
            ok: false,
            kind: 'review_decision',
            failed_check: 'wrong_verb',
            error: `expected review_decision, got '${command.type}'`,
        };
    }
    const taskId = taskIdFromCommand(command);
    if (!taskId) {
        return {
            ok: false,
            kind: 'review_decision',
            failed_check: 'missing_task_id',
            error: 'review_decision command missing target.task_id or payload.task_id',
        };
    }
    const vote = voteFromCommand(command);
    if (!vote || !(0, voteWriter_1.isValidVote)(vote)) {
        return {
            ok: false,
            kind: 'review_decision',
            failed_check: 'invalid_vote',
            error: `invalid review_decision vote '${vote ?? '(missing)'}'`,
        };
    }
    const written = await (0, voteWriter_1.writeConsensusVote)({
        consensusActiveDir: opts.consensusActiveDir,
        taskId,
        voter: command.from,
        sessionId: command.session_id,
        vote,
        comment: commentFromCommand(command),
        timestamp: opts.timestamp ?? command.timestamp,
    });
    if (!written.ok || !written.file || !written.vote) {
        return {
            ok: false,
            kind: 'review_decision',
            failed_check: 'vote_write_failed',
            error: written.error ?? 'writeConsensusVote failed',
        };
    }
    return {
        ok: true,
        kind: 'review_decision',
        file: written.file,
        vote: written.vote,
        detail: `review_decision wrote ${vote} for ${taskId}`,
    };
}
// ---------------------------------------------------------------------------
// Shared target/payload extraction (mirrors the review_decision helpers)
// ---------------------------------------------------------------------------
function agentIdFromCommand(command) {
    const target = command.target;
    if (typeof target === 'string') {
        return asString(target);
    }
    return asString(asRecord(target)?.agent_id);
}
function sessionIdFromTarget(command) {
    return asString(asRecord(command.target)?.session_id);
}
/** Sanitize an id fragment for a filename (mirrors evict.ts / beacons.ts). */
function safeFrag(s) {
    return s.replace(/[^A-Za-z0-9_.-]/g, '_');
}
/** Atomic small-JSON write: tmp in the same dir, then rename. */
async function writeJsonAtomic(file, value) {
    await fsp.mkdir(path.dirname(file), { recursive: true });
    const tmp = `${file}.tmp-${process.pid}-${Date.now().toString(36)}`;
    await fsp.writeFile(tmp, JSON.stringify(value, null, 2) + '\n', 'utf8');
    await fsp.rename(tmp, file);
}
async function applyInboxVerb(verb, command, opts) {
    if (command.type !== verb) {
        return { ok: false, kind: verb, failed_check: 'wrong_verb', error: `expected ${verb}, got '${command.type}'` };
    }
    const agent = agentIdFromCommand(command);
    if (!agent) {
        return { ok: false, kind: verb, failed_check: 'missing_target_agent', error: `${verb} command missing target.agent_id` };
    }
    const payload = asRecord(command.payload);
    // NOT taskIdFromCommand: for inbox verbs a STRING target is the agent id,
    // so the task id may only come from a record target / the payload.
    const taskId = asString(asRecord(command.target)?.task_id) ?? asString(payload?.task_id);
    const note = asString(payload?.message) ?? asString(payload?.note) ?? command.reason ?? '';
    const message = {
        id: `msg-${command.id}-${verb}`,
        from: command.from,
        to: agent,
        type: 'question',
        timestamp: opts.timestamp ?? command.timestamp,
        ...(taskId ? { task_id: taskId } : {}),
        payload: {
            kind: verb,
            command_id: command.id,
            ...(taskId ? { task_id: taskId } : {}),
            ...(note ? { note } : {}),
            ...(verb === 'handoff_request'
                ? { expected: 'a handoff note sidecar under comms/handoffs/ (docs/AGENT_SESSION_PROTOCOL.md)' }
                : {}),
        },
        // A nudge is a reminder; a handoff_request expects the note back.
        requires_response: verb === 'handoff_request',
    };
    try {
        const file = await (0, comms_1.sendMessage)(opts.commsDir, message);
        return { ok: true, kind: verb, file, detail: `${verb} delivered to ${agent} inbox` };
    }
    catch (err) {
        return { ok: false, kind: verb, failed_check: 'send_failed', error: err instanceof Error ? err.message : String(err) };
    }
}
/** Execute `nudge`: a reminder `question` message into the target inbox. */
async function applyNudgeControlCommand(command, opts) {
    return applyInboxVerb('nudge', command, opts);
}
/** Execute `handoff_request`: ask the target agent for a handoff note. */
async function applyHandoffRequestControlCommand(command, opts) {
    return applyInboxVerb('handoff_request', command, opts);
}
/** Canonical flag path: `<commsDir>/control/dispatch-pause.json`. */
function dispatchPauseFile(commsDir) {
    return path.join(commsDir, 'control', 'dispatch-pause.json');
}
/** Read the flag record. Null when absent/malformed (= dispatch running). */
async function readDispatchPauseFlag(commsDir) {
    try {
        const raw = await fsp.readFile(dispatchPauseFile(commsDir), 'utf8');
        const parsed = JSON.parse(raw.replace(/^﻿/, ''));
        return parsed && typeof parsed.paused === 'boolean' ? parsed : null;
    }
    catch {
        return null;
    }
}
/** The reader the loop adopts: paused iff the flag file says `paused: true`. */
async function isDispatchPaused(commsDir) {
    return (await readDispatchPauseFlag(commsDir))?.paused === true;
}
async function flipDispatchPause(verb, command, opts) {
    if (command.type !== verb) {
        return { ok: false, kind: verb, failed_check: 'wrong_verb', error: `expected ${verb}, got '${command.type}'` };
    }
    const flag = {
        paused: verb === 'pause',
        ...(command.reason ? { reason: command.reason } : {}),
        by: command.from,
        at: opts.timestamp ?? command.timestamp,
        command_id: command.id,
    };
    const file = dispatchPauseFile(opts.commsDir);
    try {
        await writeJsonAtomic(file, flag);
        return {
            ok: true, kind: verb, file, flag,
            detail: verb === 'pause'
                ? `dispatch paused by ${command.from}${command.reason ? `: ${command.reason}` : ''}`
                : `dispatch resumed by ${command.from}`,
        };
    }
    catch (err) {
        return { ok: false, kind: verb, failed_check: 'write_failed', error: err instanceof Error ? err.message : String(err) };
    }
}
/** Execute `pause`: persist the dispatch-pause flag (idempotent overwrite). */
async function applyDispatchPauseControlCommand(command, opts) {
    return flipDispatchPause('pause', command, opts);
}
/** Execute `resume`: flip the flag off (idempotent even when never paused). */
async function applyDispatchResumeControlCommand(command, opts) {
    return flipDispatchPause('resume', command, opts);
}
/**
 * Execute `reassign`: delete the claim file (deleting the file IS the mutex
 * release — the protocol steal-rule applied by the orchestrator holder) when
 * the TARGET owns it, then send a `task_assignment` to the new assignee and a
 * `reassign` notice to the prior owner. Refuses to steal a claim held by an
 * agent other than the command's target (`claim_owner_mismatch`).
 */
async function applyReassignControlCommand(command, opts) {
    if (command.type !== 'reassign') {
        return { ok: false, kind: 'reassign', failed_check: 'wrong_verb', error: `expected reassign, got '${command.type}'` };
    }
    const taskId = taskIdFromCommand(command);
    if (!taskId) {
        return { ok: false, kind: 'reassign', failed_check: 'missing_task_id', error: 'reassign command missing target.task_id or payload.task_id' };
    }
    const payload = asRecord(command.payload);
    const assignee = asString(payload?.to) ?? asString(payload?.assignee) ?? asString(payload?.new_assignee);
    if (!assignee) {
        return { ok: false, kind: 'reassign', failed_check: 'missing_assignee', error: 'reassign command missing payload.to / payload.assignee' };
    }
    // For reassign a STRING target is the task, so the current-owner constraint
    // may only come from a record target (absent → any current claim releases).
    const targetAgent = asString(asRecord(command.target)?.agent_id);
    const targetSession = sessionIdFromTarget(command);
    const claimFile = path.join(opts.commsDir, 'claims', `${safeFrag(taskId)}.json`);
    let released = false;
    let priorOwner;
    let claim = null;
    try {
        claim = JSON.parse((await fsp.readFile(claimFile, 'utf8')).replace(/^﻿/, ''));
    }
    catch { /* no claim on disk → nothing to release, assignment still valid */ }
    if (claim) {
        if (targetAgent && claim.claimed_by && claim.claimed_by !== targetAgent) {
            return {
                ok: false, kind: 'reassign', failed_check: 'claim_owner_mismatch',
                error: `claim for ${taskId} is held by '${claim.claimed_by}', not target '${targetAgent}' — refusing to steal`,
            };
        }
        if (targetSession && claim.session_id && claim.session_id !== targetSession) {
            return {
                ok: false, kind: 'reassign', failed_check: 'claim_owner_mismatch',
                error: `claim for ${taskId} is held by session '${claim.session_id}', not target session '${targetSession}'`,
            };
        }
        priorOwner = asString(claim.claimed_by);
        try {
            await fsp.unlink(claimFile);
            released = true;
        }
        catch { /* already gone → idempotent success */ }
    }
    const timestamp = opts.timestamp ?? command.timestamp;
    let assignmentFile;
    try {
        assignmentFile = await (0, comms_1.sendMessage)(opts.commsDir, {
            id: `msg-${command.id}-reassign`,
            from: command.from,
            to: assignee,
            type: 'task_assignment',
            timestamp,
            task_id: taskId,
            payload: {
                kind: 'reassign',
                command_id: command.id,
                task_id: taskId,
                assigned_by: command.from,
                ...(priorOwner ? { reassigned_from: priorOwner } : {}),
                ...(command.reason ? { reason: command.reason } : {}),
            },
            requires_response: false,
        });
    }
    catch (err) {
        return { ok: false, kind: 'reassign', failed_check: 'send_failed', error: err instanceof Error ? err.message : String(err) };
    }
    // Doorbell the prior owner so it stops working the released task.
    let noticeFile;
    if (released && priorOwner) {
        try {
            noticeFile = await (0, comms_1.sendMessage)(opts.commsDir, {
                id: `msg-${command.id}-reassign-notice`,
                from: command.from,
                to: priorOwner,
                type: 'reassign',
                timestamp,
                task_id: taskId,
                payload: {
                    kind: 'reassign_notice',
                    command_id: command.id,
                    task_id: taskId,
                    reassigned_to: assignee,
                    ...(command.reason ? { reason: command.reason } : {}),
                },
                requires_response: false,
            });
        }
        catch { /* notice is best-effort; the release + assignment already happened */ }
    }
    return {
        ok: true,
        kind: 'reassign',
        released,
        ...(priorOwner ? { prior_owner: priorOwner } : {}),
        assignment_file: assignmentFile,
        ...(noticeFile ? { notice_file: noticeFile } : {}),
        detail: released
            ? `reassigned ${taskId}: released ${priorOwner ?? 'prior'} claim, assigned to ${assignee}`
            : `reassigned ${taskId}: no claim to release, assigned to ${assignee}`,
    };
}
/**
 * Execute `evict` by converging with the SAFE-CORE transaction
 * ({@link evictAgent}): the control envelope only TRIGGERS the intent;
 * `comms/intents/<id>.json` remains the transaction record, and the ack result
 * is DERIVED from that record's state — never independently stamped (spec
 * §3.5). Graceful ONLY: a control-envelope `hard` evict is refused (a hard
 * kill needs the local operator's re-confirmation, not a remote-shaped verb).
 * Re-runs converge: the intent id is derived from the command id, so a re-fired
 * command resumes/no-ops the SAME transaction.
 */
async function applyEvictControlCommand(command, opts) {
    if (command.type !== 'evict') {
        return { ok: false, kind: 'evict', failed_check: 'wrong_verb', error: `expected evict, got '${command.type}'` };
    }
    const agent = agentIdFromCommand(command);
    if (!agent) {
        return { ok: false, kind: 'evict', failed_check: 'missing_target_agent', error: 'evict command missing target.agent_id' };
    }
    const payload = asRecord(command.payload);
    if (asString(payload?.mode) === 'hard') {
        return {
            ok: false, kind: 'evict', failed_check: 'hard_mode_not_allowed',
            error: 'hard evict is not permitted via a control envelope — graceful only (re-confirm locally for hard)',
        };
    }
    const intentId = `evict-${command.id}`;
    let intent = null;
    let refusal;
    try {
        intent = await (0, evict_1.evictAgent)({
            agentId: agent,
            sessionId: sessionIdFromTarget(command),
            mode: 'graceful',
            operator: command.from,
            intentId,
            commsDir: opts.commsDir,
            homeDir: opts.homeDir,
        }, { now: opts.now });
    }
    catch (err) {
        refusal = err instanceof Error ? err.message : String(err);
        // A mid-transaction failure leaves a `failed` intent we derive from; an
        // auth/remote/hard refusal throws BEFORE the intent opens (no record).
        intent = await (0, evict_1.readIntent)(opts.commsDir, intentId);
    }
    if (!intent) {
        return {
            ok: false, kind: 'evict', failed_check: 'evict_refused',
            error: refusal ?? 'evict refused before an intent record was opened',
        };
    }
    // Post-evict follow-through (triage #1/#2): doorbells + findings + survivor
    // consensus recompute. Best-effort — the ack derives from the intent record,
    // never from this. workspaceRoot = two levels above the comms dir.
    if (intent.state === 'done') {
        try {
            const { reconcileAfterEvict } = await Promise.resolve().then(() => require('./evictReconcile'));
            const workspaceRoot = path.resolve(opts.commsDir, '..', '..', '..');
            await reconcileAfterEvict(workspaceRoot, intent, { fromAgent: command.from, ...(opts.now ? { now: new Date(opts.now) } : {}) });
        }
        catch { /* the loop's liveness pass is the backstop */ }
    }
    // ---- DERIVE the ack result from the intent record's state ---------------
    if (intent.state === 'done') {
        return {
            ok: true, kind: 'evict', ack_result: 'applied', intent,
            detail: `evict intent ${intent.intent_id} done — released [${intent.released_tasks.join(', ')}]`,
        };
    }
    if (intent.state === 'failed') {
        return {
            ok: false, kind: 'evict', failed_check: 'evict_failed',
            error: intent.error ?? refusal ?? 'evict intent failed',
            intent,
        };
    }
    return {
        ok: true, kind: 'evict', ack_result: 'noop', intent,
        detail: `evict intent ${intent.intent_id} still '${intent.state}' — ack derived from intent state`,
    };
}
//# sourceMappingURL=controlVerbs.js.map