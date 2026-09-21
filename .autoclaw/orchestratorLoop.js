"use strict";
/**
 * orchestratorLoop.ts — Perpetual health-check → work-discovery → dispatch loop.
 *
 * This is the "always-on" heart of AutoClaw. It runs as a `setInterval`
 * ticker inside the extension host.
 *
 * Each tick:
 *  1. Read all heartbeat files → agent health grid
 *  2. Check inboxes for unread / requires_response messages
 *  3. Find idle/available agents → find next assignable task
 *  4. Dispatch work: write task_claim + work_package sidecar
 *  5. Write a loop-journal entry for external auditing
 *  6. Sleep until next tick
 *
 * Zero LLM calls in the hot path — all work is file-I/O against the
 * filesystem mailbox and heartbeat files.
 *
 * Agent dispatch (vendor-specific):
 *  - Kilo Code       → @kilocode/plugin (loaded dynamically via require)
 *  - Claude Code     → Claude Agent SDK headless subprocess
 *  - Kiro            → kiro-cli chat --no-interactive
 *  - Cursor          → cursor-agent CLI
 *  - Antigravity     → gemini CLI
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NEXT_DISPATCH_TTL_MS = exports.LOOP_INSTANCE_ID = exports.STALLED_MS = exports.HEALTHY_MS = exports.DEFAULT_TICK_MS = exports.LOOP_SIDE_CAR_DIR = exports.LOOP_STATE_REL = exports.LOOP_JOURNAL_REL = exports.SHARED_INBOX_REL = exports.HEARTBEATS_DIR_REL = exports.COMMS_DIR_REL = void 0;
exports.writeLoopJournal = writeLoopJournal;
exports.readLoopJournal = readLoopJournal;
exports.writeLoopState = writeLoopState;
exports.readPersistedLoopState = readPersistedLoopState;
exports.vendorFromId = vendorFromId;
exports.buildWorkLoopPrompt = buildWorkLoopPrompt;
exports.healthCheck = healthCheck;
exports.readClaimedAgentIds = readClaimedAgentIds;
exports.readRecentNextDispatches = readRecentNextDispatches;
exports.gcStaleNextDispatches = gcStaleNextDispatches;
exports.discoverWork = discoverWork;
exports.dispatchWork = dispatchWork;
exports.runTick = runTick;
exports.startOrchestratorLoop = startOrchestratorLoop;
exports.getAgentRegistry = getAgentRegistry;
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const comms_1 = require("./comms");
const peerReviewWatcher_1 = require("./orchestrator/peerReviewWatcher");
const commsGc_1 = require("./orchestrator/commsGc");
const consensusTally_1 = require("./orchestrator/consensusTally");
const logjamBreaker_1 = require("./orchestrator/logjamBreaker");
const boardWriter_1 = require("./orchestrator/boardWriter");
const taskCatalogIngest_1 = require("./orchestrator/taskCatalogIngest");
const wakeIdlePeers_1 = require("./orchestrator/wakeIdlePeers");
const heal_1 = require("./orchestrator/heal");
const claimReaper_1 = require("./orchestrator/claimReaper");
const supervisorLease_1 = require("./orchestrator/supervisorLease");
const clusterMap_1 = require("./orchestrator/clusterMap");
const monitorRoster_1 = require("./orchestrator/monitorRoster");
const clusterMapGossip_1 = require("./lmd/clusterMapGossip");
const workforceIngest_1 = require("./fleet/workforceIngest");
const recallDispatch_1 = require("./fleet/recallDispatch");
const reputationAssign_1 = require("./runners/reputationAssign");
// Fabric governance (AF-8 §3) — gate + audit the real dispatch path. Explicit
// subpath keeps the message-bus/bridge out of the loop module.
const governance_1 = require("./fabric/governance");
// Fleet HALT kill switch (HKS-3) — leaf module shared with hooks/triggerHooks.
const fleetHalt_1 = require("./hooks/fleetHalt");
const budget_1 = require("./budget");
const fsPromises = fs.promises;
// ---------------------------------------------------------------------------
// Path constants (computed once at module load; no circular deps)
// ---------------------------------------------------------------------------
exports.COMMS_DIR_REL = path.join('.autoclaw', 'orchestrator', 'comms');
exports.HEARTBEATS_DIR_REL = path.join(exports.COMMS_DIR_REL, 'heartbeats');
exports.SHARED_INBOX_REL = path.join(exports.COMMS_DIR_REL, 'inboxes', 'shared');
exports.LOOP_JOURNAL_REL = path.join(exports.COMMS_DIR_REL, 'loop-journal.jsonl');
exports.LOOP_STATE_REL = path.join(exports.COMMS_DIR_REL, 'loop-state.json');
exports.LOOP_SIDE_CAR_DIR = path.join(exports.COMMS_DIR_REL, 'agents', '_dispatch');
/** Per-process, per-workspace flag: has the spine done its cold-start backfill?
 *  First active-manager tick backfills (30d cutoff); later ticks are incremental
 *  (spec §3.2). Reset on process restart — a re-backfill is idempotent by event_id. */
const spineBackfilledByRoot = new Map();
exports.DEFAULT_TICK_MS = 30000;
exports.HEALTHY_MS = 60000;
exports.STALLED_MS = 5 * 60 * 1000;
/**
 * Per-process supervisor-candidate id (SH-2). Distinct across hosts so the
 * supervisor lease arbitrates which loop runs the HEAL phase; if the holder
 * goes stale, the next ticking host steals the lease and takes over.
 */
exports.LOOP_INSTANCE_ID = `orchestrator-loop-${crypto.randomBytes(3).toString('hex')}`;
// ---------------------------------------------------------------------------
// KiloCode plugin cache (dynamic require — avoids hard dep)
// ---------------------------------------------------------------------------
let _kiloPlugin = null;
let _kiloPluginLoadFailed = false;
// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------
function commsDir(workspaceRoot) {
    return path.join(workspaceRoot, exports.COMMS_DIR_REL);
}
function journalPath(workspaceRoot) {
    return path.join(workspaceRoot, exports.LOOP_JOURNAL_REL);
}
function loopStatePath(workspaceRoot) {
    return path.join(workspaceRoot, exports.LOOP_STATE_REL);
}
/** Best-effort journal append; never throws. */
async function writeLoopJournal(workspaceRoot, entry) {
    try {
        const fp = journalPath(workspaceRoot);
        await fsPromises.mkdir(path.dirname(fp), { recursive: true });
        await fsPromises.appendFile(fp, JSON.stringify(entry) + '\n', 'utf8');
    }
    catch { /* advisory only — never block the loop */ }
}
/** Read the loop journal (tail). */
async function readLoopJournal(workspaceRoot, maxLines = 200) {
    try {
        const raw = await fsPromises.readFile(journalPath(workspaceRoot), 'utf8');
        const lines = raw.split('\n').filter(Boolean);
        const parsed = [];
        for (const line of lines.slice(-maxLines)) {
            try {
                parsed.push(JSON.parse(line));
            }
            catch { /* skip corrupt */ }
        }
        return parsed;
    }
    catch {
        return [];
    }
}
async function writeLoopState(workspaceRoot, state) {
    const fp = loopStatePath(workspaceRoot);
    const data = JSON.stringify(state, null, 2);
    try {
        await fsPromises.mkdir(path.dirname(fp), { recursive: true });
        // Atomic + resilient: several windows may run a loop against the same
        // workspace and write this file concurrently. Writing through a per-process
        // temp file then renaming avoids a sharing-violation on the destination
        // ("UNKNOWN: unknown error, open ...") on Windows. The rename is retried
        // because it can transiently fail with EPERM when the target is held.
        const tmp = `${fp}.${process.pid}.tmp`;
        await fsPromises.writeFile(tmp, data, 'utf8');
        for (let attempt = 0; attempt < 5; attempt++) {
            try {
                await fsPromises.rename(tmp, fp);
                return;
            }
            catch {
                await new Promise(r => setTimeout(r, 20 * (attempt + 1)));
            }
        }
        // Rename kept failing — fall back to an in-place write and drop the temp.
        try {
            await fsPromises.writeFile(fp, data, 'utf8');
        }
        finally {
            try {
                await fsPromises.rm(tmp, { force: true });
            }
            catch { /* ignore */ }
        }
    }
    catch { /* persistence is best-effort; never let a disk hiccup crash the loop */ }
}
async function readPersistedLoopState(workspaceRoot) {
    try {
        const raw = await fsPromises.readFile(loopStatePath(workspaceRoot), 'utf8');
        return JSON.parse(raw);
    }
    catch {
        return freshLoopState();
    }
}
function inboxDir(workspaceRoot, agentId) {
    return path.join(workspaceRoot, exports.COMMS_DIR_REL, 'inboxes', agentId);
}
// ---------------------------------------------------------------------------
// Vendor helpers
// ---------------------------------------------------------------------------
function vendorFromId(agentId) {
    if (agentId === 'kilocode' || /kilocode/.test(agentId))
        return 'kilocode';
    if (agentId === 'claude-code' || /claude/.test(agentId))
        return 'claude-code';
    if (/kiro/.test(agentId))
        return 'kiro';
    if (/cursor/.test(agentId))
        return 'cursor';
    if (/antigravity|anti-/.test(agentId))
        return 'antigravity';
    return 'other';
}
function buildWorkLoopPrompt(pkg) {
    const lines = [];
    lines.push('<!-- AutoClaw Nested Loop — DO NOT STOP UNTIL CRITERIA VERIFIED -->');
    lines.push('');
    lines.push(`## Task ${pkg.taskId}: ${pkg.taskName}`);
    lines.push(`Priority: ${pkg.priority}`);
    lines.push('');
    lines.push('### Description');
    lines.push(pkg.description);
    lines.push('');
    if (pkg.filePaths.length > 0) {
        lines.push('### File Paths');
        for (const f of pkg.filePaths)
            lines.push(`- \`${f}\``);
        lines.push('');
    }
    lines.push('### Success Criteria');
    for (const i in pkg.successCriteria)
        lines.push(`${Number(i) + 1}. ${pkg.successCriteria[i]}`);
    lines.push('');
    lines.push('### Grounding — Context Pack');
    if (pkg.contextPackPath) {
        lines.push(`Read \`${pkg.contextPackPath}\` FIRST — a grounded pack the orchestrator ` +
            `assembled for this task: relevant code from this repo, the team's proven ` +
            `patterns, the learned style guide, recent memory, and durable facts.`);
    }
    else {
        lines.push('Before coding, pull your grounding pack: call the `intelligence.contextPack` ' +
            'MCP tool with this task, or run ' +
            '`node scripts/context-pack.js --task "<this task>"`. It returns relevant ' +
            'code, proven patterns, the style guide, memory, and durable facts.');
    }
    lines.push('Treat it as retrieved hints, not authority — verify against the current code.');
    lines.push('');
    lines.push('### Nested Loop Lifecycle');
    lines.push('1. Make required changes.');
    lines.push('2. Verify each criterion explicitly.');
    lines.push('3. If any criterion fails → return to step 1.');
    lines.push('4. Write task_complete only when ALL criteria pass.');
    lines.push('');
    lines.push(`On completion write to .autoclaw/orchestrator/comms/inboxes/orchestrator-loop/:`);
    lines.push(`task_complete message with task_id="${pkg.taskId}".`);
    return lines.join('\n');
}
// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
async function healthCheck(workspaceRoot, now = new Date()) {
    const nowMs = now.getTime();
    const hbDir = path.join(workspaceRoot, exports.HEARTBEATS_DIR_REL);
    const entries = [];
    const stalledIds = [];
    const deadIds = [];
    let healthyCount = 0;
    let idleCount = 0;
    let filenames = [];
    try {
        filenames = await fsPromises.readdir(hbDir);
    }
    catch {
        return { entries: [], stalledIds: [], deadIds: [], healthyCount: 0, idleCount: 0 };
    }
    for (const fn of filenames) {
        if (!fn.endsWith('.json'))
            continue;
        const base = fn.replace(/\.json$/, '');
        // Skip session heartbeat files: <agentId>-<uuidOrSession>.json
        // Heuristic: session files have 3+ dash-separated segments
        // (e.g., "agent-a-sess-abc" = 3 parts, "claude-code" = 2 parts, "kiro" = 1 part).
        if (base.split('-').length > 2)
            continue;
        const agentId = base;
        const hbPath = path.join(hbDir, fn);
        let hb = null;
        try {
            const raw = await fsPromises.readFile(hbPath, 'utf8');
            hb = JSON.parse(raw);
        }
        catch { /* skip */ }
        const ageMs = hb ? nowMs - new Date(hb.timestamp).getTime() : Infinity;
        const state = hb == null ? 'unknown'
            : ageMs > exports.STALLED_MS * 3 ? 'dead'
                : ageMs > exports.STALLED_MS ? 'stalled'
                    : ageMs > exports.HEALTHY_MS ? 'degraded'
                        : 'alive';
        entries.push({
            agentId,
            vendor: vendorFromId(agentId),
            state,
            lastHeartbeatAt: hb?.timestamp ?? null,
            missedTicks: Math.max(0, Math.floor(ageMs / exports.DEFAULT_TICK_MS)),
            hasUnreadMessages: false,
            unreadCount: 0,
            currentSprint: hb?.sprint ?? null,
            currentTask: hb?.current_task ?? null,
        });
    }
    for (const e of entries) {
        if (e.state === 'alive')
            healthyCount++;
        if (e.state === 'stalled')
            stalledIds.push(e.agentId);
        if (e.state === 'dead')
            deadIds.push(e.agentId);
    }
    return { entries, stalledIds, deadIds, healthyCount, idleCount };
}
// ---------------------------------------------------------------------------
// Inbox scanning
// ---------------------------------------------------------------------------
async function countUnread(workspaceRoot, agentId) {
    const dir = inboxDir(workspaceRoot, agentId);
    let files = [];
    try {
        files = await fsPromises.readdir(dir);
    }
    catch {
        return 0;
    }
    let count = 0;
    for (const fn of files) {
        if (!fn.endsWith('.json'))
            continue;
        const stateDir = path.join(dir, '_state');
        const stateFile = path.join(stateDir, fn.replace(/\.json$/, '') + '.json');
        try {
            const raw = await fsPromises.readFile(stateFile, 'utf8');
            const state = JSON.parse(raw);
            if (!state.archived_at)
                count++;
        }
        catch {
            count++;
        }
    }
    return count;
}
// ---------------------------------------------------------------------------
// Work discovery
// ---------------------------------------------------------------------------
/**
 * Return the set of agent ids that already own at least one active (non-expired)
 * claim under `comms/claims/`. An agent with a live claim is NOT idle and must
 * not be re-dispatched a `next-<agent>` placeholder.
 */
async function readClaimedAgentIds(workspaceRoot) {
    const claimsDir = path.join(workspaceRoot, exports.COMMS_DIR_REL, 'claims');
    const out = new Set();
    let entries;
    try {
        entries = await fsPromises.readdir(claimsDir);
    }
    catch {
        return out;
    }
    for (const name of entries) {
        if (!name.endsWith('.json'))
            continue;
        try {
            const raw = await fsPromises.readFile(path.join(claimsDir, name), 'utf8');
            const claim = JSON.parse(raw);
            if (typeof claim.claimed_by !== 'string')
                continue;
            if (claim.expires_at && Date.parse(claim.expires_at) < Date.now())
                continue;
            out.add(claim.claimed_by);
        }
        catch { /* skip malformed claim */ }
    }
    return out;
}
/**
 * Return the set of agent ids that already received a `next-<agent>` dispatch
 * in the last `withinMs` window. The orchestrator-loop must not re-broadcast
 * the same placeholder every tick — once is enough until either the agent
 * claims real work or the cooldown elapses.
 */
async function readRecentNextDispatches(workspaceRoot, withinMs = 5 * 60 * 1000) {
    const sharedInbox = path.join(workspaceRoot, exports.SHARED_INBOX_REL);
    const out = new Set();
    const cutoff = Date.now() - withinMs;
    let names;
    try {
        names = await fsPromises.readdir(sharedInbox);
    }
    catch {
        return out;
    }
    for (const name of names) {
        if (!name.includes('task_claim-next-'))
            continue;
        const m = name.match(/task_claim-next-(.+?)\.json$/);
        if (!m)
            continue;
        try {
            const stat = await fsPromises.stat(path.join(sharedInbox, name));
            if (stat.mtimeMs >= cutoff) {
                out.add(m[1]);
            }
        }
        catch { /* skip */ }
    }
    return out;
}
/**
 * How long a `task_claim-next-<agent>` placeholder lives before it is garbage.
 * Comfortably longer than the 5-min re-dispatch cooldown so a live agent always
 * has time to claim, but short enough that an idle fleet doesn't leave a litter
 * of stale placeholders (an idle fleet could otherwise pile up dozens in shared/).
 */
exports.NEXT_DISPATCH_TTL_MS = 30 * 60 * 1000;
/**
 * Garbage-collect stale dispatch placeholders from the shared inbox (#1).
 *
 *  - **Expire:** delete any `task_claim-next-<agent>` whose `expires_at` is in the
 *    past (falling back to file mtime + TTL for legacy files without the field).
 *  - **Coalesce:** for each agent, keep only the newest live placeholder and
 *    delete the older duplicates — one pending nudge per idle agent is enough.
 *
 * Best-effort and self-contained: a malformed file is skipped, never fatal.
 * Returns the count removed so the loop can journal it.
 */
async function gcStaleNextDispatches(workspaceRoot, now = Date.now(), ttlMs = exports.NEXT_DISPATCH_TTL_MS) {
    const sharedInbox = path.join(workspaceRoot, exports.SHARED_INBOX_REL);
    let names;
    try {
        names = await fsPromises.readdir(sharedInbox);
    }
    catch {
        return 0;
    }
    // First pass: classify each next-dispatch file as expired or live, and for the
    // live ones record (agent → newest file) so we can coalesce duplicates.
    const live = [];
    const toDelete = [];
    for (const name of names) {
        if (!name.includes('task_claim-next-'))
            continue;
        const m = name.match(/task_claim-next-(.+?)\.json$/);
        if (!m)
            continue;
        const full = path.join(sharedInbox, name);
        try {
            const raw = await fsPromises.readFile(full, 'utf8');
            const msg = JSON.parse(raw);
            const stat = await fsPromises.stat(full);
            const expiry = msg.expires_at ? Date.parse(msg.expires_at) : stat.mtimeMs + ttlMs;
            if (Number.isFinite(expiry) && expiry < now) {
                toDelete.push(name);
            }
            else {
                live.push({ agent: m[1], name, mtimeMs: stat.mtimeMs });
            }
        }
        catch {
            // Unreadable/corrupt placeholder — reap it.
            toDelete.push(name);
        }
    }
    // Coalesce live duplicates: keep the newest per agent, delete the rest.
    const newestByAgent = new Map();
    for (const l of live) {
        const prev = newestByAgent.get(l.agent);
        if (!prev || l.mtimeMs > prev.mtimeMs) {
            newestByAgent.set(l.agent, l);
        }
    }
    for (const l of live) {
        const keep = newestByAgent.get(l.agent);
        if (keep && keep.name !== l.name) {
            toDelete.push(l.name);
        }
    }
    let removed = 0;
    for (const name of toDelete) {
        try {
            await fsPromises.unlink(path.join(sharedInbox, name));
            removed++;
        }
        catch { /* already gone */ }
    }
    return removed;
}
async function discoverWork(workspaceRoot, health) {
    // Two-layer dedup: skip agents that ALREADY own an active claim, and skip
    // agents that received a `next-<agent>` placeholder in the last 5 minutes.
    // Both checks were missing before; the result was 15+ duplicate broadcasts
    // in 7 minutes — observed in production on 2026-05-29.
    const claimedAgents = await readClaimedAgentIds(workspaceRoot);
    const recentlyNotified = await readRecentNextDispatches(workspaceRoot);
    const work = [];
    for (const agent of health.entries) {
        if (agent.state !== 'alive')
            continue;
        if (claimedAgents.has(agent.agentId))
            continue;
        if (recentlyNotified.has(agent.agentId))
            continue;
        work.push({
            item: {
                type: 'work_package',
                taskId: `next-${agent.agentId}`,
                taskName: `Next available work for ${agent.agentId}`,
                description: `Auto-dispatched by orchestrator-loop. Agent ${agent.agentId} is idle.`,
                filePaths: [],
                successCriteria: [
                    'All existing tests pass',
                    'task_complete written to shared inbox',
                ],
                sprint: agent.currentSprint ?? 1,
                assignToVendor: agent.vendor,
                priority: 'low',
                timeBudgetMs: 0,
            },
            why: `agent=${agent.agentId} idle, no claim, no recent next-dispatch`,
        });
    }
    return work;
}
// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------
async function dispatchWork(workspaceRoot, pkg, controlLevel = 'individual', opts = {}) {
    // Fleet HALT kill switch (HKS-3, agent-trigger-hooks spec): when the
    // operator has engaged `.autoclaw/orchestrator/HALT`, NOTHING dispatches —
    // not the loop tick, not trigger hooks. Journaled so the pause is visible.
    if ((0, fleetHalt_1.isFleetHalted)(workspaceRoot)) {
        await writeLoopJournal(workspaceRoot, {
            at: new Date().toISOString(), tick: 0, phase: 'dispatch',
            action: 'dispatch_halted', detail: { taskId: pkg.taskId, vendor: pkg.assignToVendor, reason: 'fleet HALT engaged' },
        });
        return null;
    }
    // Cost-as-instrument ceiling: when a spend/wall-clock budget is configured and
    // breached, enforceBudget engages the fleet HALT switch (so the pause persists
    // and is visible) and we refuse this dispatch. No-op when no budget.json exists.
    const budget = await (0, budget_1.enforceBudget)(workspaceRoot);
    if (budget.enabled && !budget.within) {
        await writeLoopJournal(workspaceRoot, {
            at: new Date().toISOString(), tick: 0, phase: 'dispatch',
            action: 'dispatch_over_budget',
            detail: { taskId: pkg.taskId, vendor: pkg.assignToVendor, breaches: budget.breaches, spend_usd: budget.spend_usd },
        });
        return null;
    }
    const commsDirAbs = commsDir(workspaceRoot);
    const sidecarDir = path.join(workspaceRoot, exports.LOOP_SIDE_CAR_DIR);
    const autoclawDir = path.join(workspaceRoot, '.autoclaw');
    // AF-8 §3: resolve the target agent's fabric type and gate the dispatch.
    // Absent agent_type ⇒ 'coder' ⇒ allowed, so existing fleets are unchanged;
    // only human-in-loop (assistant/governance) types or a governance control
    // level are held for approval.
    let agentType = 'coder';
    try {
        const reg = JSON.parse((await fsPromises.readFile(path.join(commsDirAbs, 'registry.json'), 'utf8')).replace(/^﻿/, ''));
        // BL-7b Part 2: reputation-aware DEFAULT assignment. A work package with no
        // explicit target ('other') is otherwise broadcast unaddressed for any agent
        // to self-claim. Instead, address the claim to the highest-reputation CAPABLE
        // registered agent — "capable" = one the dispatch gate would allow. Explicit,
        // named vendors are untouched. Degrade-safe: no candidates or a ledger-read
        // failure leaves the original 'other' broadcast and existing queue semantics.
        if (pkg.assignToVendor === 'other') {
            const candidates = (reg.agents ?? [])
                .filter(a => !!a.id && a.id !== 'other'
                && (0, governance_1.gateDispatch)((a.agent_type ?? 'coder'), controlLevel).allowed)
                .map(a => a.id);
            const picked = await (0, reputationAssign_1.selectPreferredVendorByReputation)(workspaceRoot, candidates);
            if (picked) {
                pkg.assignToVendor = picked;
                await writeLoopJournal(workspaceRoot, {
                    at: new Date().toISOString(), tick: 0, phase: 'dispatch',
                    action: 'reputation_assigned',
                    detail: { taskId: pkg.taskId, from: 'other', to: picked, candidates: candidates.length },
                });
            }
        }
        const match = reg.agents?.find(a => a.id === pkg.assignToVendor);
        if (match?.agent_type) {
            agentType = match.agent_type;
        }
    }
    catch {
        /* no registry ⇒ default coder, original vendor preserved */
    }
    const gate = (0, governance_1.gateDispatch)(agentType, controlLevel);
    if (!gate.allowed) {
        await (0, governance_1.appendAuditLog)(autoclawDir, {
            actor: 'orchestrator-loop', agent_type: agentType, action: 'dispatch',
            task_id: pkg.taskId, control_level: controlLevel, allowed: false, detail: gate.reason,
        });
        await writeLoopJournal(workspaceRoot, {
            at: new Date().toISOString(), tick: 0, phase: 'dispatch',
            action: 'dispatch_gated', detail: { taskId: pkg.taskId, vendor: pkg.assignToVendor, reason: gate.reason },
        });
        return null;
    }
    // Auto-hook (Channel A): best-effort generate a context pack for this task and
    // reference it in the prompt. Degrade-safe and never blocks dispatch — any
    // failure (no backend, slow embed) is journaled and the prompt falls back to
    // pull-on-demand instructions.
    if (opts.generateContextPack) {
        try {
            const { buildContextPack } = await Promise.resolve().then(() => require('./intelligence'));
            const task = `${pkg.taskName}: ${pkg.description}`.trim().replace(/:\s*$/, '');
            // CTX-3: the Context Budget Broker plans the pack shape from the task
            // (mode + hybrid query mode) instead of every dispatch using a flat
            // default. Pure + deterministic; the agent type doubles as the role
            // signal. The chosen plan is journaled for audit.
            const { planContextBudget, packOptionsFromPlan } = await Promise.resolve().then(() => require('./intelligence/contextBudget'));
            const budgetPlan = planContextBudget({ task, role: agentType, taskIds: [pkg.taskId] });
            const pack = await buildContextPack({ task, sprint: pkg.sprint, agentId: pkg.assignToVendor, taskIds: [pkg.taskId] }, { workspaceRoot, ...packOptionsFromPlan(budgetPlan) });
            const sprintsDir = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'sprints');
            await fsPromises.mkdir(sprintsDir, { recursive: true });
            const packFile = path.join(sprintsDir, `${pkg.taskId}.context.md`);
            await fsPromises.writeFile(packFile, pack.markdown, 'utf8');
            pkg.contextPackPath = path.relative(workspaceRoot, packFile).split(path.sep).join('/');
            await writeLoopJournal(workspaceRoot, {
                at: new Date().toISOString(), tick: 0, phase: 'dispatch',
                action: 'context_pack_written',
                detail: {
                    taskId: pkg.taskId, file: pkg.contextPackPath, degraded: pack.degraded,
                    codeHits: pack.codeHits, kgHits: pack.kgHits,
                    budget: { task_type: budgetPlan.task_type, mode: budgetPlan.mode, query_mode: budgetPlan.query_mode },
                },
            });
            // AMCE-P4A: machine-readable sidecar beside the markdown (default-on for
            // orchestrator packs — this is where the summary is already in hand).
            // Best-effort; a sidecar failure never blocks dispatch.
            try {
                const { buildContextPackSidecar, writeContextPackSidecar } = await Promise.resolve().then(() => require('./intelligence/contextPackSidecar'));
                await writeContextPackSidecar(packFile, buildContextPackSidecar({
                    pack,
                    scope: { task, sprint: pkg.sprint, agentId: pkg.assignToVendor, taskIds: [pkg.taskId] },
                    markdownPath: packFile,
                    workspaceRoot,
                }));
            }
            catch {
                /* sidecar bookkeeping never blocks dispatch */
            }
            // AMCE-P1E: record the pack-generation event in the Trace Ledger so the
            // pack can be joined to the episode/outcome that follows it. Best-effort
            // (appendTraceRow never throws); the loop journal above stays the
            // operational log either way.
            try {
                const { appendTraceRow, buildContextPackTraceRow } = await Promise.resolve().then(() => require('./workflows/traces/ledger'));
                await appendTraceRow(workspaceRoot, buildContextPackTraceRow({
                    agent_id: pkg.assignToVendor,
                    task_id: pkg.taskId,
                    pack: {
                        path: pkg.contextPackPath,
                        mode: pack.summary.mode,
                        degraded: pack.degraded,
                        code_hits: pack.codeHits,
                        learning_hits: pack.learningHits,
                        kg_hits: pack.kgHits,
                        episode_hits: pack.summary.episode_hits,
                        evidence_count: pack.summary.evidence?.length,
                    },
                    context_block_ids: pack.summary.spine_block_ids,
                }));
            }
            catch {
                /* trace bookkeeping is never allowed to block dispatch */
            }
        }
        catch (err) {
            await writeLoopJournal(workspaceRoot, {
                at: new Date().toISOString(), tick: 0, phase: 'dispatch',
                action: 'context_pack_failed', detail: { taskId: pkg.taskId, error: String(err) },
            });
        }
    }
    const record = {
        at: new Date().toISOString(),
        type: 'work_package',
        taskId: pkg.taskId,
        taskName: pkg.taskName,
        vendor: pkg.assignToVendor,
        sprint: pkg.sprint,
        filePaths: pkg.filePaths,
        successCriteria: pkg.successCriteria,
        priority: pkg.priority,
        timeBudgetMs: pkg.timeBudgetMs,
        contextPackPath: pkg.contextPackPath,
        prompt: buildWorkLoopPrompt(pkg),
    };
    const filename = `${pkg.taskId}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.json`;
    await fsPromises.mkdir(sidecarDir, { recursive: true });
    const sidecarPath = path.join(sidecarDir, filename);
    await fsPromises.writeFile(sidecarPath, JSON.stringify(record, null, 2), 'utf8');
    // Real-time KG: remember this assignment as a durable fact (best-effort).
    if (opts.recordToKg) {
        const dispatchText = `Dispatched ${pkg.taskName || pkg.taskId} (${pkg.taskId}) to ${pkg.assignToVendor}` +
            (typeof pkg.sprint === 'number' ? ` for sprint ${pkg.sprint}` : '') + '.';
        const dispatchEventId = filename.replace(/\.json$/, '');
        try {
            const { recordOrchestrationEventsToKg } = await Promise.resolve().then(() => require('./intelligence'));
            await recordOrchestrationEventsToKg(workspaceRoot, [{
                    type: 'dispatch',
                    eventId: dispatchEventId,
                    agentId: pkg.assignToVendor,
                    taskId: pkg.taskId,
                    sprint: pkg.sprint,
                    text: dispatchText,
                }]);
        }
        catch { /* best-effort — never block dispatch */ }
        // KG-P5 (spec §4.2): the observation above is a bare thought with no edge, so
        // dispatch never shows on the task timeline. Emit a `progress` lifecycle
        // event too — it ensures the `task:*` node and writes the `activity` edge
        // task→thought so the board timeline (KG-P3) surfaces the dispatch. Distinct
        // deterministic id (dispatch sidecar basename discriminator) — no duplicate
        // of the observation write. Best-effort + degrade-safe.
        try {
            const { recordLifecycleEventToKg } = await Promise.resolve().then(() => require('./intelligence'));
            await recordLifecycleEventToKg(workspaceRoot, {
                taskId: pkg.taskId,
                sprint: pkg.sprint,
                agent: pkg.assignToVendor,
                kind: 'progress',
                text: dispatchText,
                discriminator: dispatchEventId,
                meta: { source: 'dispatch', vendor: pkg.assignToVendor },
            });
        }
        catch { /* best-effort — never block dispatch */ }
    }
    const sharedInbox = path.join(workspaceRoot, exports.SHARED_INBOX_REL);
    const claimMsg = {
        id: `msg-claim-${pkg.taskId}-${Date.now().toString(36)}`,
        from: 'orchestrator-loop',
        to: 'shared',
        type: 'task_claim',
        timestamp: new Date().toISOString(),
        task_id: pkg.taskId,
        payload: { vendor: pkg.assignToVendor, priority: pkg.priority },
        requires_response: true,
        // Ephemeral placeholder: if nobody claims it within the TTL it is garbage —
        // gcStaleNextDispatches() reaps it so the shared inbox stays bounded (#1).
        expires_at: new Date(Date.now() + exports.NEXT_DISPATCH_TTL_MS).toISOString(),
    };
    await fsPromises.mkdir(sharedInbox, { recursive: true });
    const msgFile = path.join(sharedInbox, `${claimMsg.timestamp.replace(/[:.]/g, '-')}-task_claim-${pkg.taskId}.json`);
    await fsPromises.writeFile(msgFile, JSON.stringify(claimMsg, null, 2), 'utf8');
    // Append to comms-log.
    const logPath = path.join(workspaceRoot, exports.LOOP_JOURNAL_REL.replace('loop-journal', 'comms-log'));
    await fsPromises.mkdir(path.dirname(logPath), { recursive: true });
    await fsPromises.appendFile(logPath, JSON.stringify(claimMsg) + '\n', 'utf8');
    await writeLoopJournal(workspaceRoot, {
        at: new Date().toISOString(), tick: 0, phase: 'dispatch',
        action: 'work_dispatched', detail: { taskId: pkg.taskId, vendor: pkg.assignToVendor },
    });
    // AF-8 §3: audit the allowed dispatch.
    await (0, governance_1.appendAuditLog)(autoclawDir, {
        actor: 'orchestrator-loop', agent_type: agentType, action: 'dispatch',
        task_id: pkg.taskId, control_level: controlLevel, allowed: true,
    });
    return sidecarPath;
}
// ---------------------------------------------------------------------------
// Loop state helpers
// ---------------------------------------------------------------------------
function freshLoopState() {
    return {
        tick: 0, startedAt: new Date().toISOString(), lastTickAt: null,
        totalAgentsSeen: 0, totalTicks: 0, totalErrors: 0, totalDispatches: 0,
        vendorStats: {},
    };
}
// ---------------------------------------------------------------------------
// Single tick
// ---------------------------------------------------------------------------
async function runTick(workspaceRoot, state, opts = {}) {
    const selfHealingEnabled = opts.selfHealingEnabled ?? false;
    const reapEnabled = opts.reapDeadClaims ?? false;
    const singleActive = opts.singleActive ?? true;
    const fencing = opts.fencing ?? false;
    const gossip = opts.gossip ?? false;
    const t0 = Date.now();
    state.tick++;
    state.totalTicks++;
    let tickErrors = 0;
    let dispatched = 0;
    await writeLoopJournal(workspaceRoot, { at: new Date().toISOString(), tick: state.tick, phase: 'health', action: 'tick_start' });
    let health;
    try {
        health = await healthCheck(workspaceRoot);
        state.totalAgentsSeen = Math.max(state.totalAgentsSeen, health.entries.length);
    }
    catch (e) {
        tickErrors++;
        state.totalErrors++;
        health = { entries: [], stalledIds: [], deadIds: [], healthyCount: 0, idleCount: 0 };
        await writeLoopJournal(workspaceRoot, { at: new Date().toISOString(), tick: state.tick, phase: 'error', action: 'health_failed', detail: { error: String(e) } });
    }
    await writeLoopJournal(workspaceRoot, {
        at: new Date().toISOString(), tick: state.tick, phase: 'inbox', action: 'scan_complete',
        detail: { healthy: health.healthyCount, stalled: health.stalledIds.length, dead: health.deadIds.length },
    });
    // L1 (single-active manager): acquire the supervisor lease ONCE per tick. The
    // same lease arbitrates the fleet WRITE phases below (when `singleActive`, the
    // default) AND the HEAL phase (always a single healer). Acquiring is a lease
    // heartbeat — done outside the HALT guard so the lease keeps renewing while the
    // fleet is paused (otherwise a HALT would let a standby steal supervision; this
    // is a deliberate, benign deviation from the pre-L1 path, which let the lease go
    // stale during a HALT — nothing depends on that). On a read/write error we
    // degrade this host to a SAFE STANDBY for the tick: we prefer skipping the write
    // phases (board may stale one tick) over risking a double-write under an
    // uncertain lease. All skipped phases are idempotent re-derivations, so a solo
    // host self-corrects fully on the next tick (~30 s).
    // E2b-ii START LOOP (gated by `fencing`): write THIS loop instance's presence
    // (the JOIN/keepalive — every ticking host, so standbys are discoverable) and
    // DISCOVER the live monitor roster to project into the cluster map. The roster
    // keys on the loop-instance id (same keyspace as active_manager), the FS-canonical
    // fix for the agent-id/loop-instance keyspace gap. Single-FS only (no sockets).
    // Best-effort: a roster error must never block election. The projection is passed
    // INTO the acquire so it folds into the same wx-locked write (only the active
    // manager persists it — a standby's acquire writes nothing). Standbys are scored
    // by freshness alone (uniform need_score=1) until per-instance capability lands.
    let membership;
    if (workspaceRoot && fencing) {
        try {
            const nowIso = new Date(t0).toISOString();
            await (0, monitorRoster_1.writeMonitorPresence)(workspaceRoot, { instance_id: exports.LOOP_INSTANCE_ID, timestamp: nowIso });
            const roster = await (0, monitorRoster_1.readMonitorRoster)(workspaceRoot, { now: t0, ttlMs: supervisorLease_1.SUPERVISOR_TTL_MS });
            const monitors = (0, clusterMap_1.projectMonitors)(roster.map((r) => ({ instance_id: r.instance_id, age_ms: r.age_ms })), supervisorLease_1.SUPERVISOR_TTL_MS);
            const standbys = (0, clusterMap_1.projectStandbys)(roster.map((r) => ({ instance_id: r.instance_id, agent_id: r.agent_id, need_score: 1, age_ms: r.age_ms, last_seen: r.timestamp })), exports.LOOP_INSTANCE_ID, supervisorLease_1.SUPERVISOR_TTL_MS);
            membership = { monitors, standbys, quorum_size: (0, clusterMap_1.computeQuorumSize)(monitors.length) };
            await (0, monitorRoster_1.pruneStaleMonitorPresence)(workspaceRoot, { now: t0, ttlMs: supervisorLease_1.SUPERVISOR_TTL_MS });
        }
        catch {
            membership = undefined; // never break the tick on a roster error
        }
    }
    let sup = null;
    if (workspaceRoot) {
        try {
            sup = await (0, supervisorLease_1.acquireSupervisorRole)(workspaceRoot, exports.LOOP_INSTANCE_ID, { fencing, membership });
        }
        catch (e) {
            tickErrors++;
            state.totalErrors++;
            await writeLoopJournal(workspaceRoot, {
                at: new Date().toISOString(), tick: state.tick, phase: 'error',
                action: 'supervisor_acquire_failed', detail: { error: String(e) },
            });
        }
    }
    // When `singleActive` is on, only the active supervisor performs fleet writes
    // (gc, dispatch, promote, tally, ingest, board). When off, every ticking host
    // does (legacy). A solo host always wins the lease, so single-host behavior is
    // unchanged. The board can briefly stale during a supervisor handoff — that is
    // the intended trade for a single coherent writer.
    const isActiveManager = !singleActive || (sup?.isSupervisor ?? false);
    // E3b WAKE-ONLY gossip (gated by `gossip`, which builds on `fencing`): the ACTIVE
    // manager publishes its current cluster map for peers, and every gossip host reads
    // peer map-beats into the cross-tick tracker. CRITICAL — gossip is ADVISORY: it is
    // NEVER merged into the acquire base, NEVER used for steal/renew, and the gossiped
    // heartbeat is NEVER trusted for liveness (the adversarial review proved an
    // epoch-dominant stale beat would otherwise resurrect a deposed active + drop the
    // disk fence[] = split-brain). The wx-locked cluster-map.json the acquire ABOVE
    // already wrote stays the SOLE authority. Gossip only journals a peer-newer signal
    // so a standby learns of a takeover promptly; a stale beat can at most cause a
    // wasted observation, never a write. Best-effort: gossip never breaks the tick.
    if (workspaceRoot && fencing && gossip) {
        try {
            const bus = new clusterMapGossip_1.ClusterMapGossipBus(workspaceRoot, { selfOrigin: exports.LOOP_INSTANCE_ID });
            const disk = await (0, supervisorLease_1.readClusterMap)(workspaceRoot);
            if (isActiveManager && disk) {
                await bus.publish({ origin: exports.LOOP_INSTANCE_ID, emittedAt: new Date(t0).toISOString(), map: disk });
            }
            // Use a PER-TICK tracker over the CURRENT fresh beats — not a monotonic
            // cross-tick one. A wake signal must reflect the live bus: a dead peer's
            // stale high-epoch beat must stop journalling once it ages out of readBeats,
            // not be remembered forever. (RemoteClusterMapTracker stays the seam for a
            // future stateful consumer / the T-track.)
            const tracker = new clusterMapGossip_1.RemoteClusterMapTracker();
            tracker.mergeAll(await bus.readBeats(t0));
            const peer = tracker.best();
            if (peer && disk && (0, clusterMap_1.isStrictlyNewer)(peer, disk)
                && peer.active_manager && peer.active_manager.instance_id !== exports.LOOP_INSTANCE_ID) {
                // A peer reports a strictly-newer map naming a DIFFERENT active — surface it
                // (observability / a future board-refresh wake). The host does NOT act on it
                // here: its next acquire reconciles from DISK, so a real takeover is honored
                // and a stale beat is ignored.
                await writeLoopJournal(workspaceRoot, {
                    at: new Date().toISOString(), tick: state.tick, phase: 'log', action: 'gossip_peer_newer',
                    detail: {
                        peer_active: peer.active_manager.instance_id,
                        peer_epoch: peer.epoch, peer_term: peer.term,
                        disk_epoch: disk.epoch, disk_term: disk.term,
                    },
                });
            }
            // GC long-dead orphan beats (a crashed window leaves a beat under a defunct
            // LOOP_INSTANCE_ID that per-origin overwrite never reclaims).
            await bus.pruneStale(t0);
        }
        catch {
            /* best-effort; gossip never breaks the tick */
        }
    }
    // Reap stale/duplicate dispatch placeholders before discovering new work, so
    // the shared inbox can't accumulate them unbounded.
    if (workspaceRoot && isActiveManager) {
        try {
            const reaped = await gcStaleNextDispatches(workspaceRoot);
            if (reaped > 0) {
                await writeLoopJournal(workspaceRoot, {
                    at: new Date().toISOString(), tick: state.tick, phase: 'inbox',
                    action: 'next_dispatch_gc', detail: { removed: reaped },
                });
            }
        }
        catch { /* GC is best-effort; never break the tick */ }
        // Periodic comms GC (self-throttled to ~30min via a marker): archive the
        // shared inbox, purge aged processed/ markers, sweep orphaned .tmp turds.
        // processed/ is re-scanned by the promoter + reviewfleet every tick, so
        // keeping it bounded is the durable half of the chronic tick-cost fix.
        // Best-effort: a GC error must never break the tick.
        try {
            const gc = await (0, commsGc_1.runPeriodicCommsGc)(workspaceRoot);
            const gcWorkAvailable = gc.workAvailable?.purged ?? 0;
            const gcSessionHb = gc.sessionHeartbeats?.purged ?? 0;
            const gcDispatch = (gc.dispatchSidecars?.purgedAged ?? 0) + (gc.dispatchSidecars?.purgedOverCap ?? 0);
            if (gc.ran && ((gc.processed?.purged ?? 0) > 0 || (gc.tempRemoved ?? 0) > 0
                || (gc.archive?.archivedTelemetry ?? 0) > 0 || (gc.archive?.archivedAgedSignals ?? 0) > 0
                || gcWorkAvailable > 0 || gcSessionHb > 0 || gcDispatch > 0)) {
                await writeLoopJournal(workspaceRoot, {
                    at: new Date().toISOString(), tick: state.tick, phase: 'inbox',
                    action: 'comms_gc', detail: {
                        processedPurged: gc.processed?.purged ?? 0,
                        tempRemoved: gc.tempRemoved ?? 0,
                        archivedTelemetry: gc.archive?.archivedTelemetry ?? 0,
                        archivedAgedSignals: gc.archive?.archivedAgedSignals ?? 0,
                        workAvailablePurged: gcWorkAvailable,
                        sessionHeartbeatsPurged: gcSessionHb,
                        dispatchSidecarsPurged: gcDispatch,
                    },
                });
            }
        }
        catch { /* GC is best-effort; never break the tick */ }
    }
    // CP-2.3: evaluate the review-queue WIP gate ONCE per tick so dispatch,
    // work_available emission, and the board all honor one decision. At capacity we
    // HALT both acquisition paths ("gates, not nags"); a backstop releases any claim
    // created while gated so the fleet cannot outrun the reviewer via self-claims.
    let wipGateState;
    if (workspaceRoot && isActiveManager) {
        try {
            const { evaluateWipGate, releaseClaimsCreatedWhileGated, REVIEWER_FRESH_MS } = await Promise.resolve().then(() => require('./orchestrator/wipGate'));
            const nowMs = Date.now();
            const hbs = await (0, comms_1.readAllHeartbeats)(path.join(workspaceRoot, exports.COMMS_DIR_REL));
            const reviewers = [...new Set(hbs
                    .filter((h) => h.timestamp && (nowMs - Date.parse(h.timestamp) < REVIEWER_FRESH_MS))
                    .map((h) => h.agent_id).filter((a) => !!a))];
            wipGateState = await evaluateWipGate(workspaceRoot, { now: nowMs, reviewerCount: reviewers.length, reviewers });
            if (wipGateState.gated) {
                await writeLoopJournal(workspaceRoot, {
                    at: new Date().toISOString(), tick: state.tick, phase: 'dispatch',
                    action: 'wip_gated',
                    detail: { depth: wipGateState.depth, cap: wipGateState.cap, reviewer_count: wipGateState.reviewer_count },
                });
                if (wipGateState.closed_at) {
                    const rel = await releaseClaimsCreatedWhileGated(workspaceRoot, { closedAtMs: Date.parse(wipGateState.closed_at), now: nowMs, apply: true });
                    if (rel.released.length > 0) {
                        await writeLoopJournal(workspaceRoot, {
                            at: new Date().toISOString(), tick: state.tick, phase: 'dispatch',
                            action: 'wip_claims_released',
                            detail: { released: rel.released.map((r) => ({ task: r.task_id, owner: r.owner })) },
                        });
                    }
                }
            }
        }
        catch {
            wipGateState = undefined;
        }
    }
    // Discovery + dispatch are fleet writes (next-dispatch placeholders + runner
    // dispatch) — only the active manager runs them, so two windows sharing a
    // project never double-dispatch the same task. Halted when the WIP gate is
    // closed (CP-2.3) — the review queue is at capacity.
    const work = (isActiveManager && !wipGateState?.gated) ? await discoverWork(workspaceRoot, health) : [];
    if (work.length > 0) {
        for (const w of work.slice(0, 2)) {
            try {
                const sidecar = await dispatchWork(workspaceRoot, w.item, 'individual', { generateContextPack: true, recordToKg: true });
                if (sidecar) {
                    dispatched++;
                    state.totalDispatches++;
                }
            }
            catch (e) {
                tickErrors++;
                state.totalErrors++;
            }
        }
    }
    // AWL-RUN-1 auto-hook: opt-in (autoclaw.workflows.autoExperiment, default
    // OFF), active-manager-only, and only on ticks that actually dispatched —
    // the learning loop feeds on fresh outcomes, not idle ticks. The service is
    // internally rate-limited (one cycle per 6h marker) and never throws.
    if (workspaceRoot && isActiveManager && dispatched > 0 && opts.autoExperiment) {
        try {
            const { maybeRunAwlAfterDispatch } = await Promise.resolve().then(() => require('./workflows/awlService'));
            const awl = await maybeRunAwlAfterDispatch({ workspaceRoot, enabled: true });
            if (awl.ran) {
                await writeLoopJournal(workspaceRoot, {
                    at: new Date().toISOString(), tick: state.tick, phase: 'work',
                    action: 'awl_cycle_ran', detail: {
                        experiments: awl.report?.experimentsRun ?? 0,
                        promotions: awl.report?.promotions.length ?? 0,
                        reason: awl.reason,
                    },
                });
            }
        }
        catch (e) {
            // Learning must never cost a tick — record and move on.
            await writeLoopJournal(workspaceRoot, {
                at: new Date().toISOString(), tick: state.tick, phase: 'error',
                action: 'awl_cycle_failed', detail: { error: String(e) },
            });
        }
    }
    // Auto-promote any new task_complete in shared/ into peer review_requests.
    // L1: the promote/tally/ingest/board WRITE phases run only on the active
    // manager (gated by `isActiveManager`); standby hosts skip them and defer to
    // the supervisor. HEAL stays gated on the lease independently (single healer).
    if (workspaceRoot && isActiveManager) {
        try {
            const promo = await (0, peerReviewWatcher_1.promotePendingTaskCompletes)({
                workspaceRoot,
                fromAgent: 'orchestrator-loop',
            });
            if (promo.promoted > 0) {
                await writeLoopJournal(workspaceRoot, {
                    at: new Date().toISOString(), tick: state.tick, phase: 'dispatch',
                    action: 'peer_reviews_promoted',
                    detail: { promoted: promo.promoted, promotions: promo.promotions },
                });
                // Real-time KG: remember each completion as a durable fact (best-effort).
                try {
                    const { recordOrchestrationEventsToKg } = await Promise.resolve().then(() => require('./intelligence'));
                    await recordOrchestrationEventsToKg(workspaceRoot, promo.promotions.map((p) => ({
                        type: 'completion',
                        eventId: p.sourceMessageId,
                        agentId: p.author,
                        taskId: p.taskId,
                        text: `${p.author} completed ${p.taskId ?? 'a task'} (now in peer review).`,
                    })));
                }
                catch { /* best-effort — never break the tick */ }
            }
        }
        catch (e) {
            tickErrors++;
            state.totalErrors++;
            await writeLoopJournal(workspaceRoot, {
                at: new Date().toISOString(), tick: state.tick, phase: 'error',
                action: 'peer_review_promotion_failed', detail: { error: String(e) },
            });
        }
        // L3: the freshly-written board (claimable lane) drives the work_available
        // wake pass after writeBoard below. review_resolved reconciles from
        // consensus/resolved/ directly, so it needs no tick-scoped capture.
        let boardThisTick = null;
        // Process acked control commands (CP-4.5) BEFORE the tally, so a human's
        // review_decision writes its vote and the SAME tick resolves the review +
        // reopens the WIP gate. The host-neutral handler composes the CP-4.1 preflight
        // + the CP-4.2 executor; it is mounted here and (later) in the extension.
        try {
            const { processControlCommands } = await Promise.resolve().then(() => require('./fleet/controlHandler'));
            const ctl = await processControlCommands(workspaceRoot);
            if (ctl.processed > 0) {
                await writeLoopJournal(workspaceRoot, {
                    at: new Date().toISOString(), tick: state.tick, phase: 'work',
                    action: 'control_commands_processed',
                    detail: { applied: ctl.applied, rejected: ctl.rejected, noop: ctl.noop },
                });
            }
        }
        catch (e) {
            tickErrors++;
            state.totalErrors++;
            await writeLoopJournal(workspaceRoot, {
                at: new Date().toISOString(), tick: state.tick, phase: 'error',
                action: 'control_commands_failed', detail: { error: String(e) },
            });
        }
        // Auto-tally any consensus/active/ vote sets that have reached a verdict:
        // write consensus/resolved/<task>.json and clear the active stub. Closes the
        // loop the watcher opens so no operator hand-writes it.
        try {
            // Liveness input for the tally (CP-0.1): a declared reviewer offline past
            // the grace window who never voted must not block a review permanently.
            // The active set is agents with a fresh, non-halted heartbeat — the same
            // liveness notion the claim reaper uses. Best-effort: no presence data →
            // the tally stays liveness-agnostic (unchanged behavior).
            let activeReviewers;
            try {
                const hbs = await (0, comms_1.readAllHeartbeats)(path.join(workspaceRoot, exports.COMMS_DIR_REL));
                activeReviewers = (0, claimReaper_1.liveFromHeartbeats)(hbs, Date.now()).agents;
            }
            catch { /* no presence data — leave undefined */ }
            // reviseMaxRounds:2 — on a dissent verdict (request_changes/reject) the
            // author gets one automatic "respond before we re-tally" round instead of
            // an immediate finalize; an approval or a second-round dissent finalizes.
            const tally = await (0, consensusTally_1.resolvePendingConsensus)({
                workspaceRoot, resolvedBy: 'orchestrator-loop', reviseMaxRounds: 2,
                ...(activeReviewers ? { activeReviewers } : {}),
            });
            if (tally.resolved.length > 0) {
                await writeLoopJournal(workspaceRoot, {
                    at: new Date().toISOString(), tick: state.tick, phase: 'work',
                    action: 'consensus_resolved', detail: { resolved: tally.resolved },
                });
            }
            if (tally.revised.length > 0) {
                await writeLoopJournal(workspaceRoot, {
                    at: new Date().toISOString(), tick: state.tick, phase: 'work',
                    action: 'consensus_revision_requested', detail: { revised: tally.revised },
                });
            }
            // Surface panels stuck on offline reviewers + orphan votes so they are
            // visible (and later re-selectable) rather than silently stalled forever.
            if ((tally.reselectionNeeded?.length ?? 0) > 0 || (tally.orphanPendingVotes?.length ?? 0) > 0) {
                await writeLoopJournal(workspaceRoot, {
                    at: new Date().toISOString(), tick: state.tick, phase: 'work',
                    action: 'consensus_needs_attention',
                    detail: {
                        reselection_needed: tally.reselectionNeeded ?? [],
                        orphan_pending_votes: tally.orphanPendingVotes ?? [],
                    },
                });
            }
            // …and ACT on the stuck panels: draft live reviewers onto stubs whose
            // whole declared panel is dead-and-silent (the terminal stall the tally
            // cannot resolve honestly). Same live-agent set the tally used — one
            // liveness notion. Author-COI + cooldown + audit trail live in the
            // module; a sweep with nothing viable is a no-op.
            if ((tally.reselectionNeeded?.length ?? 0) > 0 && activeReviewers && activeReviewers.size > 0) {
                const { reassignDeadReviewers } = await Promise.resolve().then(() => require('./orchestrator/reviewerReassign'));
                const swap = await reassignDeadReviewers(workspaceRoot, tally.reselectionNeeded, activeReviewers);
                if (swap.reassigned.length > 0) {
                    await writeLoopJournal(workspaceRoot, {
                        at: new Date().toISOString(), tick: state.tick, phase: 'work',
                        action: 'reviewers_reassigned',
                        detail: {
                            reassigned: swap.reassigned.map((p) => ({ task_id: p.task_id, removed: p.removed_dead, added: p.added })),
                            skipped: swap.skipped,
                        },
                    });
                }
            }
        }
        catch (e) {
            tickErrors++;
            state.totalErrors++;
            await writeLoopJournal(workspaceRoot, {
                at: new Date().toISOString(), tick: state.tick, phase: 'error',
                action: 'consensus_tally_failed', detail: { error: String(e) },
            });
        }
        // Done-means-approved (CP-2.4): reconcile state.json task lanes from live
        // signals — claim→in_progress, review_opened→in_review, consensus_approved→
        // merged — so the Done/merged lane keys on APPROVAL, not on task_complete
        // arrival. Forward-only + idempotent; the previously-dormant
        // boardAutotransition is now the single lane-transition authority. Runs after
        // the tally so a just-resolved approval transitions in the same tick.
        try {
            const { applyBoardAutoTransition } = await Promise.resolve().then(() => require('./orchestrator/boardAutotransition'));
            const auto = await applyBoardAutoTransition(workspaceRoot);
            if (auto.transitions.length > 0) {
                await writeLoopJournal(workspaceRoot, {
                    at: new Date().toISOString(), tick: state.tick, phase: 'work',
                    action: 'board_autotransition', detail: { transitions: auto.transitions },
                });
            }
        }
        catch (e) {
            tickErrors++;
            state.totalErrors++;
            await writeLoopJournal(workspaceRoot, {
                at: new Date().toISOString(), tick: state.tick, phase: 'error',
                action: 'board_autotransition_failed', detail: { error: String(e) },
            });
        }
        // Logjam breaker: reviews overdue past the SLA window get ONE clearly
        // labeled synthesized position note (from the author's own handoff note —
        // never a fabricated vote; tallyConsensus ignores it) plus a reminder, so
        // consensus threads advance instead of stalling on a silent reviewer.
        // Runs AFTER the tally so fresh votes resolve before we call anything
        // overdue. Idempotent per review_request via consensus/_logjam/ markers.
        try {
            const jam = await (0, logjamBreaker_1.breakLogjams)({ workspaceRoot, fromAgent: 'orchestrator-loop' });
            if (jam.synthesized.length > 0 || jam.reminders.length > 0) {
                await writeLoopJournal(workspaceRoot, {
                    at: new Date().toISOString(), tick: state.tick, phase: 'work',
                    action: 'review_logjams_broken', detail: {
                        overdue: jam.overdue.length,
                        synthesized: jam.synthesized.length,
                        reminders: jam.reminders.length,
                        skippedStale: jam.skippedStale,
                        errors: jam.errors,
                    },
                });
            }
        }
        catch (e) {
            tickErrors++;
            state.totalErrors++;
            await writeLoopJournal(workspaceRoot, {
                at: new Date().toISOString(), tick: state.tick, phase: 'error',
                action: 'logjam_break_failed', detail: { error: String(e) },
            });
        }
        // Spine ingest (CP-1.4): index the existing event sources into the SQLite
        // spine. SINGLE-WRITER — this whole block is isActiveManager-gated, so the
        // store is opened read-WRITE here (only the active manager holds the lease)
        // and closed immediately; no standby ever writes it. Idempotent by event_id,
        // budget-bounded (files/bytes/enumeration) so a big dir can't blow the tick.
        // First tick per process backfills (30d cutoff); steady state is incremental.
        try {
            const { openSpineStore } = await Promise.resolve().then(() => require('./spine/index'));
            const { runSpineIngest, ALL_ADAPTERS } = await Promise.resolve().then(() => require('./spine/ingest/wave1'));
            const backfilled = spineBackfilledByRoot.get(workspaceRoot) ?? false;
            const store = openSpineStore(workspaceRoot);
            try {
                const report = await runSpineIngest({
                    workspaceRoot, store, adapters: ALL_ADAPTERS, now: Date.now(),
                    ...(backfilled ? {} : { mode: { backfill: true, cutoffMs: Date.now() - 30 * 24 * 60 * 60 * 1000 } }),
                });
                if (!backfilled) {
                    spineBackfilledByRoot.set(workspaceRoot, true);
                }
                if (report.totalEvents > 0 || report.alarms.length > 0 || report.backfillComplete.length > 0) {
                    await writeLoopJournal(workspaceRoot, {
                        at: new Date().toISOString(), tick: state.tick, phase: 'work',
                        action: 'spine_ingest',
                        detail: {
                            events: report.totalEvents,
                            backfill_complete: report.backfillComplete,
                            alarms: report.alarms,
                            budget_exhausted: report.budgetExhausted,
                        },
                    });
                }
            }
            finally {
                store.close();
            }
        }
        catch (e) {
            tickErrors++;
            state.totalErrors++;
            await writeLoopJournal(workspaceRoot, {
                at: new Date().toISOString(), tick: state.tick, phase: 'error',
                action: 'spine_ingest_failed', detail: { error: String(e) },
            });
        }
        // HRW-1: fold task_complete / scope_violation into earned résumés (the
        // talent pool, HR-1). Idempotent via a per-workspace watermark; no-op when
        // there are no new signals. Distinct from the consensus/HEAL blocks above.
        try {
            const ing = await (0, workforceIngest_1.ingestWorkforceSignals)(workspaceRoot);
            if (ing.ingested > 0) {
                await writeLoopJournal(workspaceRoot, {
                    at: new Date().toISOString(), tick: state.tick, phase: 'work',
                    action: 'workforce_ingest', detail: { ingested: ing.ingested, byAgent: ing.byAgent },
                });
            }
        }
        catch (e) {
            tickErrors++;
            state.totalErrors++;
            await writeLoopJournal(workspaceRoot, {
                at: new Date().toISOString(), tick: state.tick, phase: 'error',
                action: 'workforce_ingest_failed', detail: { error: String(e) },
            });
        }
        // Materialize the task catalog into state.tasks[] BEFORE the board write, so
        // the board surfaces claimable work instead of an empty lane (L0). Idempotent
        // + digest-gated, so a steady-state tick is a cheap no-op.
        try {
            const ing = await (0, taskCatalogIngest_1.ingestTaskCatalog)({ workspaceRoot });
            if (ing.changed) {
                await writeLoopJournal(workspaceRoot, {
                    at: new Date().toISOString(), tick: state.tick, phase: 'log',
                    action: 'task_catalog_ingested',
                    detail: { count: ing.count, sprints: ing.sources.sprints, markdown: ing.sources.markdown },
                });
            }
        }
        catch (e) {
            tickErrors++;
            state.totalErrors++;
            await writeLoopJournal(workspaceRoot, {
                at: new Date().toISOString(), tick: state.tick, phase: 'error',
                action: 'task_catalog_ingest_failed', detail: { error: String(e) },
            });
        }
        // Refresh the agendaboard (board.md + board.json).
        try {
            boardThisTick = (await (0, boardWriter_1.writeBoard)({
                workspaceRoot, generator: 'orchestrator-loop',
                ...(wipGateState ? { wipGate: { gated: wipGateState.gated, depth: wipGateState.depth, cap: wipGateState.cap, reviewer_count: wipGateState.reviewer_count, reason: wipGateState.reason } } : {}),
            })).board;
        }
        catch (e) {
            tickErrors++;
            state.totalErrors++;
            await writeLoopJournal(workspaceRoot, {
                at: new Date().toISOString(), tick: state.tick, phase: 'error',
                action: 'board_write_failed', detail: { error: String(e) },
            });
        }
        // L3: WAKE IDLE PEERS. The active supervisor (this whole block is
        // isActiveManager-gated, so a standby nudges nothing) writes board-grounded
        // wake nudges to per-agent inboxes — the universal wake a chat-only IDE agent
        // polls. (a) work_available: match each idle agent to a specific claimable
        // task; (b) review_resolved: tell each task author its verdict landed. Both
        // deduped (recent-nudge window + a _notified wx ledger). Best-effort.
        try {
            // work_available emission is HALTED when the WIP gate is closed (CP-2.3) —
            // the review queue is at capacity, so nudging idle peers to claim more work
            // would just deepen the unreviewable backlog (fixes the flood at its cause).
            if (boardThisTick && boardThisTick.claimable.length > 0 && !wipGateState?.gated) {
                const claimed = await readClaimedAgentIds(workspaceRoot);
                const recentlyWoken = await (0, wakeIdlePeers_1.readRecentlyWoken)(workspaceRoot);
                const idleIds = health.entries
                    .filter((e) => e.state === 'alive')
                    .map((e) => e.agentId)
                    .filter((id) => !claimed.has(id) && !recentlyWoken.has(id));
                const idle = await (0, wakeIdlePeers_1.readIdleAgentProfiles)(workspaceRoot, idleIds);
                const wake = await (0, wakeIdlePeers_1.wakeIdlePeers)({
                    workspaceRoot, claimable: boardThisTick.claimable, idle, recentlyWoken,
                });
                if (wake.nudged.length > 0) {
                    await writeLoopJournal(workspaceRoot, {
                        at: new Date().toISOString(), tick: state.tick, phase: 'dispatch',
                        action: 'work_available_nudged',
                        detail: { nudged: wake.nudged.map((m) => ({ agent: m.agentId, task: m.task.task_id })) },
                    });
                }
            }
            // review_resolved: reconcile consensus/resolved/ vs _notified/ and tell any
            // not-yet-notified author its verdict (self-healing; cheap no-op when none).
            const notify = await (0, wakeIdlePeers_1.notifyReviewResolved)({ workspaceRoot });
            if (notify.notified.length > 0) {
                await writeLoopJournal(workspaceRoot, {
                    at: new Date().toISOString(), tick: state.tick, phase: 'work',
                    action: 'review_resolved_notified', detail: { authors: notify.notified },
                });
            }
        }
        catch (e) {
            tickErrors++;
            state.totalErrors++;
            await writeLoopJournal(workspaceRoot, {
                at: new Date().toISOString(), tick: state.tick, phase: 'error',
                action: 'wake_idle_peers_failed', detail: { error: String(e) },
            });
        }
        // HEAL phase (SH-1/SH-2) — runs AFTER the board write so signals are fresh.
        // Only the active supervisor heals (the lease arbitrates between hosts; a
        // stale holder is taken over by the next ticking loop). Act-then-report:
        // bounded, reversible recovery + a finding_report per action; never master.
        // Skipped while the fleet is HALTed. Fully guarded — never breaks the tick.
        //
        // Follow-up #3 GATE: the act-then-report HEAL phase only runs when the
        // operator OPTS IN (`selfHealingEnabled`, default FALSE). When it is off the
        // `runHealPhase` call below is skipped entirely — ZERO fleet mutation and
        // ZERO HEAL finding_reports, identical to a loop that never opted in. The
        // supervisor lease + recall sweep are NOT gated by it, so non-HEAL
        // supervisor behavior is unchanged whether or not self-healing is enabled.
        try {
            if (!(0, fleetHalt_1.isFleetHalted)(workspaceRoot)) {
                // Reuse the lease acquired once at the top of the tick (no re-acquire —
                // that would double the heartbeat write and open a TOCTOU window).
                if (sup?.isSupervisor) {
                    if (selfHealingEnabled) {
                        const heal = await (0, heal_1.runHealPhase)(workspaceRoot, { mode: 'act' });
                        if (heal.actions.length > 0 || sup?.stole) {
                            await writeLoopJournal(workspaceRoot, {
                                at: new Date().toISOString(), tick: state.tick, phase: 'work',
                                action: 'heal', detail: {
                                    summary: heal.summary, stolen: heal.stolen,
                                    findings: heal.findingsEmitted, took_over: sup?.stole,
                                },
                            });
                        }
                    }
                    else if (sup?.stole) {
                        // Self-healing disabled: do NOT act/report. Still record the lease
                        // takeover for audit (internal journal only — not a fleet finding).
                        await writeLoopJournal(workspaceRoot, {
                            at: new Date().toISOString(), tick: state.tick, phase: 'work',
                            action: 'heal_disabled', detail: { took_over: sup?.stole },
                        });
                    }
                    // CL-3: dead-session claim reaper — RELEASE-ONLY and gated SEPARATELY
                    // from self-healing (it never acts on live work, dispatches, or git;
                    // it only frees a task whose owning session is dead AND whose claim is
                    // expired, archiving the claim file for audit). Safe with HEAL off.
                    if (reapEnabled) {
                        const reap = await (0, claimReaper_1.reapDeadClaims)(workspaceRoot, { apply: true });
                        if (reap.reaped.length > 0) {
                            await writeLoopJournal(workspaceRoot, {
                                at: new Date().toISOString(), tick: state.tick, phase: 'work',
                                action: 'reap_claims', detail: {
                                    reaped: reap.reaped.length, scanned: reap.scanned,
                                    tasks: reap.reaped.map(r => r.task_id),
                                },
                            });
                        }
                    }
                    // HRW-3: supervisor-only roster-gated recall sweep (no-op without
                    // .autoclaw/orchestrator/roster.json). Keeps the establishment staffed.
                    const sweep = await (0, recallDispatch_1.runRecallSweep)(workspaceRoot);
                    if (!sweep.skipped && sweep.dispatched) {
                        await writeLoopJournal(workspaceRoot, {
                            at: new Date().toISOString(), tick: state.tick, phase: 'work',
                            action: 'recall_sweep', detail: {
                                recalled: sweep.dispatched.recalled, hires: sweep.dispatched.hires,
                                gaps: sweep.dispatched.gaps,
                            },
                        });
                    }
                }
                else {
                    await writeLoopJournal(workspaceRoot, {
                        at: new Date().toISOString(), tick: state.tick, phase: 'work',
                        action: 'heal_standby', detail: { supervisor: sup?.holder ?? 'unknown' },
                    });
                }
            }
        }
        catch (e) {
            tickErrors++;
            state.totalErrors++;
            await writeLoopJournal(workspaceRoot, {
                at: new Date().toISOString(), tick: state.tick, phase: 'error',
                action: 'heal_failed', detail: { error: String(e) },
            });
        }
    }
    // L1: record when this host stood by (single-active gated it off this tick) so
    // the deferral to the active supervisor is auditable.
    if (workspaceRoot && !isActiveManager) {
        await writeLoopJournal(workspaceRoot, {
            at: new Date().toISOString(), tick: state.tick, phase: 'log',
            action: 'manager_standby', detail: { supervisor: sup?.holder ?? null },
        });
    }
    state.lastTickAt = new Date().toISOString();
    const durationMs = Date.now() - t0;
    // Persist state to disk so external tools can audit loop progress.
    if (workspaceRoot) {
        try {
            await writeLoopState(workspaceRoot, state);
        }
        catch { /* best-effort */ }
    }
    await writeLoopJournal(workspaceRoot, {
        at: new Date().toISOString(), tick: state.tick, phase: 'log', action: 'tick_complete',
        detail: { durationMs, workFound: work.length, dispatched, errors: tickErrors },
    });
    return { tick: state.tick, durationMs, health, workFound: work, dispatched, errors: tickErrors };
}
// ---------------------------------------------------------------------------
// Loop lifecycle
// ---------------------------------------------------------------------------
function startOrchestratorLoop(opts = {}) {
    const workspaceRoot = opts.workspaceRoot ?? '';
    const tickMs = opts.tickMs ?? exports.DEFAULT_TICK_MS;
    // Follow-up #3: OFF by default — the loop only auto-heals when the operator
    // opts in (extension.ts reads `autoclaw.selfHealing.enabled` and passes it).
    const selfHealingEnabled = opts.selfHealingEnabled ?? false;
    // CL-3: OFF by default — release-only dead-session claim reaping when the
    // operator opts in (`autoclaw.selfHealing.reapDeadClaims`).
    const reapDeadClaimsEnabled = opts.reapDeadClaims ?? false;
    // L1: ON by default — only the active supervisor host runs the fleet WRITE
    // phases each tick (`autoclaw.cluster.singleActive`).
    const singleActive = opts.singleActive ?? true;
    // E1c: OFF by default — wx-lock-serialized acquire + live epoch/term + fencing
    // only when the operator opts in (`autoclaw.cluster.fencing`).
    const fencing = opts.fencing ?? false;
    // E3b: OFF by default — WAKE-ONLY cluster-map gossip (`autoclaw.cluster.gossip`).
    const gossip = opts.gossip ?? false;
    // AWL-RUN-1: OFF by default — auto experiment cycle after dispatching ticks
    // (`autoclaw.workflows.autoExperiment`).
    const autoExperiment = opts.autoExperiment ?? false;
    let running = true;
    let timerId = null;
    const state = freshLoopState();
    // Load persisted balance on start.
    if (workspaceRoot) {
        readPersistedLoopState(workspaceRoot).then(s => Object.assign(state, s)).catch(() => { });
    }
    const kick = async () => {
        if (!running)
            return;
        try {
            const result = await runTick(workspaceRoot, state, { selfHealingEnabled, reapDeadClaims: reapDeadClaimsEnabled, singleActive, fencing, gossip, autoExperiment });
            if (workspaceRoot)
                await writeLoopState(workspaceRoot, state);
            opts.onTick?.(result);
        }
        catch (e) {
            state.totalErrors++;
            if (workspaceRoot)
                await writeLoopState(workspaceRoot, state);
            console.error('[orchestrator-loop] tick error:', e);
        }
    };
    timerId = setInterval(kick, tickMs);
    kick().catch(() => { });
    return {
        stop() { running = false; if (timerId) {
            clearInterval(timerId);
            timerId = null;
        } },
        tickNow() { return kick(); },
        getState() { return state; },
        isRunning() { return running; },
    };
}
// ---------------------------------------------------------------------------
// Agent registry join
// ---------------------------------------------------------------------------
async function getAgentRegistry(workspaceRoot, health) {
    const registryPath = path.join(workspaceRoot, exports.COMMS_DIR_REL, 'registry.json');
    let entries = [];
    try {
        const raw = await fsPromises.readFile(registryPath, 'utf8');
        const parsed = JSON.parse(raw);
        entries = (parsed.agents ?? []).map((a) => ({ id: a.id, inbox_path: a.inbox_path }));
    }
    catch { /* no registry yet */ }
    return entries.map((entry) => {
        const hb = health.entries.find((e) => e.agentId === entry.id);
        return {
            id: entry.id,
            vendor: vendorFromId(entry.id),
            inbox: entry.inbox_path ?? inboxDir(workspaceRoot, entry.id),
            lastHeartbeatAt: hb?.lastHeartbeatAt ?? null,
            state: hb?.state ?? 'unknown',
        };
    });
}
//# sourceMappingURL=orchestratorLoop.js.map