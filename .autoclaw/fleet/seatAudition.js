"use strict";
/**
 * seatAudition.ts - CP-5.4 public, offline seat audition scorer.
 *
 * The public bar is deterministic and data-only: fixtures describe what a
 * shadow occupant must notice, and this scorer turns a candidate submission into
 * a recorded seat.evaluated event. Live model execution and certification
 * services can wrap this, but cannot replace the public baseline.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSeatAuditionFixture = validateSeatAuditionFixture;
exports.isSeatAuditionFixture = isSeatAuditionFixture;
exports.scoreSeatAudition = scoreSeatAudition;
exports.seatAuditionEvaluatedEvent = seatAuditionEvaluatedEvent;
const seats_1 = require("./seats");
function haystack(parts) {
    return parts.join('\n').toLowerCase();
}
function includesTerm(text, term) {
    return text.includes(term.toLowerCase());
}
function clamp01(n) {
    return Math.max(0, Math.min(1, n));
}
function round3(n) {
    return Math.round(n * 1000) / 1000;
}
function scoreBucket(bucket, terms, text, findings) {
    let hit = 0;
    for (const term of terms) {
        if (includesTerm(text, term)) {
            hit++;
        }
        else {
            findings.push({ kind: 'missing', bucket, term });
        }
    }
    return { hit, total: terms.length };
}
function weighted(hit, total, weight) {
    if (total === 0) {
        return weight;
    }
    return (hit / total) * weight;
}
function validateSeatAuditionFixture(fixture) {
    const problems = [];
    if (!fixture || typeof fixture !== 'object') {
        return ['fixture is not an object'];
    }
    const f = fixture;
    if (typeof f.fixture_id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.-]{0,96}$/.test(f.fixture_id)) {
        problems.push('fixture_id must be path-safe');
    }
    if (typeof f.seat_id !== 'string' || f.seat_id.trim().length === 0) {
        problems.push('seat_id required');
    }
    if (![0, 1, 2, 3].includes(f.tier)) {
        problems.push('tier must be 0|1|2|3');
    }
    if (typeof f.title !== 'string' || f.title.trim().length === 0) {
        problems.push('title required');
    }
    if (typeof f.prompt !== 'string' || f.prompt.trim().length === 0) {
        problems.push('prompt required');
    }
    if (typeof f.pass_score !== 'number' || f.pass_score < 0 || f.pass_score > 1) {
        problems.push('pass_score must be 0..1');
    }
    const expected = f.expected;
    if (!expected || typeof expected !== 'object') {
        problems.push('expected object required');
    }
    else {
        for (const key of ['narrative_terms', 'attention_terms', 'risk_terms']) {
            const list = expected[key];
            if (!Array.isArray(list) || list.some(v => typeof v !== 'string' || v.trim().length === 0)) {
                problems.push(`expected.${key} must be a string array`);
            }
        }
        if (expected.forbidden_terms !== undefined && (!Array.isArray(expected.forbidden_terms) || expected.forbidden_terms.some(v => typeof v !== 'string' || v.trim().length === 0))) {
            problems.push('expected.forbidden_terms must be a string array when present');
        }
    }
    return problems;
}
function isSeatAuditionFixture(fixture) {
    return validateSeatAuditionFixture(fixture).length === 0;
}
function scoreSeatAudition(fixture, submission) {
    const findings = [];
    const narrative = haystack([submission.narrative]);
    const attention = haystack(submission.attention_queue ?? []);
    const risks = haystack(submission.risk_notes ?? []);
    const allText = haystack([submission.narrative, ...(submission.attention_queue ?? []), ...(submission.risk_notes ?? [])]);
    const n = scoreBucket('narrative', fixture.expected.narrative_terms, narrative, findings);
    const a = scoreBucket('attention', fixture.expected.attention_terms, attention, findings);
    const r = scoreBucket('risk', fixture.expected.risk_terms, risks, findings);
    let raw = weighted(n.hit, n.total, 0.45) + weighted(a.hit, a.total, 0.30) + weighted(r.hit, r.total, 0.25);
    for (const term of fixture.expected.forbidden_terms ?? []) {
        if (includesTerm(allText, term)) {
            findings.push({ kind: 'forbidden', bucket: 'forbidden', term });
            raw -= 0.25;
        }
    }
    const score = round3(clamp01(raw));
    const passed = score >= fixture.pass_score && !findings.some(f => f.kind === 'forbidden');
    const missing = findings.filter(f => f.kind === 'missing').length;
    const forbidden = findings.filter(f => f.kind === 'forbidden').length;
    return {
        fixture_id: fixture.fixture_id,
        seat_id: fixture.seat_id,
        tier: fixture.tier,
        agent_id: submission.agent_id,
        session_id: submission.session_id,
        score,
        passed,
        findings,
        summary: `score ${score.toFixed(3)} (${passed ? 'pass' : 'fail'}; ${missing} missing, ${forbidden} forbidden)`,
    };
}
function seatAuditionEvaluatedEvent(lease, result, opts) {
    const evidence_refs = opts.evidence_refs ?? [{ kind: 'fixture', ref: result.fixture_id }];
    const ev = (0, seats_1.seatLeaseEvent)(lease, {
        transition: 'evaluated',
        workspace_id: opts.workspace_id,
        observed_at: opts.observed_at,
        occurred_at: opts.occurred_at ?? opts.observed_at,
        producer: opts.producer ?? 'seat-audition',
        reason: result.summary,
        evidence_refs,
    });
    return {
        ...ev,
        payload: {
            ...ev.payload,
            fixture_id: result.fixture_id,
            score: result.score,
            passed: result.passed,
            findings: result.findings,
        },
        evidence_refs,
    };
}
//# sourceMappingURL=seatAudition.js.map