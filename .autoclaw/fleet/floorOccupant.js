"use strict";
/**
 * floorOccupant.ts - CP-5.2 deterministic seat floor occupant.
 *
 * This module is deliberately pure: it does not delete lease files, write
 * messages, or query the spine. It classifies the current seat floor and emits
 * a stable plan that host wiring can apply (reap), route (remind), or display
 * (summarize).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_FLOOR_REAP_GRACE_MS = exports.DEFAULT_FLOOR_REMINDER_WINDOW_MS = void 0;
exports.buildFloorOccupantPlan = buildFloorOccupantPlan;
const seats_1 = require("./seats");
exports.DEFAULT_FLOOR_REMINDER_WINDOW_MS = 10 * 60 * 1000;
exports.DEFAULT_FLOOR_REAP_GRACE_MS = 0;
function sortBySeat(items) {
    return [...items].sort((a, b) => a.seat_id.localeCompare(b.seat_id));
}
function actionId(kind, seatId, stamp) {
    return `floor:${kind}:${seatId}${stamp ? `:${stamp}` : ''}`;
}
function count(statuses, state) {
    return statuses.filter(s => s.state === state).length;
}
function buildSummary(statuses, actions) {
    const totalDefined = statuses.filter(s => s.definition_present).length;
    const occupied = count(statuses, 'occupied');
    const expiring = count(statuses, 'expiring');
    const expired = count(statuses, 'expired');
    const vacant = count(statuses, 'vacant');
    const blocked = count(statuses, 'blocked');
    const orphaned = count(statuses, 'orphaned');
    const text = `seats: ${occupied} occupied, ${expiring} expiring, ${expired} expired, ${vacant} vacant, ${blocked} blocked, ${orphaned} orphaned; actions: ${actions.length}`;
    return {
        total_defined: totalDefined,
        occupied,
        expiring,
        expired,
        vacant,
        blocked,
        orphaned,
        actions: actions.length,
        text,
    };
}
function leaseExpiredWithGrace(lease, now, reapGraceMs) {
    const expires = Date.parse(lease.lease_expires);
    return !Number.isFinite(expires) || expires + reapGraceMs <= now;
}
/**
 * Build the deterministic floor-occupant plan for M5 seats.
 *
 * The plan is intentionally advisory: callers decide whether to execute the
 * `host` reap actions, deliver occupant/human reminders, and where to render the
 * summary.
 */
function buildFloorOccupantPlan(definitions, leases, opts = {}) {
    const now = opts.now ?? Date.now();
    const reminderWindowMs = opts.reminderWindowMs ?? exports.DEFAULT_FLOOR_REMINDER_WINDOW_MS;
    const reapGraceMs = opts.reapGraceMs ?? exports.DEFAULT_FLOOR_REAP_GRACE_MS;
    const definitionBySeat = new Map(sortBySeat(definitions).map(def => [def.seat_id, def]));
    const leaseBySeat = new Map(sortBySeat(leases).map(lease => [lease.seat_id, lease]));
    const statuses = [];
    const actions = [];
    for (const def of sortBySeat(definitions)) {
        const lease = leaseBySeat.get(def.seat_id);
        if ((0, seats_1.isGrantExpired)(def.grant, now)) {
            statuses.push({
                seat_id: def.seat_id,
                state: 'blocked',
                definition_present: true,
                problems: ['seat grant expired'],
            });
            actions.push({
                id: actionId('remind_grant_expired', def.seat_id, def.grant.expires),
                kind: 'remind_grant_expired',
                seat_id: def.seat_id,
                target: 'human',
                severity: 'action',
                reason: `seat ${def.seat_id} grant expired at ${def.grant.expires}`,
            });
            continue;
        }
        if (!lease) {
            statuses.push({ seat_id: def.seat_id, state: 'vacant', definition_present: true });
            actions.push({
                id: actionId('remind_vacant_seat', def.seat_id),
                kind: 'remind_vacant_seat',
                seat_id: def.seat_id,
                target: 'human',
                severity: 'warning',
                reason: `seat ${def.seat_id} is vacant`,
            });
            continue;
        }
        const problems = (0, seats_1.validateSeatLease)(lease, def);
        const expires = Date.parse(lease.lease_expires);
        const msUntilExpiry = Number.isFinite(expires) ? expires - now : undefined;
        const base = {
            seat_id: def.seat_id,
            agent_id: lease.agent_id,
            session_id: lease.session_id,
            tier: lease.tier,
            lease_expires: lease.lease_expires,
            ms_until_expiry: msUntilExpiry,
            definition_present: true,
            ...(problems.length ? { problems } : {}),
        };
        if (problems.length > 0 || leaseExpiredWithGrace(lease, now, reapGraceMs)) {
            statuses.push({ ...base, state: 'expired' });
            actions.push({
                id: actionId('reap_expired_lease', def.seat_id, lease.lease_expires),
                kind: 'reap_expired_lease',
                seat_id: def.seat_id,
                target: 'host',
                severity: 'action',
                agent_id: lease.agent_id,
                session_id: lease.session_id,
                lease_expires: lease.lease_expires,
                reason: problems.length > 0
                    ? `seat ${def.seat_id} lease is invalid: ${problems.join('; ')}`
                    : `seat ${def.seat_id} lease expired at ${lease.lease_expires}`,
            });
            continue;
        }
        if (msUntilExpiry !== undefined && msUntilExpiry <= reminderWindowMs) {
            statuses.push({ ...base, state: 'expiring' });
            actions.push({
                id: actionId('remind_expiring_lease', def.seat_id, lease.lease_expires),
                kind: 'remind_expiring_lease',
                seat_id: def.seat_id,
                target: 'occupant',
                severity: 'warning',
                agent_id: lease.agent_id,
                session_id: lease.session_id,
                lease_expires: lease.lease_expires,
                reason: `seat ${def.seat_id} lease expires at ${lease.lease_expires}`,
            });
            continue;
        }
        statuses.push({ ...base, state: 'occupied' });
    }
    for (const lease of sortBySeat(leases)) {
        if (definitionBySeat.has(lease.seat_id)) {
            continue;
        }
        statuses.push({
            seat_id: lease.seat_id,
            state: 'orphaned',
            agent_id: lease.agent_id,
            session_id: lease.session_id,
            tier: lease.tier,
            lease_expires: lease.lease_expires,
            ms_until_expiry: Date.parse(lease.lease_expires) - now,
            definition_present: false,
            problems: ['seat lease has no definition'],
        });
        actions.push({
            id: actionId('reap_orphaned_lease', lease.seat_id, lease.lease_expires),
            kind: 'reap_orphaned_lease',
            seat_id: lease.seat_id,
            target: 'host',
            severity: 'action',
            agent_id: lease.agent_id,
            session_id: lease.session_id,
            lease_expires: lease.lease_expires,
            reason: `seat ${lease.seat_id} lease has no definition`,
        });
    }
    statuses.sort((a, b) => a.seat_id.localeCompare(b.seat_id));
    actions.sort((a, b) => a.id.localeCompare(b.id));
    return {
        generated_at: new Date(now).toISOString(),
        statuses,
        actions,
        summary: buildSummary(statuses, actions),
    };
}
//# sourceMappingURL=floorOccupant.js.map