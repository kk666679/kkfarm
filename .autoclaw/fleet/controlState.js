"use strict";
/**
 * controlState.ts - CP-4.3 canonical control command state projection.
 *
 * UI surfaces should render control state from canonical command/ack records,
 * not optimistic local state. This module is pure: callers provide parsed
 * comms/control commands and comms/control/acks records, then render or ingest
 * the returned projection.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildControlCommandStates = buildControlCommandStates;
exports.controlCommandStateEvent = controlCommandStateEvent;
const envelope_1 = require("../spine/envelope");
function parseMs(value) {
    if (!value) {
        return undefined;
    }
    const t = Date.parse(value);
    return Number.isFinite(t) ? t : undefined;
}
function isKnownAckResult(value) {
    return value === 'applied' || value === 'rejected' || value === 'noop';
}
function compareStampThenId(a, b) {
    const at = parseMs(a.timestamp) ?? 0;
    const bt = parseMs(b.timestamp) ?? 0;
    return at - bt || a.id.localeCompare(b.id);
}
function latestAckByCommand(acks) {
    const grouped = new Map();
    for (const ack of acks) {
        if (!ack.ack_of) {
            continue;
        }
        const list = grouped.get(ack.ack_of) ?? [];
        list.push(ack);
        grouped.set(ack.ack_of, list);
    }
    const out = new Map();
    for (const [ackOf, list] of grouped) {
        list.sort(compareStampThenId);
        out.set(ackOf, list[list.length - 1]);
    }
    return out;
}
function stateFromAck(result) {
    if (result === 'applied' || result === 'rejected' || result === 'noop') {
        return result;
    }
    return 'pending';
}
function actorFromState(state) {
    const from = state.from.toLowerCase();
    if (from === 'human') {
        return { kind: 'human' };
    }
    if (from === 'control') {
        return { kind: 'system' };
    }
    return { kind: 'agent', agent_id: state.from, session_id: state.session_id };
}
function taskCorrelation(target) {
    if (!target || typeof target !== 'object') {
        return {};
    }
    const taskId = target.task_id;
    return typeof taskId === 'string' && taskId.trim() ? { task_id: taskId.trim() } : {};
}
function buildControlCommandStates(commands, acks, opts = {}) {
    const now = opts.now ?? Date.now();
    const ackByCommand = latestAckByCommand(acks);
    const states = commands
        .filter(command => typeof command.id === 'string' && command.id.trim().length > 0)
        .map((command) => {
        const id = command.id.trim();
        const ack = ackByCommand.get(id);
        const commandMs = parseMs(command.timestamp) ?? now;
        const expiresMs = parseMs(command.expires_at);
        const ackResult = ack && isKnownAckResult(ack.result) ? ack.result : undefined;
        const status = ackResult
            ? stateFromAck(ackResult)
            : expiresMs !== undefined && expiresMs <= now
                ? 'expired'
                : 'pending';
        const detail = ack?.detail
            ?? (status === 'expired'
                ? `control command expired at ${command.expires_at}`
                : 'awaiting ack');
        return {
            command_id: id,
            command_type: command.type,
            status,
            canonical_source: 'command_file',
            from: command.from,
            session_id: command.session_id,
            timestamp: command.timestamp,
            age_ms: Math.max(0, now - commandMs),
            expires_at: command.expires_at,
            target: command.target,
            reason: command.reason,
            capability_grant_id: command.capability_grant_id,
            ...(ack ? { ack } : {}),
            detail,
        };
    });
    states.sort((a, b) => {
        const at = parseMs(a.timestamp) ?? 0;
        const bt = parseMs(b.timestamp) ?? 0;
        return at - bt || a.command_id.localeCompare(b.command_id);
    });
    return states;
}
function controlCommandStateEvent(state, opts) {
    const acked = Boolean(state.ack);
    const eventId = acked
        ? (0, envelope_1.controlAckEventId)(state.command_id)
        : (0, envelope_1.controlCommandEventId)(state.command_id);
    const occurred = state.ack?.timestamp ?? state.timestamp;
    return {
        schema: envelope_1.SPINE_SCHEMA,
        event_id: eventId,
        family: 'control',
        type: `control.${state.status}`,
        occurred_at: occurred,
        observed_at: opts.observed_at,
        workspace_id: opts.workspace_id,
        producer: opts.producer ?? 'control-state',
        actor: actorFromState(state),
        correlation: taskCorrelation(state.target),
        payload: {
            command_id: state.command_id,
            command_type: state.command_type,
            status: state.status,
            detail: state.detail,
            target: state.target,
            reason: state.reason,
            ack_id: state.ack?.id,
            ack_of: state.ack?.ack_of,
        },
        ...(state.capability_grant_id ? { capability_grant_id: state.capability_grant_id } : {}),
        redaction_class: 'workspace',
    };
}
//# sourceMappingURL=controlState.js.map