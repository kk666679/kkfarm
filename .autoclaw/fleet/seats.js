"use strict";
/**
 * seats.ts - CP-5.1 durable PM/control seats.
 *
 * Seat definitions live in the user-authored fleet manifest. Occupancy lives
 * only as create-exclusive lease files under
 * `.autoclaw/orchestrator/comms/seats/<seat_id>.json`, mirroring task claims:
 * the file is the canonical projection and `seat.*` spine rows are derived
 * from it later.
 *
 * This module is vscode-free. The pure validators and event projection are
 * usable by the M4 ack handler, the M5 floor occupant, and future ingestors.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SEAT_LEASE_TTL_MS = exports.SEAT_TIERS = void 0;
exports.isValidSeatId = isValidSeatId;
exports.validateSeatDefinition = validateSeatDefinition;
exports.isSeatDefinition = isSeatDefinition;
exports.validateSeatLease = validateSeatLease;
exports.isSeatLease = isSeatLease;
exports.seatDefinitionsFromManifest = seatDefinitionsFromManifest;
exports.isGrantExpired = isGrantExpired;
exports.isSeatLeaseExpired = isSeatLeaseExpired;
exports.seatLeaseEvent = seatLeaseEvent;
exports.readSeatLease = readSeatLease;
exports.readSeatLeases = readSeatLeases;
exports.claimSeat = claimSeat;
exports.renewSeatLease = renewSeatLease;
exports.releaseSeatLease = releaseSeatLease;
const fs = require("fs");
const path = require("path");
const agentTypes_1 = require("../fabric/agentTypes");
const envelope_1 = require("../spine/envelope");
const fsp = fs.promises;
exports.SEAT_TIERS = [0, 1, 2, 3];
exports.DEFAULT_SEAT_LEASE_TTL_MS = 60 * 60 * 1000;
const SAFE_SEAT_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;
function stripBom(s) {
    return s.replace(/^\uFEFF/, '');
}
function commsDir(workspaceRoot) {
    return path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'comms');
}
function seatsDir(workspaceRoot) {
    return path.join(commsDir(workspaceRoot), 'seats');
}
function seatFileName(seatId) {
    if (!SAFE_SEAT_ID.test(seatId)) {
        throw new Error(`invalid seat_id for file projection: ${seatId}`);
    }
    return `${seatId}.json`;
}
function isIso(value) {
    const t = Date.parse(value);
    return Number.isFinite(t) && new Date(t).toISOString() === value;
}
function isSeatTier(value) {
    return typeof value === 'number' && exports.SEAT_TIERS.includes(value);
}
function isAgentType(value) {
    return typeof value === 'string' && agentTypes_1.AGENT_TYPES.includes(value);
}
function isValidSeatId(seatId) {
    return SAFE_SEAT_ID.test(seatId);
}
function validateSeatDefinition(def) {
    const problems = [];
    if (!def || typeof def !== 'object') {
        return ['definition is not an object'];
    }
    const d = def;
    if (typeof d.seat_id !== 'string' || !SAFE_SEAT_ID.test(d.seat_id)) {
        problems.push('seat_id must be path-safe alnum/dash/underscore, max 64 chars');
    }
    if (!isAgentType(d.agent_type)) {
        problems.push('agent_type must be a known AgentType');
    }
    if (typeof d.charter !== 'string' || d.charter.trim().length === 0) {
        problems.push('charter must be a non-empty string');
    }
    if (!isSeatTier(d.tier_ceiling)) {
        problems.push('tier_ceiling must be 0|1|2|3');
    }
    if (typeof d.memory_ns !== 'string' || d.memory_ns.trim().length === 0) {
        problems.push('memory_ns must be a non-empty string');
    }
    const g = d.grant;
    if (!g || typeof g !== 'object') {
        problems.push('grant object required');
    }
    else {
        if (typeof g.grant_id !== 'string' || g.grant_id.trim().length === 0) {
            problems.push('grant.grant_id required');
        }
        if (typeof g.issued_by !== 'string' || g.issued_by.trim().length === 0) {
            problems.push('grant.issued_by required');
        }
        if (typeof g.expires !== 'string' || !isIso(g.expires)) {
            problems.push('grant.expires must be ISO ms');
        }
        if (!Array.isArray(g.verbs) || g.verbs.length === 0 || g.verbs.some(v => typeof v !== 'string' || v.trim().length === 0)) {
            problems.push('grant.verbs must be a non-empty string array');
        }
        if (g.scope !== undefined && (!Array.isArray(g.scope) || g.scope.some(v => typeof v !== 'string' || v.trim().length === 0))) {
            problems.push('grant.scope must be a string array when present');
        }
        if (g.budget_cents_per_day !== undefined && (!Number.isFinite(g.budget_cents_per_day) || g.budget_cents_per_day < 0)) {
            problems.push('grant.budget_cents_per_day must be a non-negative number when present');
        }
    }
    return problems;
}
function isSeatDefinition(def) {
    return validateSeatDefinition(def).length === 0;
}
function validateSeatLease(lease, definition) {
    const problems = [];
    if (!lease || typeof lease !== 'object') {
        return ['lease is not an object'];
    }
    const l = lease;
    if (typeof l.seat_id !== 'string' || !SAFE_SEAT_ID.test(l.seat_id)) {
        problems.push('seat_id must be path-safe alnum/dash/underscore, max 64 chars');
    }
    if (typeof l.agent_id !== 'string' || l.agent_id.trim().length === 0) {
        problems.push('agent_id required');
    }
    if (typeof l.session_id !== 'string' || l.session_id.trim().length === 0) {
        problems.push('session_id required');
    }
    if (!isSeatTier(l.tier)) {
        problems.push('tier must be 0|1|2|3');
    }
    if (typeof l.since !== 'string' || !isIso(l.since)) {
        problems.push('since must be ISO ms');
    }
    if (typeof l.lease_expires !== 'string' || !isIso(l.lease_expires)) {
        problems.push('lease_expires must be ISO ms');
    }
    if (definition) {
        if (l.seat_id !== definition.seat_id) {
            problems.push('lease seat_id does not match definition');
        }
        if (isSeatTier(l.tier) && l.tier > definition.tier_ceiling) {
            problems.push('lease tier exceeds definition tier_ceiling');
        }
    }
    return problems;
}
function isSeatLease(lease, definition) {
    return validateSeatLease(lease, definition).length === 0;
}
/**
 * Extract valid seat definitions from a parsed fleet manifest. Invalid entries
 * are ignored by default so a malformed optional `seats` block does not break
 * existing fleet architecture reads.
 */
function seatDefinitionsFromManifest(manifest) {
    if (!manifest || typeof manifest !== 'object') {
        return {};
    }
    const seats = manifest.seats;
    if (!seats || typeof seats !== 'object') {
        return {};
    }
    const out = {};
    for (const [id, raw] of Object.entries(seats)) {
        if (!isSeatDefinition(raw)) {
            continue;
        }
        if (raw.seat_id !== id) {
            continue;
        }
        out[id] = raw;
    }
    return out;
}
function isGrantExpired(grant, now) {
    const expires = Date.parse(grant.expires);
    return !Number.isFinite(expires) || expires <= now;
}
function isSeatLeaseExpired(lease, now) {
    const expires = Date.parse(lease.lease_expires);
    return !Number.isFinite(expires) || expires <= now;
}
function seatLeaseEvent(lease, options) {
    const occurred_at = options.occurred_at ?? lease.since;
    const grantId = options.grant_id;
    const reason = options.reason ?? lease.reason;
    const evidence_refs = options.evidence_refs ?? lease.evidence_refs;
    return {
        schema: envelope_1.SPINE_SCHEMA,
        event_id: (0, envelope_1.seatEventId)(lease.seat_id, options.transition, occurred_at),
        family: 'governance',
        type: `seat.${options.transition}`,
        occurred_at,
        observed_at: options.observed_at,
        workspace_id: options.workspace_id,
        producer: options.producer ?? 'control',
        actor: { kind: 'agent', agent_id: lease.agent_id, session_id: lease.session_id },
        correlation: {},
        payload: {
            seat_id: lease.seat_id,
            agent_id: lease.agent_id,
            session_id: lease.session_id,
            tier: lease.tier,
            since: lease.since,
            lease_expires: lease.lease_expires,
            ...(reason ? { reason } : {}),
            ...(grantId ? { grant_id: grantId } : {}),
        },
        ...(evidence_refs && evidence_refs.length ? { evidence_refs } : {}),
        ...(grantId ? { capability_grant_id: grantId } : {}),
        redaction_class: 'workspace',
    };
}
async function readJsonFile(fullPath) {
    try {
        return JSON.parse(stripBom(await fsp.readFile(fullPath, 'utf8')));
    }
    catch {
        return null;
    }
}
async function readSeatLease(workspaceRoot, seatId) {
    let file;
    try {
        file = path.join(seatsDir(workspaceRoot), seatFileName(seatId));
    }
    catch {
        return null;
    }
    const raw = await readJsonFile(file);
    return isSeatLease(raw) ? raw : null;
}
async function readSeatLeases(workspaceRoot) {
    const dir = seatsDir(workspaceRoot);
    let names;
    try {
        names = await fsp.readdir(dir);
    }
    catch {
        return [];
    }
    const out = [];
    for (const name of names) {
        if (!name.endsWith('.json') || path.basename(name) !== name || name.startsWith('_')) {
            continue;
        }
        const raw = await readJsonFile(path.join(dir, name));
        if (isSeatLease(raw)) {
            out.push(raw);
        }
    }
    out.sort((a, b) => a.seat_id.localeCompare(b.seat_id));
    return out;
}
async function claimSeat(workspaceRoot, input, workspaceId = 'autoclaw') {
    const problems = validateSeatDefinition(input.definition);
    if (problems.length > 0) {
        return { ok: false, reason: 'invalid_definition', problems };
    }
    if (input.tier > input.definition.tier_ceiling) {
        return { ok: false, reason: 'tier_exceeds_ceiling', problems: ['requested tier exceeds definition tier_ceiling'] };
    }
    const now = input.now ?? Date.now();
    const since = new Date(now).toISOString();
    const lease = {
        seat_id: input.definition.seat_id,
        agent_id: input.agent_id,
        session_id: input.session_id,
        tier: input.tier,
        since,
        lease_expires: new Date(now + (input.ttlMs ?? exports.DEFAULT_SEAT_LEASE_TTL_MS)).toISOString(),
        ...(input.reason ? { reason: input.reason } : {}),
        ...(input.evidence_refs && input.evidence_refs.length ? { evidence_refs: input.evidence_refs } : {}),
    };
    const dir = seatsDir(workspaceRoot);
    const file = path.join(dir, seatFileName(lease.seat_id));
    await fsp.mkdir(dir, { recursive: true });
    let handle;
    try {
        handle = await fsp.open(file, 'wx');
    }
    catch (err) {
        if (err.code === 'EEXIST') {
            return { ok: false, reason: 'already_occupied', existing: await readSeatLease(workspaceRoot, lease.seat_id) };
        }
        throw err;
    }
    try {
        await handle.writeFile(JSON.stringify(lease, null, 2) + '\n', 'utf8');
    }
    finally {
        await handle.close();
    }
    return {
        ok: true,
        lease,
        file,
        event: seatLeaseEvent(lease, {
            transition: 'claimed',
            workspace_id: workspaceId,
            observed_at: since,
            grant_id: input.definition.grant.grant_id,
        }),
    };
}
async function renewSeatLease(workspaceRoot, seatId, occupant, opts = {}) {
    const file = path.join(seatsDir(workspaceRoot), seatFileName(seatId));
    const existingRaw = await readJsonFile(file);
    if (!existingRaw) {
        return { ok: false, reason: 'not_found' };
    }
    const problems = validateSeatLease(existingRaw);
    if (problems.length > 0) {
        return { ok: false, reason: 'invalid_lease', problems };
    }
    const existing = existingRaw;
    if (existing.agent_id !== occupant.agent_id || existing.session_id !== occupant.session_id) {
        return { ok: false, reason: 'not_occupant', existing };
    }
    const now = opts.now ?? Date.now();
    const occurred = new Date(now).toISOString();
    const lease = {
        ...existing,
        lease_expires: new Date(now + (opts.ttlMs ?? exports.DEFAULT_SEAT_LEASE_TTL_MS)).toISOString(),
        ...(opts.reason ? { reason: opts.reason } : {}),
    };
    await fsp.writeFile(file, JSON.stringify(lease, null, 2) + '\n', 'utf8');
    return {
        ok: true,
        lease,
        file,
        event: seatLeaseEvent(lease, {
            transition: 'lease_renewed',
            workspace_id: opts.workspaceId ?? 'autoclaw',
            observed_at: occurred,
            occurred_at: occurred,
            reason: opts.reason,
            grant_id: opts.grant_id,
        }),
    };
}
async function releaseSeatLease(workspaceRoot, seatId, occupant, opts = {}) {
    const file = path.join(seatsDir(workspaceRoot), seatFileName(seatId));
    const existingRaw = await readJsonFile(file);
    if (!existingRaw) {
        return { ok: false, reason: 'not_found' };
    }
    const problems = validateSeatLease(existingRaw);
    if (problems.length > 0) {
        return { ok: false, reason: 'invalid_lease', problems };
    }
    const existing = existingRaw;
    if (existing.agent_id !== occupant.agent_id || existing.session_id !== occupant.session_id) {
        return { ok: false, reason: 'not_occupant', existing };
    }
    await fsp.unlink(file);
    const occurred = new Date(opts.now ?? Date.now()).toISOString();
    return {
        ok: true,
        lease: existing,
        file,
        event: seatLeaseEvent(existing, {
            transition: 'released',
            workspace_id: opts.workspaceId ?? 'autoclaw',
            observed_at: occurred,
            occurred_at: occurred,
            reason: opts.reason,
            grant_id: opts.grant_id,
        }),
    };
}
//# sourceMappingURL=seats.js.map