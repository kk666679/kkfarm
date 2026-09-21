"use strict";
/**
 * controlHandler.ts — the host-neutral control ACK HANDLER loop (CP-4.1 §"ships
 * first" + CP-4.2/CP-4.5). This is the piece that makes acked control commands
 * actually DO something: it composes codex's pure preflight
 * ({@link evaluateControlAck}) and verb executor
 * ({@link applyReviewDecisionControlCommand}) — scanning `comms/control/` for
 * un-acked commands, validating each, executing the verb, and writing the
 * canonical ack. Mounted by BOTH the extension and autoclawd (a headless
 * deployment must execute the human's review decision).
 *
 * The killer feature (CP-4.5): a human's `review_decision` writes the vote into
 * `consensus/active`, so the very next loop tally resolves the review and the WIP
 * gate reopens — the human clears a review from any Control surface.
 *
 * **Authority model** (spec §3.5): every command names a `capability_grant_id`.
 * The human's inherent, free-tier authority is the RESERVED grant below (all
 * control verbs, all scope, never expires, no seat occupancy required — a
 * reserved actor skips the occupancy check). Agent-issued commands are authorized
 * by their SEAT grant + a live occupancy lease. Local integrity only — a process
 * with FS write access can already do anything; these checks are for attribution
 * + accident-prevention (pre-M6 threat model), and every rejection is auditable.
 *
 * Pure-ish + fs, no vscode. Best-effort per command; never throws.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESERVED_HUMAN_GRANT_ID = void 0;
exports.reservedHumanGrant = reservedHumanGrant;
exports.gatherControlGrants = gatherControlGrants;
exports.controlSignatureVerification = controlSignatureVerification;
exports.processControlCommands = processControlCommands;
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const controlAck_1 = require("./controlAck");
const controlVerbs_1 = require("./controlVerbs");
const seats_1 = require("./seats");
const sign_1 = require("../spine/sign");
const fsp = fs.promises;
/** The reserved grant id a human/Control surface stamps on its commands. */
exports.RESERVED_HUMAN_GRANT_ID = 'human-control';
/** Far-future sentinel — the human's authority does not expire. */
const NEVER_EXPIRES = '9999-12-31T23:59:59.999Z';
/** The human's inherent, free-tier control authority (spec §3.5). */
function reservedHumanGrant() {
    const grant = {
        grant_id: exports.RESERVED_HUMAN_GRANT_ID,
        issued_by: 'control',
        expires: NEVER_EXPIRES,
        scope: ['*'],
        verbs: [...controlAck_1.CONTROL_COMMAND_VERBS],
    };
    return { grant, kind: 'reserved', requires_occupant: false };
}
/** Build the grant sources: the reserved human grant + every seat's grant. */
function gatherControlGrants(seatDefs) {
    const out = [reservedHumanGrant()];
    for (const def of seatDefs) {
        if (def?.grant?.grant_id) {
            out.push({ grant: def.grant, seat_id: def.seat_id, kind: 'seat', requires_occupant: true });
        }
    }
    return out;
}
/**
 * Per-process replay guard for relayed control envelopes. Cross-restart replay
 * of the SAME command id is already blocked by ack idempotency (an acked id is
 * never re-processed); this guard additionally stops the same VALID signature
 * from being accepted twice within a process (e.g. re-stamped under a new id —
 * though that also breaks the signature — or re-delivered before its ack lands).
 */
const controlReplayGuard = new sign_1.ReplayGuard();
/**
 * CP-6.1: the default trusted-key verification for remote/relayed control
 * commands. Trusts this workspace's own signing key (created on first use)
 * plus every peer registered in `.autoclaw/control/trusted-keys.json`.
 * Envelopes must be bound to this workspace id (default: root basename —
 * the spine ingest convention).
 */
function controlSignatureVerification(workspaceRoot, workspaceId) {
    const self = (0, sign_1.loadOrCreateSigningKey)(workspaceRoot);
    return {
        resolvePublicKey: (0, sign_1.makeKeyResolver)(workspaceRoot, [(0, sign_1.publicKeyEntry)(self)]),
        expectedWorkspaceId: workspaceId ?? path.basename(workspaceRoot),
        replay: controlReplayGuard,
    };
}
function commsDir(workspaceRoot) {
    return path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'comms');
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
        return (await fsp.readdir(dir)).filter((n) => n.endsWith('.json'));
    }
    catch {
        return [];
    }
}
async function writeAck(acksDir, ack) {
    await fsp.mkdir(acksDir, { recursive: true }).catch(() => undefined);
    const file = path.join(acksDir, `${ack.id}.json`);
    const tmp = `${file}.tmp-${process.pid}`;
    await fsp.writeFile(tmp, JSON.stringify(ack, null, 2), 'utf8');
    await fsp.rename(tmp, file);
}
function buildAck(command, result, detail, now, failedCheck) {
    return {
        id: `ack-${crypto.randomUUID()}`,
        ack_of: command.id,
        from: 'control',
        result,
        detail,
        timestamp: now.toISOString(),
        ...(failedCheck ? { failed_check: failedCheck } : {}),
    };
}
/**
 * Process every un-acked control command once. For each: run codex's preflight;
 * on failure write its reject ack; on success execute the verb (review_decision
 * writes the vote — other verbs no-op with an honest ack until their executor is
 * wired) and write the applied/noop ack. Idempotent: a command that already has
 * an ack is skipped, so re-running the loop is safe. Never throws.
 */
async function processControlCommands(workspaceRoot, opts = {}) {
    const now = opts.now ?? new Date();
    const cd = commsDir(workspaceRoot);
    const controlDir = path.join(cd, 'control');
    const acksDir = path.join(controlDir, 'acks');
    const result = { processed: 0, applied: [], rejected: [], noop: [] };
    const names = await listJson(controlDir);
    if (names.length === 0) {
        return result;
    }
    // CP-6.1: relayed/cross-machine commands must verify against the trusted-key
    // registry before ANY grant/verb check; local-origin commands stay unsigned.
    const workspaceId = opts.workspaceId ?? path.basename(workspaceRoot);
    const signature = opts.signature ?? controlSignatureVerification(workspaceRoot, workspaceId);
    // Which commands already have an ack (idempotency).
    const acked = new Set();
    for (const name of await listJson(acksDir)) {
        const ack = await readJson(path.join(acksDir, name));
        if (ack?.ack_of) {
            acked.add(ack.ack_of);
        }
    }
    // Gather authority: reserved human grant + seat grants + current leases.
    const manifest = await readJson(path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'fleet.json'));
    const seatDefs = manifest ? Object.values((0, seats_1.seatDefinitionsFromManifest)(manifest)) : [];
    const grants = gatherControlGrants(seatDefs);
    const seatLeases = opts.seatLeases ?? await readSeatLeasesSafe(workspaceRoot);
    for (const name of names) {
        const command = await readJson(path.join(controlDir, name));
        if (!command || typeof command.id !== 'string' || command.id === '') {
            continue;
        }
        if (acked.has(command.id)) {
            continue;
        }
        result.processed++;
        try {
            const pre = (0, controlAck_1.evaluateControlAck)({
                commandFile: command, grants, seatLeases, seatDefinitions: seatDefs, now: now.getTime(),
                workspaceId, signature,
            });
            if (!pre.ok) {
                await writeAck(acksDir, pre.ack);
                result.rejected.push({ id: command.id, check: pre.failed_check });
                continue;
            }
            // Preflight passed — execute the verb.
            if (command.type === 'review_decision') {
                const applied = await (0, controlVerbs_1.applyReviewDecisionControlCommand)(command, {
                    consensusActiveDir: path.join(cd, 'consensus', 'active'), timestamp: now.toISOString(),
                });
                if (applied.ok) {
                    await writeAck(acksDir, buildAck(command, 'applied', applied.detail, now));
                    result.applied.push(command.id);
                }
                else {
                    await writeAck(acksDir, buildAck(command, 'rejected', applied.error, now, applied.failed_check));
                    result.rejected.push({ id: command.id, check: applied.failed_check });
                }
            }
            else {
                // nudge/pause/resume/reassign/handoff_request/evict passed preflight but
                // their executors are not wired here yet — honest noop, not a false apply.
                await writeAck(acksDir, buildAck(command, 'noop', `verb '${command.type}' authorized but has no executor yet`, now));
                result.noop.push(command.id);
            }
        }
        catch {
            // Isolate per-command failures; one bad command never aborts the sweep.
        }
    }
    return result;
}
async function readSeatLeasesSafe(workspaceRoot) {
    try {
        const { readSeatLeases } = await Promise.resolve().then(() => require('./seats'));
        return await readSeatLeases(workspaceRoot);
    }
    catch {
        return [];
    }
}
//# sourceMappingURL=controlHandler.js.map