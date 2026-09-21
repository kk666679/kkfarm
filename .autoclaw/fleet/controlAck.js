"use strict";
/**
 * controlAck.ts - CP-4.1 host-neutral control ack preflight.
 *
 * This pure module is the shared safety gate that extension and autoclawd
 * wiring can call before any control verb mutates canonical files. It does not
 * execute verbs or write ack files; callers persist the returned rejected ack
 * and governance event, or continue to verb execution for an accepted command.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONTROL_COMMAND_VERBS = void 0;
exports.resolveCanonicalControlCommand = resolveCanonicalControlCommand;
exports.isRemoteControlOrigin = isRemoteControlOrigin;
exports.evaluateControlAck = evaluateControlAck;
const envelope_1 = require("../spine/envelope");
const seats_1 = require("./seats");
const sign_1 = require("../spine/sign");
exports.CONTROL_COMMAND_VERBS = [
    'nudge',
    'pause',
    'resume',
    'reassign',
    'handoff_request',
    'evict',
    'review_decision',
];
const DEFAULT_RESERVED_ACTORS = ['human', 'control'];
function asRecord(value) {
    return value && typeof value === 'object' ? value : null;
}
function asString(value) {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}
function isControlVerb(value) {
    return exports.CONTROL_COMMAND_VERBS.includes(value);
}
function isIsoLike(value) {
    return Number.isFinite(Date.parse(value));
}
function normalizeCommand(command) {
    return {
        ...command,
        id: (command.id ?? '').trim(),
        from: (command.from ?? '').trim(),
        type: (command.type ?? '').trim(),
        session_id: (command.session_id ?? '').trim(),
        timestamp: (command.timestamp ?? '').trim(),
        capability_grant_id: command.capability_grant_id?.trim(),
        expires_at: command.expires_at?.trim(),
    };
}
function commandFromSpineEvent(event) {
    const payload = asRecord(event.payload);
    const type = event.type.startsWith('control.') ? event.type.slice('control.'.length) : undefined;
    const idFromPayload = payload ? asString(payload.id) : undefined;
    const idFromEvent = event.event_id.startsWith('ctl:') ? event.event_id.slice('ctl:'.length) : event.event_id;
    const from = payload ? asString(payload.from) : undefined;
    const sessionId = payload ? asString(payload.session_id) : undefined;
    const target = payload?.target;
    const reason = payload ? asString(payload.reason) : undefined;
    const requiresAck = typeof payload?.requires_ack === 'boolean' ? payload.requires_ack : undefined;
    // CP-6.1: carry origin + signature fields through the projection so a
    // relayed command cannot dodge the signature gate by arriving as a spine
    // row. (A reconstructed envelope will not re-verify a whole-envelope
    // signature — remote commands must arrive as canonical files — so this
    // keeps the gate FIRING, which fails closed.)
    const origin = payload ? asString(payload.origin) : undefined;
    return normalizeCommand({
        id: idFromPayload ?? idFromEvent,
        from: from ?? event.actor.agent_id ?? event.actor.kind,
        type: type ?? '',
        session_id: sessionId ?? event.actor.session_id ?? '',
        timestamp: event.occurred_at,
        target,
        reason,
        requires_ack: requiresAck,
        capability_grant_id: event.capability_grant_id,
        expires_at: event.expires_at,
        payload: event.payload,
        origin,
        workspace_id: event.workspace_id,
        key_id: event.key_id,
        alg: event.alg,
        signature: event.signature,
    });
}
function resolveCanonicalControlCommand(input) {
    if (input.commandFile) {
        return { ok: true, source: 'file', command: normalizeCommand(input.commandFile) };
    }
    if (!input.spineEvent) {
        return {
            ok: false,
            failed_check: 'invalid_command',
            detail: 'no canonical control file or spine projection provided',
        };
    }
    const problems = (0, envelope_1.validateSpineEvent)(input.spineEvent);
    if (problems.length > 0 || input.spineEvent.family !== 'control' || !input.spineEvent.type.startsWith('control.')) {
        return {
            ok: false,
            source: 'spine',
            failed_check: 'invalid_spine_event',
            detail: problems.concat(input.spineEvent.family !== 'control' ? ['family must be control'] : [], !input.spineEvent.type.startsWith('control.') ? ['type must start with control.'] : []).join('; '),
            command: commandFromSpineEvent(input.spineEvent) ?? undefined,
        };
    }
    const command = commandFromSpineEvent(input.spineEvent);
    if (!command) {
        return {
            ok: false,
            source: 'spine',
            failed_check: 'invalid_command',
            detail: 'spine projection did not contain a command envelope',
        };
    }
    if (!input.spineFileRefResolves) {
        return {
            ok: false,
            source: 'spine',
            failed_check: 'missing_canonical_file',
            detail: 'spine projection ignored because the canonical control file ref does not resolve',
            command,
        };
    }
    return { ok: true, source: 'spine', command };
}
function grantSourcesFromInput(input) {
    const fromSeats = (input.seatDefinitions ?? []).map((definition) => ({
        grant: definition.grant,
        seat_id: definition.seat_id,
        requires_occupant: true,
        kind: 'seat',
    }));
    return [...fromSeats, ...(input.grants ?? [])];
}
function actorFromCommand(command) {
    const from = command.from.toLowerCase();
    if (from === 'human') {
        return { kind: 'human' };
    }
    if (from === 'control') {
        return { kind: 'system' };
    }
    return { kind: 'agent', agent_id: command.from, session_id: command.session_id };
}
function targetKeys(command) {
    const out = new Set();
    out.add(`command:${command.type}`);
    const target = command.target;
    if (typeof target === 'string' && target.trim()) {
        const trimmed = target.trim();
        out.add(trimmed);
        out.add(`target:${trimmed}`);
        return [...out];
    }
    const rec = asRecord(target);
    const taskId = asString(rec?.task_id);
    const agentId = asString(rec?.agent_id);
    const seatId = asString(rec?.seat_id);
    const scope = asString(rec?.scope);
    if (taskId) {
        out.add(`task:${taskId}`);
    }
    if (agentId) {
        out.add(`agent:${agentId}`);
    }
    if (seatId) {
        out.add(`seat:${seatId}`);
    }
    if (scope) {
        out.add(scope);
    }
    return [...out];
}
function scopeAllows(grant, command) {
    if (!grant.scope || grant.scope.length === 0) {
        return true;
    }
    if (grant.scope.includes('*')) {
        return true;
    }
    const keys = new Set(targetKeys(command));
    return grant.scope.some(scope => keys.has(scope));
}
function findLeaseForSeat(leases, seatId) {
    return leases.find(lease => lease.seat_id === seatId);
}
function commandCorrelation(command) {
    const target = asRecord(command.target);
    const taskId = asString(target?.task_id);
    return taskId ? { task_id: taskId } : {};
}
function rejectedAck(command, failedCheck, detail, now) {
    return {
        id: `ack-${command.id || 'unknown'}`,
        ack_of: command.id || 'unknown',
        from: 'control-ack',
        result: 'rejected',
        detail,
        timestamp: new Date(now).toISOString(),
        failed_check: failedCheck,
    };
}
function governanceRejectedEvent(command, ack, failedCheck, source, input) {
    return {
        schema: envelope_1.SPINE_SCHEMA,
        event_id: `governance:${(0, envelope_1.controlAckEventId)(command.id || 'unknown')}`,
        family: 'governance',
        type: 'governance.control.rejected',
        occurred_at: ack.timestamp,
        observed_at: ack.timestamp,
        workspace_id: input.workspaceId ?? 'autoclaw',
        producer: input.producer ?? 'control-ack',
        actor: actorFromCommand(command),
        correlation: commandCorrelation(command),
        payload: {
            command_id: command.id || 'unknown',
            command_type: command.type || 'unknown',
            ack_id: ack.id,
            result: 'rejected',
            failed_check: failedCheck,
            detail: ack.detail,
            canonical_source: source ?? 'none',
            capability_grant_id: command.capability_grant_id,
            target: command.target,
        },
        ...(command.capability_grant_id ? { capability_grant_id: command.capability_grant_id } : {}),
        redaction_class: 'workspace',
    };
}
function reject(command, failedCheck, detail, source, input) {
    const now = input.now ?? Date.now();
    const normalized = normalizeCommand(command);
    const ack = rejectedAck(normalized, failedCheck, detail, now);
    return {
        ok: false,
        source,
        command: normalized,
        failed_check: failedCheck,
        detail,
        ack,
        governance_event: governanceRejectedEvent(normalized, ack, failedCheck, source, input),
    };
}
function rejectResolution(resolution, input) {
    const command = resolution.command ?? normalizeCommand({
        id: 'unknown',
        from: 'control',
        type: 'unknown',
        session_id: '',
        timestamp: new Date(input.now ?? Date.now()).toISOString(),
    });
    return reject(command, resolution.failed_check, resolution.detail, resolution.source, input);
}
function validateCommandShape(command) {
    if (!command.id) {
        return 'command id required';
    }
    if (!command.from) {
        return 'command from required';
    }
    if (!command.session_id) {
        return 'command session_id required';
    }
    if (!command.type || !isControlVerb(command.type)) {
        return `unsupported control verb '${command.type || '(missing)'}'`;
    }
    if (!command.timestamp || !isIsoLike(command.timestamp)) {
        return 'command timestamp must be ISO-like';
    }
    return null;
}
function isReservedActor(command, reservedActors) {
    return reservedActors.map(a => a.toLowerCase()).includes(command.from.toLowerCase());
}
const LOCAL_CONTROL_ORIGINS = new Set(['', 'local', 'loopback']);
/**
 * CP-6.1: is this envelope's origin cross-machine? Absent/'local'/'loopback'
 * are the only unsigned-OK origins; every OTHER value is treated as remote,
 * so an unknown origin string fails closed into the signature gate.
 */
function isRemoteControlOrigin(origin) {
    if (origin === undefined || origin === null) {
        return false;
    }
    return !LOCAL_CONTROL_ORIGINS.has(String(origin).trim().toLowerCase());
}
function evaluateControlAck(input) {
    const resolution = resolveCanonicalControlCommand(input);
    if (!resolution.ok) {
        return rejectResolution(resolution, input);
    }
    const command = normalizeCommand(resolution.command);
    const now = input.now ?? Date.now();
    // CP-6.1 signature gate — BEFORE any shape/grant/verb check. A relayed or
    // cross-machine command must carry a valid whole-envelope Ed25519 signature
    // from a trusted key; unsigned is acceptable only for a command written by a
    // process on this machine (the human at the machine). FAIL-CLOSED: remote
    // with no verifier configured is rejected, and verifyEnvelope only accepts
    // asymmetric Ed25519 — an HMAC/SVID/Biscuit mock token can never satisfy it.
    const remote = input.transportRemote === true || isRemoteControlOrigin(command.origin);
    if (remote) {
        if (!input.signature) {
            return reject(command, 'signature_required', 'remote control command rejected fail-closed: no trusted-key verifier configured', resolution.source, input);
        }
        // Verify the RAW canonical file when present — the signature covers the
        // envelope exactly as signed; normalization must not affect the check.
        const carrier = (input.commandFile ?? command);
        const verdict = (0, sign_1.verifyEnvelope)(carrier, input.signature, new Date(now));
        if (!verdict.ok) {
            return reject(command, 'signature_invalid', `remote control command failed signature verification: ${verdict.reason}`, resolution.source, input);
        }
    }
    const shapeProblem = validateCommandShape(command);
    if (shapeProblem) {
        return reject(command, 'invalid_command', shapeProblem, resolution.source, input);
    }
    if (command.expires_at && Date.parse(command.expires_at) <= now) {
        return reject(command, 'command_expired', `control command expired at ${command.expires_at}`, resolution.source, input);
    }
    const grantId = command.capability_grant_id;
    if (!grantId) {
        return reject(command, 'missing_capability_grant_id', 'control command missing capability_grant_id', resolution.source, input);
    }
    const grants = grantSourcesFromInput(input);
    const grantSource = grants.find(source => source.grant.grant_id === grantId);
    if (!grantSource) {
        return reject(command, 'grant_not_found', `capability grant '${grantId}' was not found`, resolution.source, input);
    }
    if ((0, seats_1.isGrantExpired)(grantSource.grant, now)) {
        return reject(command, 'grant_expired', `capability grant '${grantId}' expired at ${grantSource.grant.expires}`, resolution.source, input);
    }
    if (!grantSource.grant.verbs.includes(command.type)) {
        return reject(command, 'verb_not_granted', `grant '${grantId}' does not allow '${command.type}'`, resolution.source, input);
    }
    if (!scopeAllows(grantSource.grant, command)) {
        return reject(command, 'scope_not_granted', `target is outside grant '${grantId}' scope`, resolution.source, input);
    }
    const reservedActors = input.reservedActors ?? DEFAULT_RESERVED_ACTORS;
    if (grantSource.requires_occupant !== false && grantSource.seat_id && !isReservedActor(command, reservedActors)) {
        const lease = findLeaseForSeat(input.seatLeases ?? [], grantSource.seat_id);
        if (!lease) {
            return reject(command, 'no_active_seat_lease', `seat '${grantSource.seat_id}' has no active lease`, resolution.source, input);
        }
        const leaseProblems = (0, seats_1.validateSeatLease)(lease);
        if (leaseProblems.length > 0 || (0, seats_1.isSeatLeaseExpired)(lease, now)) {
            return reject(command, 'seat_lease_expired', `seat '${grantSource.seat_id}' lease is invalid or expired`, resolution.source, input);
        }
        if (lease.agent_id !== command.from || lease.session_id !== command.session_id) {
            return reject(command, 'occupant_mismatch', `command actor does not match seat '${grantSource.seat_id}' occupant`, resolution.source, input);
        }
    }
    const budget = grantSource.grant.budget_cents_per_day;
    if (budget !== undefined) {
        const spent = Math.max(0, input.costTodayCentsByGrantId?.[grantId] ?? 0);
        const cost = Math.max(0, input.commandCostCents ?? 0);
        if (spent + cost > budget) {
            return reject(command, 'budget_exceeded', `grant '${grantId}' budget exceeded (${spent + cost} > ${budget} cents)`, resolution.source, input);
        }
    }
    return {
        ok: true,
        source: resolution.source,
        command,
        grant: grantSource,
        detail: `control command '${command.id}' accepted by CP-4.1 preflight`,
    };
}
//# sourceMappingURL=controlAck.js.map