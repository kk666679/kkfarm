"use strict";
/**
 * seatSuccession.ts - CP-5.5 seat succession over roleElection.
 *
 * {@link buildSeatSuccessionPlan} is the pure bridge between durable seats and
 * the existing SA-2 role election scorer: it never claims seats or deletes
 * leases. {@link applySeatSuccessionSuggestion} is the thin IO step that turns
 * one accepted suggestion into a real claim via `seats.ts`' create-exclusive
 * `claimSeat` — still no scheduling policy here (deciding *when* to apply a
 * suggestion, e.g. after sleep/resume grace, and feeding a live fleet roster,
 * stays host/loop wiring, deferred).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSeatSuccessionPlan = buildSeatSuccessionPlan;
exports.pickSeatSuccessionSuggestion = pickSeatSuccessionSuggestion;
exports.applySeatSuccessionSuggestion = applySeatSuccessionSuggestion;
const roleElection_1 = require("./roleElection");
const seats_1 = require("./seats");
function sortBySeat(items) {
    return [...items].sort((a, b) => a.seat_id.localeCompare(b.seat_id));
}
function unique(values) {
    const seen = new Set();
    const out = [];
    for (const value of values) {
        const trimmed = value.trim();
        if (!trimmed) {
            continue;
        }
        const key = trimmed.toLowerCase();
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        out.push(trimmed);
    }
    return out;
}
function requiredCapabilities(def) {
    return unique([def.agent_type, ...def.grant.verbs]);
}
function seatLane(seatId) {
    return `seat:${seatId}`;
}
function parseIsoMs(value) {
    const t = Date.parse(value);
    return Number.isFinite(t) ? t : Number.NEGATIVE_INFINITY;
}
function buildSummary(needs, suggestions, blocked, unfilled) {
    const text = `seat succession: ${suggestions.length}/${needs.length} suggested, ${unfilled.length} unfilled, ${blocked.length} blocked`;
    return {
        needs: needs.length,
        suggestions: suggestions.length,
        blocked: blocked.length,
        unfilled: unfilled.length,
        text,
    };
}
function asNeedsVector(needs) {
    const open_lanes = needs.map(n => ({
        lane: n.lane,
        role: n.seat_id,
        required_capabilities: n.required_capabilities,
        unclaimed: 1,
    }));
    return {
        open_lanes,
        role_coverage_gap: [],
        staleness_pressure: [],
        unclaimed_findings: 0,
        summary: needs.length ? `seat succession needs ${needs.map(n => n.seat_id).join(', ')}` : '',
    };
}
function buildSeatSuccessionPlan(definitions, leases, candidates, opts = {}) {
    const now = opts.now ?? Date.now();
    const expiredLeaseGraceMs = opts.expiredLeaseGraceMs ?? 0;
    const sleepResumeGraceUntilMs = opts.sleepResumeGraceUntilMs;
    const leaseBySeat = new Map(sortBySeat(leases).map(lease => [lease.seat_id, lease]));
    const needs = [];
    const blocked = [];
    for (const def of sortBySeat(definitions)) {
        if ((0, seats_1.isGrantExpired)(def.grant, now)) {
            blocked.push({
                seat_id: def.seat_id,
                reason: 'grant_expired',
                grant_expires: def.grant.expires,
            });
            continue;
        }
        const lease = leaseBySeat.get(def.seat_id);
        if (!lease) {
            needs.push({
                seat_id: def.seat_id,
                reason: 'vacant',
                lane: seatLane(def.seat_id),
                required_capabilities: requiredCapabilities(def),
                tier_ceiling: def.tier_ceiling,
            });
            continue;
        }
        const problems = (0, seats_1.validateSeatLease)(lease, def);
        if (problems.length > 0) {
            needs.push({
                seat_id: def.seat_id,
                reason: 'invalid_lease',
                lane: seatLane(def.seat_id),
                required_capabilities: requiredCapabilities(def),
                tier_ceiling: def.tier_ceiling,
                lease_agent_id: lease.agent_id,
                lease_session_id: lease.session_id,
                lease_expires: lease.lease_expires,
                problems,
            });
            continue;
        }
        const expiresMs = parseIsoMs(lease.lease_expires);
        if (expiresMs > now) {
            continue;
        }
        if (sleepResumeGraceUntilMs !== undefined && now < sleepResumeGraceUntilMs) {
            blocked.push({
                seat_id: def.seat_id,
                reason: 'sleep_resume_grace',
                until: new Date(sleepResumeGraceUntilMs).toISOString(),
                lease_expires: lease.lease_expires,
            });
            continue;
        }
        if (expiresMs + expiredLeaseGraceMs > now) {
            blocked.push({
                seat_id: def.seat_id,
                reason: 'lease_expiry_grace',
                until: new Date(expiresMs + expiredLeaseGraceMs).toISOString(),
                lease_expires: lease.lease_expires,
            });
            continue;
        }
        needs.push({
            seat_id: def.seat_id,
            reason: 'expired',
            lane: seatLane(def.seat_id),
            required_capabilities: requiredCapabilities(def),
            tier_ceiling: def.tier_ceiling,
            lease_agent_id: lease.agent_id,
            lease_session_id: lease.session_id,
            lease_expires: lease.lease_expires,
        });
    }
    const needBySeat = new Map(needs.map(need => [need.seat_id.toLowerCase(), need]));
    const sortedCandidates = [...candidates].sort((a, b) => a.agent_id.localeCompare(b.agent_id));
    const assignments = (0, roleElection_1.distributeRoles)(asNeedsVector(needs), sortedCandidates);
    const suggestions = assignments
        .map((assignment) => {
        const need = needBySeat.get(assignment.role.toLowerCase());
        if (!need) {
            return null;
        }
        return {
            seat_id: need.seat_id,
            agent_id: assignment.agent_id,
            lane: need.lane,
            score: assignment.score,
            reason: need.reason,
            tier: need.tier_ceiling,
            required_capabilities: need.required_capabilities,
        };
    })
        .filter((s) => s !== null)
        .sort((a, b) => a.seat_id.localeCompare(b.seat_id) || a.agent_id.localeCompare(b.agent_id));
    const filled = new Set(suggestions.map(s => s.seat_id.toLowerCase()));
    const unfilled = needs.filter(n => !filled.has(n.seat_id.toLowerCase()));
    return {
        generated_at: new Date(now).toISOString(),
        needs,
        suggestions,
        blocked: blocked.sort((a, b) => a.seat_id.localeCompare(b.seat_id)),
        unfilled,
        summary: buildSummary(needs, suggestions, blocked, unfilled),
    };
}
// ---------------------------------------------------------------------------
// CP-5.5 remaining: apply a suggestion via seats.ts claimSeat
// ---------------------------------------------------------------------------
/**
 * Look up the suggestion for one seat out of a full {@link SeatSuccessionPlan}.
 * Pure convenience for host wiring that iterates the plan one seat at a time.
 */
function pickSeatSuccessionSuggestion(plan, seatId) {
    const key = seatId.toLowerCase();
    return plan.suggestions.find(s => s.seat_id.toLowerCase() === key) ?? null;
}
/**
 * Apply one {@link SeatSuccessionSuggestion} by claiming the seat through the
 * existing create-exclusive {@link claimSeat} lease writer. Pure/IO-thin: the
 * only side effect is the same lease-file write `claimSeat` already performs.
 * Loop/scheduling wiring (deciding *when* to call this after sleep/resume grace,
 * feeding real fleet agent cards) stays the host's job — this only performs one
 * suggestion → one claim attempt and reports the typed outcome.
 *
 * Returns a typed conflict (never throws for an expected disagreement):
 * - `no_suggestion` — no candidate was suggested for this seat (e.g. `distributeRoles`
 *   found no positive-scoring agent).
 * - `unknown_agent` — the suggestion names an agent absent from `candidates` (stale
 *   input; the host should re-run {@link buildSeatSuccessionPlan} with a fresh roster).
 * - `definition_not_found` — the seat is not (or no longer) declared in `definitions`.
 * - `invalid_definition` / `tier_exceeds_ceiling` / `already_occupied` — forwarded
 *   verbatim from {@link claimSeat} (e.g. a peer won the create-exclusive race first).
 */
async function applySeatSuccessionSuggestion(workspaceRoot, suggestion, definitions, candidates, opts) {
    if (!suggestion) {
        return { ok: false, seat_id: '(none)', reason: 'no_suggestion' };
    }
    const definition = definitions.find(d => d.seat_id === suggestion.seat_id);
    if (!definition) {
        return { ok: false, seat_id: suggestion.seat_id, reason: 'definition_not_found' };
    }
    const candidate = candidates.find(c => c.agent_id === suggestion.agent_id);
    if (!candidate) {
        return { ok: false, seat_id: suggestion.seat_id, reason: 'unknown_agent' };
    }
    // Never let a stale/optimistic suggestion request more than the definition allows.
    const tier = Math.min(suggestion.tier, definition.tier_ceiling);
    const claim = await (0, seats_1.claimSeat)(workspaceRoot, {
        definition,
        agent_id: suggestion.agent_id,
        session_id: opts.sessionId,
        tier,
        ttlMs: opts.ttlMs,
        now: opts.now,
        reason: opts.reason ?? `seat succession (${suggestion.reason}): elected via roleElection score ${suggestion.score.toFixed(3)}`,
    }, opts.workspaceId ?? 'autoclaw');
    if (!claim.ok) {
        return {
            ok: false,
            seat_id: suggestion.seat_id,
            reason: claim.reason,
            problems: claim.problems,
            ...(claim.reason === 'already_occupied' ? { existing: claim.existing } : {}),
        };
    }
    return {
        ok: true,
        seat_id: suggestion.seat_id,
        agent_id: suggestion.agent_id,
        lease: claim.lease,
        file: claim.file,
        event: claim.event,
    };
}
//# sourceMappingURL=seatSuccession.js.map