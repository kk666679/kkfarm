"use strict";
/**
 * hatchet.ts — Durable workflow adapter (Phase 4).
 *
 * Wraps the Hatchet workflow runtime (https://hatchet.run) when available,
 * falling back to a simple in-memory queue for local development. The
 * in-memory queue does NOT survive process restarts; use Hatchet for
 * production workloads that must survive editor restarts.
 *
 * Install the official Hatchet SDK to unlock persistence:
 *
 *   npm install --save-optional @hatchet-dev/typescript-sdk
 *
 * Spec: docs/DISTRIBUTED_AGENT_FABRIC.md §3 Phase 4.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHatchetAvailable = isHatchetAvailable;
exports.registerWorkflow = registerWorkflow;
exports.triggerWorkflow = triggerWorkflow;
exports.getWorkflowStatus = getWorkflowStatus;
exports.listWorkflowRuns = listWorkflowRuns;
exports.registerAutoclawPipeline = registerAutoclawPipeline;
const crypto = require("crypto");
// ---------------------------------------------------------------------------
// In-memory queue (no external deps)
// ---------------------------------------------------------------------------
class InMemoryWorkflowEngine {
    constructor() {
        this.definitions = new Map();
        this.runs = new Map();
    }
    register(def) {
        this.definitions.set(def.name, def);
    }
    async trigger(workflowName, input) {
        const def = this.definitions.get(workflowName);
        if (!def) {
            throw new Error(`Unknown workflow: ${workflowName}`);
        }
        const runId = `run-${crypto.randomBytes(8).toString('hex')}`;
        const run = {
            runId,
            workflowName,
            status: 'pending',
            input,
            stepResults: {},
            started_at: new Date().toISOString(),
        };
        this.runs.set(runId, run);
        // Execute asynchronously without blocking the caller
        setImmediate(() => this.execute(run, def).catch(e => {
            run.status = 'failed';
            run.error = String(e);
            run.finished_at = new Date().toISOString();
        }));
        return runId;
    }
    async execute(run, def) {
        run.status = 'running';
        // Topological execution: build a simple level set from depends_on
        const completed = new Set();
        const remaining = [...def.steps];
        const maxIterations = def.steps.length * 2; // guard against cycles
        let iter = 0;
        while (remaining.length > 0 && iter++ < maxIterations) {
            const ready = remaining.filter(s => (s.depends_on ?? []).every(d => completed.has(d)));
            if (ready.length === 0) {
                break;
            }
            for (const step of ready) {
                const idx = remaining.indexOf(step);
                remaining.splice(idx, 1);
                const ctx = {
                    workflowId: def.name,
                    runId: run.runId,
                    stepName: step.name,
                    stepResults: { ...run.stepResults },
                };
                try {
                    const result = await Promise.race([
                        step.handler(run.input, ctx),
                        new Promise((_, rej) => setTimeout(() => rej(new Error(`Step ${step.name} timed out`)), step.timeout_ms ?? 30000)),
                    ]);
                    run.stepResults[step.name] = result;
                    completed.add(step.name);
                }
                catch (e) {
                    run.status = 'failed';
                    run.error = String(e);
                    run.finished_at = new Date().toISOString();
                    return;
                }
            }
        }
        run.status = 'succeeded';
        run.finished_at = new Date().toISOString();
    }
    getStatus(runId) {
        return this.runs.get(runId) ?? null;
    }
    listRuns(workflowName) {
        const all = [...this.runs.values()];
        return workflowName ? all.filter(r => r.workflowName === workflowName) : all;
    }
}
// ---------------------------------------------------------------------------
// Singleton engine (swapped to Hatchet client when SDK is present)
// ---------------------------------------------------------------------------
let _engine = null;
let _hatchetAvailable = null;
async function isHatchetAvailable() {
    if (_hatchetAvailable !== null) {
        return _hatchetAvailable;
    }
    try {
        await Function('return import("@hatchet-dev/typescript-sdk")')();
        _hatchetAvailable = true;
    }
    catch {
        _hatchetAvailable = false;
    }
    return _hatchetAvailable;
}
function getEngine() {
    if (!_engine) {
        _engine = new InMemoryWorkflowEngine();
    }
    return _engine;
}
/**
 * Register a workflow definition. Safe to call multiple times with the same
 * name — later calls overwrite.
 */
function registerWorkflow(def) {
    getEngine().register(def);
}
/**
 * Trigger a workflow run. Returns the runId immediately; the workflow
 * executes asynchronously.
 */
async function triggerWorkflow(workflowName, input = {}) {
    // Try Hatchet if available (placeholder — wire real SDK here)
    if (await isHatchetAvailable()) {
        try {
            const sdk = await Function('return import("@hatchet-dev/typescript-sdk")')();
            const hatchet = sdk;
            const { runId } = await hatchet.run(workflowName, input);
            return runId;
        }
        catch {
            _hatchetAvailable = false;
        }
    }
    return getEngine().trigger(workflowName, input);
}
/**
 * Poll run status (in-memory) or query Hatchet API.
 */
async function getWorkflowStatus(runId) {
    return getEngine().getStatus(runId);
}
/**
 * List all runs, optionally filtered by workflow name.
 */
function listWorkflowRuns(workflowName) {
    return getEngine().listRuns(workflowName);
}
// ---------------------------------------------------------------------------
// Built-in AutoClaw workflows
// ---------------------------------------------------------------------------
/**
 * Registers the canonical AutoClaw orchestration pipeline as a workflow.
 * Steps: plan → assign → review → merge. Each step is a stub that writes
 * a status message; real implementations plug in by replacing the handlers.
 */
function registerAutoclawPipeline() {
    registerWorkflow({
        name: 'autoclaw:sprint-pipeline',
        steps: [
            {
                name: 'plan',
                handler: async (input) => {
                    return { status: 'planned', manifest: input.manifest ?? null };
                },
            },
            {
                name: 'assign',
                depends_on: ['plan'],
                handler: async (_input, ctx) => {
                    const planResult = ctx.stepResults['plan'];
                    return { status: 'assigned', sprints: planResult?.sprints ?? [] };
                },
            },
            {
                name: 'review',
                depends_on: ['assign'],
                handler: async (_input, ctx) => {
                    const assignResult = ctx.stepResults['assign'];
                    return { status: 'review_requested', assignments: assignResult?.sprints ?? [] };
                },
            },
            {
                name: 'merge',
                depends_on: ['review'],
                handler: async () => ({ status: 'merged', merged_at: new Date().toISOString() }),
            },
        ],
    });
}
//# sourceMappingURL=hatchet.js.map