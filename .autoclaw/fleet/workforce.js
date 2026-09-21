"use strict";
/**
 * workforce.ts — the talent pool + earned résumé (HR-1).
 *
 * A standing, long-running record per worker that outlives any one session or
 * project: which roles it can play, its skills/llms/tools, and a RÉSUMÉ built
 * incrementally from real signals (task_complete, consensus votes,
 * scope_violation, cost) — earned, not self-asserted. This is what lets the
 * org layer recall a proven worker, weight routing by reputation, and report
 * performance up the chain.
 *
 * Pure core (applyOutcome / foldOutcomes) + fs persistence under
 * `~/.autoclaw/workforce/<agent_id>.json`. `now` injectable for tests; no vscode.
 *
 * See docs/ideas/FLEET-FEDERATION-SELF-HEALING.md §9.2.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.emptyResume = emptyResume;
exports.applyOutcome = applyOutcome;
exports.foldOutcomes = foldOutcomes;
exports.workforceDir = workforceDir;
exports.workerPath = workerPath;
exports.readWorker = readWorker;
exports.writeWorker = writeWorker;
exports.listWorkers = listWorkers;
exports.upsertWorker = upsertWorker;
exports.recordOutcome = recordOutcome;
exports.setWorkerStatus = setWorkerStatus;
const fs = require("fs");
const os = require("os");
const path = require("path");
const fsp = fs.promises;
/** A fresh, empty résumé. */
function emptyResume() {
    return {
        projects: [], tasks_completed: 0, tasks_failed: 0,
        reviews_passed: 0, reviews_failed: 0, scope_violations: 0,
        avg_review_score: 0, reviews_scored: 0, specialties_proven: [],
    };
}
/** Pure: apply one outcome to a résumé, returning a NEW résumé. */
function applyOutcome(resume, outcome) {
    const r = {
        ...resume,
        projects: [...resume.projects],
        specialties_proven: [...resume.specialties_proven],
    };
    const addProject = (p) => { if (p && !r.projects.includes(p)) {
        r.projects.push(p);
    } };
    const foldScore = (score) => {
        if (typeof score === 'number' && Number.isFinite(score)) {
            r.avg_review_score = (r.avg_review_score * r.reviews_scored + score) / (r.reviews_scored + 1);
            r.reviews_scored += 1;
        }
    };
    switch (outcome.kind) {
        case 'task_complete':
            r.tasks_completed += 1;
            addProject(outcome.project);
            if (outcome.specialty && !r.specialties_proven.includes(outcome.specialty)) {
                r.specialties_proven.push(outcome.specialty);
            }
            break;
        case 'task_failed':
            r.tasks_failed += 1;
            addProject(outcome.project);
            break;
        case 'review_passed':
            r.reviews_passed += 1;
            foldScore(outcome.score);
            break;
        case 'review_failed':
            r.reviews_failed += 1;
            foldScore(outcome.score);
            break;
        case 'scope_violation':
            r.scope_violations += 1;
            break;
    }
    return r;
}
/** Pure: fold many outcomes onto a starting résumé (left-to-right). */
function foldOutcomes(start, outcomes) {
    return outcomes.reduce(applyOutcome, start);
}
// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------
function workforceDir(homeDir = os.homedir()) {
    return path.join(homeDir, '.autoclaw', 'workforce');
}
function workerPath(agentId, homeDir = os.homedir()) {
    return path.join(workforceDir(homeDir), `${agentId.replace(/[^A-Za-z0-9_-]/g, '_')}.json`);
}
async function readWorker(agentId, homeDir) {
    try {
        const raw = await fsp.readFile(workerPath(agentId, homeDir), 'utf8');
        return JSON.parse(raw.replace(/^﻿/, ''));
    }
    catch {
        return null;
    }
}
async function writeWorker(worker, homeDir) {
    const file = workerPath(worker.agent_id, homeDir);
    await fsp.mkdir(path.dirname(file), { recursive: true });
    await fsp.writeFile(file, JSON.stringify(worker, null, 2) + '\n', 'utf8');
    return file;
}
async function listWorkers(homeDir) {
    const dir = workforceDir(homeDir);
    let files;
    try {
        files = await fsp.readdir(dir);
    }
    catch {
        return [];
    }
    const out = [];
    for (const f of files) {
        if (!f.endsWith('.json')) {
            continue;
        }
        try {
            const raw = await fsp.readFile(path.join(dir, f), 'utf8');
            const w = JSON.parse(raw.replace(/^﻿/, ''));
            if (w && typeof w.agent_id === 'string') {
                out.push(w);
            }
        }
        catch { /* skip malformed */ }
    }
    return out;
}
/**
 * Create a worker record if absent, or merge declared fields onto an existing
 * one (the résumé is preserved — it is only changed via recordOutcome).
 */
async function upsertWorker(input, opts = {}) {
    const now = new Date(opts.now ?? Date.now()).toISOString();
    const existing = await readWorker(input.agent_id, opts.homeDir);
    const worker = existing
        ? {
            ...existing,
            ...(input.display_name ? { display_name: input.display_name } : {}),
            ...(input.origin_tool ? { origin_tool: input.origin_tool } : {}),
            ...(input.roles_can_play ? { roles_can_play: input.roles_can_play } : {}),
            ...(input.skills ? { skills: input.skills } : {}),
            ...(input.llms ? { llms: input.llms } : {}),
            ...(input.tools ? { tools: input.tools } : {}),
            ...(input.spun_from_template ? { spun_from_template: input.spun_from_template } : {}),
            ...(input.trust ? { trust: input.trust } : {}),
            ...(input.status ? { status: input.status } : {}),
        }
        : {
            agent_id: input.agent_id,
            ...(input.display_name ? { display_name: input.display_name } : {}),
            ...(input.origin_tool ? { origin_tool: input.origin_tool } : {}),
            roles_can_play: input.roles_can_play ?? [],
            skills: input.skills ?? [],
            llms: input.llms ?? [],
            tools: input.tools ?? [],
            ...(input.spun_from_template ? { spun_from_template: input.spun_from_template } : {}),
            resume: emptyResume(),
            status: input.status ?? 'available',
            trust: input.trust ?? 'off',
            created_at: now,
        };
    await writeWorker(worker, opts.homeDir);
    return worker;
}
/**
 * Record a performance outcome against a worker's résumé (read-modify-write).
 * Stamps `last_engaged`. A worker that was `engaged` returns to `available`
 * after a terminal outcome. Creates the worker if absent.
 */
async function recordOutcome(agentId, outcome, opts = {}) {
    const now = new Date(opts.now ?? Date.now()).toISOString();
    const worker = (await readWorker(agentId, opts.homeDir)) ?? (await upsertWorker({ agent_id: agentId }, opts));
    worker.resume = applyOutcome(worker.resume, outcome);
    worker.last_engaged = now;
    if (worker.status === 'engaged') {
        worker.status = 'available';
    }
    await writeWorker(worker, opts.homeDir);
    return worker;
}
/** Set a worker's standing status (available/engaged/benched/retired). */
async function setWorkerStatus(agentId, status, homeDir) {
    const worker = await readWorker(agentId, homeDir);
    if (!worker) {
        return null;
    }
    worker.status = status;
    await writeWorker(worker, homeDir);
    return worker;
}
//# sourceMappingURL=workforce.js.map