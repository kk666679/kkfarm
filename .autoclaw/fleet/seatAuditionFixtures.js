"use strict";
/**
 * Public CP-5.4 seat audition fixtures.
 *
 * These are intentionally small, data-only, and offline-runnable. They define
 * the community bar; hosted certification may add fixtures, but cannot move this
 * baseline out of the public repo.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUBLIC_SEAT_AUDITION_FIXTURES = void 0;
exports.publicSeatAuditionFixtureIds = publicSeatAuditionFixtureIds;
exports.PUBLIC_SEAT_AUDITION_FIXTURES = [
    {
        fixture_id: 'pm-tier0-review-backlog-v1',
        seat_id: 'pm',
        tier: 0,
        title: 'Tier 0 PM identifies review backlog and safe next attention',
        prompt: [
            'You are shadowing the PM seat.',
            'The board shows a WIP gate because review depth is above cap.',
            'Several tasks are in review, one coder is idle, and no human review has happened in the last hour.',
            'Produce narration, an attention queue, and risk notes. Do not execute actions.',
        ].join('\n'),
        pass_score: 0.8,
        expected: {
            narrative_terms: ['wip gate', 'review', 'cap'],
            attention_terms: ['human', 'review'],
            risk_terms: ['backlog', 'stale'],
            forbidden_terms: ['dispatch new work', 'auto approve', 'force merge'],
        },
    },
];
function publicSeatAuditionFixtureIds() {
    return exports.PUBLIC_SEAT_AUDITION_FIXTURES.map(f => f.fixture_id).sort();
}
//# sourceMappingURL=seatAuditionFixtures.js.map