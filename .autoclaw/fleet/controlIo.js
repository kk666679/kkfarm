"use strict";
/**
 * controlIo.ts - CP-4.1 canonical control-file IO + CP-4.2 verb dispatcher.
 *
 * The `comms/control/` tree is CANONICAL for the control family (spec §3.5
 * winner rule): commands are `comms/control/<id>.json`, acks live in
 * `comms/control/acks/ack-<frag>.json`, and every UI/spine surface derives its
 * state from these files. This module owns that IO — atomic tmp+rename writes,
 * SHORT deterministic filenames (Windows MAX_PATH is real), and the
 * never-double-ack rule (an existing ack for the same `ack_of` always wins).
 *
 * {@link dispatchControlCommand} is the "final ack result derivation" seam the
 * host handler mounts AFTER the CP-4.1 preflight (`evaluateControlAck`): it
 * routes the approved command to its CP-4.2 executor (controlVerbs.ts), maps
 * the executor outcome to an `applied`/`rejected`/`noop` ack, persists it
 * idempotently, and returns the CP-4.3 canonical-state projection.
 *
 * Pure Node (fs/path only, no vscode) so extension AND autoclawd share it.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.controlDir = controlDir;
exports.controlAcksDir = controlAcksDir;
exports.controlAckId = controlAckId;
exports.readControlCommands = readControlCommands;
exports.readControlAcks = readControlAcks;
exports.findControlAck = findControlAck;
exports.writeControlAck = writeControlAck;
exports.dispatchControlCommand = dispatchControlCommand;
const fs = require("fs");
const path = require("path");
const controlState_1 = require("./controlState");
const controlVerbs_1 = require("./controlVerbs");
const fsp = fs.promises;
// ---------------------------------------------------------------------------
// Canonical paths + ids
// ---------------------------------------------------------------------------
/** Canonical control-command home: `<commsDir>/control`. */
function controlDir(commsDir) {
    return path.join(commsDir, 'control');
}
/** Canonical ack home: `<commsDir>/control/acks`. */
function controlAcksDir(commsDir) {
    return path.join(commsDir, 'control', 'acks');
}
/**
 * Deterministic SHORT ack id for a command: `ack-<frag>` where the fragment is
 * the sanitized command id minus its `ctl-` prefix, capped for MAX_PATH. The
 * ack FILE is `<id>.json`, so a re-derived ack for the same command lands on
 * the same name — filesystem-level idempotency (the spine event id stays
 * `ack:<ack_of>` via `controlAckEventId`, applied by controlState.ts).
 */
function controlAckId(ackOf) {
    const frag = ackOf.replace(/^ctl[-:]/i, '').replace(/[^A-Za-z0-9_-]/g, '_').slice(-48);
    return `ack-${frag || 'unknown'}`;
}
async function readJson(file) {
    try {
        return JSON.parse((await fsp.readFile(file, 'utf8')).replace(/^﻿/, ''));
    }
    catch {
        return null;
    }
}
async function listJson(dir) {
    try {
        return (await fsp.readdir(dir)).filter(n => n.endsWith('.json'));
    }
    catch {
        return [];
    }
}
function stampMs(value) {
    const t = value ? Date.parse(value) : NaN;
    return Number.isFinite(t) ? t : 0;
}
/**
 * Read every canonical command under `comms/control/` (skipping the acks
 * subdir, the dispatch-pause flag, and malformed/id-less files), oldest first.
 */
async function readControlCommands(commsDir) {
    const dir = controlDir(commsDir);
    const pauseName = path.basename((0, controlVerbs_1.dispatchPauseFile)(commsDir));
    const out = [];
    for (const name of await listJson(dir)) {
        if (name === pauseName) {
            continue;
        }
        const file = path.join(dir, name);
        const command = await readJson(file);
        if (!command || typeof command.id !== 'string' || command.id.trim() === '') {
            continue;
        }
        if (typeof command.type !== 'string' || command.type.trim() === '') {
            continue;
        }
        out.push({ file, command });
    }
    out.sort((a, b) => stampMs(a.command.timestamp) - stampMs(b.command.timestamp)
        || a.command.id.localeCompare(b.command.id));
    return out;
}
/** Read every ack record under `comms/control/acks/`, oldest first. */
async function readControlAcks(commsDir) {
    const dir = controlAcksDir(commsDir);
    const out = [];
    for (const name of await listJson(dir)) {
        const file = path.join(dir, name);
        const ack = await readJson(file);
        if (!ack || typeof ack.ack_of !== 'string' || ack.ack_of.trim() === '') {
            continue;
        }
        out.push({ file, ack });
    }
    out.sort((a, b) => stampMs(a.ack.timestamp) - stampMs(b.ack.timestamp)
        || (a.ack.id ?? '').localeCompare(b.ack.id ?? ''));
    return out;
}
/** Find the (latest) existing ack for a command id. Null when un-acked. */
async function findControlAck(commsDir, commandId) {
    const matches = (await readControlAcks(commsDir)).filter(a => a.ack.ack_of === commandId);
    return matches.length > 0 ? matches[matches.length - 1] : null;
}
/**
 * Persist an ack under `comms/control/acks/` (atomic tmp+rename). IDEMPOTENT:
 * if ANY existing ack already answers the same `ack_of`, that record is
 * returned untouched and the new ack is discarded — a command is acked exactly
 * once, and re-running a handler sweep can never flip a durable ack.
 */
async function writeControlAck(commsDir, ack) {
    const existing = await findControlAck(commsDir, ack.ack_of);
    if (existing) {
        return { file: existing.file, ack: existing.ack, existing: true };
    }
    const dir = controlAcksDir(commsDir);
    await fsp.mkdir(dir, { recursive: true });
    const name = `${controlAckId(ack.ack_of)}.json`;
    const file = path.join(dir, name);
    const tmp = `${file}.tmp-${process.pid}-${Date.now().toString(36)}`;
    await fsp.writeFile(tmp, JSON.stringify(ack, null, 2) + '\n', 'utf8');
    await fsp.rename(tmp, file);
    return { file, ack, existing: false };
}
/**
 * Execute a PREFLIGHT-APPROVED control command end to end: route the verb to
 * its executor, derive the final `applied`/`rejected`/`noop` ack, persist it
 * (never double-acking — an already-acked command short-circuits WITHOUT
 * re-executing), and return the canonical state projection UIs render.
 *
 * The caller MUST have run `evaluateControlAck` first — this function performs
 * no authorization. Executor rejections are encoded in the ack `detail` as
 * `<failed_check>: <error>` (executor checks are per-verb, not the preflight's
 * `failed_check` union). Never throws on executor failure; a thrown executor
 * error becomes a `rejected` ack.
 */
async function dispatchControlCommand(command, opts) {
    if (!command.id || typeof command.id !== 'string') {
        throw new Error('dispatchControlCommand requires a preflighted command with an id');
    }
    const now = opts.now ?? new Date();
    // Never double-ack / double-execute: an existing durable ack wins outright.
    const already = await findControlAck(opts.commsDir, command.id);
    if (already) {
        return {
            ack: already.ack,
            ackFile: already.file,
            existing: true,
            executed: false,
            state: projectState(command, already.ack, now),
        };
    }
    let result;
    let detail;
    let executed = true;
    const io = { commsDir: opts.commsDir, timestamp: now.toISOString() };
    try {
        switch (command.type) {
            case 'review_decision': {
                const r = await (0, controlVerbs_1.applyReviewDecisionControlCommand)(command, {
                    consensusActiveDir: path.join(opts.commsDir, 'consensus', 'active'),
                    timestamp: now.toISOString(),
                });
                ({ result, detail } = mapOutcome(r));
                break;
            }
            case 'nudge': {
                ({ result, detail } = mapOutcome(await (0, controlVerbs_1.applyNudgeControlCommand)(command, io)));
                break;
            }
            case 'handoff_request': {
                ({ result, detail } = mapOutcome(await (0, controlVerbs_1.applyHandoffRequestControlCommand)(command, io)));
                break;
            }
            case 'pause': {
                ({ result, detail } = mapOutcome(await (0, controlVerbs_1.applyDispatchPauseControlCommand)(command, io)));
                break;
            }
            case 'resume': {
                ({ result, detail } = mapOutcome(await (0, controlVerbs_1.applyDispatchResumeControlCommand)(command, io)));
                break;
            }
            case 'reassign': {
                ({ result, detail } = mapOutcome(await (0, controlVerbs_1.applyReassignControlCommand)(command, io)));
                break;
            }
            case 'evict': {
                // Ack result DERIVED from the SAFE-CORE intent record (spec §3.5).
                const r = await (0, controlVerbs_1.applyEvictControlCommand)(command, {
                    commsDir: opts.commsDir, homeDir: opts.homeDir, now: now.getTime(),
                });
                if (r.ok) {
                    result = r.ack_result;
                    detail = r.detail;
                }
                else {
                    result = 'rejected';
                    detail = `${r.failed_check}: ${r.error}`;
                }
                break;
            }
            default: {
                // Honest noop — authorized but nothing executes this verb here.
                result = 'noop';
                detail = `verb '${command.type}' authorized but has no executor`;
                executed = false;
            }
        }
    }
    catch (err) {
        result = 'rejected';
        detail = `executor threw: ${err instanceof Error ? err.message : String(err)}`;
    }
    const ack = {
        id: controlAckId(command.id),
        ack_of: command.id,
        from: opts.producer ?? 'control',
        result,
        detail,
        timestamp: now.toISOString(),
    };
    const written = await writeControlAck(opts.commsDir, ack);
    return {
        ack: written.ack,
        ackFile: written.file,
        existing: written.existing,
        executed: executed && !written.existing,
        state: projectState(command, written.ack, now),
    };
}
/** Map a per-verb executor outcome onto the final ack result + detail. */
function mapOutcome(outcome) {
    return outcome.ok
        ? { result: 'applied', detail: outcome.detail }
        : { result: 'rejected', detail: `${outcome.failed_check}: ${outcome.error}` };
}
/** Build the single-command CP-4.3 projection for a dispatch result. */
function projectState(command, ack, now) {
    const states = (0, controlState_1.buildControlCommandStates)([command], [ack], { now: now.getTime() });
    if (states.length === 1) {
        return states[0];
    }
    // Unreachable for a preflighted command (non-empty id) — defensive fallback.
    return {
        command_id: command.id,
        command_type: command.type,
        status: ack.result,
        canonical_source: 'command_file',
        from: command.from,
        session_id: command.session_id,
        timestamp: command.timestamp,
        age_ms: 0,
        ack,
        detail: ack.detail,
    };
}
//# sourceMappingURL=controlIo.js.map