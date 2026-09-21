"use strict";
/**
 * handoff_factory.ts — Autonomous work package factory for the orchestrator loop.
 *
 * Replaces the manual copy-paste cross-agent workflow with a machine-readable
 * dispatch envelope that any vendor-specific runner can consume without
 * a human in the loop.
 *
 * Each dispatch produces a `work_package` JSON sidecar + a `task_claim` message
 * in the shared inbox.  The sidecar contains:
 *  - task summary + file paths
 *  - success criteria (verifiable without LLM)
 *  - the loop prompt (nested loop lifecycle)
 *  - vendor-specific runner flag
 *
 * Supports these vendor flags (upstream CI gate swaps to real runner flags):
 *   kilocode     → @kilocode/plugin requires()
 *   claude-code  → Claude Agent SDK headless
 *   kiro         → kiro-cli chat --no-interactive
 *   cursor       → cursor-agent
 *   antigravity  → gemini CLI
 *
 * Kanban types (COORDINATION_IMPROVEMENTS §2.4 cc/velocity/nfr/task):
 *  - cc       — corrective-change (bug fix)
 *  - velocity — throughput improvement (refactor, de-tech-debt)
 *  - nfr      — non-functional requirement
 *  - task     — plain user story / spike
 *
 * Supports kubernetes-workload workload isolation (lb-f451c70f)
 * — spawns vendors as Kubernetes Pod-based tasks so every sub-agent
 * runs in its own isolated namespace.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPackage = buildPackage;
exports.ccTask = ccTask;
exports.commitPackage = commitPackage;
exports.buildPackagePrompt = buildPackagePrompt;
exports.buildK8sWorkload = buildK8sWorkload;
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const orchestratorLoop_1 = require("./orchestratorLoop");
const handoff_1 = require("./orchestrator/handoff");
const fsPromises = fs.promises;
const LANE_EFFORT = {
    cc: 3,
    velocity: 2,
    nfr: 4,
    task: 1,
};
/**
 * Build a deterministic work package.
 * Pure synchronous computation — all file I/O is deferred to dispatch.
 */
function buildPackage(desc, ctx) {
    const effort = LANE_EFFORT[desc.lane];
    const vendor = ctx.vendor;
    const timeBudgetMs = effort * 60 * 60 * 1000; // effort hours → ms
    const pkg = {
        type: 'work_package',
        taskId: desc.id,
        taskName: desc.name,
        description: `[${desc.lane}] ${desc.description}`,
        filePaths: desc.filePaths,
        successCriteria: desc.successCriteria,
        sprint: ctx.sprint,
        assignToVendor: vendor,
        priority: effort >= 4 ? 'high' : effort >= 2 ? 'medium' : 'low',
        timeBudgetMs,
    };
    // Derive a "why" string for the loop journal.
    const whyParts = [];
    whyParts.push(`lane=${desc.lane}`);
    whyParts.push(`vendor=${vendor}`);
    if (desc.criticality) {
        whyParts.push(`criticality=${desc.criticality}`);
    }
    if (desc.fileGlobs) {
        whyParts.push(`globs=${desc.fileGlobs.join(',')}`);
    }
    const why = whyParts.join(' ');
    // Context-satisfying: success criteria + file paths or globs
    const contextSatisfying = desc.successCriteria.length > 0 &&
        (desc.filePaths.length > 0 || (desc.fileGlobs != null && desc.fileGlobs.length > 0));
    return { pkg, why, sidecarPending: true, contextSatisfying };
}
// ---------------------------------------------------------------------------
// Kanban-to-task helpers
// ---------------------------------------------------------------------------
/**
 * Create a cc (corrective-change) task descriptor from a file-glob match.
 */
function ccTask(repoRoot, fileGlobCandidate, laneHint) {
    const lane = laneHint ?? 'cc';
    const id = `${lane}-${Date.now().toString(36)}`;
    return {
        id,
        lane,
        name: `Fix in ${fileGlobCandidate}`,
        description: `Address outstanding changes in \`${fileGlobCandidate}\`. Run the existing test suite, fix failing tests or lint, and keep the existing API stable.`,
        filePaths: [path.join(repoRoot, fileGlobCandidate)],
        fileGlobs: [fileGlobCandidate],
        successCriteria: [
            `npm run test passes`,
            `npm run lint clean`,
            `Changes scoped to ${fileGlobCandidate} only`,
            `task_complete message written to shared inbox`,
        ],
    };
}
// ---------------------------------------------------------------------------
// Commit helpers
// ---------------------------------------------------------------------------
const DISPATCH_LOG_DIR = path.join(orchestratorLoop_1.COMMS_DIR_REL, 'agents', '_dispatch');
/**
 * Finalise a package: write the sidecar file and the task_claim message.
 * Returns the commit record path so the caller can confirm or retry.
 */
async function commitPackage(workspaceRoot, pkg, ctx) {
    const commsDirRel = orchestratorLoop_1.COMMS_DIR_REL;
    const commsDirAbs = path.join(workspaceRoot, commsDirRel);
    // Build the sidecar record.
    const record = {
        at: new Date().toISOString(),
        type: 'work_package',
        taskId: pkg.taskId,
        taskName: pkg.taskName,
        lane: pkg.taskId.split('-')[0],
        vendor: pkg.assignToVendor,
        vendorAgentId: ctx.agentId,
        sprint: pkg.sprint,
        filePaths: pkg.filePaths,
        successCriteria: pkg.successCriteria,
        priority: pkg.priority,
        timeBudgetMs: pkg.timeBudgetMs,
        k8sWorkload: ctx.k8sWorkload ?? false,
        commitment: ctx.commitmentText,
        prompt: JSON.stringify(buildPackagePrompt(pkg, ctx)),
    };
    // Write sidecar.
    const sidecarFilename = `${pkg.taskId}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.json`;
    const sidecarDir = path.join(workspaceRoot, DISPATCH_LOG_DIR);
    await fsPromises.mkdir(sidecarDir, { recursive: true });
    const sidecarPathFull = path.join(sidecarDir, sidecarFilename);
    await fsPromises.writeFile(sidecarPathFull, JSON.stringify(record, null, 2), 'utf8');
    // Write task_claim to shared inbox.
    const sharedInbox = path.join(workspaceRoot, orchestratorLoop_1.SHARED_INBOX_REL);
    const claimMsg = {
        id: `msg-claim-${pkg.taskId}-${Date.now().toString(36)}`,
        from: 'orchestrator-loop',
        to: ctx.agentId,
        type: 'task_claim',
        timestamp: new Date().toISOString(),
        task_id: pkg.taskId,
        payload: {
            sidecar: path.relative(sharedInbox, sidecarPathFull),
            vendor: pkg.assignToVendor,
            priority: pkg.priority,
            successCriteria: pkg.successCriteria,
        },
        requires_response: true,
    };
    await fsPromises.mkdir(sharedInbox, { recursive: true });
    const msgFilename = `${claimMsg.timestamp.replace(/[:.]/g, '-')}-task_claim-${pkg.taskId}.json`;
    const messagePathFull = path.join(sharedInbox, msgFilename);
    await fsPromises.writeFile(messagePathFull, JSON.stringify(claimMsg, null, 2), 'utf8');
    // Append to comms-log.
    const logPath = path.join(workspaceRoot, commsDirRel, 'comms-log.jsonl');
    await fsPromises.mkdir(path.dirname(logPath), { recursive: true });
    await fsPromises.appendFile(logPath, JSON.stringify(claimMsg) + '\n', 'utf8');
    return {
        sidecarPath: sidecarPathFull,
        messagePath: messagePathFull,
        committed: true,
    };
}
// ---------------------------------------------------------------------------
// Prompt builders
// ---------------------------------------------------------------------------
/**
 * Build the nested-loop prompt injected into every work package.
 * The nested loop lifecycle for a sub-agent:
 *
 *  1. Read success criteria
 *  2. Make changes
 *  3. Verify
 *  4. Loop back until ALL criteria pass
 *  5. Write task_complete only on verified success
 */
function buildPackagePrompt(pkg, ctx) {
    const lines = [];
    lines.push('<!-- AutoClaw Nested Loop — DO NOT STOP UNTIL CRITERIA VERIFIED -->');
    lines.push('');
    lines.push(`## Task ${pkg.taskId}: ${pkg.taskName}`);
    lines.push(`Vendor: ${pkg.assignToVendor} | Agent: ${ctx.agentId}`);
    lines.push(`Priority: ${pkg.priority} | Sprint: ${pkg.sprint}`);
    if (pkg.timeBudgetMs > 0) {
        lines.push(`Time budget: ${Math.round(pkg.timeBudgetMs / 3600000)}h`);
    }
    lines.push('');
    lines.push('### Description');
    lines.push(pkg.description);
    lines.push('');
    if (pkg.filePaths.length > 0) {
        lines.push('### File Paths');
        for (const f of pkg.filePaths) {
            lines.push(`- \`${f}\``);
        }
        lines.push('');
    }
    if (ctx.priorBrief) {
        const b = ctx.priorBrief;
        lines.push('### Prior Agent Handoff Brief');
        lines.push(`The last agent to work on this task was **${b.agent_id}** at \`${b.timestamp}\`.`);
        lines.push('Read this before touching any file to avoid re-work and collisions.');
        lines.push('');
        if (b.files_changed.length > 0) {
            lines.push('**Files already changed** (review before re-editing):');
            b.files_changed.forEach(f => lines.push(`- \`${f}\``));
            lines.push('');
        }
        if (b.files_not_touched.length > 0) {
            lines.push('**Files in scope but deliberately left clean** (safe to edit):');
            b.files_not_touched.forEach(f => lines.push(`- \`${f}\``));
            lines.push('');
        }
        if (b.integration_points.length > 0) {
            lines.push('**Integration points to be aware of:**');
            b.integration_points.forEach(p => lines.push(`- ${p}`));
            lines.push('');
        }
        if (b.tests_run.length > 0) {
            const allPassed = b.tests_run.every(t => t.failed === 0);
            lines.push(`**Tests at handoff:** ${allPassed ? '✅ all passing' : '⚠️ some failing'}`);
            b.tests_run.forEach(t => lines.push(`- ${t.suite}: ${t.passed} passed, ${t.failed} failed`));
            lines.push('');
        }
        if (b.risks.length > 0) {
            lines.push('**Known risks / incomplete items:**');
            b.risks.forEach(r => lines.push(`- ${r}`));
            lines.push('');
        }
        if (b.summary) {
            lines.push(`**Summary:** ${b.summary}`);
            lines.push('');
        }
    }
    lines.push('### Context (Do Not Ignore)');
    lines.push('The success criteria below are mandatory. You are operating in a');
    lines.push('nested loop — do not stop until ALL criteria are verified as passing.');
    lines.push('Failure to verify is not completion.');
    lines.push('');
    lines.push('### Success Criteria');
    for (const i in pkg.successCriteria)
        lines.push(`${Number(i) + 1}. ${pkg.successCriteria[i]}`);
    lines.push('');
    lines.push('### Nested Loop Lifecycle');
    lines.push('1. Make the changes required by the criteria.');
    lines.push('2. Verify each criterion explicitly.');
    lines.push('3. If any criterion fails → return to step 1 with fixes.');
    lines.push('4. Only write `task_complete` to the shared inbox when EVERY criterion passes.');
    lines.push('');
    lines.push('### Handoff Note (REQUIRED before task_complete)');
    lines.push('Before writing task_complete, write a handoff note sidecar to:');
    lines.push(`\`.autoclaw/orchestrator/comms/handoffs/${pkg.taskId}-<first-8-chars-of-your-session-id>.json\``);
    lines.push('Then include `"handoff_note": "<relative path to the sidecar>"` in the task_complete payload.');
    lines.push('This is how you prevent peer agents racing on the files you just touched.');
    lines.push('Fill in ALL fields. Use the template below:');
    lines.push('');
    lines.push('```json');
    lines.push((0, handoff_1.handoffNoteTemplate)(pkg.taskId, ctx.agentId, '<your-session-id>'));
    lines.push('```');
    lines.push('');
    lines.push('### Task Complete Message');
    lines.push(`When done, write to \`.autoclaw/orchestrator/comms/inboxes/orchestrator-loop/\`: `);
    lines.push('```json');
    lines.push(`{`);
    lines.push(`  "id": "msg-taskcomplete-${pkg.taskId}-${Date.now().toString(36)}",`);
    lines.push(`  "from": "${ctx.agentId}",`);
    lines.push(`  "to": "orchestrator-loop",`);
    lines.push(`  "type": "task_complete",`);
    lines.push(`  "task_id": "${pkg.taskId}",`);
    lines.push(`  "timestamp": "ISO-8601",`);
    lines.push(`  "payload": {"verification": "all-passed", "verifier": "${ctx.agentId}"},`);
    lines.push(`  "requires_response": false`);
    lines.push(`}`);
    lines.push('```');
    lines.push('');
    lines.push('---');
    lines.push('This is the orchestrator\'s nested working loop.');
    lines.push('No criterion is optional. No handoff note = incomplete task.');
    return lines.join('\n');
}
const DEFAULT_K8S = {
    serviceAccount: 'autoclaw-agent',
    image: 'autoclaw/agent-runner:latest',
    cpuLimit: '1',
    memLimit: '2Gi',
    restartPolicy: 'OnFailure',
    enableEnvoySidecar: true,
    envoyImage: 'envoyproxy/envoy:v1.31',
};
/**
 * Build a Kubernetes Pod manifest for a vendor's workload.
 * When k8sWorkload=true, the orchestrator hands off a sidecar-less
 * workload spec rather than a raw prompt — upstream CI gate (lb-f451c70f)
 * swaps this for a real `kubectl apply` path.
 */
function buildK8sWorkload(pkg, ctx, cfg = DEFAULT_K8S) {
    // Escape Helm-safe names: lower-dots-to-dashes, max 253 chars.
    const safeName = `${pkg.taskId}-${ctx.agentId}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const safeNs = cfg.namespace ?? 'default';
    const containers = [
        {
            name: 'agent',
            image: cfg.image,
            args: [
                '--task-id', pkg.taskId,
                '--vendor', pkg.assignToVendor,
                '--loop-prompt', buildPackagePrompt(pkg, ctx),
            ],
            resources: {
                limits: { cpu: cfg.cpuLimit ?? '1', memory: cfg.memLimit ?? '2Gi' },
            },
        },
    ];
    if (cfg.enableEnvoySidecar) {
        containers.push({
            name: 'envoy-proxy',
            image: cfg.envoyImage ?? 'envoyproxy/envoy:v1.31',
            args: ['-c', '/etc/envoy/envoy.yaml'],
            resources: {
                limits: { cpu: '200m', memory: '256Mi' },
            },
        });
    }
    const manifest = {
        apiVersion: 'v1',
        kind: 'Pod',
        metadata: {
            name: safeName,
            namespace: safeNs,
            labels: {
                'app.kubernetes.io/managed-by': 'autoclaw-loop',
                'autoclaw.io/vendor': pkg.assignToVendor,
                'autoclaw.io/task-id': pkg.taskId,
            },
            annotations: {
                'autoclaw.io/task': pkg.taskName,
                'autoclaw.io/sprint': String(pkg.sprint),
                'autoclaw.io/agent': ctx.agentId,
                'autoclaw.io/commitment': ctx.commitmentText,
            },
        },
        spec: {
            serviceAccountName: cfg.serviceAccount,
            restartPolicy: cfg.restartPolicy ?? 'OnFailure',
            containers,
        },
    };
    return manifest;
}
//# sourceMappingURL=handoff_factory.js.map