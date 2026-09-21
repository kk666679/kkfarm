"use strict";
/**
 * recall.ts — recall hooks + standing roster + graceful dismiss (HR-4).
 *
 * Closes the org loop: instead of only waiting for a worker to join, the
 * orchestrator/HR can CALL workers in to fill an establishment ("this project
 * always wants 1 reviewer + 2 coders"). For each vacancy it prefers an
 * available pooled worker (ranked by earned reputation, HR-3) and otherwise
 * hires fresh from the best-fit template (HR-2). Dismiss is the graceful
 * inverse — mark a worker retired but keep its résumé for the record.
 *
 * Pure planning core (vacancies / recallPlan / recallMessage / surplus) + thin
 * fs helpers (planRecallFromDisk / dismiss). No vscode; `now` injectable.
 *
 * See docs/ideas/FLEET-FEDERATION-SELF-HEALING.md §9.5.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.vacancies = vacancies;
exports.surplus = surplus;
exports.recallPlan = recallPlan;
exports.recallMessage = recallMessage;
exports.planRecallFromDisk = planRecallFromDisk;
exports.dismiss = dismiss;
const workforce_1 = require("./workforce");
const templates_1 = require("./templates");
const performance_1 = require("./performance");
/**
 * Pure: the vacancies given the roster and the current live count per role.
 * `liveByRole` is normalized case-insensitively. Roles wanted but over-/fully
 * staffed produce no vacancy.
 */
function vacancies(roster, liveByRole) {
    const live = {};
    for (const [k, v] of Object.entries(liveByRole)) {
        live[k.toLowerCase()] = v;
    }
    const out = [];
    for (const [role, want] of Object.entries(roster.want)) {
        const have = live[role.toLowerCase()] ?? 0;
        const need = want - have;
        if (need > 0) {
            out.push({ role, need });
        }
    }
    return out.sort((a, b) => a.role.localeCompare(b.role));
}
/**
 * Pure: roles where the establishment is OVER-staffed (candidates to bench when
 * a sprint winds down). The inverse of {@link vacancies}.
 */
function surplus(roster, liveByRole) {
    const live = {};
    for (const [k, v] of Object.entries(liveByRole)) {
        live[k.toLowerCase()] = v;
    }
    const out = [];
    for (const [role, want] of Object.entries(roster.want)) {
        const have = live[role.toLowerCase()] ?? 0;
        const over = have - want;
        if (over > 0) {
            out.push({ role, need: over });
        }
    }
    return out.sort((a, b) => a.role.localeCompare(b.role));
}
/**
 * Pure: build a recall plan for the vacancies. For each vacancy, prefer the
 * highest-reputation AVAILABLE pooled workers who can play the role; if the pool
 * runs short, hire fresh from the best-fit template; if no template exists
 * either, emit a `gap`. A pooled worker is assigned at most once across the plan.
 */
function recallPlan(vac, pool, templates) {
    const actions = [];
    const used = new Set();
    for (const v of vac) {
        const ranked = (0, performance_1.rankByReputation)(pool.filter(w => w.status === 'available' && !used.has(w.agent_id)), { role: v.role });
        let filled = 0;
        for (const r of ranked) {
            if (filled >= v.need) {
                break;
            }
            used.add(r.worker.agent_id);
            actions.push({ kind: 'recall', role: v.role, agent_id: r.worker.agent_id, reputation: r.score });
            filled++;
        }
        // Pool exhausted for this role → hire fresh from a template, one per slot.
        if (filled < v.need) {
            const tmpl = (0, templates_1.bestTemplateForRole)(templates, v.role);
            for (; filled < v.need; filled++) {
                if (tmpl) {
                    actions.push({ kind: 'hire', role: v.role, template_id: tmpl.template_id });
                }
                else {
                    actions.push({ kind: 'gap', role: v.role, reason: `no available worker and no template for role "${v.role}"` });
                }
            }
        }
    }
    return actions;
}
/**
 * Pure: a `task_assign` recall message (the doorbell that calls a worker in).
 * The bridge/relay/runner layer delivers it; this builds the envelope.
 */
function recallMessage(agentId, role, opts = {}) {
    return {
        from: opts.from ?? 'supervisor',
        to: agentId,
        type: 'task_assign',
        ...(opts.timestamp ? { timestamp: opts.timestamp } : {}),
        requires_response: true,
        payload: {
            recall: true,
            role,
            ...(opts.task_id ? { task_id: opts.task_id } : {}),
            ...(opts.project ? { project: opts.project } : {}),
            reason: `Recalled to fill the ${role} establishment on ${opts.project ?? 'this project'}.`,
        },
    };
}
// ---------------------------------------------------------------------------
// fs helpers
// ---------------------------------------------------------------------------
/**
 * Read the talent pool + templates and produce a recall plan for the roster,
 * given the current live count per role.
 */
async function planRecallFromDisk(roster, liveByRole, homeDir) {
    const [pool, templates] = await Promise.all([(0, workforce_1.listWorkers)(homeDir), (0, templates_1.listTemplates)(homeDir)]);
    return recallPlan(vacancies(roster, liveByRole), pool, templates);
}
/**
 * Graceful dismiss: mark a worker `retired` (its résumé is kept for the record).
 * Releasing leases / revoking trust is the wiring layer's job; this is the
 * standing-record half. Returns the updated worker or null if unknown.
 */
async function dismiss(agentId, homeDir) {
    return (0, workforce_1.setWorkerStatus)(agentId, 'retired', homeDir);
}
//# sourceMappingURL=recall.js.map