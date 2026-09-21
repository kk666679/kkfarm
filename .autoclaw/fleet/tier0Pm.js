"use strict";
/**
 * tier0Pm.ts - CP-5.3 Tier 0 PM narration core.
 *
 * This is the pure layer between the CP-1.8 spine read surface and future
 * panel/web/fleet.brief renderers. It consumes an already-read batch of
 * SpineEvents and emits narration, attention items, and risk notes. No direct
 * spine db handle, no vscode, no daemon/web dependency.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTier0PmBrief = buildTier0PmBrief;
function payloadRecord(event) {
    return event.payload && typeof event.payload === 'object'
        ? event.payload
        : {};
}
function str(value) {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}
function strings(value) {
    return Array.isArray(value) ? value.filter((v) => typeof v === 'string' && v.trim().length > 0) : [];
}
function taskId(event) {
    return event.correlation.task_id ?? str(payloadRecord(event).task_id);
}
function actorAgent(event) {
    return event.actor.agent_id ?? str(payloadRecord(event).agent_id);
}
function eventTime(a, b) {
    const at = Date.parse(a.occurred_at);
    const bt = Date.parse(b.occurred_at);
    if (Number.isFinite(at) && Number.isFinite(bt) && at !== bt) {
        return at - bt;
    }
    return a.event_id.localeCompare(b.event_id);
}
function item(kind, event, severity, title, detail) {
    return {
        id: `${kind}:${event.event_id}`,
        severity,
        title,
        detail,
        event_id: event.event_id,
        ...(taskId(event) ? { task_id: taskId(event) } : {}),
        ...(actorAgent(event) ? { agent_id: actorAgent(event) } : {}),
    };
}
function verdict(event) {
    const p = payloadRecord(event);
    return str(p.verdict) ?? str(p.status) ?? str(p.result);
}
function messageKind(event) {
    const p = payloadRecord(event);
    return str(p.kind) ?? str(p.type) ?? str(p.message_type);
}
function compactCounts(events) {
    const byFamily = new Map();
    for (const event of events) {
        byFamily.set(event.family, (byFamily.get(event.family) ?? 0) + 1);
    }
    return [...byFamily.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([family, count]) => `${family} ${count}`)
        .join(', ');
}
function isBadVerdict(v) {
    return !!v && /^(blocked|rejected|failed|failure|needs_attention)$/i.test(v);
}
function isReviewKind(kind) {
    return !!kind && /review/.test(kind.toLowerCase());
}
function buildTier0PmBrief(events, opts = {}) {
    const now = opts.now ?? Date.now();
    const maxItems = Math.max(1, Math.floor(opts.maxItems ?? 8));
    const sorted = [...events].sort(eventTime);
    const attention = [];
    const risks = [];
    for (const event of sorted) {
        const p = payloadRecord(event);
        const tid = taskId(event);
        const v = verdict(event);
        const kind = messageKind(event);
        if (event.type === 'coordination.consensus.resolved' && isBadVerdict(v)) {
            attention.push(item('attention', event, 'action', `Review outcome needs attention${tid ? `: ${tid}` : ''}`, `Consensus resolved as ${v}.`));
        }
        if (event.type === 'coordination.message.expired') {
            risks.push(item('risk', event, 'warning', `Message expired${tid ? `: ${tid}` : ''}`, 'A coordination message expired before processing.'));
        }
        if (event.type === 'coordination.message.received' && isReviewKind(kind)) {
            attention.push(item('attention', event, 'action', `Review waiting${tid ? `: ${tid}` : ''}`, `Review message received${actorAgent(event) ? ` from ${actorAgent(event)}` : ''}.`));
        }
        const handoffRisks = strings(p.risks);
        if (event.type === 'coordination.handoff' && handoffRisks.length > 0) {
            risks.push(item('risk', event, 'warning', `Handoff carries risk${tid ? `: ${tid}` : ''}`, handoffRisks.slice(0, 3).join('; ')));
        }
        if (event.type === 'seat.evaluated' && p.passed === false) {
            risks.push(item('risk', event, 'warning', `Seat audition failed${str(p.fixture_id) ? `: ${str(p.fixture_id)}` : ''}`, str(p.reason) ?? `score ${typeof p.score === 'number' ? p.score : 'unknown'}`));
        }
        if (event.family === 'control' && isBadVerdict(v)) {
            attention.push(item('attention', event, 'action', `Control command ${v}`, str(p.reason) ?? 'A control command was rejected or failed.'));
        }
    }
    const narration = [];
    narration.push(sorted.length === 0
        ? 'No spine events in this Tier 0 PM window.'
        : `Read ${sorted.length} spine event(s): ${compactCounts(sorted)}.`);
    if (attention.length > 0) {
        narration.push(`${attention.length} item(s) need human or PM attention.`);
    }
    if (risks.length > 0) {
        narration.push(`${risks.length} risk note(s) surfaced from reviews, handoffs, control, or seat evaluations.`);
    }
    if (attention.length === 0 && risks.length === 0 && sorted.length > 0) {
        narration.push('No Tier 0 PM attention items detected in this spine window.');
    }
    const attention_queue = attention.slice(0, maxItems);
    const risk_notes = risks.slice(0, maxItems);
    return {
        generated_at: new Date(now).toISOString(),
        source_event_count: sorted.length,
        source_event_ids: sorted.map(e => e.event_id),
        narration,
        attention_queue,
        risk_notes,
        summary: `${attention_queue.length} attention, ${risk_notes.length} risks from ${sorted.length} spine event(s)`,
    };
}
//# sourceMappingURL=tier0Pm.js.map