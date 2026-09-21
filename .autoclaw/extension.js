"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KDreamViewProvider = exports.checkZippyMeshHealth = exports.getTodayLogPath = exports.getStatePath = exports.getMemoryPath = exports.getTodayDate = exports.shouldShowNotificationHelper = exports.generateNonce = exports.DEFAULT_ADAPTERS = exports.isAdapterDetected = exports.getAdapterHealthEntry = exports.isExcludedTodoPath = exports.buildTodoScanExcludeGlob = exports.parseTodosFromContent = exports.parseLogEntries = exports.addAutoclawToGitignore = exports.isAutoclawInGitignore = exports.createInitialMemoryContent = exports.addTaskToContent = exports.parseMemoryTasks = exports.recordTaskDuration = void 0;
exports.activate = activate;
exports.computeKiloModesContent = computeKiloModesContent;
exports.getZippyMeshCandidatePaths = getZippyMeshCandidatePaths;
exports.getCodeChurnMetrics = getCodeChurnMetrics;
exports.getProductivityInsights = getProductivityInsights;
exports.getProjectHealthIndicators = getProjectHealthIndicators;
exports.refreshDashboardData = refreshDashboardData;
exports._resetZmlrHealthCache = _resetZmlrHealthCache;
exports.getCachedZippyMeshHealth = getCachedZippyMeshHealth;
exports.getAdapterHealth = getAdapterHealth;
exports.shouldShowNotification = shouldShowNotification;
exports.addTaskToMemory = addTaskToMemory;
exports.checkAndOfferGitignoreUpdate = checkAndOfferGitignoreUpdate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
/**
 * Helper: run a git subcommand asynchronously in a workspace and return stdout.
 * Falls back to empty string on any error so callers can stay simple.
 */
async function runGit(cwd, args) {
    try {
        const { stdout } = await execFileAsync('git', args, { cwd, encoding: 'utf8' });
        return stdout;
    }
    catch {
        return '';
    }
}
const kdream_helpers_1 = require("./kdream-helpers");
Object.defineProperty(exports, "parseMemoryTasks", { enumerable: true, get: function () { return kdream_helpers_1.parseMemoryTasks; } });
Object.defineProperty(exports, "addTaskToContent", { enumerable: true, get: function () { return kdream_helpers_1.addTaskToContent; } });
Object.defineProperty(exports, "createInitialMemoryContent", { enumerable: true, get: function () { return kdream_helpers_1.createInitialMemoryContent; } });
Object.defineProperty(exports, "isAutoclawInGitignore", { enumerable: true, get: function () { return kdream_helpers_1.isAutoclawInGitignore; } });
Object.defineProperty(exports, "addAutoclawToGitignore", { enumerable: true, get: function () { return kdream_helpers_1.addAutoclawToGitignore; } });
Object.defineProperty(exports, "parseLogEntries", { enumerable: true, get: function () { return kdream_helpers_1.parseLogEntries; } });
Object.defineProperty(exports, "parseTodosFromContent", { enumerable: true, get: function () { return kdream_helpers_1.parseTodosFromContent; } });
Object.defineProperty(exports, "buildTodoScanExcludeGlob", { enumerable: true, get: function () { return kdream_helpers_1.buildTodoScanExcludeGlob; } });
Object.defineProperty(exports, "isExcludedTodoPath", { enumerable: true, get: function () { return kdream_helpers_1.isExcludedTodoPath; } });
Object.defineProperty(exports, "getAdapterHealthEntry", { enumerable: true, get: function () { return kdream_helpers_1.getAdapterHealthEntry; } });
Object.defineProperty(exports, "isAdapterDetected", { enumerable: true, get: function () { return kdream_helpers_1.isAdapterDetected; } });
Object.defineProperty(exports, "DEFAULT_ADAPTERS", { enumerable: true, get: function () { return kdream_helpers_1.DEFAULT_ADAPTERS; } });
Object.defineProperty(exports, "generateNonce", { enumerable: true, get: function () { return kdream_helpers_1.generateNonce; } });
Object.defineProperty(exports, "shouldShowNotificationHelper", { enumerable: true, get: function () { return kdream_helpers_1.shouldShowNotification; } });
Object.defineProperty(exports, "getTodayDate", { enumerable: true, get: function () { return kdream_helpers_1.getTodayDate; } });
Object.defineProperty(exports, "getMemoryPath", { enumerable: true, get: function () { return kdream_helpers_1.getMemoryPath; } });
Object.defineProperty(exports, "getStatePath", { enumerable: true, get: function () { return kdream_helpers_1.getStatePath; } });
Object.defineProperty(exports, "getTodayLogPath", { enumerable: true, get: function () { return kdream_helpers_1.getTodayLogPath; } });
Object.defineProperty(exports, "checkZippyMeshHealth", { enumerable: true, get: function () { return kdream_helpers_1.checkZippyMeshHealth; } });
const doctor_1 = require("./doctor");
const snapshot_1 = require("./snapshot");
const autobuild_1 = require("./autobuild");
const orchestrate_1 = require("./orchestrate");
const consensusActiveScan_1 = require("./orchestrator/consensusActiveScan");
const chatparticipant_1 = require("./chatparticipant");
const intelligence_commands_1 = require("./intelligence-commands");
const command_1 = require("./workflows/command");
const intelligence_1 = require("./intelligence");
const intelligence_2 = require("./intelligence");
const orientation_1 = require("./intelligence/orientation");
const contract_1 = require("./intelligence/contract");
const intelligenceDashboard_1 = require("./views/intelligenceDashboard");
const healthSurface_1 = require("./intelligence/healthSurface");
const managerPanel_1 = require("./manager/managerPanel");
const kgViewPanel_1 = require("./kg/kgViewPanel");
const support_1 = require("./support/support");
const licensing_1 = require("./licensing/licensing");
const gateService_1 = require("./licensing/gateService");
const premium_1 = require("./premium");
const advancedInput_1 = require("./premium/advancedInput");
const routesService_1 = require("./autopilot/routesService");
const embeddings_1 = require("./intelligence/embeddings");
const zippymesh_1 = require("./llm/zippymesh");
const comms_1 = require("./comms");
const cloud_1 = require("./cloud");
const remotePresence_1 = require("./fleet/remotePresence");
const runners_1 = require("./runners");
const reputationPreference_1 = require("./runners/reputationPreference");
const activate_1 = require("./reviewfleet/activate");
const fleetData_1 = require("./panel/fleetData");
const statusBar_1 = require("./statusbar/statusBar");
const fleetDigest_1 = require("./fleet/fleetDigest");
// Agent-fabric taxonomy via explicit subpaths (keeps the message-bus + bridge
// out of modules that only need the taxonomy).
const onboarding_1 = require("./fabric/onboarding");
const agentTypes_1 = require("./fabric/agentTypes");
// Trigger hooks + fleet HALT kill switch (HKS-1..3, agent-trigger-hooks spec).
const triggerHooks_1 = require("./hooks/triggerHooks");
// Track-record ledger (REP-1) — record reviewed-task outcomes for reputation routing.
const reputation_1 = require("./reputation");
const kgRecord_1 = require("./intelligence/kgRecord");
const webview_render_1 = require("./webview-render");
const webview_hostContext_1 = require("./webview-hostContext");
const handoff_1 = require("./orchestrator/handoff");
const consensusTally_1 = require("./orchestrator/consensusTally");
const sessionUsage_1 = require("./fleet/sessionUsage");
const webview_render_board_1 = require("./webview-render-board");
const roles_1 = require("./roles");
const architecture_1 = require("./fleet/architecture");
const beacons_1 = require("./fleet/beacons");
const lanDiscovery_1 = require("./fleet/lanDiscovery");
const lanGossipRelay_1 = require("./fleet/lanGossipRelay");
const invites_1 = require("./fleet/invites");
const pending_1 = require("./fleet/pending");
const joinPrompt_1 = require("./fleet/joinPrompt");
const roleType_1 = require("./fleet/roleType");
const teamTemplates_1 = require("./fleet/teamTemplates");
const scaffold_1 = require("./fleet/scaffold");
const authoring_1 = require("./fleet/authoring");
const taskLedger_1 = require("./taskLedger");
const allowWritesConfig_1 = require("./mcp/allowWritesConfig");
const agentCost_1 = require("./agentCost");
// LANE C: per-agent LLM-cost metrics (tokens in/out, $, dispatches). The reader
// is fs-only + swallows errors; the builder is pure. See src/fleet/fleetMetrics.ts.
const fleetMetrics_1 = require("./fleet/fleetMetrics");
// LANE B: per-agent command & control. evictAgent() is the SAFE CORE eviction
// transaction (local single-operator only — the §5 cross-machine signing gate
// is not built); the typed errors map to user-facing modals / scope-violations.
const evict_1 = require("./fleet/evict");
const fleetViewModelBuilders_1 = require("./views/fleetViewModelBuilders");
const heartbeat_1 = require("./comms/heartbeat");
const timetravel_1 = require("./timetravel");
const bridge_1 = require("./bridge");
const ide_ports_1 = require("./ide-ports");
const workspace_registry_1 = require("./workspace-registry");
const fabric_1 = require("./fabric");
const agent_card_1 = require("./agent-card");
const skillLauncher_1 = require("./skillLauncher");
const kg_1 = require("./kg");
const service_1 = require("./intelligence/kg/service");
const orchestratorLoop_1 = require("./orchestratorLoop");
const boardRefresh_1 = require("./orchestrator/boardRefresh");
const manifest_probe_1 = require("./manifest-probe");
const reconcile_1 = require("./reconcile");
const program_plane_1 = require("./program-plane");
const svid_1 = require("./svid");
const metrics_1 = require("./metrics");
Object.defineProperty(exports, "recordTaskDuration", { enumerable: true, get: function () { return metrics_1.recordTaskDuration; } });
const voteWriter_1 = require("./orchestrator/voteWriter");
const reviewAdvisoryBuild_1 = require("./orchestrator/reviewAdvisoryBuild");
const reviewReasonerWiring_1 = require("./autopilot/reviewReasonerWiring");
const reviewRecommendation_1 = require("./orchestrator/reviewRecommendation");
const claimReaper_1 = require("./orchestrator/claimReaper");
const scopeLease_1 = require("./orchestrator/scopeLease");
const announce_1 = require("./orchestrator/announce");
const commsGc_1 = require("./orchestrator/commsGc");
const fleetBrief_1 = require("./orchestrator/fleetBrief");
const dispatch_1 = require("./voidspec/dispatch");
const skills_1 = require("./skills");
const transcripts_1 = require("./skills/dream/transcripts");
const kgFacts_1 = require("./memory/kgFacts");
const project_1 = require("./intelligence/project");
const fleet_templates_1 = require("./cli/fleet-templates");
const fleet_watch_1 = require("./cli/fleet-watch");
const fsPromises = fs.promises;
let doctorOutputChannel;
let autobuildOutputChannel;
let autobuildIntervalId;
let kgOutputChannel;
let activeKg = null;
let activeRefreshService = null;
/**
 * Module-level FabricBus handle. Created during activate() based on
 * autoclaw.fabric.busDriver and closed in deactivate(). Best-effort: an
 * activation that fails to spin up the bus logs and continues — the
 * filesystem mailbox always remains the canonical durable record.
 */
let activeFabric = null;
// Review Fleet activation controller (RF-4d) — singleton; dormant until the
// user runs autoclaw.reviewFleet.start with enabled + a budget set. Stopped in deactivate().
let reviewFleetController = null;
let currentIde = 'other';
let currentWorkspace = '';
function getKgOutputChannel() {
    if (!kgOutputChannel) {
        kgOutputChannel = vscode.window.createOutputChannel('AutoClaw KG');
    }
    return kgOutputChannel;
}
/**
 * Best-effort FabricBus initializer. Reads autoclaw.fabric.busDriver and
 * autoclaw.fabric.natsUrl, instantiates the bus, and stashes it in
 * `activeFabric` for later close in deactivate(). Any error is logged and
 * swallowed — activation must not fail because the optional fast-path
 * transport is unavailable.
 */
async function initFabricBus() {
    try {
        const cfg = vscode.workspace.getConfiguration('autoclaw.fabric');
        const driver = cfg.get('busDriver', 'fs');
        const natsUrl = cfg.get('natsUrl', 'nats://127.0.0.1:4222');
        activeFabric = await (0, fabric_1.createFabricBus)({ driver, natsUrl });
        console.log(`AutoClaw FabricBus: driver=${activeFabric.driver}`);
    }
    catch (e) {
        console.warn(`AutoClaw FabricBus: initialization failed (${e.message}); continuing without fast-path bus`);
        activeFabric = null;
    }
}
/**
 * Spawn the kg-daemon if `autoclaw.kg.enabled` is true. Best-effort —
 * never throws. If deps aren't installed or the entrypoint is missing
 * we log a one-liner and skip the spawn.
 */
async function maybeStartKgDaemon(extensionPath) {
    const cfg = vscode.workspace.getConfiguration('autoclaw.kg');
    if (!cfg.get('enabled', false)) {
        return;
    }
    if (activeKg?.child && activeKg.child.exitCode === null) {
        return;
    }
    const userKgPort = cfg.get('port', 0);
    const dbPath = cfg.get('dbPath', '');
    const channel = getKgOutputChannel();
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    const idePorts = (0, ide_ports_1.getIdePorts)(currentIde, workspaceRoot || undefined);
    const kgPort = userKgPort > 0 ? userKgPort : idePorts.kgPort;
    const result = await (0, kg_1.startKgDaemon)({ extensionPath, port: kgPort, dbPath, logger: channel });
    if (result.ok) {
        activeKg = result.state;
    }
    else {
        channel.appendLine(`[kg] ${result.message}`);
        console.log(`AutoClaw KG: ${result.message}`);
    }
}
/**
 * Start the standalone per-host context refresh service when
 * `autoclaw.intelligence.autoRefresh.enabled` is true. Best-effort — never
 * throws. Idempotent: a running service is left in place. The service only
 * rewrites digests that already exist, so enabling it can never create files.
 */
function maybeStartRefreshService() {
    const cfg = vscode.workspace.getConfiguration('autoclaw.intelligence.autoRefresh');
    if (!cfg.get('enabled', false)) {
        return;
    }
    if (activeRefreshService?.running) {
        return;
    }
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        return;
    }
    const minutes = cfg.get('intervalMinutes', 30);
    try {
        activeRefreshService = (0, intelligence_1.startIntelligenceRefreshService)({
            workspaceRoot,
            intervalMs: Math.max(1, minutes) * 60000,
            log: (m) => console.log(`AutoClaw intelligence: ${m}`),
        });
    }
    catch (e) {
        console.error('AutoClaw intelligence refresh service failed to start:', e);
    }
}
/** Stop the refresh service if running. Best-effort. */
function stopRefreshService() {
    if (activeRefreshService) {
        try {
            activeRefreshService.stop();
        }
        catch { /* ignore */ }
        activeRefreshService = null;
    }
}
let activeIndexWatch = null;
/**
 * Start the always-on incremental code re-index watcher when
 * `autoclaw.intelligence.watch.enabled` is true. Best-effort, idempotent. The
 * service's path filter excludes `.autoclaw/` + ignored dirs, so the index's own
 * writes can't re-trigger it.
 */
function maybeStartIndexWatch() {
    const cfg = vscode.workspace.getConfiguration('autoclaw.intelligence.watch');
    if (!cfg.get('enabled', false)) {
        return;
    }
    if (activeIndexWatch) {
        return;
    }
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        return;
    }
    const seconds = cfg.get('debounceSeconds', 5);
    try {
        const intelConfig = (0, intelligence_2.loadConfig)(workspaceRoot);
        const handle = (0, intelligence_2.startIndexWatchService)({
            workspaceRoot,
            debounceMs: Math.max(1, seconds) * 1000,
            config: intelConfig,
            log: (m) => console.log(`AutoClaw intelligence: ${m}`),
        });
        const watcher = vscode.workspace.createFileSystemWatcher('**/*');
        const onChange = (uri) => handle.notifyChange(uri.fsPath);
        watcher.onDidChange(onChange);
        watcher.onDidCreate(onChange);
        watcher.onDidDelete(onChange);
        activeIndexWatch = { handle, watcher };
    }
    catch (e) {
        console.error('AutoClaw intelligence index watch failed to start:', e);
    }
}
/** Stop the index watch service + dispose its watcher. Best-effort. */
function stopIndexWatch() {
    if (activeIndexWatch) {
        try {
            activeIndexWatch.handle.stop();
        }
        catch { /* ignore */ }
        try {
            activeIndexWatch.watcher.dispose();
        }
        catch { /* ignore */ }
        activeIndexWatch = null;
    }
}
let kdreamView = undefined;
let stateWatcher = undefined;
// L2: consumer-side watcher — refresh the visible sidebar the instant board.json lands.
let boardWatcher = undefined;
let refreshIntervalId = undefined;
/**
 * Run a paid-feature command behind the licensing gate. First meaningful use
 * starts the 7-day Pro trial; during trial or with a license `runPaid` runs;
 * otherwise `gate.require` shows ONE polite upgrade prompt and `runFallback`
 * (if any) runs. Never throws/blocks — local-first, graceful degradation.
 */
async function withGate(context, feature, reason, runPaid, runFallback) {
    const gate = new gateService_1.GateService(context);
    const result = await gate.require(feature, { startTrial: true, reason });
    if (result.allowed) {
        await runPaid();
    }
    else if (runFallback) {
        await runFallback();
    }
}
/* -------------------------------------------------------------------------- */
/*  /dream + /recall — memory-skill host adapters                             */
/* -------------------------------------------------------------------------- */
/**
 * Facts for the memory skills come from the ONE persisted fact store this repo
 * has: the in-process Knowledge Graph (`.autoclaw/kg/kg.db`), projected into
 * `BitemporalFact` by `memory/kgFacts.ts`. Transcripts come from the Source
 * Adapter registry — the same ingested sessions `/learn` reads.
 *
 * Degrade-safe by construction: a degraded (no SQLite driver) or disabled
 * (`autoclaw.kg.enabled=false`) KG reads as `[]`. We surface THAT distinction to
 * the user rather than silently reporting "no facts".
 */
function memoryKgFacts(workspaceRoot) {
    const handle = (0, service_1.getKnowledgeGraph)({ workspaceRoot });
    return (0, kgFacts_1.loadKgFacts)(handle.kg);
}
/** Human explanation when the KG cannot serve facts. `null` when it is healthy. */
function memoryStoreUnavailableReason(workspaceRoot) {
    const handle = (0, service_1.getKnowledgeGraph)({ workspaceRoot });
    if (handle.disabled) {
        return 'the knowledge graph is turned off (autoclaw.kg.enabled = false)';
    }
    if (handle.degraded) {
        return 'the knowledge-graph store is degraded (no SQLite driver) — run "AutoClaw: Intelligence — Install Vector Backend"';
    }
    return null;
}
/**
 * Fill in the arguments a memory-skill handler needs when the command is
 * invoked bare from the command palette (programmatic callers — MCP, tests —
 * pass their own args and are passed straight through).
 *
 * Returns `null` when the user cancelled.
 */
async function fillMemorySkillArgs(commandId, args) {
    const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (commandId === 'autoclaw.dream') {
        if (args[0] && typeof args[0] === 'object') {
            return args;
        }
        if (!root) {
            vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
            return null;
        }
        const input = {
            transcripts: await (0, transcripts_1.loadRecentTranscripts)(root),
            existingFacts: await memoryKgFacts(root),
            sourceFiles: [],
            codeIndex: { files: [], symbols: [] },
        };
        return [input];
    }
    if (commandId === 'autoclaw.recall') {
        const facts = Array.isArray(args[0])
            ? args[0]
            : root ? await memoryKgFacts(root) : [];
        let query = typeof args[1] === 'string' ? args[1] : '';
        if (!query) {
            const typed = await vscode.window.showInputBox({
                prompt: 'Recall from AutoClaw memory',
                placeHolder: 'What do you want to remember?',
            });
            if (typed === undefined) {
                return null;
            } // cancelled
            query = typed;
        }
        return [facts, query, args[2] ?? {}];
    }
    return args;
}
/**
 * Persist `/dream` output. Consolidated facts are written back into the KG —
 * without this the pipeline would distil facts into a void and `/recall` could
 * never see them. Ids are preserved and `recordThought` is an INSERT, so a
 * re-run over the same transcripts skips what is already recorded.
 */
async function persistMemorySkillResult(commandId, result, workspaceRoot) {
    if (commandId !== 'autoclaw.dream' || !workspaceRoot) {
        return 0;
    }
    const created = result?.resolution?.created ?? [];
    if (created.length === 0) {
        return 0;
    }
    const handle = (0, service_1.getKnowledgeGraph)({ workspaceRoot });
    const saved = await (0, kgFacts_1.saveFactsToKg)(handle.kg, created, {
        project: (0, project_1.resolveProjectKey)(workspaceRoot),
    });
    return saved.recorded;
}
/** Surface a memory-skill result to the user. */
function reportMemorySkillResult(commandId, result, ctx) {
    if (!shouldShowNotification('info')) {
        return;
    }
    if (commandId === 'autoclaw.dream') {
        const r = result;
        const tail = ctx.unavailable
            ? ` — NOT saved: ${ctx.unavailable}`
            : ` — ${ctx.persisted} saved to the knowledge graph.`;
        vscode.window.showInformationMessage(`AutoClaw /dream: ${r.resolution.created.length} new fact(s), ${r.deduped.length} kept, ` +
            `${r.drift.length} drift finding(s)${tail}`);
        return;
    }
    if (commandId === 'autoclaw.recall') {
        const hits = result ?? [];
        if (hits.length > 0) {
            vscode.window.showInformationMessage(`AutoClaw /recall: ${hits.length} hit(s) — top: ${hits[0].fact.content.slice(0, 120)}`);
            return;
        }
        vscode.window.showInformationMessage(ctx.unavailable
            ? `AutoClaw /recall: memory unavailable — ${ctx.unavailable}.`
            : 'AutoClaw /recall: no matching facts in the knowledge graph. Run /dream or /learn to consolidate memory.');
    }
}
function activate(context) {
    console.log('AutoClaw activated — skills ready');
    currentIde = (0, ide_ports_1.detectIde)(vscode.env.appName || '');
    currentWorkspace = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    console.log(`AutoClaw: detected IDE=${currentIde}, workspace=${currentWorkspace || '(none)'}`);
    if (currentWorkspace) {
        (0, statusBar_1.registerFleetStatusBar)(context, {
            workspaceRoot: currentWorkspace,
            selfAgentId: activeHostAgentId() ?? 'claude-code',
        });
    }
    // `autoclaw.openFleetPanel` — the fleet status-bar item's click target
    // (statusBar.ts sets `item.command` to this id). It was never registered, so
    // every click on the most visible surface in the extension raised
    // "command 'autoclaw.openFleetPanel' not found".
    //
    // Reveal target: the dedicated Fleet webview (`src/panel/fleetPanel.ts`, view
    // id `autoclawFleet`) is NOT contributed under `contributes.views`, so there
    // is no view for it to live in — calling `registerFleetPanel()` here would
    // stand up a second, competing webview provider for a view id VS Code never
    // renders. The fleet surface the user actually sees is the sidebar dashboard
    // (`kdreamDashboard`, KDreamViewProvider), so this command reveals THAT.
    // VS Code auto-generates `<viewId>.focus` for every contributed view; fall
    // back to the container id if a host does not provide it.
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.openFleetPanel', async () => {
        try {
            await vscode.commands.executeCommand('kdreamDashboard.focus');
        }
        catch {
            try {
                await vscode.commands.executeCommand('workbench.view.extension.autoclaw-kdream');
            }
            catch (err) {
                void vscode.window.showErrorMessage(`AutoClaw: could not open the Fleet panel — ${err.message}`);
            }
        }
    }));
    const adaptersDir = path.join(context.extensionPath, 'adapters');
    // Spin up the cross-agent message bus per autoclaw.fabric.busDriver.
    // Best-effort: the FS mailbox is the canonical durable record so a bus
    // failure never blocks activation.
    void initFabricBus();
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.enableAll', () => {
        if (shouldShowNotification('info')) {
            vscode.window.showInformationMessage('AutoClaw: All skills loaded and ready. Try /kdream start or /autobuild schedule in any chat.');
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.startKdream', async () => {
        await vscode.commands.executeCommand('workbench.action.chat.open');
        if (shouldShowNotification('info')) {
            vscode.window.showInformationMessage('KDream background agent started via skill. Check chat for status.');
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.installAdapters', async () => {
        await installAdapters(adaptersDir, context.extensionPath);
    }));
    // LLM provider install — wires optional routers/local providers into the workspace.
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.llm.install', async () => {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceRoot) {
            vscode.window.showWarningMessage('Open a workspace folder before running LLM install.');
            return;
        }
        const choice = await vscode.window.showQuickPick([
            {
                label: 'ZippyMesh + Ollama',
                description: 'Recommended',
                detail: 'Optional router plus local fallback. Skips unreachable providers without failing.',
                zippymesh: true,
                ollama: true,
            },
            {
                label: 'Ollama only',
                description: 'Local LLM',
                detail: 'Uses a local Ollama server on OLLAMA_HOST or http://127.0.0.1:11434.',
                zippymesh: false,
                ollama: true,
            },
            {
                label: 'ZippyMesh only',
                description: 'Optional router',
                detail: 'Adds the router when it is running; AutoClaw still works without it.',
                zippymesh: true,
                ollama: false,
            },
        ], { placeHolder: 'Choose optional LLM provider wiring. LM Studio is auto-detected on localhost:1234.' });
        if (!choice)
            return;
        const { installLlm, formatLlmInstallReport } = await Promise.resolve().then(() => require('./llm'));
        const report = await installLlm({
            workspaceRoot,
            zippymesh: choice.zippymesh,
            ollama: choice.ollama,
        });
        const text = formatLlmInstallReport(report);
        const channel = vscode.window.createOutputChannel('AutoClaw — LLM Install');
        channel.appendLine(text);
        channel.show(true);
        if (report.ok) {
            vscode.window.showInformationMessage('LLM install completed. See output channel.');
        }
        else {
            vscode.window.showErrorMessage('LLM install completed with errors. See output channel.');
        }
    }));
    // MCP server install (CP-3.6) — front-end for the `installAll` writer, which
    // registers the AutoClaw MCP server into every detected host CLI (Claude Code,
    // Codex, Kiro, Cursor, Gemini, …). The function shipped but had no UI entry.
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.installMcpServers', async () => {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        const pick = await vscode.window.showQuickPick([
            { label: 'This workspace', description: 'Recommended', detail: 'Register the AutoClaw MCP server for detected host CLIs, scoped to this project.', scope: 'workspace', force: false },
            { label: 'All my tools (user scope)', description: 'Global', detail: 'Register it in your user-level host configs so every project sees it.', scope: 'global', force: false },
            { label: 'Repair / overwrite (this workspace)', description: 'Force', detail: 'Overwrite an existing autoclaw entry whose command or path has changed.', scope: 'workspace', force: true },
        ], { placeHolder: 'Install the AutoClaw MCP server into detected host CLIs (Claude Code, Codex, Kiro, …)' });
        if (!pick)
            return;
        if (pick.scope === 'workspace' && !workspaceRoot) {
            vscode.window.showWarningMessage('Open a workspace folder to install at workspace scope.');
            return;
        }
        const { installAll, formatReport } = await Promise.resolve().then(() => require('./mcp/install'));
        const results = await installAll({ scope: pick.scope, force: pick.force, workspaceRoot });
        const channel = vscode.window.createOutputChannel('AutoClaw — MCP Install');
        channel.appendLine(formatReport(results));
        channel.show(true);
        const changed = results.filter(r => r.outcome === 'added' || r.outcome === 'updated').length;
        const errors = results.filter(r => r.outcome === 'error').length;
        const detected = results.filter(r => r.outcome !== 'not-installed').length;
        if (errors > 0) {
            vscode.window.showErrorMessage(`MCP install finished with ${errors} error(s) — see the AutoClaw — MCP Install output.`);
        }
        else if (detected === 0) {
            vscode.window.showInformationMessage('No host CLIs were detected to install into. See the output for what was checked.');
        }
        else {
            vscode.window.showInformationMessage(`AutoClaw MCP server installed — ${changed} host(s) changed, ${detected} detected. See the output for details.`);
        }
    }));
    // Skill launcher — quick pick that copies a skill prompt to clipboard
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.launchSkill', async () => {
        // Resolve which host's conventions to target, then render every prompt for
        // it. Forks (Cursor/Kiro/Windsurf/Antigravity) are detected by appName; in
        // stock VS Code an explicit autoclaw.hostAgentId wins, else we prefer an
        // installed Claude Code, else the one installed agent extension.
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? '';
        const hostId = resolveLauncherHost(workspaceRoot);
        const isSlashHost = skillLauncher_1.HOST_SKILL_CONVENTIONS[hostId]?.style === 'slash';
        // ONB-2: Goal-oriented skill catalog — grouped by user intent, not a flat
        // command list. Each action names a shipped skill + the command phrase
        // (which begins with the skill name); the prompt is rendered for `hostId`
        // at selection time so it always points at THIS IDE's installed adapter.
        const skillCatalog = [
            {
                label: '🚀 Start a New Project',
                detail: 'Initialize orchestration, set up manifests, and plan your first sprint',
                actions: [
                    { label: 'Initialize + Plan', skill: 'orchestrate', command: 'orchestrate init, then orchestrate plan' },
                ],
            },
            {
                label: '▶️ Run / Resume Orchestration',
                detail: 'Assign work, check progress, and manage active sprints',
                actions: [
                    { label: 'Assign Next Sprint', skill: 'orchestrate', command: 'orchestrate next' },
                    { label: 'Check Status', skill: 'orchestrate', command: 'orchestrate status' },
                    { label: 'Review + Merge', skill: 'orchestrate', command: 'orchestrate review, then orchestrate merge' },
                ],
            },
            {
                label: '👥 Spawn a Multi-Agent Team',
                detail: 'Launch a team of parallel agents to work on a feature or fix',
                actions: [
                    { label: 'Launch Team', skill: 'mateam', command: 'mateam launch "' },
                ],
            },
            {
                label: '🔨 Automate Builds & Workflows',
                detail: 'Schedule or run CI/CD workflows, lint fixes, and automated tasks',
                actions: [
                    { label: 'Schedule Workflow', skill: 'autobuild', command: 'autobuild schedule' },
                    { label: 'Run Now', skill: 'autobuild', command: 'autobuild run' },
                ],
            },
            {
                label: '🌙 Background Agent (KDream)',
                detail: 'Start, monitor, or task the persistent background agent',
                actions: [
                    { label: 'Start KDream', skill: 'kdream', command: 'kdream start' },
                    { label: 'Check Status', skill: 'kdream', command: 'kdream ps' },
                    { label: 'Add Task', skill: 'kdream', command: 'kdream add "' },
                ],
            },
            {
                label: '📬 Check Inbox',
                detail: 'Read cross-agent messages, review requests, and task completions',
                actions: [
                    { label: 'Check Inbox', inbox: true },
                ],
            },
            {
                label: '🛡️ Security Audit',
                detail: 'Audit a module for security defects before merging or GA',
                actions: [
                    { label: 'Run Audit', skill: 'security-auditor', command: 'security-auditor "audit <path>"' },
                ],
            },
            {
                label: '📝 Write Documentation',
                detail: 'Generate docs, READMEs, or API references from code',
                actions: [
                    { label: 'Write Docs', skill: 'doc-writer', command: 'doc-writer "' },
                ],
            },
        ];
        // Two-step picker: first pick a goal, then pick an action within it.
        const goalPick = await vscode.window.showQuickPick(skillCatalog, {
            placeHolder: 'What do you want to do? (select a goal)',
            matchOnDetail: true,
        });
        if (!goalPick)
            return;
        // If only one action, use it directly; otherwise let the user pick the specific action.
        let action;
        if (goalPick.actions.length === 1) {
            action = goalPick.actions[0];
        }
        else {
            const actionPick = await vscode.window.showQuickPick(goalPick.actions, {
                placeHolder: `${goalPick.label} — select an action`,
                matchOnDetail: true,
            });
            if (!actionPick)
                return;
            action = actionPick;
        }
        // Render the prompt for the ACTIVE host — correct rules dir, file
        // extension, and invocation modality (slash command vs. rule-file path).
        let selectedPrompt;
        if (action.inbox) {
            selectedPrompt = (0, skillLauncher_1.renderInboxPrompt)(hostId);
        }
        else {
            selectedPrompt = (0, skillLauncher_1.renderSkillPrompt)(hostId, action.skill, action.command);
            // Don't hand the user a path to a file that isn't installed for this
            // host — offer to install the adapters first.
            if (!isSkillInstalled(hostId, action.skill, workspaceRoot)) {
                const choice = await vscode.window.showWarningMessage(`The "${action.skill}" skill isn't installed for ${hostId} yet.`, 'Install Adapters', 'Copy Anyway');
                if (!choice) {
                    return;
                }
                if (choice === 'Install Adapters') {
                    await installAdapters(adaptersDir, context.extensionPath, false);
                }
            }
        }
        await vscode.env.clipboard.writeText(selectedPrompt);
        const hint = isSlashHost
            ? `Copied "${goalPick.label}" — paste into ${hostId} chat (skills run as slash commands).`
            : `Copied "${goalPick.label}" — paste into your AI chat (points at this IDE's installed rule file).`;
        vscode.window.showInformationMessage(hint, 'Open Chat').then(sel => {
            if (sel === 'Open Chat') {
                vscode.commands.executeCommand('workbench.action.chat.open');
            }
        });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.doctor', async () => {
        await runDoctorCommand(context.extensionPath);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.doctorJson', async () => {
        await runDoctorCommand(context.extensionPath, 'json');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.exportSnapshot', async () => {
        await runExportSnapshotCommand(context.extensionPath);
    }));
    context.subscriptions.push(
    // Gated (Pro): scheduled/automated AutoBuild. First use starts the trial.
    vscode.commands.registerCommand('autoclaw.autobuild.runNow', () => withGate(context, 'pro.autobuild.schedule', 'Scheduled AutoBuild', autobuildRunNowCommand)));
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.autobuild.tail', async () => {
        await autobuildTailCommand();
    }));
    // Orchestrate commands
    context.subscriptions.push(
    // Gated (Pro): advanced multi-agent orchestration planning. First use starts
    // the trial. TODO: gate the rest of the pro/team commands from the refactor
    // spec Step 11 (orchestrate.assign/review/merge, autobuild.tail, fleet.metrics,
    // voidspec.sync, program.*, cloud.*, bridge.*) using this same withGate helper.
    vscode.commands.registerCommand('autoclaw.orchestrate.plan', () => withGate(context, 'pro.orchestrate.advanced', 'Advanced Orchestration', orchestratePlanCommand)));
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.orchestrate.status', async () => {
        await orchestrateStatusCommand();
    }));
    // Gated (Pro): the orchestrate *action* commands, consistent with plan. NOTE:
    // orchestrate.status (read-only) stays free, and core-coordination commands
    // (bridge.*, cloud.*, program.*) are deliberately NOT gated — gating those
    // would break cross-agent coordination for non-Team users.
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.orchestrate.assign', () => withGate(context, 'pro.orchestrate.advanced', 'Advanced Orchestration', orchestrateAssignNextCommand)));
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.orchestrate.review', () => withGate(context, 'pro.orchestrate.advanced', 'Advanced Orchestration', orchestrateReviewCommand)));
    // Review Fleet (RF-4d): start/stop the automated reviewer watcher. DORMANT
    // by default — nothing dispatches a paid model unless BOTH autoclaw.reviewFleet.enabled
    // is true AND autoclaw.reviewFleet.budgetCents > 0 (the two-gate $0 safety).
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.reviewFleet.start', async () => {
        const ws = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!ws) {
            vscode.window.showErrorMessage('AutoClaw Review Fleet: open a workspace folder first.');
            return;
        }
        const cfg = vscode.workspace.getConfiguration('autoclaw.reviewFleet');
        const enabled = cfg.get('enabled', false);
        const budgetCents = cfg.get('budgetCents', 0);
        if (enabled && budgetCents <= 0) {
            vscode.window.showWarningMessage('AutoClaw Review Fleet: enabled but budget is 0¢ — reviewers fail safe to human (no spend). ' +
                'Set autoclaw.reviewFleet.budgetCents > 0 to allow paid dispatch.');
        }
        if (!reviewFleetController) {
            reviewFleetController = new activate_1.ReviewFleetController();
        }
        const hostAgentId = activeHostAgentId() ?? 'claude-code';
        const res = await reviewFleetController.start(ws, {
            enabled,
            budgetCents,
            intervalMs: cfg.get('intervalMs', 15000),
            maxCycles: cfg.get('maxCycles', 50),
            agentId: hostAgentId,
            sessionId: extScopeSession(),
        });
        vscode.window.showInformationMessage(`AutoClaw Review Fleet: ${res.reason}`);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.reviewFleet.stop', () => {
        const res = reviewFleetController?.stop() ?? { stopped: false };
        vscode.window.showInformationMessage(res.stopped
            ? 'AutoClaw Review Fleet: stopping at the next cycle boundary…'
            : 'AutoClaw Review Fleet: not running.');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.orchestrate.merge', () => withGate(context, 'pro.orchestrate.advanced', 'Advanced Orchestration', orchestrateMergeCommand)));
    // Bridge commands
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.bridge.start', async () => {
        await bridgeStartCommand();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.bridge.stop', async () => {
        await bridgeStopCommand();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.bridge.addAgent', async () => {
        await bridgeAddAgentCommand();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.bridge.revokeToken', async () => {
        await bridgeRevokeTokenCommand();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.agentCard.show', async () => {
        await agentCardShowCommand();
    }));
    // KG-daemon commands
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.kg.openOutput', () => {
        getKgOutputChannel().show(true);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.kg.healthCheck', async () => {
        await kgHealthCheckCommand();
    }));
    // RV-3: the panel's KG fabric-health chip dispatches to these three commands
    // (startKgDaemon / restartKgDaemon / openKgDashboard). Before v3.2 they were
    // referenced but never registered, so the chip click fell through to a docs
    // prompt. Register them so the chip actually controls the daemon.
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.kg.start', async () => {
        await kgStartCommand(context.extensionPath);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.kg.restart', async () => {
        await kgRestartCommand(context.extensionPath);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.kg.openDashboard', async () => {
        await kgOpenDashboardCommand();
    }));
    // KG-P4: one-shot backfill of per-task lifecycle provenance from the artifacts
    // already on disk (handoff sidecars + state.json catalog). FREE — no gate.
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.kg.backfillProvenance', async () => {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceRoot) {
            void vscode.window.showWarningMessage('AutoClaw: open a workspace folder before backfilling KG provenance.');
            return;
        }
        const log = (m) => getKgOutputChannel().appendLine(m);
        try {
            const res = await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'AutoClaw: backfilling KG task provenance…' }, () => (0, kgRecord_1.backfillTaskProvenance)(workspaceRoot, { log }));
            void vscode.window.showInformationMessage(`AutoClaw: KG provenance backfill complete — recorded ${res.recorded}, skipped ${res.skipped}.`);
        }
        catch (err) {
            void vscode.window.showErrorMessage(`AutoClaw: KG provenance backfill failed — ${err.message}`);
        }
    }));
    // Program-plane commands (Phase 4 cross-repo registry)
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.program.create', async () => {
        await programCreateCommand(context);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.program.join', async () => {
        await programJoinCommand(context);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.program.leave', async () => {
        await programLeaveCommand();
    }));
    // Fleet metrics command
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.fleet.metrics', async () => {
        const m = (0, metrics_1.getFleetMetrics)();
        if (!m) {
            vscode.window.showInformationMessage('AutoClaw Fleet Metrics: No task samples recorded yet.');
            return;
        }
        const lines = [
            `AutoClaw Fleet Metrics (${m.sample_count} tasks in window)`,
            `  p50: ${Math.round(m.p50_ms / 1000)}s  p95: ${Math.round(m.p95_ms / 1000)}s  p99: ${Math.round(m.p99_ms / 1000)}s`,
            `  min: ${Math.round(m.min_ms / 1000)}s  max: ${Math.round(m.max_ms / 1000)}s  mean: ${Math.round(m.mean_ms / 1000)}s`,
            `  throughput: ${m.throughput_per_hour.toFixed(1)} tasks/hr`,
            ...Object.entries(m.by_agent).map(([id, s]) => `  ${id}: p50=${Math.round(s.p50_ms / 1000)}s (${s.count} tasks)`),
        ];
        vscode.window.showInformationMessage(lines.join('\n'), { modal: true });
    }));
    // VoidSpec sync command — thin VS Code wrapper around the headless
    // syncVoidSpecCommand() in src/voidspec/dispatch.ts (no vscode import there,
    // so the core sync logic stays unit-testable). This layer resolves the
    // workspace root and surfaces the summary to the user.
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.voidspec.sync', async () => {
        const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!root) {
            vscode.window.showWarningMessage('AutoClaw: open a workspace folder before syncing VoidSpec tasks.');
            return;
        }
        try {
            const r = await (0, dispatch_1.syncVoidSpecCommand)({ workspaceRoot: root });
            vscode.window.showInformationMessage(r.summary);
        }
        catch (err) {
            vscode.window.showErrorMessage(`AutoClaw: VoidSpec sync failed — ${String(err)}`);
        }
    }));
    // Cloud relay consent commands (RELAY-WIRE / SEC-2)
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.cloud.enableRelay', () => cloudEnableRelayCommand()), vscode.commands.registerCommand('autoclaw.cloud.disableRelay', () => cloudDisableRelayCommand()));
    // Fabric onboarding (AF-4b)
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.fabric.onboard', () => fabricOnboardCommand()));
    // Declarative agent roles — assign a panel role to a detected agent.
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.setAgentRole', () => setAgentRoleCommand()));
    // Fleet architecture — let the user designate who coordinates the team.
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.designateOrchestrator', () => designateOrchestratorCommand()));
    // Fleet manifest authoring — CREATE fleet.json + needs.json from detected
    // agents (the per-agent setAgentRole/designateOrchestrator commands above only
    // edit an existing manifest; this scaffolds it in the first place).
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.fleet.scaffoldManifest', () => fleetScaffoldManifestCommand()), vscode.commands.registerCommand('autoclaw.fleet.pickOrchestrator', () => fleetPickOrchestratorCommand()));
    // Fleet federation (FF-3) — invite outside agents, admit/decline the pending tray.
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.fleet.invite', () => fleetInviteCommand()), vscode.commands.registerCommand('autoclaw.fleet.admit', () => fleetAdmitCommand()), vscode.commands.registerCommand('autoclaw.fleet.decline', () => fleetDeclineCommand()), 
    // Generate a ready-to-paste join prompt for a chosen tool (Codex/Claude
    // Desktop/OpenClaw/Hermes/…), bundling a fresh invite token + lane steps.
    vscode.commands.registerCommand('autoclaw.fleet.joinPrompt', (arg) => fleetJoinPromptCommand(arg)), 
    // Add a whole agent team from a ready-made template (gallery → preview → fan-out).
    vscode.commands.registerCommand('autoclaw.fleet.addTeam', () => fleetAddTeamCommand()), 
    // Open the "Build your first agent team" getting-started walkthrough.
    vscode.commands.registerCommand('autoclaw.openWalkthrough', () => openGettingStartedWalkthrough()), 
    // Wire an arbitrary (non-extension) agent id into the comms tree.
    vscode.commands.registerCommand('autoclaw.fleet.scaffoldAgent', () => fleetScaffoldAgentCommand()), 
    // Toggle the MCP server's allowWrites gate (lets MCP-lane agents claim/vote).
    vscode.commands.registerCommand('autoclaw.mcp.allowWrites', () => mcpAllowWritesToggleCommand()), 
    // CL-3: manually release dead-session, expired claims (safe, release-only).
    vscode.commands.registerCommand('autoclaw.fleet.reapClaims', () => fleetReapClaimsCommand()), 
    // CL-4: file-scope leases — declare/release the globs this window is editing,
    // and surface overlaps with other sessions as scope_violation findings.
    vscode.commands.registerCommand('autoclaw.fleet.declareScope', () => fleetDeclareScopeCommand()), vscode.commands.registerCommand('autoclaw.fleet.releaseScope', () => fleetReleaseScopeCommand()), vscode.commands.registerCommand('autoclaw.fleet.scopeStatus', () => fleetScopeStatusCommand()), 
    // CL-5: one-read situational awareness (write fleet-brief.json + summary).
    vscode.commands.registerCommand('autoclaw.fleet.brief', () => fleetBriefCommand()), 
    // CL-2: archive shared-inbox telemetry so it returns to being signal.
    vscode.commands.registerCommand('autoclaw.fleet.archiveTelemetry', () => fleetArchiveTelemetryCommand()));
    // LANE B — per-agent Command & Control. Each accepts a {agentId, sessionId}
    // arg (posted by the panel action buttons) or prompts when invoked bare from
    // the palette. evict shows a REQUIRED modal confirm before calling evictAgent;
    // all of these are LOCAL single-operator only (no relay path).
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.fleet.messageAgent', (arg) => fleetMessageAgentCommand(arg)), vscode.commands.registerCommand('autoclaw.fleet.pauseAgent', (arg) => fleetPauseAgentCommand(arg)), vscode.commands.registerCommand('autoclaw.fleet.resumeAgent', (arg) => fleetResumeAgentCommand(arg)), vscode.commands.registerCommand('autoclaw.fleet.reassignAgent', (arg) => fleetReassignAgentCommand(arg)), vscode.commands.registerCommand('autoclaw.fleet.evict', (arg) => fleetEvictAgentCommand(arg)));
    // Memory skills — /dream (consolidation) + /recall (retrieval).
    // registerMemorySkills() is deliberately vscode-free: it takes a
    // CommandRegistrar. Back it with vscode.commands.registerCommand, capture the
    // disposables, and fill palette invocations with real persisted data: facts
    // from the in-process Knowledge Graph (.autoclaw/kg/kg.db) and transcripts
    // from the ingested session sources. /dream's output is written back to the
    // KG, so the consolidation → recall loop actually closes.
    {
        const memoryRegistrar = {
            register: (commandId, handler) => {
                context.subscriptions.push(vscode.commands.registerCommand(commandId, async (...args) => {
                    const filled = await fillMemorySkillArgs(commandId, args);
                    if (filled === null) {
                        return undefined;
                    } // user cancelled
                    try {
                        const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
                        const result = handler(...filled);
                        const unavailable = root ? memoryStoreUnavailableReason(root) : 'no workspace folder is open';
                        const persisted = unavailable ? 0 : await persistMemorySkillResult(commandId, result, root);
                        reportMemorySkillResult(commandId, result, { persisted, unavailable });
                        return result;
                    }
                    catch (err) {
                        vscode.window.showErrorMessage(`AutoClaw: ${commandId} failed — ${err instanceof Error ? err.message : String(err)}`);
                        return undefined;
                    }
                }));
            },
        };
        (0, skills_1.registerMemorySkills)(memoryRegistrar);
    }
    // AutoClaw: Start Fleet — first-run template picker → .autoclaw/program/registry.json
    // → fleet boot (runner detection + LMD health monitor).
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.fleet.start', async () => {
        const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!root) {
            vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
            return;
        }
        try {
            const result = await (0, fleet_templates_1.startFleetCommand)({
                workspaceRoot: root,
                pickTemplate: async (items) => {
                    const pick = await vscode.window.showQuickPick(items.map((i) => ({ label: i.label, detail: i.detail, id: i.id })), { placeHolder: 'Choose a fleet configuration' });
                    return pick ? pick.id : null;
                },
            });
            vscode.window.showInformationMessage(result.summary);
        }
        catch (err) {
            vscode.window.showErrorMessage(`AutoClaw: Start Fleet failed — ${err instanceof Error ? err.message : String(err)}`);
        }
    }));
    // AutoClaw: Watch Fleet — toggle the stall watcher (heartbeat health →
    // recovery strategy chain) and bind its status-bar text.
    {
        const watchStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
        watchStatus.command = 'autoclaw.watchFleet';
        context.subscriptions.push(watchStatus);
        let watching = false;
        const toggleWatch = () => {
            const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!root) {
                vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
                return undefined;
            }
            const result = (0, fleet_watch_1.watchFleetCommand)({ workspaceRoot: root });
            watching = result.active;
            watchStatus.text = result.statusBarText;
            watchStatus.tooltip = result.active
                ? 'AutoClaw fleet watch is running — click to stop'
                : 'AutoClaw fleet watch is stopped — click to start';
            watchStatus.show();
            return result;
        };
        context.subscriptions.push(vscode.commands.registerCommand('autoclaw.watchFleet', () => toggleWatch()), 
        // Stop the watcher on deactivate so it does not outlive the extension.
        { dispose: () => { if (watching) {
                (0, fleet_watch_1.watchFleetCommand)({});
                watching = false;
            } } });
    }
    // Fleet HALT kill switch + trigger hooks (HKS-1..3, agent-trigger-hooks spec).
    // HALT is a file (`.autoclaw/orchestrator/HALT`): while present, neither the
    // orchestrator loop nor trigger hooks dispatch anything in this workspace.
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.fleet.halt', async () => {
        const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!root) {
            vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
            return;
        }
        const reason = await vscode.window.showInputBox({
            prompt: 'Reason for halting the fleet (written to the HALT file)',
            placeHolder: 'manual fleet halt',
        });
        await (0, triggerHooks_1.setFleetHalted)(root, true, reason || undefined);
        vscode.window.showWarningMessage('AutoClaw: fleet HALTED — all auto-dispatch and trigger hooks are paused. Run "AutoClaw: Resume Fleet" to release.');
    }), vscode.commands.registerCommand('autoclaw.fleet.resume', async () => {
        const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!root) {
            vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
            return;
        }
        await (0, triggerHooks_1.setFleetHalted)(root, false);
        vscode.window.showInformationMessage('AutoClaw: fleet resumed — dispatch and trigger hooks are active again.');
    }));
    {
        // Zero-config no-op: startTriggerHooksRuntime returns an inert handle when
        // .autoclaw/orchestrator/hooks.yaml is absent or has no valid rules.
        const hooksRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (hooksRoot) {
            // Relay client for the `relay` hook action — inert no-op unless the user
            // has enabled + consented to the cloud relay (same contract as elsewhere).
            const hookRelay = new cloud_1.CloudRelay({ autoclawDir: path.join(hooksRoot, '.autoclaw') });
            (0, triggerHooks_1.startTriggerHooksRuntime)({
                workspaceRoot: hooksRoot,
                log: (line) => console.log(`[autoclaw] ${line}`),
                notify: (m) => { vscode.window.showInformationMessage(m); },
                // HKS-4: launch_skill — render the skill prompt for the target host and
                // copy it to the clipboard (the documented "open a session" mechanism),
                // surfacing a toast the operator can paste into the agent's chat.
                launchSkill: async (decision) => {
                    const host = decision.target || 'claude-code';
                    const skill = decision.rule.skill || 'orchestrate';
                    const prompt = decision.rule.prompt || (0, skillLauncher_1.renderSkillPrompt)(host, skill, skill);
                    try {
                        await vscode.env.clipboard.writeText(prompt);
                    }
                    catch { /* clipboard best-effort */ }
                    vscode.window.showInformationMessage(`AutoClaw hook "${decision.rule.id}": ${skill} prompt copied for ${host} — paste into the agent.`);
                },
                // HKS-4: spawn_runner — confirm the target is a known runner, then wake it
                // via the existing dispatch path (the established way runners start work).
                spawnRunner: async (decision) => {
                    const target = decision.target ?? '';
                    // BL-7: a hook with no explicit target (or 'auto'/'best') selects the best
                    // runner by REPUTATION instead of erroring — the production caller that
                    // finally makes getPreferred's §5.5 `reputation` criterion fire (the
                    // flagship reputation-aware assignment was built but called nowhere).
                    const wantsReputationPick = target === '' || target === 'auto' || target === 'best';
                    const known = runners_1.BUILTIN_RUNNER_IDS.includes(target);
                    if (!wantsReputationPick && !known) {
                        throw new Error(`unknown runner "${target}"`);
                    }
                    vscode.window.showInformationMessage(`AutoClaw hook "${decision.rule.id}": spawning runner ${wantsReputationPick ? '(reputation-preferred)' : target}.`);
                    // Reputation-aware direct dispatch through the runner contract (§5.5
                    // preference order + Runner.dispatch). Off by default because it can
                    // launch a real host process; the default path below wakes via the work
                    // queue. Reachable two ways (BL-19): the legacy AUTOCLAW_RUNNER_DIRECT_DISPATCH
                    // env var OR the documented `autoclaw.runners.reputationAwareDispatch`
                    // setting — so reputation routing is a user-toggleable capability, not an
                    // undocumented flag. When on, a no/auto/best target selects the best runner
                    // by reputation (BL-7b); a completed dispatch auto-feeds the cost ledger.
                    const reputationAwareDispatch = process.env.AUTOCLAW_RUNNER_DIRECT_DISPATCH === 'true' ||
                        vscode.workspace
                            .getConfiguration('autoclaw.runners')
                            .get('reputationAwareDispatch', false);
                    if (reputationAwareDispatch) {
                        const sprint = Number(decision.event.payload.sprint ?? 1) || 1;
                        const prompt = `[AutoClaw hook "${decision.rule.id}"] Resume assigned work (trigger: ${decision.rule.on}).`;
                        const registry = (0, runners_1.createDefaultRunnerRegistry)();
                        // reputation-preferred selection (no explicit runnerId so the §5.5
                        // order decides) vs. a targeted wake of the named runner.
                        const outcome = wantsReputationPick
                            ? await (0, reputationPreference_1.dispatchPreferredByReputation)(registry, {
                                workspaceRoot: hooksRoot, prompt, workingDir: hooksRoot, trust: 'auto',
                                onResult: (runnerId, result) => (0, fleetData_1.recordDispatchCost)(hooksRoot, runnerId, result, { sprint }),
                            })
                            : await (0, runners_1.dispatchViaRegistry)(registry, {
                                runnerId: target, prompt, workingDir: hooksRoot, trust: 'auto',
                                onResult: (runnerId, result) => (0, fleetData_1.recordDispatchCost)(hooksRoot, runnerId, result, { sprint }),
                            });
                        if (outcome === null) {
                            throw new Error(wantsReputationPick
                                ? 'no runner selectable by reputation (none detected/enabled)'
                                : `runner "${target}" not detected or disabled`);
                        }
                        if (!outcome.result.ok) {
                            throw new Error(`runner ${outcome.runnerId} dispatch failed (exit ${outcome.result.exitCode})`);
                        }
                        return;
                    }
                    const pkg = {
                        type: 'work_package',
                        taskId: `next-${target}`,
                        taskName: `Hook spawn_runner: ${decision.rule.id}`,
                        description: `Runner wake by trigger hook "${decision.rule.id}" on ${decision.rule.on}. via_hook:${decision.rule.id}`,
                        filePaths: [],
                        successCriteria: ['Start the registered runner and begin assigned work'],
                        sprint: Number(decision.event.payload.sprint ?? 1) || 1,
                        assignToVendor: 'other',
                        priority: 'low',
                        timeBudgetMs: 0,
                    };
                    const res = await (0, orchestratorLoop_1.dispatchWork)(hooksRoot, pkg);
                    if (res === null) {
                        throw new Error('runner dispatch gated or halted');
                    }
                },
                // HKS-5: relay — forward the wake to the target machine's inbox over the
                // cloud relay. Inert no-op unless the relay is enabled + consented.
                relay: async (decision) => {
                    const target = decision.target ?? '';
                    const r = await hookRelay.sendInbox([{
                            id: `hook-${decision.rule.id}-${Date.now()}`,
                            to: target,
                            from: 'trigger-hooks',
                            type: 'wake',
                            timestamp: new Date().toISOString(),
                            payload: { via_hook: decision.rule.id, on: decision.rule.on, event: decision.event.payload },
                        }]);
                    if (!r.ok) {
                        throw new Error(`relay send failed: ${r.detail ?? 'unknown'}`);
                    }
                },
            }).then(runtime => {
                if (runtime.ruleCount > 0) {
                    context.subscriptions.push({ dispose: () => { void runtime.stop(); } });
                }
            }).catch(e => console.error('trigger-hooks runtime failed to start:', e));
        }
    }
    // Orchestrator Dashboard commands — redirect to unified panel
    context.subscriptions.push(vscode.commands.registerCommand('orchestrator.showDashboard', async () => {
        await vscode.commands.executeCommand('kdreamDashboard.focus');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('orchestrator.refreshDashboard', async () => {
        if (kdreamView) {
            await refreshOrchestratorData(kdreamView);
        }
    }));
    // Auto-start bridge: default-on when at least one orchestrator manifest
    // exists in the workspace. The legacy `autoclaw.bridge.enabled` setting
    // (default false) acts as an explicit override — if a user has flipped
    // it to true we still start regardless of manifest presence. Setting
    // `autoStart` to false disables manifest-based auto-start; an explicit
    // `enabled = true` still wins.
    const bridgeConfig = vscode.workspace.getConfiguration('autoclaw.bridge');
    const bridgeAutoStart = bridgeConfig.get('autoStart', true);
    const bridgeEnabledOverride = bridgeConfig.get('enabled', false);
    if (bridgeEnabledOverride) {
        bridgeStartCommand().catch(e => console.error('bridge auto-start failed:', e));
    }
    else if (bridgeAutoStart) {
        const probeRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (probeRoot) {
            (0, manifest_probe_1.hasOrchestratorManifest)(probeRoot).then(found => {
                if (found) {
                    bridgeStartCommand().catch(e => console.error('bridge auto-start failed:', e));
                }
            }).catch(e => console.error('bridge auto-start probe failed:', e));
        }
    }
    // Knowledge Graph: the default KG is now an IN-PROCESS store (lazily opened
    // on first use via getKnowledgeGraph / closed in deactivate). We deliberately
    // do NOT auto-spawn the standalone child daemon on activation. The optional
    // daemon stays available behind the explicit `autoclaw.kg.start` command.
    // (Set autoclaw.kg.spawnDaemonOnActivate to opt back into the legacy spawn.)
    if (vscode.workspace.getConfiguration('autoclaw.kg').get('spawnDaemonOnActivate', false)) {
        maybeStartKgDaemon(context.extensionPath).catch(e => {
            console.error('kg-daemon auto-start failed:', e);
        });
    }
    // GIT-R5-1: fleet-aware branch health — the stale-branch audit as a command.
    // Analyzes every local branch vs the base (setting, else dev-beta/main/master
    // auto-detect), writes a markdown report, and opens it.
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.git.branchHealth', async () => {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceRoot) {
            void vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
            return;
        }
        try {
            const { analyzeBranchHealth, renderBranchHealthMarkdown } = await Promise.resolve().then(() => require('./git/branchHealth'));
            const { execFile } = await Promise.resolve().then(() => require('child_process'));
            const { promisify } = await Promise.resolve().then(() => require('util'));
            const exec = promisify(execFile);
            const runGit = async (args) => (await exec('git', args, { cwd: workspaceRoot, maxBuffer: 8 * 1024 * 1024 })).stdout;
            let base = vscode.workspace.getConfiguration('autoclaw.git').get('baseBranch', '') || '';
            if (!base) {
                const heads = (await runGit(['for-each-ref', '--format=%(refname:short)', 'refs/heads/'])).split(/\r?\n/);
                base = ['dev-beta', 'main', 'master'].find((b) => heads.includes(b))
                    ?? (await runGit(['branch', '--show-current'])).trim();
            }
            const report = await analyzeBranchHealth({ base, runGit });
            const dir = path.join(workspaceRoot, '.autoclaw', 'reports');
            await fsPromises.mkdir(dir, { recursive: true });
            const file = path.join(dir, `branch-health-${report.generatedAt.replace(/:/g, '-')}.md`);
            await fsPromises.writeFile(file, renderBranchHealthMarkdown(report), 'utf8');
            const deleteSafe = report.branches.filter((b) => b.recommendation === 'delete-safe').length;
            void vscode.window.showTextDocument(vscode.Uri.file(file));
            void vscode.window.showInformationMessage(`AutoClaw: ${report.branches.length} branch(es) vs ${base} — ${deleteSafe} delete-safe. Recommendations only; nothing was deleted.`);
        }
        catch (err) {
            void vscode.window.showErrorMessage(`AutoClaw: branch health failed — ${err.message}`);
        }
    }));
    // AWL-RUN-1: the Adaptive Workflow Learning loop, user-reachable. One
    // bounded experiment cycle over recorded scaffold history; report opens
    // from .autoclaw/orchestrator/reports/. Promotion thresholds are the
    // library's own (integrity-gates-first) — the command cannot weaken them.
    {
        const { registerAwlCommands } = require('./workflows/awlCommand');
        registerAwlCommands(context, () => vscode.workspace.workspaceFolders?.[0]?.uri.fsPath);
    }
    // Corroboration promotion pass: multi-agent redundancy → trust. Dry-run
    // first, then confirm; promotions ride the shipped supersession idiom and
    // each rung needs strictly more distinct agents than the last (anti-gaming).
    {
        const { registerCorroborationCommands } = require('./intelligence/kg/corroborationCommand');
        registerCorroborationCommands(context, () => vscode.workspace.workspaceFolders?.[0]?.uri.fsPath);
    }
    // TL-2 consumer: opt-in trace dataset export. The command IS the explicit
    // user action the spec requires — a modal confirm plus a folder pick, then
    // exportTraces (redaction on by default) with the result surfaced.
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.traces.export', async () => {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceRoot) {
            void vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
            return;
        }
        const proceed = await vscode.window.showInformationMessage('Export Trace Ledger episodes as a redacted evals dataset? Paths, project names, session ids, and secret-like values are scrubbed by default; prompt/response bodies are never stored to begin with.', { modal: true }, 'Choose folder & export');
        if (proceed !== 'Choose folder & export') {
            return;
        }
        const picked = await vscode.window.showOpenDialog({
            canSelectFiles: false, canSelectFolders: true, canSelectMany: false,
            openLabel: 'Export traces here',
        });
        const outDir = picked?.[0]?.fsPath;
        if (!outDir) {
            return;
        }
        try {
            const { exportTraces } = await Promise.resolve().then(() => require('./workflows/traces/export'));
            const res = await exportTraces({ workspaceRoot, outDir, confirm: true });
            if (!res.ok) {
                void vscode.window.showErrorMessage(`AutoClaw: trace export failed — ${res.error}`);
                return;
            }
            const open = await vscode.window.showInformationMessage(`AutoClaw: exported ${res.exported} episode(s) with a provenance manifest.`
                + (res.warnings.length ? ` Warnings: ${res.warnings.join('; ')}` : ''), 'Open manifest');
            if (open === 'Open manifest' && res.manifestPath) {
                void vscode.window.showTextDocument(vscode.Uri.file(res.manifestPath));
            }
        }
        catch (err) {
            void vscode.window.showErrorMessage(`AutoClaw: trace export failed — ${err.message}`);
        }
    }));
    // BENCH-1 consumer: canary-benchmark a model from the command palette. Runs
    // the content-safe default fixtures (minus tool-use, which needs a harness
    // transport this thin adapter doesn't parse) through LlmRegistry.chat and
    // writes the adopt/trial/demote report under .autoclaw/llm/bench/reports/.
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.llm.benchmark', async () => {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceRoot) {
            void vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
            return;
        }
        const raw = await vscode.window.showInputBox({
            prompt: 'Model id(s) to benchmark, comma-separated (e.g. "qwen2.5-coder" or "ollama:llama3"). Empty = registry default.',
            placeHolder: 'model ids — provider-prefixed ids route accordingly; paid providers may incur cost',
        });
        if (raw === undefined) {
            return;
        }
        const proceed = await vscode.window.showInformationMessage('Run canary fixtures against the selected model(s)? Local models are free; BYO/cloud providers may incur small per-call costs.', { modal: true }, 'Run benchmark');
        if (proceed !== 'Run benchmark') {
            return;
        }
        try {
            const { runCanaryBenchmark, defaultCanaryFixtures } = await Promise.resolve().then(() => require('./llm/bench/canary'));
            const { LlmRegistry } = await Promise.resolve().then(() => require('./llm/registry'));
            const reg = new LlmRegistry({ workspaceRoot });
            const ids = raw.split(',').map((s) => s.trim()).filter(Boolean);
            const candidates = (ids.length > 0 ? ids : ['(registry default)']).map((id) => ({
                id,
                source: id === 'zmlr' ? 'router'
                    : /^(ollama|lmstudio|local)/i.test(id) ? 'local' : 'byo',
                model: id === '(registry default)' ? undefined : id.includes(':') ? id.split(':')[1] : id,
            }));
            const fixtures = defaultCanaryFixtures().filter((f) => f.kind !== 'tool-use');
            const report = await runCanaryBenchmark({
                fixtures,
                candidates,
                chat: async (candidate, fixture) => {
                    const started = Date.now();
                    const result = await reg.chat({ prompt: fixture.prompt, model: candidate.model });
                    return {
                        text: String(result.response ?? ''),
                        costCents: result.costCents,
                        latencyMs: Date.now() - started,
                    };
                },
            });
            const dir = path.join(workspaceRoot, '.autoclaw', 'llm', 'bench', 'reports');
            await fsPromises.mkdir(dir, { recursive: true });
            const file = path.join(dir, `canary-${report.created_at.replace(/:/g, '-')}.json`);
            await fsPromises.writeFile(file, JSON.stringify(report, null, 2) + '\n', 'utf8');
            const summary = report.candidates
                .map((c) => `${c.candidate.id}: ${c.recommendation.toUpperCase()} (${Math.round(c.totals.pass_rate * 100)}% pass)`)
                .join(' · ');
            const open = await vscode.window.showInformationMessage(`AutoClaw canary: ${summary}`, 'Open report');
            if (open === 'Open report') {
                void vscode.window.showTextDocument(vscode.Uri.file(file));
            }
        }
        catch (err) {
            void vscode.window.showErrorMessage(`AutoClaw: benchmark failed — ${err.message}`);
        }
    }));
    // Intelligence refresh service: standalone tick that keeps opted-in per-host
    // context digests current (gated on autoclaw.intelligence.autoRefresh.enabled).
    maybeStartRefreshService();
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.intelligence.startRefreshService', () => {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceRoot) {
            void vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
            return;
        }
        if (activeRefreshService?.running) {
            void vscode.window.showInformationMessage('AutoClaw: intelligence refresh service is already running.');
            return;
        }
        const minutes = vscode.workspace
            .getConfiguration('autoclaw.intelligence.autoRefresh')
            .get('intervalMinutes', 30);
        activeRefreshService = (0, intelligence_1.startIntelligenceRefreshService)({
            workspaceRoot,
            intervalMs: Math.max(1, minutes) * 60000,
            log: (m) => console.log(`AutoClaw intelligence: ${m}`),
        });
        void vscode.window.showInformationMessage(`AutoClaw: intelligence refresh service started (every ${Math.max(1, minutes)} min). It refreshes only host digests you've already created.`);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.intelligence.stopRefreshService', () => {
        if (!activeRefreshService?.running) {
            void vscode.window.showInformationMessage('AutoClaw: intelligence refresh service is not running.');
            return;
        }
        stopRefreshService();
        void vscode.window.showInformationMessage('AutoClaw: intelligence refresh service stopped.');
    }));
    // Honor live toggling of the setting without a reload.
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('autoclaw.intelligence.autoRefresh.enabled')) {
            const enabled = vscode.workspace
                .getConfiguration('autoclaw.intelligence.autoRefresh')
                .get('enabled', false);
            if (enabled) {
                maybeStartRefreshService();
            }
            else {
                stopRefreshService();
            }
        }
    }));
    // Intelligence index watch: incremental re-index as you work
    // (gated on autoclaw.intelligence.watch.enabled, default off).
    maybeStartIndexWatch();
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.intelligence.startWatch', () => {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceRoot) {
            void vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
            return;
        }
        if (activeIndexWatch) {
            void vscode.window.showInformationMessage('AutoClaw: intelligence index watch is already running.');
            return;
        }
        const seconds = vscode.workspace
            .getConfiguration('autoclaw.intelligence.watch')
            .get('debounceSeconds', 5);
        const intelConfig = (0, intelligence_2.loadConfig)(workspaceRoot);
        const handle = (0, intelligence_2.startIndexWatchService)({
            workspaceRoot,
            debounceMs: Math.max(1, seconds) * 1000,
            config: intelConfig,
            log: (m) => console.log(`AutoClaw intelligence: ${m}`),
        });
        const watcher = vscode.workspace.createFileSystemWatcher('**/*');
        const onChange = (uri) => handle.notifyChange(uri.fsPath);
        watcher.onDidChange(onChange);
        watcher.onDidCreate(onChange);
        watcher.onDidDelete(onChange);
        activeIndexWatch = { handle, watcher };
        void vscode.window.showInformationMessage(`AutoClaw: intelligence index watch started (incremental re-index, ${Math.max(1, seconds)}s debounce).`);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.intelligence.stopWatch', () => {
        if (!activeIndexWatch) {
            void vscode.window.showInformationMessage('AutoClaw: intelligence index watch is not running.');
            return;
        }
        stopIndexWatch();
        void vscode.window.showInformationMessage('AutoClaw: intelligence index watch stopped.');
    }));
    // Honor live toggling of the setting without a reload.
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('autoclaw.intelligence.watch.enabled')) {
            const enabled = vscode.workspace
                .getConfiguration('autoclaw.intelligence.watch')
                .get('enabled', false);
            if (enabled) {
                maybeStartIndexWatch();
            }
            else {
                stopIndexWatch();
            }
        }
    }));
    // AutoBuild scheduler: single setInterval in the extension host.
    startAutobuildScheduler(context);
    // KDream Dashboard commands
    context.subscriptions.push(vscode.commands.registerCommand('kdream.showDashboard', async () => {
        await vscode.commands.executeCommand('kdreamDashboard.focus');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('kdream.refreshDashboard', async () => {
        if (kdreamView) {
            await refreshDashboardData(kdreamView);
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('kdream.addTask', async () => {
        const task = await vscode.window.showInputBox({
            prompt: 'Enter task for KDream',
            placeHolder: 'e.g., Review PR #123'
        });
        if (task) {
            await addTaskToMemory(task);
        }
    }));
    // Register KDream View Provider
    const kdreamViewProvider = new KDreamViewProvider(context.extensionUri);
    context.subscriptions.push(
    // retainContextWhenHidden keeps the DOM (and the user's expand/collapse
    // state) alive when the view is hidden — otherwise switching VS Code tabs
    // and back reloads the webview from scratch, collapsing every panel.
    // The Intelligence dashboard and fleet panel already do this.
    vscode.window.registerWebviewViewProvider(KDreamViewProvider.viewType, kdreamViewProvider, { webviewOptions: { retainContextWhenHidden: true } }));
    // Set up file system watcher for state.json
    stateWatcher = vscode.workspace.createFileSystemWatcher('**/.autoclaw/kdream/state.json');
    stateWatcher.onDidChange(async (uri) => {
        if (kdreamView) {
            await refreshDashboardData(kdreamView);
        }
    });
    context.subscriptions.push(stateWatcher);
    // L2 consumer: refresh the visible KDream sidebar the instant board.json is
    // (re)written, instead of waiting for the slow backstop poll. Gated by the same
    // `cluster.boardWatch` flag as the producer (so turning it off = 30s tick only),
    // scoped to THIS workspace (a nested/sibling project's board never drives a
    // spurious refresh), and gated on visibility so a hidden panel does zero work.
    const kdreamBoardWatchEnabled = vscode.workspace
        .getConfiguration('autoclaw').get('cluster.boardWatch', true);
    const kdreamWorkspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (kdreamBoardWatchEnabled && kdreamWorkspaceRoot) {
        boardWatcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(kdreamWorkspaceRoot, '.autoclaw/orchestrator/board.json'));
        const onBoardChange = () => {
            if (kdreamView?.visible) {
                refreshOrchestratorData(kdreamView).catch(() => { });
            }
        };
        boardWatcher.onDidChange(onBoardChange);
        boardWatcher.onDidCreate(onBoardChange);
        context.subscriptions.push(boardWatcher);
    }
    // Check if .autoclaw/ is in .gitignore
    checkAndOfferGitignoreUpdate().catch(e => console.error('gitignore check failed:', e));
    // Auto-install adapters silently on activation if enabled
    const config = vscode.workspace.getConfiguration('autoclaw.kdream');
    const autoInstall = config.get('autoInstallAdapters', true);
    if (autoInstall) {
        installAdapters(adaptersDir, context.extensionPath, true);
    }
    // Auto-provision cross-agent comms infrastructure, then CL-1 auto-announce this
    // session (self-describing fleet) + CL-2 one-time telemetry sweep of the shared
    // inbox so it starts as signal. Both best-effort — never block activation.
    provisionCrossAgentComms()
        .then(async () => {
        const wr = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!wr) {
            return;
        }
        let branch;
        try {
            branch = (await fsPromises.readFile(path.join(wr, '.git', 'HEAD'), 'utf8'))
                .trim().replace(/^ref:\s*refs\/heads\//, '') || undefined;
        }
        catch { /* not a git checkout / detached — omit branch */ }
        await (0, announce_1.announceSession)(wr, {
            agent_id: activeHostAgentId() ?? 'claude-code',
            session_id: extScopeSession(),
            branch,
        });
        await (0, commsGc_1.archiveSharedInbox)(wr).catch(() => { });
    })
        .catch(e => console.error('cross-agent comms provisioning failed:', e));
    // Start heartbeat ticker — writes real heartbeats for detected agents
    startHeartbeatTicker(context);
    // Watch shared inbox for task_complete messages — notify and auto-refresh
    startInboxWatcher(context);
    // Periodic reconciliation sweep — detects drift between tasks.md / sprint YAML / comms-log
    startReconcileTicker(context);
    // Orchestrator perpetual loop: health → inbox → work → dispatch → log
    startOrchestratorLoopTick(context);
    // Register @autoclaw chat participant (VS Code 1.90+; degrades on older builds / other IDEs)
    (0, chatparticipant_1.registerChatParticipant)(context, () => vscode.workspace.workspaceFolders?.[0]?.uri.fsPath);
    // Register Intelligence Layer commands (registration only — no I/O at activation)
    (0, intelligence_commands_1.registerIntelligenceCommands)(context, () => vscode.workspace.workspaceFolders?.[0]?.uri.fsPath);
    // Register Workflow Lab commands (WL-1.4)
    (0, command_1.registerWorkflowLabCommands)(context, () => vscode.workspace.workspaceFolders?.[0]?.uri.fsPath);
    // Intelligence metrics dashboard (webview view + refresh command + metrics
    // file watcher). Registration only — no I/O until the view is opened.
    (0, intelligenceDashboard_1.registerIntelligenceDashboard)(context);
    // Always-on Intelligence health surface (Theme 3): a status-bar rollup, a
    // one-shot toast when the layer is in a red state, and the auto-detect
    // "learn from other tools' sessions" consent prompt. Registration only; the
    // probe + detection are deferred + best-effort (never block activation).
    (0, healthSurface_1.registerIntelligenceHealthSurface)(context, () => vscode.workspace.workspaceFolders?.[0]?.uri.fsPath);
    // Full-tab Manager Surface (autoclaw.manager.open) — roomy single pane for
    // overseeing the fleet. Command registration only; no I/O until opened.
    (0, managerPanel_1.registerManagerPanel)(context);
    // Knowledge Graph viewer (autoclaw.kg.browse) — browse + visualize the
    // in-process KG (thoughts + relations). Command registration only.
    (0, kgViewPanel_1.registerKgViewPanel)(context);
    // First-run welcome with IDE-specific guidance
    showWelcomeIfNeeded(context);
    // Support surface: register the Support/Donate panel + rate commands, count
    // today's activity, and (deferred) show a non-invasive milestone prompt.
    (0, support_1.registerSupport)(context);
    // Commercial licensing + BYO-key + 7-day Pro trial + status bar. Registers
    // commands only; local features degrade gracefully. Hosted features opt in via
    // requireHosted(); tiered local features gate via GateService.
    (0, licensing_1.registerLicensing)(context);
    // PR Evidence Report — the worked example of the gate + trial + premium stack.
    // During trial/license it runs the (premium) engine; otherwise it generates a
    // basic free fallback report and offers an upgrade. Never blocks.
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.reports.prEvidence', async () => {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceRoot) {
            vscode.window.showWarningMessage('Open a workspace folder before generating a report.');
            return;
        }
        const gate = new gateService_1.GateService(context);
        const access = await gate.require('pro.reports.prEvidence', {
            startTrial: true,
            reason: 'PR Evidence Report',
            silent: true, // we surface our own tailored upgrade prompt below
        });
        const premium = (0, premium_1.createPremiumApi)({ extensionPath: context.extensionPath });
        const report = await premium.generatePrEvidenceReport({ workspaceRoot });
        const doc = await vscode.workspace.openTextDocument({ content: report.markdown, language: 'markdown' });
        await vscode.window.showTextDocument(doc);
        if (!access.allowed) {
            void vscode.window.showInformationMessage('Generated a basic free report. Unlock Pro for full evidence reports with tests, risks, changed files, agent history, and reviewer verdicts.', 'Compare Plans', 'Enter License').then(choice => {
                if (choice === 'Compare Plans') {
                    void vscode.commands.executeCommand('autoclaw.license.comparePlans');
                }
                if (choice === 'Enter License') {
                    void vscode.commands.executeCommand('autoclaw.license.enter');
                }
            });
        }
    }));
    // Agent Scorecards — second premium engine, same gate+trial+fallback pattern.
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.reports.agentScorecard', async () => {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceRoot) {
            vscode.window.showWarningMessage('Open a workspace folder before generating scorecards.');
            return;
        }
        const gate = new gateService_1.GateService(context);
        const access = await gate.require('pro.agentScorecards', {
            startTrial: true,
            reason: 'Agent Scorecards',
            silent: true,
        });
        const premium = (0, premium_1.createPremiumApi)({ extensionPath: context.extensionPath });
        const result = (await premium.generateAgentScorecard?.({ workspaceRoot }));
        const markdown = result?.markdown ?? '# Agent Scorecards\n\nNo scorecard available.';
        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
        await vscode.window.showTextDocument(doc);
        if (!access.allowed) {
            void vscode.window.showInformationMessage('Generated a basic scorecard. Unlock Pro for full per-agent scorecards (actions, tokens, wall time, token share, last active).', 'Compare Plans', 'Enter License').then(choice => {
                if (choice === 'Compare Plans') {
                    void vscode.commands.executeCommand('autoclaw.license.comparePlans');
                }
                if (choice === 'Enter License') {
                    void vscode.commands.executeCommand('autoclaw.license.enter');
                }
            });
        }
    }));
    // Autopilot Model Routing — fourth premium engine, same gate+trial+fallback
    // pattern. Resolves every Autopilot task class through the routing ladder
    // (premium → ZMLR → static tiers → fallback → host default) and shows the
    // report. Free builds always get the static resolution — never blocks.
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.autopilot.showModelRouting', async () => {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        const gate = new gateService_1.GateService(context);
        const access = await gate.require('pro.autopilot.modelRouting', {
            startTrial: true,
            reason: 'Autopilot Learned Model Routing',
            silent: true,
        });
        const premium = (0, premium_1.createPremiumApi)({ extensionPath: context.extensionPath });
        const routing = await (0, routesService_1.resolveAllModelRoutes)({
            rawConfig: vscode.workspace.getConfiguration('autoclaw.autopilot').get('modelRoutes'),
            // The learned-routing rung only runs for licensed/trial users; the
            // ladder resolves statically otherwise (honest free behaviour).
            premium: access.allowed ? premium : undefined,
            workspaceRoot,
            listLocalModels: () => (0, embeddings_1.listOllamaModels)(),
            zmlrClientFactory: (endpoint) => new zippymesh_1.ZippyMeshProvider({ host: endpoint }),
        });
        const doc = await vscode.workspace.openTextDocument({ content: routing.markdown, language: 'markdown' });
        await vscode.window.showTextDocument(doc);
        if (!access.allowed) {
            void vscode.window.showInformationMessage('Static route resolution shown. Unlock Pro for learned routing ranked from your cost/effectiveness ledgers.', 'Compare Plans', 'Enter License').then(choice => {
                if (choice === 'Compare Plans') {
                    void vscode.commands.executeCommand('autoclaw.license.comparePlans');
                }
                if (choice === 'Enter License') {
                    void vscode.commands.executeCommand('autoclaw.license.enter');
                }
            });
        }
    }));
    // Advanced Orchestration — third premium engine. Same gate+trial+fallback
    // pattern. Reads a dependency-free `advanced-input.json` ({objective?, tasks[],
    // agents[]}); agents fall back to the orchestrator registry. Writes/opens an
    // optimised plan (critical path, weighted assignment, scope-conflict-free).
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.orchestrate.advancedPlan', async () => {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceRoot) {
            vscode.window.showWarningMessage('Open a workspace folder before planning.');
            return;
        }
        const orchDir = path.join(workspaceRoot, '.autoclaw', 'orchestrator');
        const inputPath = path.join(orchDir, 'advanced-input.json');
        const registryPath = path.join(orchDir, 'comms', 'registry.json');
        const readIf = (p) => { try {
            return fs.readFileSync(p, 'utf8');
        }
        catch {
            return undefined;
        } };
        const built = (0, advancedInput_1.buildAdvancedInput)({
            workspaceRoot,
            inputJson: readIf(inputPath),
            registryJson: readIf(registryPath),
        });
        if (!built.ok) {
            // Seed a starter descriptor the first time so the command is discoverable.
            if (built.reason === 'no_input') {
                fs.mkdirSync(orchDir, { recursive: true });
                if (!fs.existsSync(inputPath)) {
                    fs.writeFileSync(inputPath, built.template, 'utf8');
                }
                const doc = await vscode.workspace.openTextDocument(inputPath);
                await vscode.window.showTextDocument(doc);
                void vscode.window.showInformationMessage('Created advanced-input.json — fill in tasks (and optionally agents), then run Advanced Orchestration again.');
            }
            else {
                void vscode.window.showWarningMessage(`Advanced Orchestration: ${built.reason.replace(/_/g, ' ')} in advanced-input.json (need tasks, and agents or a registry).`);
            }
            return;
        }
        const gate = new gateService_1.GateService(context);
        const access = await gate.require('pro.orchestrate.advanced', {
            startTrial: true,
            reason: 'Advanced Orchestration',
            silent: true,
        });
        const premium = (0, premium_1.createPremiumApi)({ extensionPath: context.extensionPath });
        const result = await premium.runAdvancedOrchestration?.(built.input);
        const markdown = result?.markdown ?? '# Advanced Orchestration\n\nNo plan produced.';
        const outPath = path.join(orchDir, 'advanced-plan.md');
        fs.mkdirSync(orchDir, { recursive: true });
        fs.writeFileSync(outPath, markdown, 'utf8');
        const doc = await vscode.workspace.openTextDocument(outPath);
        await vscode.window.showTextDocument(doc);
        if (!access.allowed) {
            void vscode.window.showInformationMessage('Generated a basic plan. Unlock Pro for the optimising planner: critical-path analysis, capability/reputation/cost-aware assignment, scope-conflict-free packing, and risk-tiered review hints.', 'Compare Plans', 'Enter License').then(choice => {
                if (choice === 'Compare Plans') {
                    void vscode.commands.executeCommand('autoclaw.license.comparePlans');
                }
                if (choice === 'Enter License') {
                    void vscode.commands.executeCommand('autoclaw.license.enter');
                }
            });
        }
    }));
}
async function installAdapters(adaptersDir, extensionPath, silent = false) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const workspaceRoot = workspaceFolders?.[0]?.uri.fsPath;
    const installed = [];
    // Claude Code — global ~/.claude/skills/
    if (vscode.extensions.getExtension('Anthropic.claude-code')) {
        const dest = path.join(os.homedir(), '.claude', 'skills');
        copySkillDir(path.join(adaptersDir, 'claude-code'), dest);
        installed.push('Claude Code');
    }
    if (!workspaceRoot) {
        if (!silent && installed.length > 0 && shouldShowNotification('info')) {
            vscode.window.showInformationMessage(`AutoClaw: Installed adapters for ${installed.join(', ')}.`);
        }
        return;
    }
    // Cline — workspace .clinerules/
    const clineIds = ['saoudrizwan.claude-dev', 'rooveterinaryinc.roo-cline', 'cline.cline'];
    if (clineIds.some(id => vscode.extensions.getExtension(id))) {
        const dest = path.join(workspaceRoot, '.clinerules');
        copyDir(path.join(adaptersDir, 'cline'), dest);
        installed.push('Cline');
    }
    // KiloCode — workspace .kilocodemodes + .clinerules/
    if (vscode.extensions.getExtension('kilocode.kilo-code')) {
        const src = path.join(adaptersDir, 'kilocode', 'autoclaw-modes.yaml');
        const dest = path.join(workspaceRoot, '.kilocodemodes');
        mergeKiloModes(src, dest);
        // Also copy Cline-format rules to .clinerules/ since KiloCode reads them
        // as system instructions (works in all IDEs including Kiro where custom modes may not load)
        const clinerulesDest = path.join(workspaceRoot, '.clinerules');
        copyDir(path.join(adaptersDir, 'cline'), clinerulesDest);
        installed.push('KiloCode');
    }
    // Cursor — workspace .cursor/rules/
    // Cursor is a standalone app; we write rules for it if the directory exists
    const cursorDir = path.join(workspaceRoot, '.cursor', 'rules');
    if (fs.existsSync(path.join(workspaceRoot, '.cursor')) || hasCursorConfig(workspaceRoot)) {
        fs.mkdirSync(cursorDir, { recursive: true });
        copyDir(path.join(adaptersDir, 'cursor'), cursorDir);
        installed.push('Cursor');
    }
    // Kiro — workspace .kiro/steering/
    const kiroDir = path.join(workspaceRoot, '.kiro');
    if (fs.existsSync(kiroDir) || vscode.extensions.getExtension('amazon.kiro')) {
        const dest = path.join(workspaceRoot, '.kiro', 'steering');
        copyDir(path.join(adaptersDir, 'kiro'), dest);
        installed.push('Kiro');
    }
    // Windsurf — workspace .windsurf/rules/
    const windsurfDir = path.join(workspaceRoot, '.windsurf');
    if (fs.existsSync(windsurfDir) || vscode.extensions.getExtension('codeium.windsurf')) {
        const dest = path.join(workspaceRoot, '.windsurf', 'rules');
        copyDir(path.join(adaptersDir, 'windsurf'), dest);
        installed.push('Windsurf');
    }
    // Continue — workspace .continue/prompts/
    if (vscode.extensions.getExtension('Continue.continue')) {
        const dest = path.join(workspaceRoot, '.continue', 'prompts');
        copyDir(path.join(adaptersDir, 'continue'), dest);
        installed.push('Continue');
    }
    // Antigravity — workspace .agent/rules/
    // Antigravity is a standalone IDE fork (not a VS Code extension), so detect via
    // the host app name or an existing .agent/ directory in the workspace.
    const agentDir = path.join(workspaceRoot, '.agent');
    const isAntigravityHost = /antigravity/i.test(vscode.env.appName || '');
    if (isAntigravityHost || fs.existsSync(agentDir)) {
        const dest = path.join(workspaceRoot, '.agent', 'rules');
        copyDir(path.join(adaptersDir, 'antigravity'), dest);
        installed.push('Antigravity');
    }
    // ZippyMesh LLM Router — drop setup guide if ZMLR is running or was recently detected
    let zmlrDetected = false;
    if (workspaceRoot) {
        try {
            const zippymeshUrl = vscode.workspace.getConfiguration('autoclaw.kdream').get('zippymeshUrl', 'http://localhost:20128');
            const zmlrRes = await fetch(zippymeshUrl, {
                method: 'HEAD',
                signal: AbortSignal.timeout(1000)
            });
            if (zmlrRes.ok) {
                zmlrDetected = true;
                // Drop the setup guide and playbooks into .autoclaw/zippymesh/
                const zmlrDestDir = path.join(workspaceRoot, '.autoclaw', 'zippymesh');
                copyDir(path.join(adaptersDir, 'zippymesh'), zmlrDestDir);
                installed.push('ZippyMesh LLM Router');
                // Offer to open the setup guide
                if (!silent && shouldShowNotification('info')) {
                    const action = await vscode.window.showInformationMessage('ZippyMesh LLM Router detected! Setup guide copied to .autoclaw/zippymesh/README.md', 'Open Setup Guide');
                    if (action === 'Open Setup Guide') {
                        const setupPath = path.join(zmlrDestDir, 'README.md');
                        vscode.window.showTextDocument(vscode.Uri.file(setupPath));
                    }
                }
            }
        }
        catch {
            // ZMLR not running — skip silently
        }
    }
    // If both Claude Code AND ZippyMesh are detected, offer MCP setup
    const claudeCodeInstalled = !!vscode.extensions.getExtension('Anthropic.claude-code');
    if (claudeCodeInstalled && zmlrDetected) {
        await offerZippyMeshMcpSetup(adaptersDir);
    }
    if (!silent) {
        if (installed.length > 0 && shouldShowNotification('info')) {
            vscode.window.showInformationMessage(`AutoClaw: Adapters installed for ${installed.join(', ')}.`);
        }
        else if (shouldShowNotification('info')) {
            vscode.window.showInformationMessage('AutoClaw: No supported AI extensions detected. Adapters are in the extension\'s adapters/ folder for manual use.');
        }
    }
}
function copyDir(src, dest) {
    if (!fs.existsSync(src)) {
        return;
    }
    fs.mkdirSync(dest, { recursive: true });
    for (const file of fs.readdirSync(src)) {
        const srcFile = path.join(src, file);
        const destFile = path.join(dest, file);
        if (fs.statSync(srcFile).isDirectory()) {
            copyDir(srcFile, destFile);
        }
        else {
            fs.copyFileSync(srcFile, destFile);
        }
    }
}
function copySkillDir(src, dest) {
    if (!fs.existsSync(src)) {
        return;
    }
    fs.mkdirSync(dest, { recursive: true });
    for (const skillName of fs.readdirSync(src)) {
        const skillSrc = path.join(src, skillName);
        const skillDest = path.join(dest, skillName);
        if (fs.statSync(skillSrc).isDirectory()) {
            copyDir(skillSrc, skillDest);
        }
    }
}
/**
 * AutoClaw modes block marker — used to detect and replace previously installed
 * KiloCode modes content from any earlier AutoClaw release.
 */
const AUTOCLAW_MODES_MARKER = '# AutoClaw modes';
const AUTOCLAW_MODE_SLUGS = ['slug: kdream', 'slug: autobuild', 'slug: mateam'];
/**
 * Computes the merged content for a KiloCode `.kilocodemodes` file.
 *
 * Behavior:
 *   - No existing content      -> return new modes verbatim.
 *   - Existing has marker      -> replace from marker through EOF with the new
 *                                 marker block (upgrade path).
 *   - Existing has our slugs   -> previous install without a marker; prepend a
 *                                 warning comment and append a fresh marked
 *                                 block (don't auto-overwrite user data).
 *   - Otherwise                -> append a marked block.
 */
function computeKiloModesContent(existingContent, newModesContent) {
    const block = '\n' + AUTOCLAW_MODES_MARKER + '\n' + newModesContent;
    if (existingContent === null || existingContent.length === 0) {
        return newModesContent;
    }
    const markerIdx = existingContent.indexOf(AUTOCLAW_MODES_MARKER);
    if (markerIdx !== -1) {
        // Replace from the marker comment line through the end of file.
        const before = existingContent.slice(0, markerIdx).replace(/\s+$/, '');
        return before + block;
    }
    const hasOurSlugs = AUTOCLAW_MODE_SLUGS.some(s => existingContent.includes(s));
    if (hasOurSlugs) {
        // Slugs present without our marker — keep user data, append a warning.
        const warning = '\n# WARNING: AutoClaw detected mode slugs (kdream/autobuild/mateam) ' +
            'in this file but no "# AutoClaw modes" marker. The block below was ' +
            'appended without removing the existing entries; please de-duplicate ' +
            'manually if needed.\n';
        return existingContent + warning + block;
    }
    return existingContent + block;
}
function mergeKiloModes(src, dest) {
    if (!fs.existsSync(src)) {
        return;
    }
    const newContent = fs.readFileSync(src, 'utf8');
    const existing = fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8') : null;
    const merged = computeKiloModesContent(existing, newContent);
    fs.writeFileSync(dest, merged);
}
function hasCursorConfig(workspaceRoot) {
    const indicators = ['.cursorrules', '.cursor'];
    return indicators.some(f => fs.existsSync(path.join(workspaceRoot, f)));
}
/**
 * Builds the ordered list of candidate paths to look for a ZippyMesh LLM Router
 * installation. Workspace-relative candidates come first, then $HOME-relative
 * ones, then any user-configured paths from `autoclaw.kdream.zippymeshSearchPaths`.
 * No hard-coded developer drives (K:/, S:/) are included by default.
 */
function getZippyMeshCandidatePaths(workspaceRoot, homeDir, userPaths = []) {
    const candidates = [];
    if (workspaceRoot) {
        candidates.push(path.join(workspaceRoot, 'zippymesh-router'));
        candidates.push(path.join(workspaceRoot, '..', 'zippymesh-router'));
    }
    candidates.push(path.join(homeDir, 'zippymesh-router'));
    candidates.push(path.join(homeDir, 'Downloads', 'zippymesh-router'));
    candidates.push(path.join(homeDir, 'Projects', 'zippymesh-router'));
    for (const p of userPaths) {
        if (typeof p === 'string' && p.length > 0) {
            candidates.push(p);
        }
    }
    return candidates;
}
async function offerZippyMeshMcpSetup(adaptersDir) {
    const mcpPath = path.join(os.homedir(), '.claude', 'mcp.json');
    // Check if already configured
    try {
        const existing = await fsPromises.readFile(mcpPath, 'utf8');
        if (existing.includes('zippymesh')) {
            return; // Already configured
        }
    }
    catch {
        // File doesn't exist yet — that's fine
    }
    if (!shouldShowNotification('info')) {
        return;
    }
    const action = await vscode.window.showInformationMessage('AutoClaw: Add ZippyMesh LLM Router as an MCP server in Claude Code? This enables live model recommendations in KDream.', 'Yes, Add MCP Server', 'No', 'Show Setup Guide');
    if (action === 'Show Setup Guide') {
        const guidePath = path.join(adaptersDir, 'zippymesh', 'mcp-setup.md');
        vscode.window.showTextDocument(vscode.Uri.file(guidePath));
        return;
    }
    if (action !== 'Yes, Add MCP Server') {
        return;
    }
    // Find ZMLR install path — check workspace, then home dir, then user-configured paths.
    const config = vscode.workspace.getConfiguration('autoclaw.kdream');
    const userPaths = config.get('zippymeshSearchPaths', []);
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const zmlrPaths = getZippyMeshCandidatePaths(workspaceRoot, os.homedir(), userPaths);
    // Ask user to confirm path
    const zmlrPath = await vscode.window.showInputBox({
        prompt: 'Enter the path to your ZippyMesh LLM Router installation',
        placeHolder: 'e.g., ~/zippymesh-router',
        value: zmlrPaths.find(p => {
            try {
                return fs.existsSync(p);
            }
            catch {
                return false;
            }
        }) ?? ''
    });
    if (!zmlrPath) {
        return;
    }
    // Read or create mcp.json
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mcpConfig = { mcpServers: {} };
    try {
        const existing = await fsPromises.readFile(mcpPath, 'utf8');
        mcpConfig = JSON.parse(existing);
        if (!mcpConfig.mcpServers) {
            mcpConfig.mcpServers = {};
        }
    }
    catch {
        // Start fresh
    }
    // Add ZippyMesh MCP server
    mcpConfig.mcpServers.zippymesh = {
        command: 'node',
        args: [path.join(zmlrPath, 'mcp-server.js')],
        env: { ZMLR_BASE_URL: 'http://localhost:20128' }
    };
    await fsPromises.mkdir(path.dirname(mcpPath), { recursive: true });
    await fsPromises.writeFile(mcpPath, JSON.stringify(mcpConfig, null, 2));
    vscode.window.showInformationMessage('ZippyMesh MCP server added to ~/.claude/mcp.json. Restart Claude Code to activate.');
}
async function getCodeChurnMetrics(workspaceRoot) {
    const defaultMetrics = {
        totalCommits: 0,
        commitsLast7Days: 0,
        commitsLast30Days: 0,
        linesAdded: 0,
        linesDeleted: 0,
        churnRate: 0,
        avgCommitSize: 0,
        mostActiveDay: ''
    };
    if (!fs.existsSync(path.join(workspaceRoot, '.git'))) {
        return defaultMetrics;
    }
    try {
        // Commit counts
        const totalCommits = parseInt((await runGit(workspaceRoot, ['rev-list', '--count', 'HEAD'])).trim()) || 0;
        const commitsLast7Days = parseInt((await runGit(workspaceRoot, ['rev-list', '--count', 'HEAD', '--since=7 days ago'])).trim()) || 0;
        const commitsLast30Days = parseInt((await runGit(workspaceRoot, ['rev-list', '--count', 'HEAD', '--since=30 days ago'])).trim()) || 0;
        // Lines changed — aggregate over the last 30 days (B1 fix). Each shortstat
        // line looks like " 3 files changed, 17 insertions(+), 4 deletions(-)" with
        // either insertions OR deletions optional, so we parse them independently.
        const shortstatOut = await runGit(workspaceRoot, [
            'log', '--since=30 days ago', '--pretty=tformat:', '--shortstat'
        ]);
        let linesAdded = 0, linesDeleted = 0;
        for (const line of shortstatOut.split('\n')) {
            const ins = line.match(/(\d+)\s+insertions?\(\+\)/);
            const del = line.match(/(\d+)\s+deletions?\(-\)/);
            if (ins) {
                linesAdded += parseInt(ins[1]);
            }
            if (del) {
                linesDeleted += parseInt(del[1]);
            }
        }
        // Most active day + active-days count (used for churnRate)
        const logOutput = await runGit(workspaceRoot, ['log', '--pretty=format:%ai', '--since=30 days ago']);
        const dates = logOutput.split('\n').filter(line => line.trim()).map(line => line.split(' ')[0]);
        const dateCounts = {};
        dates.forEach(date => dateCounts[date] = (dateCounts[date] || 0) + 1);
        const mostActiveDay = Object.keys(dateCounts).reduce((a, b) => dateCounts[a] > dateCounts[b] ? a : b, '');
        // B2: distinct formulas.
        //   avgCommitSize = lines changed per commit (size of a typical commit)
        //   churnRate     = lines changed per day across the 30-day window
        const avgCommitSize = totalCommits > 0 ? (linesAdded + linesDeleted) / totalCommits : 0;
        const churnRate = (linesAdded + linesDeleted) / 30;
        return {
            totalCommits,
            commitsLast7Days,
            commitsLast30Days,
            linesAdded,
            linesDeleted,
            churnRate: Math.round(churnRate * 100) / 100,
            avgCommitSize: Math.round(avgCommitSize * 100) / 100,
            mostActiveDay
        };
    }
    catch (e) {
        console.error('Error collecting code churn metrics:', e);
        return defaultMetrics;
    }
}
async function getProductivityInsights(workspaceRoot, logs, todos) {
    const defaultInsights = {
        todoResolutionRate: 0,
        avgTimeToResolveTodo: 0,
        commitFrequency: 0,
        activeDays: 0,
        memorySize: 0,
        logsSize: 0
    };
    try {
        // Memory size — ENOENT is normal (file not yet created).
        const memoryPath = (0, kdream_helpers_1.getMemoryPath)(workspaceRoot);
        let memorySize = 0;
        try {
            const stats = await fsPromises.stat(memoryPath);
            memorySize = Math.round(stats.size / 1024); // KB
        }
        catch (e) {
            if (e.code !== 'ENOENT') {
                console.warn(`AutoClaw: stat failed for ${memoryPath}:`, e.message);
            }
        }
        // Logs size - estimate from today's log
        const logPath = (0, kdream_helpers_1.getTodayLogPath)(workspaceRoot);
        let logsSize = 0;
        try {
            const stats = await fsPromises.stat(logPath);
            logsSize = Math.round(stats.size / 1024); // KB
        }
        catch (e) {
            if (e.code !== 'ENOENT') {
                console.warn(`AutoClaw: stat failed for ${logPath}:`, e.message);
            }
        }
        // TODO resolution - simplified, assume resolved if not in current scan
        const openTodos = todos.length;
        // For resolution rate, we'd need historical data, placeholder
        const todoResolutionRate = 0; // Need better tracking
        // Commit frequency - commits per day last 30 days
        let commitFrequency = 0;
        if (fs.existsSync(path.join(workspaceRoot, '.git'))) {
            const commits30d = (await runGit(workspaceRoot, ['rev-list', '--count', 'HEAD', '--since=30 days ago'])).trim();
            commitFrequency = Math.round((parseInt(commits30d) || 0) / 30 * 100) / 100;
        }
        // Active days - unique days with commits
        let activeDays = 0;
        if (fs.existsSync(path.join(workspaceRoot, '.git'))) {
            const logOutput = await runGit(workspaceRoot, ['log', '--pretty=format:%ai', '--since=30 days ago']);
            const dates = logOutput.split('\n').filter(line => line.trim()).map(line => line.split(' ')[0]);
            const uniqueDates = new Set(dates);
            activeDays = uniqueDates.size;
        }
        return {
            todoResolutionRate,
            avgTimeToResolveTodo: 0, // Placeholder
            commitFrequency,
            activeDays,
            memorySize,
            logsSize
        };
    }
    catch (e) {
        console.error('Error collecting productivity insights:', e);
        return defaultInsights;
    }
}
async function getProjectHealthIndicators(workspaceRoot, todos, adapterHealth) {
    const defaultIndicators = {
        totalFiles: 0,
        sourceFiles: 0,
        openTodos: 0,
        uncommittedChanges: 0,
        staleChangesHours: 0,
        memoryCompleteness: 0,
        adapterCoverage: 0
    };
    try {
        // File counts - use findFiles for source files. Share the TODO-scan
        // excludes so nested worktrees / tool dirs don't inflate the counts.
        const excludeGlob = (0, kdream_helpers_1.buildTodoScanExcludeGlob)();
        const sourceFiles = await vscode.workspace.findFiles('**/*.{ts,js,tsx,jsx,py,java,cpp,c,h,hpp,rs,go}', excludeGlob);
        const totalFiles = await vscode.workspace.findFiles('**/*', excludeGlob);
        // Open TODOs
        const openTodos = todos.length;
        // Uncommitted changes
        let uncommittedChanges = 0;
        let staleChangesHours = 0;
        if (fs.existsSync(path.join(workspaceRoot, '.git'))) {
            const statusStr = await runGit(workspaceRoot, ['status', '--porcelain']);
            uncommittedChanges = statusStr.split('\n').filter(line => line.trim()).length;
            // Stale changes - time since last commit if uncommitted
            if (uncommittedChanges > 0) {
                const lastCommitTime = (await runGit(workspaceRoot, ['log', '-1', '--format=%ct'])).trim();
                const lastCommitSeconds = parseInt(lastCommitTime);
                if (!isNaN(lastCommitSeconds)) {
                    staleChangesHours = Math.round((Date.now() / 1000 - lastCommitSeconds) / 3600);
                }
            }
        }
        // Memory completeness - check if sections exist (ENOENT = no MEMORY.md yet).
        const memoryPath = (0, kdream_helpers_1.getMemoryPath)(workspaceRoot);
        let memoryCompleteness = 0;
        try {
            const content = await fsPromises.readFile(memoryPath, 'utf8');
            const sections = ['## Follow-ups', '## Facts', '## Observations'];
            const presentSections = sections.filter(s => content.includes(s)).length;
            memoryCompleteness = Math.round((presentSections / sections.length) * 100);
        }
        catch (e) {
            if (e.code !== 'ENOENT') {
                console.warn(`AutoClaw: read failed for ${memoryPath}:`, e.message);
            }
        }
        // Adapter coverage
        const healthyAdapters = adapterHealth.filter(a => a.status === 'healthy').length;
        const adapterCoverage = adapterHealth.length === 0
            ? 0
            : Math.round((healthyAdapters / adapterHealth.length) * 100);
        return {
            totalFiles: totalFiles.length,
            sourceFiles: sourceFiles.length,
            openTodos,
            uncommittedChanges,
            staleChangesHours,
            memoryCompleteness,
            adapterCoverage
        };
    }
    catch (e) {
        console.error('Error collecting project health indicators:', e);
        return defaultIndicators;
    }
}
async function refreshDashboardData(view) {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        return;
    }
    // Read state.json
    const statePath = (0, kdream_helpers_1.getStatePath)(workspaceRoot);
    let stateData = null;
    try {
        await fsPromises.access(statePath);
        const content = await fsPromises.readFile(statePath, 'utf8');
        stateData = JSON.parse(content);
    }
    catch (e) {
        // File doesn't exist or can't be read - that's okay
    }
    // Read MEMORY.md for tasks
    const memoryPath = (0, kdream_helpers_1.getMemoryPath)(workspaceRoot);
    let tasks = [];
    try {
        await fsPromises.access(memoryPath);
        const memoryContent = await fsPromises.readFile(memoryPath, 'utf8');
        tasks = (0, kdream_helpers_1.parseMemoryTasks)(memoryContent);
    }
    catch (e) {
        // File doesn't exist or can't be read - that's okay
    }
    // Read today's log
    const logPath = (0, kdream_helpers_1.getTodayLogPath)(workspaceRoot);
    let logs = [];
    try {
        await fsPromises.access(logPath);
        const logContent = await fsPromises.readFile(logPath, 'utf8');
        logs = (0, kdream_helpers_1.parseLogEntries)(logContent);
    }
    catch (e) {
        // File doesn't exist or can't be read - that's okay
    }
    // Get adapter health
    const adapterHealth = await getAdapterHealth();
    // Scan for TODOs/FIXMEs
    const todos = await scanWorkspaceForTodos();
    // Collect analytics data
    const codeChurn = await getCodeChurnMetrics(workspaceRoot);
    const productivity = await getProductivityInsights(workspaceRoot, logs, todos);
    const health = await getProjectHealthIndicators(workspaceRoot, todos, adapterHealth);
    // FF-3: pending tray — agents that joined via a fresh beacon but are not yet
    // admitted to fleet.json. Best-effort; an empty list simply hides the tray.
    let pending = [];
    try {
        pending = await readPendingTray(path.join(workspaceRoot, '.autoclaw'));
    }
    catch { /* best-effort — leave empty */ }
    // Send data to webview
    try {
        view.webview.postMessage({ command: 'updateStatus', data: stateData });
        view.webview.postMessage({ command: 'updateTasks', data: tasks });
        view.webview.postMessage({ command: 'updateLogs', data: logs });
        view.webview.postMessage({ command: 'updateAdapterHealth', data: adapterHealth });
        view.webview.postMessage({ command: 'updateTodos', data: todos });
        view.webview.postMessage({ command: 'updateCodeChurn', data: codeChurn });
        view.webview.postMessage({ command: 'updateProductivity', data: productivity });
        view.webview.postMessage({ command: 'updateHealth', data: health });
        view.webview.postMessage({ command: 'updatePending', data: (0, fleetViewModelBuilders_1.buildPending)(pending) });
    }
    catch (e) {
        console.error('Error sending message to webview:', e);
    }
}
let zmlrHealthCache;
/**
 * Test seam: clear the in-memory ZippyMesh health cache.
 */
function _resetZmlrHealthCache() {
    zmlrHealthCache = undefined;
}
/**
 * Returns a cached ZippyMesh health probe if fresh, or runs a new probe.
 * Uses a 60 s TTL with ±5 s jitter to avoid synchronized fan-out across
 * multiple windows refreshing in lockstep.
 */
async function getCachedZippyMeshHealth(zmlrUrl, now = Date.now(), probe = kdream_helpers_1.checkZippyMeshHealth) {
    if (zmlrHealthCache &&
        zmlrHealthCache.url === zmlrUrl &&
        zmlrHealthCache.expiresAt > now) {
        return zmlrHealthCache.result;
    }
    const result = await probe(zmlrUrl);
    // 60 s TTL with ±5 s jitter
    const jitterMs = Math.round((Math.random() * 10000) - 5000);
    zmlrHealthCache = {
        url: zmlrUrl,
        expiresAt: now + 60000 + jitterMs,
        result
    };
    return result;
}
async function getAdapterHealth() {
    const config = vscode.workspace.getConfiguration('autoclaw.kdream');
    const adapters = config.get('adapters', kdream_helpers_1.DEFAULT_ADAPTERS);
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    // Host IDEs (Cursor/Kiro/Windsurf/Antigravity) are VS Code forks, not
    // extensions loaded inside another editor — detect them via the running app
    // name. `getExtension('amazon.kiro')` is always undefined inside Kiro itself,
    // so an extension-id lookup alone wrongly reports the host fork as missing.
    const hostId = (0, ide_ports_1.detectIde)(vscode.env.appName || '');
    const hasExtension = (id) => !!vscode.extensions.getExtension(id);
    const extensionResults = adapters.map(adapter => (0, kdream_helpers_1.getAdapterHealthEntry)(adapter.name, (0, kdream_helpers_1.isAdapterDetected)(adapter, hostId, hasExtension, workspaceRoot)));
    // Check ZippyMesh LLM Router (async network check, cached for 60 s)
    const zmlrUrl = config.get('zippymeshUrl', 'http://localhost:20128');
    const zmlrHealth = await getCachedZippyMeshHealth(zmlrUrl);
    return [...extensionResults, zmlrHealth];
}
async function scanWorkspaceForTodos() {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        return [];
    }
    const config = vscode.workspace.getConfiguration('autoclaw.kdream');
    const patterns = config.get('scanPatterns', ['**/*.ts', '**/*.js', '**/*.tsx', '**/*.jsx', '**/*.py', '**/*.md']);
    const excludeGlob = (0, kdream_helpers_1.buildTodoScanExcludeGlob)();
    const results = [];
    // Show progress notification for large workspaces
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Window,
        title: 'Scanning for TODOs...',
        cancellable: false
    }, async (progress) => {
        let current = 0;
        const total = patterns.length;
        for (const pattern of patterns) {
            progress.report({ message: `Scanning ${pattern} (${current + 1}/${total})`, increment: (1 / total) * 100 });
            try {
                const files = await vscode.workspace.findFiles(pattern, excludeGlob);
                for (const fileUri of files) {
                    const filePath = fileUri.fsPath;
                    const relativePath = path.relative(workspaceRoot, filePath);
                    // Safety net: skip nested worktrees / tool dirs the glob may have
                    // missed (each nested checkout would duplicate every TODO).
                    if ((0, kdream_helpers_1.isExcludedTodoPath)(relativePath)) {
                        continue;
                    }
                    try {
                        const content = await fsPromises.readFile(filePath, 'utf8');
                        results.push(...(0, kdream_helpers_1.parseTodosFromContent)(content, relativePath));
                    }
                    catch (e) {
                        // Skip files that can't be read
                    }
                }
            }
            catch (e) {
                // Skip patterns that don't match
            }
            current++;
        }
    });
    return results;
}
function getNotificationLevel() {
    const config = vscode.workspace.getConfiguration('autoclaw.kdream');
    return config.get('notificationLevel', 'all');
}
function shouldShowNotification(level) {
    const notificationLevel = getNotificationLevel();
    return (0, kdream_helpers_1.shouldShowNotification)(notificationLevel, level);
}
async function addTaskToMemory(task) {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
    }
    const memoryPath = (0, kdream_helpers_1.getMemoryPath)(workspaceRoot);
    // Create directory if it doesn't exist
    const memoryDir = path.dirname(memoryPath);
    await fsPromises.mkdir(memoryDir, { recursive: true });
    // Read or create MEMORY.md
    let memoryContent = '';
    try {
        await fsPromises.access(memoryPath);
        memoryContent = await fsPromises.readFile(memoryPath, 'utf8');
    }
    catch {
        memoryContent = '# KDream Memory\n\n## Follow-ups\n\n';
    }
    // Add task using helper
    memoryContent = (0, kdream_helpers_1.addTaskToContent)(memoryContent, task);
    await fsPromises.writeFile(memoryPath, memoryContent);
    if (shouldShowNotification('info')) {
        vscode.window.showInformationMessage(`Task added to KDream memory: ${task}`);
    }
    // Refresh dashboard if open
    if (kdreamView) {
        await refreshDashboardData(kdreamView);
    }
}
async function checkAndOfferGitignoreUpdate() {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        return;
    }
    const gitignorePath = path.join(workspaceRoot, '.gitignore');
    try {
        await fsPromises.access(gitignorePath);
    }
    catch {
        return;
    }
    const gitignoreContent = await fsPromises.readFile(gitignorePath, 'utf8');
    if (!(0, kdream_helpers_1.isAutoclawInGitignore)(gitignoreContent)) {
        if (!shouldShowNotification('info')) {
            return;
        }
        const response = await vscode.window.showInformationMessage('AutoClaw: Add .autoclaw/ to .gitignore to prevent committing KDream data?', 'Yes', 'No');
        if (response === 'Yes') {
            const updatedContent = (0, kdream_helpers_1.addAutoclawToGitignore)(gitignoreContent);
            await fsPromises.writeFile(gitignorePath, updatedContent);
            vscode.window.showInformationMessage('Added .autoclaw/ to .gitignore');
        }
    }
}
class KDreamViewProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        kdreamView = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'refresh':
                    await refreshDashboardData(webviewView);
                    await refreshOrchestratorData(webviewView);
                    break;
                case 'getInitialData':
                    await refreshDashboardData(webviewView);
                    await refreshOrchestratorData(webviewView);
                    break;
                case 'launchSkill':
                    await vscode.commands.executeCommand('autoclaw.launchSkill');
                    break;
                case 'markTaskComplete': {
                    // Mark a task as complete in the MEMORY.md file
                    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
                    if (workspaceRoot) {
                        const memPath = (0, kdream_helpers_1.getMemoryPath)(workspaceRoot);
                        try {
                            const content = await fsPromises.readFile(memPath, 'utf8');
                            // Replace "[ ] <taskDescription>" with "[x] <taskDescription>"
                            const escaped = message.taskDescription.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                            const updated = content.replace(new RegExp(`\\[ \\]\\s+${escaped}`, 'g'), `[x] ${message.taskDescription}`);
                            if (updated !== content) {
                                await fsPromises.writeFile(memPath, updated, 'utf8');
                                await refreshDashboardData(webviewView);
                                vscode.window.showInformationMessage(`Task marked complete: ${message.taskDescription}`);
                            }
                        }
                        catch {
                            vscode.window.showWarningMessage('Could not update MEMORY.md to mark task complete.');
                        }
                    }
                    break;
                }
                case 'scanTodos': {
                    // Trigger a TODO scan from the webview and refresh the dashboard
                    try {
                        const todos = await scanWorkspaceForTodos();
                        webviewView.webview.postMessage({ command: 'updateTodos', data: todos });
                        vscode.window.showInformationMessage(`Scan complete: ${todos.length} TODO/FIXME item(s) found.`);
                    }
                    catch {
                        vscode.window.showWarningMessage('TODO scan failed. Check that a workspace is open.');
                    }
                    break;
                }
                case 'exportSnapshot': {
                    // Route to the same logic as the autoclaw.exportSnapshot command so
                    // the dashboard button and command palette stay in lockstep.
                    try {
                        await vscode.commands.executeCommand('autoclaw.exportSnapshot');
                    }
                    catch (e) {
                        vscode.window.showWarningMessage(`Snapshot export failed: ${e.message}`);
                    }
                    break;
                }
                case 'replyAwaiting': {
                    await handleReplyAwaiting(webviewView, {
                        messageId: message.messageId,
                        from: message.from,
                        type: message.type,
                        body: message.body,
                    });
                    break;
                }
                case 'castVote': {
                    // RV-1: the review-decision Approve / Request changes / Reject
                    // buttons. Writes this host's own consensus vote file end-to-end.
                    await handleCastVote(webviewView, {
                        taskId: message.taskId,
                        vote: message.vote,
                        comment: message.comment,
                    });
                    break;
                }
                case 'requestAdvisory': {
                    // RA-5: build the non-voting Review Advisory for this row and push
                    // the refreshed section (the advisory renders as a chip + flags).
                    await handleRequestAdvisory(webviewView, {
                        taskId: message.taskId,
                        requester: message.requester,
                    });
                    break;
                }
                case 'openAdvisoryChat': {
                    // RA-5 `Dig in ↗`: seed a chat brief with the advisory + packet refs.
                    await handleOpenAdvisoryChat({ taskId: message.taskId });
                    break;
                }
                case 'openAwaitingFile': {
                    // RV-2: drill-in source links in the review-decision panel.
                    await handleOpenAwaitingFile(message.file);
                    break;
                }
                case 'openSession': {
                    // Session-tracking ph1: jump from a panel session row to the chat.
                    await handleOpenSession({
                        sessionId: message.sessionId,
                        source: message.source,
                        rawRef: message.rawRef,
                    });
                    break;
                }
                case 'persistFilterState': {
                    // UI-6: per-section filter state persistence (Memento)
                    if (message.sectionId && message.state) {
                        try {
                            const ws = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
                            if (ws) {
                                const filterDir = path.join(ws, '.autoclaw', 'orchestrator', 'filters');
                                await fsPromises.mkdir(filterDir, { recursive: true });
                                const filterFile = path.join(filterDir, message.sectionId + '.json');
                                await fsPromises.writeFile(filterFile, JSON.stringify(message.state, null, 2), 'utf8');
                            }
                        }
                        catch (_) { /* best-effort */ }
                    }
                    break;
                }
                case 'getFilterState': {
                    // UI-6: restore persisted filter state
                    if (message.sectionId) {
                        try {
                            const ws = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
                            if (ws) {
                                const filterFile = path.join(ws, '.autoclaw', 'orchestrator', 'filters', message.sectionId + '.json');
                                const raw = await fsPromises.readFile(filterFile, 'utf8');
                                const state = JSON.parse(raw);
                                webviewView.webview.postMessage({ command: 'restoreFilterState', sectionId: message.sectionId, state });
                            }
                        }
                        catch (_) { /* no persisted state — ignore */ }
                    }
                    break;
                }
                case 'openBridgeDoc': {
                    await vscode.env.openExternal(vscode.Uri.parse('https://github.com/GoZippy/autoclaw/blob/master/docs/rfc/runner-bridge-contract.md'));
                    break;
                }
                case 'enableKg': {
                    // KG chip clicked while disabled — enable the in-process store and
                    // surface the setting so the user sees the toggle they flipped.
                    try {
                        await vscode.workspace.getConfiguration('autoclaw.kg')
                            .update('enabled', true, vscode.ConfigurationTarget.Workspace);
                    }
                    catch { /* fall through to opening settings */ }
                    await vscode.commands.executeCommand('workbench.action.openSettings', 'autoclaw.kg.enabled');
                    vscode.window.showInformationMessage('AutoClaw Knowledge Graph enabled (in-process store — no install needed).');
                    break;
                }
                case 'openKgDoctor': {
                    // KG chip clicked while degraded — run doctor so the user can see the
                    // KG section (driver/caps) and the KG output channel for warnings.
                    getKgOutputChannel().show(true);
                    await vscode.commands.executeCommand('autoclaw.doctor');
                    break;
                }
                case 'openManagerWide':
                    // Pop the sidebar board into the roomy editor-tab Manager surface.
                    await vscode.commands.executeCommand('autoclaw.manager.open');
                    break;
                case 'openTaskProvenance':
                    // KG-P3: a board card's "◎ why" button — open the KG viewer focused on
                    // this task's provenance (created-by/why + activity timeline + lineage).
                    if (typeof message.taskId === 'string' && message.taskId) {
                        await vscode.commands.executeCommand('autoclaw.kg.taskProvenance', { taskId: message.taskId });
                    }
                    break;
                case 'inviteAgent':
                    await vscode.commands.executeCommand('autoclaw.fleet.invite');
                    break;
                case 'addTeam':
                    await vscode.commands.executeCommand('autoclaw.fleet.addTeam');
                    break;
                case 'generateJoinPrompt':
                    await vscode.commands.executeCommand('autoclaw.fleet.joinPrompt');
                    break;
                case 'admitAgent':
                    await vscode.commands.executeCommand('autoclaw.fleet.admit');
                    break;
                case 'declineAgent':
                    await vscode.commands.executeCommand('autoclaw.fleet.decline');
                    break;
                // LANE B — per-agent Command & Control. The card detail buttons post
                // {command, agentId, sessionId}; forward that arg straight to the
                // matching command (which prompts/confirms as needed). evict opens a
                // REQUIRED modal inside its command.
                case 'messageAgent':
                    await vscode.commands.executeCommand('autoclaw.fleet.messageAgent', { agentId: message.agentId, sessionId: message.sessionId });
                    break;
                case 'pauseAgent':
                    await vscode.commands.executeCommand('autoclaw.fleet.pauseAgent', { agentId: message.agentId, sessionId: message.sessionId });
                    break;
                case 'resumeAgent':
                    await vscode.commands.executeCommand('autoclaw.fleet.resumeAgent', { agentId: message.agentId, sessionId: message.sessionId });
                    break;
                case 'reassignAgent':
                    await vscode.commands.executeCommand('autoclaw.fleet.reassignAgent', { agentId: message.agentId, sessionId: message.sessionId });
                    break;
                case 'evictAgent':
                    await vscode.commands.executeCommand('autoclaw.fleet.evict', { agentId: message.agentId, sessionId: message.sessionId });
                    break;
                case 'startOnboardAgent':
                    // One-click Start / Onboard for a detected-but-not-live agent card.
                    // Reuses the EXISTING join-prompt flow, pre-selecting THIS agent id so
                    // the target-tool picker step is skipped.
                    await vscode.commands.executeCommand('autoclaw.fleet.joinPrompt', { agentId: message.agentId });
                    break;
                case 'startKgDaemon':
                case 'restartKgDaemon':
                case 'openKgDashboard': {
                    const cmd = 'autoclaw.kg.openDashboard';
                    const all = await vscode.commands.getCommands(true);
                    if (all.includes(cmd)) {
                        await vscode.commands.executeCommand(cmd);
                    }
                    else {
                        getKgOutputChannel().show(true);
                    }
                    break;
                }
            }
        });
        // Send initial data
        refreshDashboardData(webviewView);
        refreshOrchestratorData(webviewView);
        // Set up periodic refresh interval as fallback for file watcher
        const config = vscode.workspace.getConfiguration('autoclaw.kdream');
        const refreshIntervalSeconds = config.get('refreshInterval', 30);
        if (refreshIntervalId) {
            clearInterval(refreshIntervalId);
        }
        refreshIntervalId = setInterval(async () => {
            if (kdreamView) {
                await refreshDashboardData(kdreamView);
                await refreshOrchestratorData(kdreamView);
            }
        }, refreshIntervalSeconds * 1000);
        // Clean up interval when view is disposed
        webviewView.onDidDispose(() => {
            if (refreshIntervalId) {
                clearInterval(refreshIntervalId);
                refreshIntervalId = undefined;
            }
            // Clear the module-level handle so visibility checks (incl. the L2 board
            // watcher's onBoardChange) short-circuit after the view is destroyed.
            kdreamView = undefined;
        });
    }
    _getHtmlForWebview(webview) {
        const cssPath = vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'kdream-dashboard.css');
        const jsPath = vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'kdream-dashboard.js');
        const cssUri = webview.asWebviewUri(cssPath);
        const jsUri = webview.asWebviewUri(jsPath);
        const sectionSearchCssUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'section-search.css'));
        const sectionSearchJsUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'section-search.js'));
        // UI-2: version footer (pure FS reads — no spawn).
        const version = (0, webview_hostContext_1.readExtensionVersionFromDisk)(this._extensionUri.fsPath);
        const wsRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        const branch = wsRoot ? (0, webview_hostContext_1.readGitBranchFromDisk)(wsRoot) : null;
        const footerHtml = (0, webview_render_1.renderPanelFooter)(version, branch);
        // UI-3: status-dot legend popover, injected in the Agents section header.
        const legendHtml = (0, webview_render_1.renderStatusLegend)();
        // Generate a nonce for CSP
        const nonce = this._generateNonce();
        // Content Security Policy - restrict sources to extension resources only
        const csp = `default-src 'none'; style-src ${webview.cspSource} 'nonce-${nonce}'; script-src ${webview.cspSource} 'nonce-${nonce}'; img-src ${webview.cspSource} data:;`;
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="${csp}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AutoClaw</title>
    <link rel="stylesheet" href="${cssUri}">
    <link rel="stylesheet" href="${sectionSearchCssUri}">
</head>
<body>
    <div id="panel-root" role="main">
        <!-- Quick Actions bar — always visible -->
        <div class="quick-actions" role="toolbar" aria-label="Quick actions">
            <button id="btn-launch-skill" class="primary" type="button" aria-label="Launch Skill">&#9889; Launch Skill</button>
            <button id="btn-refresh" type="button" aria-label="Refresh">&#8635; Refresh</button>
            <button id="btn-export" type="button" aria-label="Export Snapshot">&#128230; Export</button>
            <button id="btn-follow-new" class="follow-new-toggle" type="button" aria-label="Follow new updates is off" aria-pressed="false" title="Follow New: off">&#9675; Follow</button>
        </div>
        <div id="follow-new-summary" class="follow-new-summary" hidden aria-live="polite"></div>

        <!-- Fabric health badges (bridge + kg-daemon) -->
        <div class="fabric-health-bar" id="fabric-health-bar" role="status" aria-live="polite" aria-label="Fabric health">
            <span class="health-badge bridge-poll">bridge: poll</span>
            <span class="health-badge kg-off">kg: off</span>
        </div>

        <!-- Awaiting You section (per COORDINATION_IMPROVEMENTS §2.7) -->
        <div class="panel-section" id="awaiting-you-section">
            <div class="section-header" role="button" tabindex="0" aria-expanded="false" aria-controls="awaiting-you-body" data-section="awaiting-you">
                <span class="section-chevron"></span>
                Awaiting You
                <span class="section-badge" id="awaiting-you-badge">0</span>
            </div>
            <div class="section-body" id="awaiting-you-body">
                <div id="awaiting-you-content" aria-live="polite"><p class="empty">Loading...</p></div>
            </div>
        </div>

        <!-- Pending agents tray (FF-3) — joined via beacon, not yet admitted -->
        <div class="panel-section" id="pending-section">
            <div class="section-header" role="button" tabindex="0" aria-expanded="false" aria-controls="pending-body" data-section="pending">
                <span class="section-chevron"></span>
                Agents
                <span class="section-badge" id="pending-badge">0</span>
                <button id="btn-join-prompt" class="pending-invite-btn" type="button" aria-label="Generate join prompt">&#128203; Join prompt&#8230;</button>
                <button id="btn-invite-agent" class="pending-invite-btn" type="button" aria-label="Invite agent">&#10133; Invite&#8230;</button>
            </div>
            <div class="section-body" id="pending-body">
                <div id="pending-content" aria-live="polite"></div>
            </div>
        </div>

        <!-- Board section (kanban: backlog → in progress → review → blocked) -->
        <div class="panel-section open" id="board-section">
            <div class="section-header" role="button" tabindex="0" aria-expanded="true" aria-controls="board-body" data-section="board">
                <span class="section-chevron"></span>
                Board
                <span class="section-badge" id="board-badge">0</span>
                <button id="btn-board-open-wide" class="pending-invite-btn" type="button" aria-label="Open the board in the roomy Manager tab" title="Pop the board into the full editor-tab Manager">&#10530; Open Wide</button>
            </div>
            <div class="section-body" id="board-body">
                <div id="board-content"><p class="empty">Loading...</p></div>
            </div>
        </div>

        <!-- Agents section -->
        <div class="panel-section open" id="agents-section">
            <div class="section-header" role="button" tabindex="0" aria-expanded="true" aria-controls="agents-body" data-section="agents">
                <span class="section-chevron"></span>
                Team
                <span class="section-badge" id="agents-badge">0</span>
            </div>
            <div class="section-body" id="agents-body">
                <div id="agents-content"><p class="empty">Loading...</p></div>
                <div id="status-content"></div>
            </div>
        </div>

        <!-- Sprints section -->
        <div class="panel-section" id="sprints-section" style="display:none">
            <div class="section-header" role="button" tabindex="0" aria-expanded="false" aria-controls="sprints-body" data-section="sprints">
                <span class="section-chevron"></span>
                Sprints
                <span class="section-badge" id="sprints-badge"></span>
            </div>
            <div class="section-body" id="sprints-body">
                <div id="sprints-content"><p class="empty">Loading...</p></div>
            </div>
        </div>

        <!-- Messages section -->
        <div class="panel-section" id="messages-section">
            <div class="section-header" role="button" tabindex="0" aria-expanded="false" aria-controls="messages-body" data-section="messages">
                <span class="section-chevron"></span>
                Messages
                <span class="section-badge" id="messages-badge">0</span>
            </div>
            <div class="section-body" id="messages-body">
                <div id="messages-content"><p class="empty">Loading...</p></div>
            </div>
        </div>

        <!-- Tasks section -->
        <div class="panel-section" id="tasks-section">
            <div class="section-header" role="button" tabindex="0" aria-expanded="false" aria-controls="tasks-body" data-section="tasks">
                <span class="section-chevron"></span>
                Tasks
                <span class="section-badge" id="tasks-badge">0</span>
            </div>
            <div class="section-body" id="tasks-body">
                <div id="tasks-content"><p class="empty">Loading...</p></div>
                <div id="todos-content"></div>
            </div>
        </div>

        <!-- Activity section -->
        <div class="panel-section" id="activity-section">
            <div class="section-header" role="button" tabindex="0" aria-expanded="false" aria-controls="activity-body" data-section="activity">
                <span class="section-chevron"></span>
                Activity
            </div>
            <div class="section-body" id="activity-body">
                <div id="logs-content"><p class="empty">Loading...</p></div>
                <div id="timeline-content"></div>
            </div>
        </div>

        <!-- Health section -->
        <div class="panel-section" id="health-section">
            <div class="section-header" role="button" tabindex="0" aria-expanded="false" aria-controls="health-body" data-section="health">
                <span class="section-chevron"></span>
                Health
            </div>
            <div class="section-body" id="health-body">
                <div id="adapter-health-content"><p class="empty">Loading...</p></div>
                <div id="code-churn-content"></div>
                <div id="productivity-content"></div>
                <div id="health-content"></div>
            </div>
        </div>
    </div>
    <!-- Floating jump-to-top / jump-to-bottom. Shown by the panel JS only when
         the content is tall enough to scroll; keeps Status + commands reachable
         from anywhere in a long panel. -->
    <div id="jump-nav" class="jump-nav" hidden aria-hidden="true">
        <button id="jump-top" class="jump-btn" type="button" title="Jump to top" aria-label="Jump to top">&#8593;</button>
        <button id="jump-bottom" class="jump-btn" type="button" title="Jump to bottom" aria-label="Jump to bottom">&#8595;</button>
    </div>
    ${footerHtml}
    <script nonce="${nonce}" src="${jsUri}"></script>
    <script nonce="${nonce}" src="${sectionSearchJsUri}"></script>
</body>
</html>`;
    }
    _generateNonce() {
        return crypto.randomBytes(16).toString('hex');
    }
}
exports.KDreamViewProvider = KDreamViewProvider;
KDreamViewProvider.viewType = 'kdreamDashboard';
async function runExportSnapshotCommand(extensionPath) {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showWarningMessage('AutoClaw: open a workspace folder before exporting a snapshot.');
        return;
    }
    const config = vscode.workspace.getConfiguration('autoclaw.kdream');
    const zippymeshUrl = config.get('zippymeshUrl', 'http://localhost:20128');
    const isAntigravityHost = /antigravity/i.test(vscode.env.appName || '');
    const shim = {
        workspaceRoot,
        isExtensionInstalled: (id) => !!vscode.extensions.getExtension(id),
        isAntigravityHost,
        hostAppName: vscode.env.appName,
        zippymeshUrl
    };
    let snapshot;
    try {
        snapshot = await (0, snapshot_1.buildSnapshot)(workspaceRoot, extensionPath, shim);
    }
    catch (e) {
        vscode.window.showErrorMessage(`AutoClaw: failed to build snapshot — ${e.message}`);
        return;
    }
    const today = (0, kdream_helpers_1.getTodayDate)();
    const defaultUri = vscode.Uri.file(path.join(workspaceRoot, `autoclaw-snapshot-${today}.md`));
    const target = await vscode.window.showSaveDialog({
        defaultUri,
        filters: { Markdown: ['md'] },
        saveLabel: 'Save Snapshot'
    });
    if (!target) {
        return; // user cancelled
    }
    try {
        await fsPromises.writeFile(target.fsPath, snapshot, 'utf8');
    }
    catch (e) {
        vscode.window.showErrorMessage(`AutoClaw: failed to write snapshot — ${e.message}`);
        return;
    }
    const action = await vscode.window.showInformationMessage(`Snapshot saved: ${target.fsPath}`, 'Open');
    if (action === 'Open') {
        await vscode.window.showTextDocument(target);
    }
}
async function runDoctorCommand(extensionPath, format = 'text') {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const config = vscode.workspace.getConfiguration('autoclaw.kdream');
    const zippymeshUrl = config.get('zippymeshUrl', 'http://localhost:20128');
    const isAntigravityHost = /antigravity/i.test(vscode.env.appName || '');
    const kgCfg = vscode.workspace.getConfiguration('autoclaw.kg');
    // The KG is an in-process store; `enabled` defaults on. `port`/`dbPath` are
    // passed through so the doctor reflects the configured settings (port only
    // governs the optional standalone daemon).
    const kgEnabled = kgCfg.get('enabled', true);
    const kgConfiguredPort = kgCfg.get('port', 9877);
    const kgDbPath = kgCfg.get('dbPath', '');
    const report = await (0, doctor_1.runDoctor)(extensionPath, {
        workspaceRoot,
        isExtensionInstalled: (id) => !!vscode.extensions.getExtension(id),
        isAntigravityHost,
        hostAppName: vscode.env.appName,
        zippymeshUrl,
        kg: {
            enabled: kgEnabled,
            port: kgConfiguredPort,
            dbPath: kgDbPath,
        }
    });
    if (!doctorOutputChannel) {
        doctorOutputChannel = vscode.window.createOutputChannel('AutoClaw Doctor');
    }
    doctorOutputChannel.clear();
    doctorOutputChannel.appendLine(format === 'json' ? (0, doctor_1.renderReportJson)(report) : (0, doctor_1.renderReport)(report));
    doctorOutputChannel.show(true);
}
function getAutobuildOutputChannel() {
    if (!autobuildOutputChannel) {
        autobuildOutputChannel = vscode.window.createOutputChannel('AutoClaw AutoBuild');
    }
    return autobuildOutputChannel;
}
function startAutobuildScheduler(context) {
    if (autobuildIntervalId) {
        clearInterval(autobuildIntervalId);
        autobuildIntervalId = undefined;
    }
    const config = vscode.workspace.getConfiguration('autoclaw.autobuild');
    const enabled = config.get('enabled', true);
    if (!enabled) {
        return;
    }
    const intervalSeconds = Math.max(10, config.get('tickIntervalSeconds', 30));
    const runTick = async () => {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceRoot) {
            // Quietly no-op when no workspace is open.
            return;
        }
        try {
            const cfg = vscode.workspace.getConfiguration('autoclaw.autobuild');
            // Stamp the scheduler heartbeat so `list`/the panel can tell live
            // automation from dormant — a registered cron is inert without us.
            await (0, autobuild_1.writeSchedulerHeartbeat)(workspaceRoot, intervalSeconds);
            const report = await (0, autobuild_1.tick)(workspaceRoot, new Date(), {
                enabled: cfg.get('enabled', true),
                runner: autobuild_1.runWorkflow
            });
            if (report.ranNow.length > 0) {
                getAutobuildOutputChannel().appendLine(`[${new Date().toISOString()}] tick fired: ${report.ranNow.join(', ')}`);
            }
            for (const err of report.errors) {
                getAutobuildOutputChannel().appendLine(`[${new Date().toISOString()}] error in workflow ${err.name}: ${err.message}`);
            }
        }
        catch (e) {
            console.error('autobuild tick failed:', e);
        }
    };
    autobuildIntervalId = setInterval(runTick, intervalSeconds * 1000);
    // Kick off an immediate tick so a freshly-activated extension picks up
    // due workflows without waiting a full interval.
    runTick().catch(() => { });
    context.subscriptions.push({
        dispose: () => {
            if (autobuildIntervalId) {
                clearInterval(autobuildIntervalId);
                autobuildIntervalId = undefined;
            }
        }
    });
}
async function autobuildRunNowCommand() {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage('AutoBuild: open a workspace first.');
        return;
    }
    const discovered = (0, autobuild_1.discoverWorkflows)(workspaceRoot);
    if (discovered.length === 0) {
        vscode.window.showInformationMessage('AutoBuild: no workflows found in .autoclaw/autobuild/workflows/.');
        return;
    }
    const pick = await vscode.window.showQuickPick(discovered.map(d => ({
        label: d.workflow.name,
        description: d.workflow.cron,
        detail: d.filePath,
        filePath: d.filePath
    })), { placeHolder: 'Select an AutoBuild workflow to run now' });
    if (!pick) {
        return;
    }
    const channel = getAutobuildOutputChannel();
    channel.show(true);
    channel.appendLine(`[runNow] starting ${pick.label}`);
    try {
        const result = await (0, autobuild_1.runWorkflow)(pick.filePath, (0, autobuild_1.getRunsDir)(workspaceRoot));
        channel.appendLine(`[runNow] ${result.workflow}: ${result.status} (log: ${result.logPath})`);
        if (shouldShowNotification('info')) {
            vscode.window.showInformationMessage(`AutoBuild ${result.workflow}: ${result.status}`);
        }
    }
    catch (e) {
        channel.appendLine(`[runNow] error: ${e.message}`);
        vscode.window.showErrorMessage(`AutoBuild run failed: ${e.message}`);
    }
}
async function autobuildTailCommand() {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage('AutoBuild: open a workspace first.');
        return;
    }
    const discovered = (0, autobuild_1.discoverWorkflows)(workspaceRoot);
    if (discovered.length === 0) {
        vscode.window.showInformationMessage('AutoBuild: no workflows found.');
        return;
    }
    const pick = await vscode.window.showQuickPick(discovered.map(d => ({ label: d.workflow.name, description: d.workflow.cron })), { placeHolder: 'Select a workflow to tail the most recent run log' });
    if (!pick) {
        return;
    }
    const logPath = (0, autobuild_1.findLatestRunLog)(workspaceRoot, pick.label);
    if (!logPath) {
        vscode.window.showInformationMessage(`AutoBuild: no run logs yet for ${pick.label}.`);
        return;
    }
    const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(logPath));
    await vscode.window.showTextDocument(doc);
}
// ---------------------------------------------------------------------------
// Welcome / Onboarding
// ---------------------------------------------------------------------------
/**
 * Open the AutoClaw getting-started walkthrough. Best-effort: VS Code forks /
 * non-Microsoft hosts may not support `workbench.action.openWalkthrough`, so a
 * failure is swallowed rather than surfaced. Exposed as `autoclaw.openWalkthrough`
 * so the first-run nudge, the panel, and the docs can all link to it.
 */
async function openGettingStartedWalkthrough() {
    try {
        await vscode.commands.executeCommand('workbench.action.openWalkthrough', 'ZippyTechnologiesLLC.autoclaw#autoclaw.fleet.getStarted', false);
    }
    catch { /* host doesn't support walkthroughs — non-fatal */ }
}
async function showWelcomeIfNeeded(context) {
    // Bump the key suffix whenever this message changes so existing installs see
    // the new onboarding exactly once (the old `.2.0.0` key is intentionally left
    // behind). Promotes the team-onboarding flow that is now the headline feature.
    const WELCOME_KEY = 'autoclaw.welcomeShown.3.6';
    if (context.globalState.get(WELCOME_KEY)) {
        return;
    }
    const ide = vscode.env.appName || 'VS Code';
    const isKiro = /kiro/i.test(ide);
    const isCursor = /cursor/i.test(ide);
    let tip;
    if (isKiro) {
        tip = 'In Kiro chat, use # to attach steering files (kdream, orchestrate).';
    }
    else if (isCursor) {
        tip = 'Skills load from .cursor/rules/ — type commands in chat (e.g. "orchestrate plan").';
    }
    else {
        tip = 'Or use /kdream, /orchestrate, or "AutoClaw: Launch Skill" in chat.';
    }
    const ADD_TEAM = 'Add a team';
    const WALKTHROUGH = 'Open walkthrough';
    const action = await vscode.window.showInformationMessage(`AutoClaw is ready (${ide}). Put a small team of AI agents on this repo — start with "Solo + Reviewer". ${tip}`, ADD_TEAM, WALKTHROUGH, 'Dismiss');
    if (action === ADD_TEAM) {
        await vscode.commands.executeCommand('autoclaw.fleet.addTeam');
    }
    else if (action === WALKTHROUGH) {
        await openGettingStartedWalkthrough();
    }
    await context.globalState.update(WELCOME_KEY, true);
}
const AGENT_DEFINITIONS = [
    { id: 'kiro', name: 'Kiro', extensionId: 'amazon.kiro', rulesFormat: 'kiro-steering', rulesDir: '.kiro/steering', hooksSupported: true },
    { id: 'kilocode', name: 'Kilo Code', extensionId: 'kilocode.kilo-code', rulesFormat: 'clinerules', rulesDir: '.clinerules', hooksSupported: false },
    { id: 'cline', name: 'Cline', extensionId: 'saoudrizwan.claude-dev', rulesFormat: 'clinerules', rulesDir: '.clinerules', hooksSupported: false },
    { id: 'claude-code', name: 'Claude Code', extensionId: 'Anthropic.claude-code', rulesFormat: 'claude-rules', rulesDir: '.claude/rules', hooksSupported: false },
    { id: 'continue', name: 'Continue', extensionId: 'Continue.continue', rulesFormat: 'continue-prompts', rulesDir: '.continue/prompts', hooksSupported: false },
    { id: 'codex', name: 'Codex', extensionId: 'openai.codex', rulesFormat: 'codex-instructions', rulesDir: '.codex', hooksSupported: false },
    { id: 'cursor', name: 'Cursor', extensionId: null, rulesFormat: 'cursor-rules', rulesDir: '.cursor/rules', hooksSupported: false },
    { id: 'windsurf', name: 'Windsurf', extensionId: 'codeium.windsurf', rulesFormat: 'windsurf-rules', rulesDir: '.windsurf/rules', hooksSupported: false },
    { id: 'antigravity', name: 'Antigravity', extensionId: null, rulesFormat: 'antigravity-rules', rulesDir: '.agent/rules', hooksSupported: false },
];
/**
 * `detected: true` means the agent is REGISTERED in this workspace — either
 * its extension is installed OR its rules directory exists (.cursor, .agent,
 * etc.) — NOT that it is actually running right now. Distinguish the two:
 *
 *   - Cross-agent rules generation: use `detected` so peer-agent inboxes are
 *     wired up even when an agent isn't loaded at the moment.
 *   - Heartbeat ticker / presence reporting: ALSO check
 *     `vscode.extensions.getExtension(id)?.isActive` or `isHost`. The mere
 *     presence of `.agent/` in the workspace does NOT mean Antigravity is
 *     running — see writeAgentHeartbeats() for the presence gate.
 */
function detectAgents(workspaceRoot) {
    const isAntigravityHost = /antigravity/i.test(vscode.env.appName || '');
    const isKiroHost = /kiro/i.test(vscode.env.appName || '');
    const isCursorHost = /cursor/i.test(vscode.env.appName || '');
    const isWindsurfHost = /windsurf/i.test(vscode.env.appName || '');
    return AGENT_DEFINITIONS.map(def => {
        let detected = false;
        if (def.extensionId) {
            detected = !!vscode.extensions.getExtension(def.extensionId);
        }
        // Host IDE is always detected as an agent even without its own extension ID
        if (def.id === 'kiro' && isKiroHost) {
            detected = true;
        }
        if (def.id === 'cursor' && (isCursorHost || hasCursorConfig(workspaceRoot))) {
            detected = true;
        }
        if (def.id === 'windsurf' && isWindsurfHost) {
            detected = true;
        }
        if (def.id === 'antigravity' && (isAntigravityHost || fs.existsSync(path.join(workspaceRoot, '.agent')))) {
            detected = true;
        }
        return { ...def, detected };
    });
}
/**
 * Resolve which host the "Launch Skill" picker should target. Forks are
 * unambiguous via appName (currentIde); in stock VS Code we honor an explicit
 * `autoclaw.hostAgentId`, else prefer an installed Claude Code, else the single
 * installed agent extension. Falls back to claude-code.
 */
function resolveLauncherHost(workspaceRoot) {
    if (currentIde === 'cursor' || currentIde === 'kiro' || currentIde === 'windsurf' || currentIde === 'antigravity') {
        return currentIde;
    }
    const explicit = vscode.workspace.getConfiguration('autoclaw').get('hostAgentId');
    if (explicit && skillLauncher_1.HOST_SKILL_CONVENTIONS[explicit]) {
        return explicit;
    }
    const installed = detectAgents(workspaceRoot).filter(a => a.detected && skillLauncher_1.HOST_SKILL_CONVENTIONS[a.id]);
    if (installed.some(a => a.id === 'claude-code')) {
        return 'claude-code';
    }
    if (installed.length >= 1) {
        return installed[0].id;
    }
    return 'claude-code';
}
/**
 * True if `skill`'s adapter is actually installed for `hostId` — a global Claude
 * Code skill dir (~/.claude/skills/<skill>/SKILL.md), or the host's workspace
 * rule file. Used to warn before copying a prompt that points at nothing.
 */
function isSkillInstalled(hostId, skill, workspaceRoot) {
    const conv = skillLauncher_1.HOST_SKILL_CONVENTIONS[hostId];
    if (!conv) {
        return false;
    }
    if (conv.style === 'slash') {
        return fs.existsSync(path.join(os.homedir(), '.claude', 'skills', skill, 'SKILL.md'));
    }
    if (!workspaceRoot) {
        return false;
    }
    return fs.existsSync(path.join(workspaceRoot, conv.dir, `${skill}${conv.ext}`));
}
function generateCrossAgentRules(agentId, agentName, allAgents) {
    const otherAgents = allAgents.filter(a => a.detected && a.id !== agentId);
    const otherNames = otherAgents.map(a => a.name).join(', ');
    const inboxLines = otherAgents
        .map(a => `- To ${a.name}: \`.autoclaw/orchestrator/comms/inboxes/${a.id}/\``)
        .join('\n');
    return `# Cross-Agent Coordination Protocol — ${agentName}

## Multi-Agent Team

You (${agentName}) are part of a multi-agent team. Other active agents: ${otherNames || 'none detected'}.
All agents coordinate through the AutoClaw Orchestrator.

## Your Mailbox

Check at the START of every task and AFTER completing work:
- **Inbox**: \`.autoclaw/orchestrator/comms/inboxes/${agentId}/\`
- **Shared**: \`.autoclaw/orchestrator/comms/inboxes/shared/\`

Message types: review_request, review_response, consensus_vote, task_claim,
task_complete, finding_report, question, answer.

## Send Messages

Write JSON to target inbox. Filename: \`{timestamp}-{type}-${agentId}.json\`
${inboxLines}
- Broadcast: \`.autoclaw/orchestrator/comms/inboxes/shared/\`

## On Task Completion

1. Broadcast task_complete to shared/
2. Write review_request to other agents' inboxes
3. Check YOUR inbox for pending reviews

## Consensus

Tasks require 2/3 majority approval. Security findings require unanimous.
Write votes to \`consensus/active/{task_id}-${agentId}.json\`.

## Scope

Check \`.autoclaw/orchestrator/sprints/plan-summary.yaml\` for assignments.
Stay in your assigned scope. Coordinate via messages for cross-scope changes.

${(0, contract_1.renderOrientationBlock)()}
`;
}
// ---------------------------------------------------------------------------
// Cloud relay consent (SEC-2 / RELAY-WIRE) — explicit opt-in before any
// cross-machine forwarding. Writes relay-config.json with tier:ga + consentAckAt.
// ---------------------------------------------------------------------------
async function cloudEnableRelayCommand() {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage('AutoClaw: open a workspace first.');
        return;
    }
    const autoclawDir = path.join(workspaceRoot, '.autoclaw');
    const current = await (0, cloud_1.readRelayConfig)(autoclawDir);
    const endpoint = await vscode.window.showInputBox({
        title: 'Enable AutoClaw Cloud Relay',
        prompt: 'Relay endpoint URL for cross-machine fleet coordination. Must be https.',
        value: current.endpoint || 'https://',
        ignoreFocusOut: true,
        validateInput: (v) => (0, cloud_1.endpointIsSecure)(v.trim()) ? undefined : 'Must be an https:// URL (plain http allowed only for localhost).',
    });
    if (!endpoint) {
        return;
    }
    const ep = endpoint.trim();
    // Explicit consent — name exactly what leaves the machine and to where.
    const choice = await vscode.window.showWarningMessage(`Enable the AutoClaw cloud relay?\n\n` +
        `When enabled AND you are logged in, AutoClaw forwards to:\n${ep}\n\n` +
        `• Inbox message bodies are encrypted before leaving this machine.\n` +
        `• Heartbeats (agent status / current task) are sent in clear.\n` +
        `• Nothing is sent until you also log in (cloud login).\n\n` +
        `You can disable this at any time.`, { modal: true }, 'Enable relay');
    if (choice !== 'Enable relay') {
        return;
    }
    await (0, cloud_1.writeRelayConfig)(autoclawDir, {
        ...(0, cloud_1.defaultRelayConfig)(),
        endpoint: ep,
        enabled: true,
        tier: 'ga',
        consentAckAt: new Date().toISOString(),
        forward: { heartbeats: true, inbox: true },
    });
    vscode.window.showInformationMessage('AutoClaw: cloud relay enabled. Run "AutoClaw: Cloud Login" to start forwarding.');
}
async function cloudDisableRelayCommand() {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage('AutoClaw: open a workspace first.');
        return;
    }
    const autoclawDir = path.join(workspaceRoot, '.autoclaw');
    const current = await (0, cloud_1.readRelayConfig)(autoclawDir);
    await (0, cloud_1.writeRelayConfig)(autoclawDir, { ...current, enabled: false });
    vscode.window.showInformationMessage('AutoClaw: cloud relay disabled (inert). Your settings are kept — re-enable anytime.');
}
// ---------------------------------------------------------------------------
// Fabric onboarding (AF-4b) — register a platform agent as a typed fabric worker.
// ---------------------------------------------------------------------------
async function fabricOnboardCommand() {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage('AutoClaw: open a workspace first.');
        return;
    }
    const commsDir = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'comms');
    const pick = await vscode.window.showQuickPick(runners_1.BUILTIN_RUNNER_IDS.map(id => ({ label: id, description: `default type: ${(0, agentTypes_1.defaultAgentTypeForRunner)(id)}` })), { placeHolder: 'Onboard which platform agent into the fabric?' });
    if (!pick) {
        return;
    }
    const registry = (0, runners_1.createDefaultRunnerRegistry)();
    const entry = registry.get(pick.label);
    if (!entry) {
        vscode.window.showErrorMessage(`AutoClaw: unknown runner "${pick.label}".`);
        return;
    }
    try {
        const report = await (0, onboarding_1.onboardPlatform)({
            runner: entry.runner,
            readRegistry: () => (0, comms_1.readRegistry)(commsDir),
            writeRegistry: (reg) => (0, comms_1.writeRegistry)(commsDir, reg),
        });
        if (report.registered) {
            vscode.window.showInformationMessage(`AutoClaw fabric: ${report.detail}`);
        }
        else {
            vscode.window.showWarningMessage(`AutoClaw fabric: ${report.platform} ${report.detail}`);
        }
    }
    catch (err) {
        vscode.window.showErrorMessage(`AutoClaw fabric onboarding failed: ${String(err)}`);
    }
}
// ---------------------------------------------------------------------------
// Heartbeat Ticker — writes real heartbeats for detected agents based on
// actual VS Code signals (extension installed + active, visible editors,
// recent file saves, running tasks).
// ---------------------------------------------------------------------------
let heartbeatIntervalId;
/** Tracks the last file-save timestamp per workspace folder. */
let lastFileSaveTimestamp = 0;
/** Stable per-extension-activation session UUID stamped into every heartbeat. */
const sessionId = (() => {
    // Node 19+ exposes crypto.randomUUID(); fall back to a hex random for older runtimes.
    const c = require('crypto');
    return typeof c.randomUUID === 'function' ? c.randomUUID() : c.randomBytes(16).toString('hex');
})();
/** Orchestrator perpetual loop handle — started in activate(), stopped in deactivate(). */
let activeOrchestratorLoopHandle = null;
function startHeartbeatTicker(context) {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        return;
    }
    const commsDir = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'comms');
    const autoclawDir = path.join(workspaceRoot, '.autoclaw');
    // RELAY-WIRE: one relay client for the session. Every call is a safe no-op
    // unless the user has explicitly enabled + consented to the cloud relay AND
    // is logged in (relayIsActive + a stored token). Nothing transmits otherwise.
    const relay = new cloud_1.CloudRelay({ autoclawDir });
    // Track file saves as a proxy for "an agent is actively editing"
    const saveWatcher = vscode.workspace.onDidSaveTextDocument(() => {
        lastFileSaveTimestamp = Date.now();
    });
    context.subscriptions.push(saveWatcher);
    let relayTickInFlight = false;
    const tick = async () => {
        await writeAgentHeartbeats(workspaceRoot, commsDir).catch(() => { });
        // Forward heartbeats + inbox messages + drain the offline queue. Best-effort;
        // a relay failure must never disrupt the local heartbeat loop. The in-flight
        // guard stops a slow send from overlapping the next 30s tick.
        if (relayTickInFlight) {
            return;
        }
        relayTickInFlight = true;
        try {
            await (0, cloud_1.forwardHeartbeats)(autoclawDir, relay);
            await (0, cloud_1.forwardInbox)(autoclawDir, relay);
            await relay.flushQueue();
            // AF-7b/AF-10c: pull cross-machine messages + remote heartbeats.
            const fetched = await relay.fetchInbox();
            if (fetched.messages.length > 0) {
                await (0, cloud_1.applyFetchedToInboxes)(autoclawDir, fetched.messages);
            }
            await (0, cloud_1.fetchAndCacheHeartbeats)(autoclawDir, relay);
        }
        catch {
            /* relay is opt-in + best-effort */
        }
        finally {
            relayTickInFlight = false;
        }
    };
    // Write/forward immediately, then every 30s
    tick();
    heartbeatIntervalId = setInterval(() => { tick(); }, 30000);
    context.subscriptions.push({
        dispose: () => {
            if (heartbeatIntervalId) {
                clearInterval(heartbeatIntervalId);
                heartbeatIntervalId = undefined;
            }
        }
    });
}
let reconcileIntervalId;
function startReconcileTicker(context) {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        return;
    }
    const cfg = vscode.workspace.getConfiguration('autoclaw.orchestrate');
    const intervalSec = cfg.get('reconcileIntervalSeconds', 300);
    if (intervalSec <= 0) {
        return;
    } // disabled
    const tick = async () => {
        try {
            const report = await (0, reconcile_1.runReconcile)(workspaceRoot);
            const reportPath = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'reconcile-report.json');
            await fsPromises.mkdir(path.dirname(reportPath), { recursive: true });
            await fsPromises.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
            const commsDir = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'comms');
            if (report.mismatches.length > 0) {
                await (0, comms_1.sendMessage)(commsDir, {
                    id: '', from: 'orchestrator', to: 'shared', type: 'system',
                    timestamp: new Date().toISOString(),
                    payload: {
                        kind: 'reconcile_report',
                        mismatch_count: report.mismatches.length,
                        mismatches: report.mismatches.slice(0, 25), // cap to keep message size sane
                    },
                    requires_response: false,
                }).catch(() => { });
            }
            // Capability resolution sweep — collect capability_pending tasks from
            // any sprint YAML files, broadcast queries for new ones, and resolve
            // offers for previously broadcast queries.
            await runCapabilityResolutionSweep(workspaceRoot, commsDir);
            // Program-plane heartbeat + fan-in
            const homeDir = require('os').homedir();
            await (0, program_plane_1.touchParticipant)(workspaceRoot, homeDir).catch(() => { });
            const link = await (0, program_plane_1.readProgramLink)(workspaceRoot).catch(() => null);
            if (link) {
                const added = await (0, program_plane_1.fanInCommsLog)(link.program_id, homeDir).catch(() => 0);
                if (added > 0) {
                    console.log(`[autoclaw] program-plane fan-in: +${added} lines`);
                }
            }
        }
        catch (err) {
            console.error('reconcile sweep failed:', err);
        }
    };
    // Run once on startup, then on interval.
    tick();
    reconcileIntervalId = setInterval(tick, intervalSec * 1000);
    context.subscriptions.push({
        dispose: () => {
            if (reconcileIntervalId) {
                clearInterval(reconcileIntervalId);
                reconcileIntervalId = undefined;
            }
        },
    });
}
/**
 * Scans sprint YAML files for `capability_pending` tasks, broadcasts
 * `capability_query` messages for any not yet broadcast, and resolves
 * any received `capability_offer` messages by logging the winner.
 */
async function runCapabilityResolutionSweep(workspaceRoot, commsDir) {
    const sprintsDir = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'sprints');
    let pendingTasks = [];
    try {
        const files = await fsPromises.readdir(sprintsDir);
        for (const file of files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))) {
            try {
                const raw = await fsPromises.readFile(path.join(sprintsDir, file), 'utf8');
                // Extract capability_pending arrays from simple YAML (avoid heavy parser dep)
                const match = raw.match(/capability_pending:\s*\n([\s\S]*?)(?=\n\w|\n---|\Z)/);
                if (match) {
                    // Use JSON-keyed sprint file if available (written by writePlanArtifacts)
                    const jsonFile = file.replace(/\.ya?ml$/, '.json');
                    try {
                        const jsonRaw = await fsPromises.readFile(path.join(sprintsDir, jsonFile), 'utf8');
                        const sprint = JSON.parse(jsonRaw);
                        if (Array.isArray(sprint.capability_pending)) {
                            pendingTasks.push(...sprint.capability_pending);
                        }
                    }
                    catch { /* no JSON twin — skip */ }
                }
            }
            catch { /* skip unreadable */ }
        }
    }
    catch { /* sprints dir absent */ }
    if (pendingTasks.length === 0) {
        return;
    }
    // Deduplicate by query_id
    const seen = new Set();
    pendingTasks = pendingTasks.filter(t => {
        if (seen.has(t.query_id)) {
            return false;
        }
        seen.add(t.query_id);
        return true;
    });
    await (0, orchestrate_1.broadcastCapabilityQueries)(commsDir, 'orchestrator', pendingTasks).catch(() => { });
    const resolutions = await (0, orchestrate_1.resolveCapabilityOffers)(commsDir, 'orchestrator', pendingTasks).catch(() => []);
    if (resolutions.length > 0) {
        const resolvedPath = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'capability-resolutions.json');
        await fsPromises.writeFile(resolvedPath, JSON.stringify(resolutions, null, 2), 'utf8').catch(() => { });
        console.log(`[autoclaw] capability resolution: ${resolutions.length} task(s) matched to remote agents`);
    }
}
async function writeAgentHeartbeats(workspaceRoot, commsDir) {
    const agents = detectAgents(workspaceRoot);
    const detectedAgents = agents.filter(a => a.detected);
    const now = new Date().toISOString();
    const nowMs = Date.now();
    // A file save within the last 2 minutes means something is actively editing
    const recentSave = (nowMs - lastFileSaveTimestamp) < 2 * 60 * 1000;
    // Check if there are visible text editors (someone is working)
    const hasVisibleEditors = vscode.window.visibleTextEditors.length > 0;
    // The HOST agent — only one agent legitimately gets stamped with the host's
    // sessionId. Peer agents own their own session_id and the daemon must not
    // overwrite it. Fixes session_id collision across all detected agents.
    const hostAgentId = (0, comms_1.detectAutoclawHostAgent)(vscode.env.appName ?? '');
    for (const agent of detectedAgents) {
        // PRESENCE GATE — the tick may stamp a live heartbeat ONLY for the host
        // agent. Everyone else owns their own presence.
        //
        // The old gate also stamped any agent whose EXTENSION was activated. That
        // conflated "installed + loaded" (detected) with "a session is actually
        // running" (live): a peer like Kilo Code auto-activates its extension at
        // IDE startup, so the tick wrote it a fresh heartbeat every cycle — same
        // millisecond timestamp as the host, no session_id, and a `status` copied
        // from HOST file-save / editor activity. The panel then showed the peer as
        // "ACTIVE · Ns ago" even though no chat session existed. (Reported by a
        // Claude Code session in another workspace; confirmed against runtime.)
        //
        // A real peer agent following the cross-agent protocol self-writes its own
        // heartbeat (REGISTER stamps `<agent>.json` with its session_id; SYNC
        // refreshes it). So the honest model is: the host stamps the host; every
        // non-host peer's liveness is exactly what that peer last wrote — and it is
        // allowed to go stale when the peer stops writing.
        const isHost = agent.id === hostAgentId;
        if (!isHost) {
            // Never fabricate or refresh a peer's heartbeat. Leave whatever the peer
            // itself last wrote in place; downstream consumers compare its timestamp
            // to the wall clock and treat a stale heartbeat as "presence unknown."
            continue;
        }
        // Status now only reflects activity we can ACTUALLY attribute to this
        // agent: either the host IDE shell or its own active extension.
        const status = (recentSave || hasVisibleEditors) ? 'active' : 'idle';
        // Read existing heartbeat so agent-set fields survive the tick.
        // The tick owns timestamp + status; the AGENT owns session_id +
        // current_task + sprint.
        const existingHb = await (0, comms_1.readHeartbeat)(commsDir, agent.id);
        const hb = {
            agent_id: agent.id,
            timestamp: now,
            status,
            // current_task is OWNED BY THE AGENT. vscode.window.activeTextEditor is
            // HOST UI state (which file the user has open), not agent task state.
            // Stamping it overwrites real claims (e.g. UI-4) with junk like ".env"
            // or AikidoSecurity output channel paths. Preserve the agent's value.
            current_task: existingHb?.current_task ?? null,
            sprint: existingHb?.sprint ?? null,
            // session_id is OWNED BY THE AGENT. claude-code's session_id is NOT
            // kilocode's session_id. Only stamp the host's sessionId on the host's
            // own heartbeat; for peer agents preserve whatever they wrote.
            session_id: isHost ? sessionId : existingHb?.session_id,
        };
        // Try to read sprint assignment from plan-summary — overrides agent-set value when found.
        try {
            const planPath = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'sprints', 'plan-summary.yaml');
            if (fs.existsSync(planPath)) {
                const planContent = await fsPromises.readFile(planPath, 'utf8');
                const inProgress = planContent.match(/- number: (\d+)[\s\S]*?status: in_progress/);
                const assigned = planContent.match(/- number: (\d+)[\s\S]*?status: assigned/);
                if (inProgress) {
                    hb.sprint = parseInt(inProgress[1]);
                }
                else if (assigned) {
                    hb.sprint = parseInt(assigned[1]);
                }
            }
        }
        catch { /* no plan, that's fine */ }
        await (0, comms_1.writeHeartbeat)(commsDir, hb);
    }
}
async function provisionCrossAgentComms() {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        return;
    }
    const registryPath = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'comms', 'registry.json');
    const commsDir = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'comms');
    const agents = detectAgents(workspaceRoot);
    const detectedAgents = agents.filter(a => a.detected);
    // A single detected agent still gets a comms tree so a newcomer (or a
    // scaffolded peer) can be wired into it later. Only bail when none are found.
    if (detectedAgents.length < 1) {
        return;
    }
    // Skip if already provisioned with same agent set
    try {
        const existing = JSON.parse(await fsPromises.readFile(registryPath, 'utf8'));
        const existingIds = new Set((existing.agents || []).map((a) => a.id));
        const currentIds = new Set(detectedAgents.map(a => a.id));
        if (existingIds.size === currentIds.size && [...currentIds].every(id => existingIds.has(id))) {
            return;
        }
    }
    catch { /* proceed */ }
    // Create directories
    const dirs = [
        path.join(commsDir, 'inboxes', 'shared'),
        path.join(commsDir, 'consensus', 'active'),
        path.join(commsDir, 'consensus', 'resolved'),
        path.join(commsDir, 'reviews', 'pending'),
        path.join(commsDir, 'reviews', 'completed'),
        path.join(commsDir, 'heartbeats'),
        ...detectedAgents.map(a => path.join(commsDir, 'inboxes', a.id)),
    ];
    for (const dir of dirs) {
        await fsPromises.mkdir(dir, { recursive: true });
    }
    // Write cross-agent rules for each agent
    for (const agent of detectedAgents) {
        const rulesContent = generateCrossAgentRules(agent.id, agent.name, agents);
        const rulesDir = path.join(workspaceRoot, agent.rulesDir);
        await fsPromises.mkdir(rulesDir, { recursive: true });
        const isKiro = agent.rulesFormat === 'kiro-steering';
        const isCodex = agent.rulesFormat === 'codex-instructions';
        const filename = isCodex ? 'instructions.md' : isKiro ? 'cross-agent.md' : 'cross-agent-protocol.md';
        const content = isKiro ? '---\ninclusion: auto\n---\n\n' + rulesContent : rulesContent;
        const rulesPath = path.join(rulesDir, filename);
        if (!fs.existsSync(rulesPath)) {
            await fsPromises.writeFile(rulesPath, content, 'utf8');
        }
    }
    // Orientation contract (PR #61, restored after the 882a65b sweep): write
    // AGENT-ORIENTATION.md + per-store READMEs so a foreign agent joining the
    // workspace reads accurate facts instead of reverse-engineering (and
    // mis-describing) the layout. Best-effort; never blocks provisioning.
    try {
        await (0, orientation_1.writeAgentOrientation)(workspaceRoot);
    }
    catch { /* best-effort */ }
    // Write registry
    const registry = {
        agents: detectedAgents.map(a => ({
            id: a.id, name: a.name, extension_id: a.extensionId, detected: true,
            rules_path: path.join(a.rulesDir, a.rulesFormat === 'codex-instructions' ? 'instructions.md' : a.rulesFormat === 'kiro-steering' ? 'cross-agent.md' : 'cross-agent-protocol.md'),
            inbox_path: `.autoclaw/orchestrator/comms/inboxes/${a.id}/`,
            hooks_supported: a.hooksSupported, last_heartbeat: null, status: 'detected',
            // loop_mechanism + keepalive_template so `/orchestrate revive <id>` resolves
            // a shipped template (codex.md, cursor.md, …) for this agent.
            ...(0, scaffold_1.keepaliveProfileFor)(a.id),
        })),
        ide: vscode.env.appName || 'unknown',
        provisioned_at: new Date().toISOString(),
    };
    await fsPromises.writeFile(registryPath, JSON.stringify(registry, null, 2), 'utf8');
    // Initialize comms log
    const logPath = path.join(commsDir, 'comms-log.jsonl');
    if (!fs.existsSync(logPath)) {
        const entry = JSON.stringify({
            timestamp: new Date().toISOString(), type: 'system', from: 'autoclaw',
            message: `Comms provisioned. Agents: ${detectedAgents.map(a => a.name).join(', ')}`,
        }) + '\n';
        await fsPromises.writeFile(logPath, entry, 'utf8');
    }
    console.log(`AutoClaw: cross-agent comms provisioned for ${detectedAgents.length} agents`);
}
/**
 * startOrchestratorLoopTick — one-shot entry point for the eternal loop.
 * Reads the workspace, computes the health check, and dispatches work every
 * 30 s without any LLM call.
 *
 * Lifecycle:
 *  1. checkHealth   — reads heartbeat files, builds the agent health grid
 *  2. nextWork      — discovers assignable work for idle agents
 *  3. workNow       — dispatches work packages
 *  4. checkProgress — compares health changes to expected actor outcomes
 *  5. loop          — re-evaluate; repeat while actor is active
 */
function startOrchestratorLoopTick(context) {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        return;
    }
    // Start the perpetual health→work→dispatch→log loop.
    // The loop is headless (no vscode API calls in the hot path).
    activeOrchestratorLoopHandle = (0, orchestratorLoop_1.startOrchestratorLoop)({
        workspaceRoot,
        tickMs: 30000, // 30 s between ticks
        // Follow-up #3: opt-in self-healing, OFF by default. When the operator
        // enables it, the loop's HEAL phase performs bounded, reversible recovery
        // (act-then-report) each tick; otherwise the loop only detects/reports.
        selfHealingEnabled: vscode.workspace
            .getConfiguration('autoclaw')
            .get('selfHealing.enabled', false),
        // CL-3: opt-in dead-session claim reaper, OFF by default. Release-only —
        // frees tasks whose owning session is dead and whose claim is expired.
        reapDeadClaims: vscode.workspace
            .getConfiguration('autoclaw')
            .get('selfHealing.reapDeadClaims', false),
        // L1: single-active manager, ON by default. Only the active supervisor host
        // writes the board / dispatches / tallies each tick; standbys defer to it.
        singleActive: vscode.workspace
            .getConfiguration('autoclaw')
            .get('cluster.singleActive', true),
        // E1c: opt-in fencing (wx-lock-serialized acquire + live epoch/term + deposed
        // -holder fencing), OFF by default — a solo host stays byte-identical to E1b.
        fencing: vscode.workspace
            .getConfiguration('autoclaw')
            .get('cluster.fencing', false),
        // E3b: opt-in WAKE-ONLY cluster-map gossip (publish/read peer map-beats; advisory
        // only — never elects), OFF by default. Builds on fencing.
        gossip: vscode.workspace
            .getConfiguration('autoclaw')
            .get('cluster.gossip', false),
        // AWL-RUN-1: opt-in auto experiment cycle after dispatching ticks, OFF by
        // default. Self-rate-limited to one cycle per 6h; reports under
        // .autoclaw/orchestrator/reports/.
        autoExperiment: vscode.workspace
            .getConfiguration('autoclaw')
            .get('workflows.autoExperiment', false),
        onTick(result) {
            // Surface health/dispatch alerts in the output channel.
            const unhealthy = result.health.stalledIds.length + result.health.deadIds.length;
            if (unhealthy > 0 || result.dispatched > 0 || result.errors > 0) {
                getOrchestrateOutputChannel().appendLine(`[loop tick ${result.tick}] agents=${result.health.entries.length} ` +
                    `healthy=${result.health.healthyCount} stalled=${result.health.stalledIds.length} ` +
                    `dead=${result.health.deadIds.length} dispatched=${result.dispatched} ` +
                    `errors=${result.errors} (${result.durationMs}ms)`);
            }
            if (result.health.deadIds.length > 0) {
                console.warn(`[autoclaw-loop] dead agents: ${result.health.deadIds.join(', ')}`);
            }
        },
    });
    context.subscriptions.push({
        dispose: () => {
            activeOrchestratorLoopHandle?.stop();
            activeOrchestratorLoopHandle = null;
            console.log('[autoclaw] orchestrator loop stopped');
        },
    });
    // L2 producer: watch the board's INPUTS and refresh the board within a debounce
    // window (sub-second) instead of waiting up to 30s. The 30s tick stays as the
    // backstop. Single-active safe: refreshBoardNow reuses the L1 lease gate under
    // the loop's holder id, so a standby host writes nothing.
    startBoardWatch(context, workspaceRoot);
    // T0b: opt-in LAN peer discovery. OFF by default — binds NO socket unless the
    // autoclaw.cluster.lan flag is on AND the user acknowledged the one-time network
    // consent. Discovered peers arrive as origin-'lan' (untrusted) beacons.
    void startLanDiscovery(context, workspaceRoot);
    // T1: opt-in LAN relay of cluster-map gossip. OFF by default — binds NO socket
    // unless cluster.lan AND cluster.lan.gossip are on AND its own consent is acked.
    // Advisory only: relayed peer beats are wake-only (the E3b consumer never elects
    // on them); they never grant trust to an unauthenticated LAN peer (T2 does).
    void startLanGossipRelay(context, workspaceRoot);
    console.log(`[autoclaw] orchestrator loop started – tickMs=30000 workspace="${workspaceRoot}"`);
}
// Orchestrate Commands
// ---------------------------------------------------------------------------
let orchestrateOutputChannel;
function getOrchestrateOutputChannel() {
    if (!orchestrateOutputChannel) {
        orchestrateOutputChannel = vscode.window.createOutputChannel('AutoClaw Orchestrate');
    }
    return orchestrateOutputChannel;
}
async function orchestratePlanCommand() {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage('Orchestrate: open a workspace first.');
        return;
    }
    const manifestDir = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'manifests');
    if (!fs.existsSync(manifestDir)) {
        vscode.window.showErrorMessage('Orchestrate: no manifests/ directory found. Run /orchestrate init first.');
        return;
    }
    // Find manifest files
    const manifestFiles = fs.readdirSync(manifestDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
    if (manifestFiles.length === 0) {
        vscode.window.showErrorMessage('Orchestrate: no manifest YAML files found in manifests/.');
        return;
    }
    let manifestFile = manifestFiles[0];
    if (manifestFiles.length > 1) {
        const pick = await vscode.window.showQuickPick(manifestFiles.map(f => ({ label: f })), { placeHolder: 'Select a task manifest' });
        if (!pick) {
            return;
        }
        manifestFile = pick.label;
    }
    const channel = getOrchestrateOutputChannel();
    channel.show(true);
    channel.appendLine(`[orchestrate] Planning from manifest: ${manifestFile}`);
    // Read config for planner settings
    const config = vscode.workspace.getConfiguration('autoclaw.orchestrate');
    const plannerConfig = {
        work_agents: config.get('workAgents', orchestrate_1.DEFAULT_PLANNER_CONFIG.work_agents),
        max_tasks_per_agent: config.get('maxTasksPerAgent', orchestrate_1.DEFAULT_PLANNER_CONFIG.max_tasks_per_agent),
        max_subtasks_per_sprint: config.get('maxSubtasksPerSprint', orchestrate_1.DEFAULT_PLANNER_CONFIG.max_subtasks_per_sprint),
        migration_range_size: config.get('migrationRangeSize', orchestrate_1.DEFAULT_PLANNER_CONFIG.migration_range_size),
        branch_prefix: config.get('branchPrefix', orchestrate_1.DEFAULT_PLANNER_CONFIG.branch_prefix),
    };
    // Note: actual YAML parsing of the manifest is done by the skill prompt
    // (the AI reads the YAML and constructs the Manifest object).
    // The extension command provides the infrastructure; the skill provides the intelligence.
    channel.appendLine(`[orchestrate] Config: ${plannerConfig.work_agents} agents, max ${plannerConfig.max_tasks_per_agent} tasks/agent`);
    channel.appendLine(`[orchestrate] Manifest path: ${path.join(manifestDir, manifestFile)}`);
    channel.appendLine(`[orchestrate] Use /orchestrate plan in chat to generate sprint plans from this manifest.`);
    if (shouldShowNotification('info')) {
        vscode.window.showInformationMessage(`Orchestrate: manifest "${manifestFile}" ready. Use /orchestrate plan in chat to generate sprints.`);
    }
}
async function orchestrateStatusCommand() {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage('Orchestrate: open a workspace first.');
        return;
    }
    const statePath = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'state.json');
    const state = await (0, orchestrate_1.readStateFile)(statePath);
    const channel = getOrchestrateOutputChannel();
    channel.show(true);
    if (!state) {
        channel.appendLine('[orchestrate] No orchestration state found. Run /orchestrate plan first.');
        return;
    }
    channel.appendLine(`[orchestrate] Project: ${state.project}`);
    channel.appendLine(`[orchestrate] Progress: ${state.tasks_complete}/${state.tasks_total} tasks`);
    channel.appendLine(`[orchestrate] Current sprint: ${state.current_sprint ?? 'none'}`);
    channel.appendLine(`[orchestrate] Total sprints: ${state.total_sprints}`);
    for (const [agentId, agentState] of Object.entries(state.agents)) {
        channel.appendLine(`[orchestrate]   ${agentId}: ${agentState.status} (sprint ${agentState.sprint ?? '-'}, tasks: ${agentState.tasks.join(', ') || 'none'})`);
    }
}
async function orchestrateAssignNextCommand() {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage('Orchestrate: open a workspace first.');
        return;
    }
    const channel = getOrchestrateOutputChannel();
    channel.show(true);
    // Detect active agents and write registry so comms can route by WA-N → platform
    const detected = detectAgents(workspaceRoot);
    if (detected.length > 0) {
        const registryPath = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'agents.json');
        const state = await (0, orchestrate_1.readStateFile)(path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'state.json'));
        const sprint = state?.current_sprint ?? null;
        const commsDir = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'comms');
        // Tier-aware routing (B): mirror each agent's advertised llms_available
        // from the comms registry (registered-agent-v2) onto its WA-N row so the
        // planner's scoreAgent can weigh model tier against task phase. Agents
        // that advertise no models are written unchanged (tierFactor stays 1.0).
        const commsReg = await (0, comms_1.readRegistry)(commsDir);
        const llmsByAgent = new Map();
        for (const a of commsReg?.agents ?? []) {
            if (a.llms_available && a.llms_available.length > 0) {
                llmsByAgent.set(a.id, a.llms_available);
            }
        }
        const entries = detected.map((a, i) => {
            const entry = {
                id: `WA-${i + 1}`,
                platform: a.id,
                inbox: `.autoclaw/orchestrator/comms/inboxes/${a.id}/`,
                sprint,
                assigned_at: new Date().toISOString(),
            };
            const llms = llmsByAgent.get(a.id);
            if (llms) {
                entry.llms_available = llms;
            }
            return entry;
        });
        await (0, orchestrate_1.writeAgentRegistry)(registryPath, entries);
        channel.appendLine(`[orchestrate] Agent registry written (${entries.length} agents): ${entries.map(e => `${e.id}=${e.platform}`).join(', ')}`);
        // Heartbeat-aware: skip WA-N slots whose mapped agent has stalled or
        // never beat. Writes the exclusion set to a stalled-slots.json sidecar
        // so the skill-side /orchestrate next command can read it without
        // re-deriving heartbeat ages itself.
        const cfg = vscode.workspace.getConfiguration('autoclaw.orchestrate');
        const stallSeconds = cfg.get('heartbeatStallSeconds', 300);
        const liveStatuses = await (0, comms_1.getAgentStatuses)(commsDir);
        const stalled = [];
        for (const e of entries) {
            const live = liveStatuses.find(s => s.id === e.platform);
            if (!live) {
                stalled.push(e.id);
                continue;
            }
            if (live.live_status === 'offline' || live.live_status === 'stalled') {
                stalled.push(e.id);
                continue;
            }
            const hbAge = live.heartbeat
                ? Math.max(0, (Date.now() - new Date(live.heartbeat.timestamp).getTime()) / 1000)
                : Number.POSITIVE_INFINITY;
            if (hbAge > stallSeconds) {
                stalled.push(e.id);
            }
        }
        if (stalled.length > 0) {
            channel.appendLine(`[orchestrate] Heartbeat-aware: skipping stalled slots: ${stalled.join(', ')} (>${stallSeconds}s since last beat)`);
        }
        else {
            channel.appendLine(`[orchestrate] Heartbeat-aware: all ${entries.length} slot(s) live within ${stallSeconds}s threshold.`);
        }
        // Persist the exclusion set so the skill-side `generatePlan` call can
        // read it without re-deriving — written as a plain JSON sidecar.
        const sprintLabel = sprint ?? 'next';
        const sidecarPath = path.join(workspaceRoot, '.autoclaw', 'orchestrator', `sprint-${sprintLabel}-stalled.json`);
        await fsPromises.mkdir(path.dirname(sidecarPath), { recursive: true });
        await fsPromises.writeFile(sidecarPath, JSON.stringify({
            sprint: sprintLabel,
            stalled,
            computed_at: new Date().toISOString(),
            stall_seconds: stallSeconds,
        }, null, 2), 'utf8');
    }
    channel.appendLine('[orchestrate] Use /orchestrate next in chat to assign the next available sprint.');
    if (shouldShowNotification('info')) {
        vscode.window.showInformationMessage('Orchestrate: use /orchestrate next in chat to assign the next sprint.');
    }
}
async function orchestrateReviewCommand() {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage('Orchestrate: open a workspace first.');
        return;
    }
    const channel = getOrchestrateOutputChannel();
    channel.show(true);
    channel.appendLine('[orchestrate] Running consensus review...');
    const consensusDir = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'comms', 'consensus', 'active');
    if (!fs.existsSync(consensusDir)) {
        channel.appendLine('[orchestrate] No consensus votes found. Agents have not yet submitted votes.');
        vscode.window.showInformationMessage('Orchestrate: no consensus votes found yet. Wait for agents to complete their work.');
        return;
    }
    // consensus/active holds TWO file kinds: review STUBS (`<task>.json`, no
    // top-level `vote`) and per-agent VOTES (`<task>-<voter>.json`, string `vote`).
    // Classify by CONTENT and take task_id from the file — filenames can't be
    // split on '-' because ids like `RV-1` contain dashes (this was the perennial
    // "No vote files in consensus/active/" bug). See consensusActiveScan.ts.
    const allFiles = fs.readdirSync(consensusDir).filter(f => f.endsWith('.json'));
    const entries = [];
    for (const f of allFiles) {
        try {
            const raw = await fsPromises.readFile(path.join(consensusDir, f), 'utf8');
            entries.push({ name: f, json: JSON.parse(raw) });
        }
        catch {
            channel.appendLine(`[orchestrate] Warning: could not parse ${f}`);
        }
    }
    const scan = (0, consensusActiveScan_1.classifyConsensusActive)(entries);
    const votesByTask = scan.votesByTask;
    const awaitingReview = scan.awaitingReview;
    if (votesByTask.size === 0) {
        if (awaitingReview.length > 0) {
            channel.appendLine(`[orchestrate] ${awaitingReview.length} task(s) in peer review, awaiting agent votes: ${awaitingReview.join(', ')}.`);
            vscode.window.showInformationMessage(`Orchestrate: ${awaitingReview.length} task(s) in review, awaiting votes. Agents must vote (consensus.vote / vote files) to resolve.`);
        }
        else {
            channel.appendLine('[orchestrate] No consensus activity in consensus/active/ (no review stubs or votes yet).');
            vscode.window.showInformationMessage('Orchestrate: no consensus activity yet.');
        }
        return;
    }
    if (awaitingReview.length > 0) {
        channel.appendLine(`[orchestrate] Note: ${awaitingReview.length} task(s) still awaiting votes: ${awaitingReview.join(', ')}.`);
    }
    const commsDir = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'comms');
    // Gate/routing fields (criticality, acceptance) for the tasks under review,
    // read straight from the manifests. Missing manifest or unknown task ⇒
    // votes-only with the default config, exactly as before.
    const manifestDir = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'manifests');
    const { tasks: gateFields, warnings: gateWarnings } = await (0, orchestrate_1.readManifestTaskGates)(manifestDir);
    for (const w of gateWarnings) {
        channel.appendLine(`[orchestrate] Manifest warning: ${w}`);
    }
    let allApproved = true;
    for (const [taskId, votes] of votesByTask) {
        const taskDef = gateFields.get(taskId);
        // Acceptance gate (C): run the task's declared checks orchestrator-side
        // BEFORE evaluating — votes cannot approve over a red check.
        let gateChecks;
        if (taskDef?.acceptance && taskDef.acceptance.length > 0) {
            channel.appendLine(`[orchestrate] Task ${taskId}: running ${taskDef.acceptance.length} acceptance check(s)...`);
            gateChecks = await (0, orchestrate_1.runAcceptanceChecks)(taskDef.acceptance, { cwd: workspaceRoot });
            for (const g of gateChecks) {
                channel.appendLine(`   ${g.passed ? '✅' : '❌'} acceptance: ${g.command} → exit ${g.exit_code} (${g.duration_ms}ms)`);
            }
        }
        // Verifier independence: drop the task author's self-vote from the tally.
        const author = await (0, comms_1.readClaimAuthor)(commsDir, taskId);
        // Criticality-aware threshold: unanimous for tier 1, simple majority for
        // tier 3; unknown task / no criticality ⇒ the default 2/3 config.
        const result = (0, orchestrate_1.evaluateConsensus)(votes, 1, (0, orchestrate_1.consensusConfigForTask)(taskDef?.criticality), { author_agent_id: author });
        result.task_id = taskId;
        if (gateChecks) {
            // Attaches gate_checks to the result (the consensus_result broadcast
            // below spreads it along) and forces a non-overridable block on any red check.
            (0, orchestrate_1.applyAcceptanceGate)(result, gateChecks, { criticality: taskDef?.criticality });
        }
        const icon = result.status === 'consensus_reached' ? '✅' : result.status === 'deadlocked' ? '🔴' : '⏳';
        channel.appendLine(`${icon} Task ${taskId}: ${result.status} — verdict: ${result.final_verdict} (${votes.length} vote${votes.length === 1 ? '' : 's'})`);
        if (result.unresolved_findings.length > 0) {
            for (const f of result.unresolved_findings.slice(0, 5)) {
                channel.appendLine(`   [${f.severity}] ${f.category}: ${f.description}${f.file ? ` (${f.file}:${f.line ?? ''})` : ''}`);
            }
        }
        // Broadcast the consensus result so all agents can react in real time.
        try {
            await (0, comms_1.sendMessage)(commsDir, {
                id: '', from: 'orchestrator', to: 'shared', type: 'consensus_result',
                timestamp: new Date().toISOString(), task_id: taskId,
                payload: { ...result }, requires_response: false,
            });
        }
        catch (e) {
            channel.appendLine(`[orchestrate] consensus broadcast failed for ${taskId}: ${e.message}`);
        }
        // REP-1: record the reviewed-task outcome for the claiming agent's track
        // record (best-effort; never blocks the review). Skip 'abstain' — that is
        // "not enough voters yet", not a decision about the agent's work.
        if (author && result.final_verdict !== 'abstain') {
            try {
                await (0, reputation_1.recordTaskOutcome)(workspaceRoot, {
                    task_id: taskId,
                    agent_id: author,
                    phase: taskDef?.phase,
                    verdict: result.final_verdict,
                    gate_passed: gateChecks ? gateChecks.every(g => g.passed) : undefined,
                    timestamp: new Date().toISOString(),
                });
            }
            catch (e) {
                channel.appendLine(`[orchestrate] reputation record failed for ${taskId}: ${e.message}`);
            }
            // A co-design fan-out: mirror the SAME outcome as a structural KG edge
            // (one event → { reputation row above + KG edge here }). Best-effort.
            // reviewers = distinct voters (excluding the assignee) — populates the
            // agent--reviewed--> task edges so the graph is structural, not just
            // completed-links. No capabilities lookup at this site (agent registry
            // join), so demonstrated-edges are not sourced here.
            (0, kgRecord_1.recordOutcomeEdge)(workspaceRoot, {
                taskId,
                agentId: author,
                verdict: result.final_verdict,
                gatePassed: gateChecks ? gateChecks.every(g => g.passed) : undefined,
                resolvedAt: new Date().toISOString(),
                reviewers: result.votes ? Array.from(new Set(result.votes.map(v => v.agent_id).filter(a => a !== author))) : undefined,
            }).catch(() => { });
        }
        if (result.status !== 'consensus_reached') {
            allApproved = false;
        }
    }
    if (allApproved && votesByTask.size > 0) {
        channel.appendLine('[orchestrate] All tasks approved. Run /orchestrate merge to integrate the sprint branch.');
        vscode.window.showInformationMessage(`Orchestrate: consensus reached on ${votesByTask.size} task(s). Ready to merge.`, 'Assign Next Sprint').then(action => {
            if (action === 'Assign Next Sprint') {
                vscode.commands.executeCommand('autoclaw.orchestrate.assign');
            }
        });
    }
    else {
        vscode.window.showWarningMessage(`Orchestrate: ${votesByTask.size} task(s) reviewed — not all approved. Check the AutoClaw Orchestrate output for details.`);
    }
}
async function orchestrateMergeCommand() {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage('Orchestrate: open a workspace first.');
        return;
    }
    const sprintsDir = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'sprints');
    const channel = getOrchestrateOutputChannel();
    channel.show(true);
    const input = await vscode.window.showInputBox({ prompt: 'Sprint number to merge', placeHolder: '1' });
    if (!input) {
        return;
    }
    const sprintNum = parseInt(input, 10);
    if (isNaN(sprintNum)) {
        vscode.window.showErrorMessage('Orchestrate: invalid sprint number.');
        return;
    }
    const sprintPath = path.join(sprintsDir, `sprint-${sprintNum}.yaml`);
    if (!fs.existsSync(sprintPath)) {
        vscode.window.showErrorMessage(`Orchestrate: sprint-${sprintNum}.yaml not found.`);
        return;
    }
    const content = await fsPromises.readFile(sprintPath, 'utf8');
    const statusMatch = content.match(/^status:\s*(\w+)\s*$/m);
    const status = statusMatch?.[1];
    if (status !== 'approved') {
        vscode.window.showErrorMessage(`Orchestrate: Sprint ${sprintNum} must be 'approved' before merging (current: ${status ?? 'unknown'}).`);
        return;
    }
    // Extract all branch names from the sprint YAML
    const branchMatches = [...content.matchAll(/branch:\s*"?([^"\n]+)"?/g)];
    const branches = branchMatches.map(m => m[1].trim()).filter(Boolean);
    if (branches.length === 0) {
        vscode.window.showErrorMessage(`Orchestrate: no branches found in sprint-${sprintNum}.yaml.`);
        return;
    }
    const cfg = vscode.workspace.getConfiguration('autoclaw.orchestrate');
    const baseBranch = cfg.get('baseBranch', 'main');
    channel.appendLine(`[orchestrate] Merging Sprint ${sprintNum} branches into ${baseBranch}: ${branches.join(', ')}`);
    // Checkout base branch and merge each sprint branch
    const checkoutOut = await runGit(workspaceRoot, ['checkout', baseBranch]);
    if (checkoutOut === '' && !(await runGit(workspaceRoot, ['rev-parse', '--verify', baseBranch]))) {
        vscode.window.showErrorMessage(`Orchestrate: could not checkout base branch '${baseBranch}'.`);
        return;
    }
    let allMerged = true;
    for (const branch of branches) {
        channel.appendLine(`[orchestrate]   git merge --no-ff ${branch}`);
        const mergeOut = await runGit(workspaceRoot, ['merge', '--no-ff', branch, '-m', `chore: merge Sprint ${sprintNum} — ${branch}`]);
        if (mergeOut === '' && !fs.existsSync(path.join(workspaceRoot, '.git', 'MERGE_HEAD'))) {
            // runGit returns '' on error — check if HEAD advanced
            const headCheck = await runGit(workspaceRoot, ['log', '--oneline', '-1']);
            if (!headCheck.includes(branch.split('/').pop() ?? '')) {
                channel.appendLine(`[orchestrate]   WARNING: merge of ${branch} may have failed. Resolve manually.`);
                allMerged = false;
            }
        }
    }
    if (!allMerged) {
        vscode.window.showWarningMessage(`Sprint ${sprintNum}: one or more branches had merge issues. Resolve conflicts, then re-run merge.`);
        return;
    }
    // Update sprint YAML status → merged
    const mergedContent = content.replace(/^status:\s*approved\s*$/m, 'status: merged');
    await fsPromises.writeFile(sprintPath, mergedContent, 'utf8');
    // Update downstream sprints: find all pending sprints at a higher level and mark dependencies_met
    await updateDownstreamDependencies(workspaceRoot, sprintsDir, sprintNum);
    // Update state.json
    const statePath = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'state.json');
    const state = await (0, orchestrate_1.readStateFile)(statePath);
    if (state) {
        for (const agentState of Object.values(state.agents)) {
            if (agentState.sprint === sprintNum && agentState.status === 'review') {
                agentState.status = 'done';
            }
        }
        state.last_updated = new Date().toISOString();
        await (0, orchestrate_1.writeStateFile)(statePath, state);
    }
    channel.appendLine(`[orchestrate] Sprint ${sprintNum} merged into ${baseBranch}. Downstream dependencies updated.`);
    vscode.window.showInformationMessage(`Sprint ${sprintNum} merged. Downstream sprints unblocked.`, 'Assign Next Sprint').then(action => {
        if (action === 'Assign Next Sprint') {
            vscode.commands.executeCommand('autoclaw.orchestrate.assign');
        }
    });
}
async function updateDownstreamDependencies(workspaceRoot, sprintsDir, mergedSprintNum) {
    // Determine the level of the merged sprint
    const mergedPath = path.join(sprintsDir, `sprint-${mergedSprintNum}.yaml`);
    const mergedContent = await fsPromises.readFile(mergedPath, 'utf8');
    const mergedLevelMatch = mergedContent.match(/^level:\s*(\d+)\s*$/m);
    const mergedLevel = mergedLevelMatch ? parseInt(mergedLevelMatch[1], 10) : -1;
    if (mergedLevel < 0) {
        return;
    }
    // Collect all sprint YAML files
    let files;
    try {
        files = (await fsPromises.readdir(sprintsDir)).filter(f => /^sprint-\d+\.yaml$/.test(f));
    }
    catch {
        return;
    }
    // Read all sprint statuses and levels
    const sprintInfos = [];
    for (const file of files) {
        const c = await fsPromises.readFile(path.join(sprintsDir, file), 'utf8');
        const numMatch = c.match(/^sprint:\s*(\d+)\s*$/m);
        const levelMatch = c.match(/^level:\s*(\d+)\s*$/m);
        const statusMatch = c.match(/^status:\s*(\w+)\s*$/m);
        const depsMatch = c.match(/^dependencies_met:\s*(true|false)\s*$/m);
        if (numMatch && levelMatch && statusMatch) {
            sprintInfos.push({
                file,
                num: parseInt(numMatch[1], 10),
                level: parseInt(levelMatch[1], 10),
                status: statusMatch[1],
                depsMet: depsMatch?.[1] === 'true',
            });
        }
    }
    // For each pending sprint at level > mergedLevel, check if ALL sprints at lower levels are merged
    for (const sprint of sprintInfos) {
        if (sprint.level <= mergedLevel) {
            continue;
        }
        if (sprint.status !== 'pending' && sprint.status !== 'assigned') {
            continue;
        }
        if (sprint.depsMet) {
            continue;
        }
        const lowerLevelSprints = sprintInfos.filter(s => s.level < sprint.level);
        const allLowerMerged = lowerLevelSprints.every(s => s.status === 'merged');
        if (allLowerMerged) {
            const filePath = path.join(sprintsDir, sprint.file);
            const c = await fsPromises.readFile(filePath, 'utf8');
            const updated = c.replace(/^dependencies_met:\s*false\s*$/m, 'dependencies_met: true');
            if (updated !== c) {
                await fsPromises.writeFile(filePath, updated, 'utf8');
                getOrchestrateOutputChannel().appendLine(`[orchestrate] Sprint ${sprint.num} (level ${sprint.level}) unblocked — all lower-level sprints merged.`);
            }
        }
    }
}
// ---------------------------------------------------------------------------
// Bridge Commands
// ---------------------------------------------------------------------------
let activeBridge = null;
async function bridgeStartCommand() {
    if (activeBridge?.running) {
        vscode.window.showInformationMessage(`Bridge already running on ${activeBridge.config.host}:${activeBridge.config.port}`);
        return;
    }
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage('Bridge: open a workspace first.');
        return;
    }
    const cfg = vscode.workspace.getConfiguration('autoclaw.bridge');
    const userPort = cfg.get('port', 0);
    const host = cfg.get('host', '127.0.0.1');
    const allocated = await (0, ide_ports_1.allocatePorts)(currentIde, workspaceRoot, userPort > 0 ? userPort : undefined, undefined);
    const block = (0, ide_ports_1.getIDEPortBlock)(currentIde);
    const config = {
        port: allocated.bridgePort, host,
        portBlockBase: block.bridgeBase,
        commsDir: path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'comms'),
        tokensPath: path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'comms', 'tokens.json'),
        workspaceRoot,
    };
    try {
        activeBridge = await (0, bridge_1.startBridge)(config);
        (0, workspace_registry_1.registerWorker)({
            id: `${currentIde}-${process.pid}`,
            ide: currentIde,
            workspace: workspaceRoot,
            bridgeHost: host,
            bridgePort: allocated.bridgePort,
            bridgeUrl: `http://${host}:${allocated.bridgePort}`,
            pid: process.pid,
            status: 'online',
            capabilities: ['bridge', 'orchestrate'],
            lastHeartbeat: new Date().toISOString(),
            assignedTasks: [],
        });
        vscode.window.showInformationMessage(`OpenClaw bridge started on ${host}:${allocated.bridgePort} [${currentIde}]`);
    }
    catch (e) {
        (0, ide_ports_1.releasePorts)(currentIde, workspaceRoot);
        vscode.window.showErrorMessage(`Bridge failed: ${e.message}`);
    }
}
async function bridgeStopCommand() {
    if (!activeBridge?.running) {
        vscode.window.showInformationMessage('Bridge not running.');
        return;
    }
    const port = activeBridge.config.port;
    await (0, bridge_1.stopBridge)(activeBridge);
    activeBridge = null;
    (0, workspace_registry_1.unregisterWorker)(process.pid, currentIde);
    if (currentWorkspace) {
        (0, ide_ports_1.releasePorts)(currentIde, currentWorkspace);
    }
    vscode.window.showInformationMessage(`OpenClaw bridge stopped (was on ${port}).`);
}
async function kgHealthCheckCommand() {
    const channel = getKgOutputChannel();
    const livePid = activeKg?.child && activeKg.child.exitCode === null ? activeKg.child.pid : null;
    const daemonLive = !!(activeKg && livePid !== undefined && livePid !== null && activeKg.port > 0);
    // Only probe over HTTP when the OPTIONAL standalone daemon is genuinely
    // running on a real port. The default is the IN-PROCESS KG (node:sqlite) —
    // probing a non-existent daemon on port 0 just spams ECONNREFUSED:80.
    if (daemonLive) {
        const port = activeKg.port;
        channel.appendLine(`[kg] healthCheck (daemon) → http://127.0.0.1:${port}/api/v1/health`);
        const result = await (0, kg_1.fetchKgHealth)(port);
        if (result.ok) {
            const summary = typeof result.body === 'object' ? JSON.stringify(result.body) : String(result.body);
            channel.appendLine(`[kg] ${result.status} ${summary}`);
            vscode.window.showInformationMessage(`AutoClaw KG (daemon): ${result.status} OK — ${summary.slice(0, 120)}`);
        }
        else {
            const detail = result.error ?? `status=${result.status ?? 'n/a'}`;
            channel.appendLine(`[kg!] daemon healthCheck failed: ${detail}`);
            vscode.window.showWarningMessage(`AutoClaw KG: daemon health check failed (${detail}).`, 'Open KG Output')
                .then(a => { if (a === 'Open KG Output') {
                channel.show(true);
            } });
        }
        return;
    }
    // In-process KG: report status directly from the store handle — no HTTP.
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        channel.appendLine('[kg] healthCheck: no workspace open.');
        return;
    }
    try {
        const h = (0, service_1.getKnowledgeGraph)({ workspaceRoot });
        const summary = {
            mode: 'in-process',
            ok: !h.degraded,
            degraded: h.degraded,
            sqlite: h.caps.sqlite, vec: h.caps.vec, fts: h.caps.fts,
            driver: h.driverKind,
            embedding: `${h.embedding.provider}/${h.embedding.model}@${h.embedding.dimension}`,
        };
        channel.appendLine(`[kg] healthCheck (in-process) → ${JSON.stringify(summary)}`);
        if (h.degraded) {
            vscode.window.showWarningMessage('AutoClaw KG: in-process store is DEGRADED (no SQLite driver). Run "AutoClaw: Intelligence — Install Vector Backend" or check Diagnostics.', 'Open KG Output').then(a => { if (a === 'Open KG Output') {
                channel.show(true);
            } });
        }
        else {
            vscode.window.showInformationMessage(`AutoClaw KG: in-process OK — sqlite=${h.caps.sqlite} vec=${h.caps.vec} fts=${h.caps.fts} (${summary.embedding}).`);
        }
    }
    catch (e) {
        channel.appendLine(`[kg!] in-process health check failed: ${e.message}`);
        vscode.window.showWarningMessage(`AutoClaw KG: health check failed — ${e.message}`);
    }
}
/**
 * RV-3: explicit `autoclaw.kg.start` — spawn the kg-daemon on demand. Unlike
 * maybeStartKgDaemon (auto-start, gated on `autoclaw.kg.enabled`), an explicit
 * user/panel action starts the daemon regardless of the enabled flag. A
 * no-op + toast if it is already running.
 */
async function kgStartCommand(extensionPath) {
    if (activeKg?.child && activeKg.child.exitCode === null) {
        vscode.window.showInformationMessage(`AutoClaw KG: daemon already running on port ${activeKg.port}.`);
        return;
    }
    const cfg = vscode.workspace.getConfiguration('autoclaw.kg');
    const userKgPort = cfg.get('port', 0);
    const dbPath = cfg.get('dbPath', '');
    const channel = getKgOutputChannel();
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    const idePorts = (0, ide_ports_1.getIdePorts)(currentIde, workspaceRoot || undefined);
    const kgPort = userKgPort > 0 ? userKgPort : idePorts.kgPort;
    const result = await (0, kg_1.startKgDaemon)({ extensionPath, port: kgPort, dbPath, logger: channel });
    if (result.ok) {
        activeKg = result.state;
        vscode.window.showInformationMessage(`AutoClaw KG: daemon started on port ${result.state.port}.`);
    }
    else {
        channel.appendLine(`[kg] ${result.message}`);
        vscode.window.showWarningMessage(`AutoClaw KG: could not start daemon — ${result.message}`, 'Open KG Output').then(a => { if (a === 'Open KG Output') {
            channel.show(true);
        } });
    }
}
/**
 * RV-3: explicit `autoclaw.kg.restart` — stop the running daemon (if any),
 * then start a fresh one.
 */
async function kgRestartCommand(extensionPath) {
    const channel = getKgOutputChannel();
    if (activeKg?.child && activeKg.child.exitCode === null) {
        channel.appendLine('[kg] restart → stopping current daemon');
        try {
            await (0, kg_1.stopKgDaemon)(activeKg);
        }
        catch (e) {
            channel.appendLine(`[kg] stop warning: ${e.message}`);
        }
        activeKg = null;
    }
    await kgStartCommand(extensionPath);
}
/**
 * `autoclaw.kg.openDashboard` — open the Knowledge Graph viewer (browse +
 * visualize). This is the surface the `kg:` fabric-health chip dispatches to.
 * Falls back to focusing the unified dashboard + a health line if the viewer
 * can't open (e.g. headless).
 */
async function kgOpenDashboardCommand() {
    try {
        await vscode.commands.executeCommand('autoclaw.kg.browse');
    }
    catch {
        try {
            await vscode.commands.executeCommand('kdreamDashboard.focus');
        }
        catch { /* panel may be unavailable in headless */ }
        await kgHealthCheckCommand();
    }
}
async function bridgeAddAgentCommand() {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage('Open a workspace first.');
        return;
    }
    const agentId = await vscode.window.showInputBox({ prompt: 'Remote agent ID', placeHolder: 'openclaw-worker-1' });
    if (!agentId) {
        return;
    }
    const tokensPath = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'comms', 'tokens.json');
    await fsPromises.mkdir(path.dirname(tokensPath), { recursive: true });
    const token = await (0, bridge_1.createRemoteAgentToken)(tokensPath, agentId);
    await fsPromises.mkdir(path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'comms', 'inboxes', agentId), { recursive: true });
    const ch = getOrchestrateOutputChannel();
    ch.show(true);
    ch.appendLine(`[bridge] Registered: ${agentId} | Token: ${token.token} | Expires: ${token.expires_at}`);
    vscode.window.showInformationMessage(`Remote agent "${agentId}" registered. Token in output channel.`);
}
/**
 * Revoke a previously-issued remote agent token. Presents a quick-pick of
 * still-active (non-revoked) tokens; on selection, stamps `revoked_at` via
 * the bridge helper and posts a `system` message to inboxes/shared/ so
 * other agents can react (e.g. drop cached credentials).
 */
async function bridgeRevokeTokenCommand() {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage('Open a workspace first.');
        return;
    }
    const commsDir = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'comms');
    const tokensPath = path.join(commsDir, 'tokens.json');
    const tokens = await (0, bridge_1.readTokens)(tokensPath);
    const active = tokens.filter(t => !t.revoked_at);
    if (active.length === 0) {
        vscode.window.showInformationMessage('No active remote agent tokens to revoke.');
        return;
    }
    const items = active.map(t => ({
        label: t.agent_id,
        description: `expires ${t.expires_at}`,
        detail: `created ${t.created_at} • token ${t.token.slice(0, 12)}…`,
        token: t.token,
        agentId: t.agent_id,
    }));
    const pick = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a remote agent token to revoke',
        matchOnDescription: true,
        matchOnDetail: true,
    });
    if (!pick) {
        return;
    }
    const ok = await (0, bridge_1.revokeToken)(tokensPath, pick.token);
    if (!ok) {
        vscode.window.showErrorMessage(`Token for ${pick.agentId} could not be revoked (already removed?).`);
        return;
    }
    const timestamp = new Date().toISOString();
    // Best-effort broadcast — fire-and-forget so revocation always succeeds
    // even if the inboxes/shared dir is somehow unwriteable.
    await (0, comms_1.sendMessage)(commsDir, {
        id: '', from: 'orchestrator', to: 'shared', type: 'system',
        timestamp,
        payload: {
            kind: 'token_revoked',
            agent_id: pick.agentId,
            revoked_at: timestamp,
            message: `agent ${pick.agentId}'s token revoked at ${timestamp}`,
        },
        requires_response: false,
    }).catch(() => { });
    const ch = getOrchestrateOutputChannel();
    ch.appendLine(`[bridge] Revoked token for ${pick.agentId} at ${timestamp}`);
    vscode.window.showInformationMessage(`Token for "${pick.agentId}" revoked.`);
}
/**
 * Render the current host agent's A2A Agent Card as JSON in an Untitled
 * editor. Useful for debugging agent-card-schema.md / x-autoclaw mirroring.
 *
 * Picks the first registered agent from the workspace registry (or a
 * synthetic fallback when none is registered yet) and feeds its
 * RegisteredAgent fields into {@link buildAgentCard}.
 */
async function agentCardShowCommand() {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const cfg = vscode.workspace.getConfiguration('autoclaw.bridge');
    const port = cfg.get('port', 9876);
    const host = cfg.get('host', '127.0.0.1');
    const baseUrl = `http://${host}:${port}/a2a`;
    let agentName = 'AutoClaw Host Agent';
    let agentId = 'autoclaw-host';
    const autoclawFields = {
        machine_id: 'unknown',
    };
    if (workspaceRoot) {
        try {
            const commsDir = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'comms');
            const reg = await (0, comms_1.readRegistry)(commsDir);
            const first = reg?.agents[0];
            if (first) {
                agentId = first.id;
                agentName = first.name;
                autoclawFields.machine_id = first.machine_id ?? `local-${first.id}`;
                if (first.machine_ip) {
                    autoclawFields.machine_ip = first.machine_ip;
                }
                if (first.llms_available) {
                    autoclawFields.llms_available = first.llms_available;
                }
                if (typeof first.context_window === 'number') {
                    autoclawFields.context_window = first.context_window;
                }
                if (first.tools_supported) {
                    autoclawFields.tools_supported = first.tools_supported;
                }
                if (first.trust_level) {
                    autoclawFields.trust_level = first.trust_level;
                }
                if (first.cost_budget) {
                    autoclawFields.cost_budget = first.cost_budget;
                }
                if (typeof first.max_parallel_tasks === 'number') {
                    autoclawFields.max_parallel_tasks = first.max_parallel_tasks;
                }
                if (first.skills_loaded) {
                    autoclawFields.skills_loaded = first.skills_loaded;
                }
                if (typeof first.human_in_loop_required === 'boolean') {
                    autoclawFields.human_in_loop_required = first.human_in_loop_required;
                }
                if (first.capabilities) {
                    autoclawFields.capabilities = first.capabilities;
                }
            }
        }
        catch { /* fall through to synthetic card */ }
    }
    const card = (0, agent_card_1.buildAgentCard)({
        name: agentName,
        description: `Agent Card for ${agentId} (rendered locally for debugging).`,
        url: baseUrl,
        version: '2.4.0',
        autoclaw: autoclawFields,
    });
    const doc = await vscode.workspace.openTextDocument({
        language: 'json',
        content: JSON.stringify(card, null, 2),
    });
    await vscode.window.showTextDocument(doc, { preview: false });
}
// ---------------------------------------------------------------------------
// Orchestrator Dashboard
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Orchestrator data refresh — sends agent/sprint/message/timeline data to the
// unified panel webview (formerly a separate OrchestratorViewProvider).
// ---------------------------------------------------------------------------
let lastOrchestratorBoardSnapshot = null;
async function refreshOrchestratorData(view) {
    var _a;
    const wr = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!wr) {
        return;
    }
    const commsDir = path.join(wr, '.autoclaw', 'orchestrator', 'comms');
    let agents = [];
    try {
        agents = await (0, comms_1.getAgentStatuses)(commsDir);
    }
    catch { }
    try {
        view.webview.postMessage({ command: 'updateAgents', data: agents });
    }
    catch { }
    // Attach per-session heartbeats so cards can break a single agent process
    // into its individual chat sessions.
    const agentsWithSessions = [];
    for (const a of agents) {
        let sessions = [];
        try {
            sessions = await (0, heartbeat_1.readSessionHeartbeats)(commsDir, a.id);
        }
        catch { /* none */ }
        // "Open chat" needs the REAL Claude Code transcript session id — the
        // heartbeat's own session_id is a coordination UUID (mailboxes, claims),
        // never a resumable chat session, so the deep link always missed and
        // opened a blank conversation. Best-effort swap it (and rawRef) for the
        // nearest on-disk transcript for this workspace; falls back silently.
        if (a.id === 'claude-code') {
            for (const s of sessions) {
                try {
                    const at = Date.parse(s.timestamp);
                    const match = await (0, heartbeat_1.resolveClaudeCodeTranscript)(wr, Number.isFinite(at) ? at : Date.now());
                    if (match) {
                        s.session_id = match.sessionId;
                        s.rawRef = match.rawRef;
                    }
                }
                catch { /* keep original session_id/rawRef */ }
            }
        }
        agentsWithSessions.push({ ...a, sessions });
    }
    // Board snapshot — read once and reused for role inference, the kanban, and
    // the section badge.
    let board = lastOrchestratorBoardSnapshot?.workspaceRoot === wr
        ? lastOrchestratorBoardSnapshot.board
        : null;
    try {
        const boardPath = path.join(wr, '.autoclaw', 'orchestrator', 'board.json');
        if (fs.existsSync(boardPath)) {
            const parsed = JSON.parse((await fsPromises.readFile(boardPath, 'utf8')).replace(/^\uFEFF/, ''));
            board = parsed;
            lastOrchestratorBoardSnapshot = { workspaceRoot: wr, board: parsed };
        }
    }
    catch {
        board =
            lastOrchestratorBoardSnapshot?.workspaceRoot === wr
                ? lastOrchestratorBoardSnapshot.board
                : null;
    }
    // Durable task ledger + live claims → per-agent workload rollups and the
    // board's Done lane (Slice B). Best-effort; missing files degrade to empty.
    const ledger = (() => { try {
        return (0, taskLedger_1.readTaskLedger)(commsDir);
    }
    catch {
        return [];
    } })();
    const claims = [];
    try {
        const claimsDir = path.join(commsDir, 'claims');
        if (fs.existsSync(claimsDir)) {
            for (const f of await fsPromises.readdir(claimsDir)) {
                if (!f.endsWith('.json')) {
                    continue;
                }
                try {
                    const c = JSON.parse((await fsPromises.readFile(path.join(claimsDir, f), 'utf8')).replace(/^﻿/, ''));
                    claims.push({ task_id: c.task_id ?? path.basename(f, '.json'), claimed_by: c.claimed_by, agent: c.agent });
                }
                catch { /* skip malformed claim */ }
            }
        }
    }
    catch { /* no claims dir */ }
    // Worklog context: read initiative/sprint labels keyed by task_id so the
    // panel can disambiguate generic task_ids (e.g. "a task") in the Done lane
    // and per-agent work history.
    const worklogContext = (() => {
        const out = new Map();
        try {
            const wlDir = path.join((0, fleetData_1.orchestratorDir)(wr), 'worklogs');
            if (!fs.existsSync(wlDir)) {
                return out;
            }
            for (const name of fs.readdirSync(wlDir)) {
                if (!name.endsWith('.jsonl')) {
                    continue;
                }
                const lines = fs.readFileSync(path.join(wlDir, name), 'utf8').split(/\r?\n/);
                for (const line of lines) {
                    const t = line.trim();
                    if (!t) {
                        continue;
                    }
                    try {
                        const e = JSON.parse(t);
                        if (typeof e.task_id !== 'string' || !e.task_id) {
                            continue;
                        }
                        const existing = out.get(e.task_id);
                        const initiative = typeof e.initiative === 'string' ? e.initiative : undefined;
                        const sprint = typeof e.sprint === 'string' ? e.sprint : undefined;
                        if (initiative || sprint) {
                            out.set(e.task_id, { initiative: initiative ?? existing?.initiative, sprint: sprint ?? existing?.sprint });
                        }
                    }
                    catch { /* skip malformed line */ }
                }
            }
        }
        catch { /* swallow — worklog enrichment is best-effort */ }
        return out;
    })();
    const workloadByAgent = (0, taskLedger_1.summarizeByAgent)(ledger, claims, board, { now: new Date(), recentLimit: 5, worklogContext });
    // Follow-up #4: per-agent cost rollup (tokens / $ / dispatches) from the LLM
    // cost ledger. Best-effort; missing ledger degrades to empty.
    const costByAgent = (() => { try {
        return (0, agentCost_1.readAgentCosts)(wr);
    }
    catch {
        return {};
    } })();
    // Merge in agents that checked in from OTHER tools/IDEs/runners via beacons
    // (other-IDE AutoClaw, Hermes, openclaw, …). Local registry agents win on id
    // collision. See docs/FLEET_ARCHITECTURE.md §4.
    let beaconRows = [];
    try {
        beaconRows = await (0, beacons_1.readAllBeacons)({ commsDir, now: Date.now() });
    }
    catch { /* none */ }
    const knownIds = new Set(agentsWithSessions.map(a => a.id));
    const fleetAgents = [...agentsWithSessions];
    for (const b of beaconRows) {
        // T0 trust ceiling: a LAN-DISCOVERED peer (origin 'lan') is observe-only,
        // unauthenticated telemetry — never promote it into the TRUSTED fleet roster
        // (beaconToAgent would launder its 'lan' marker to a 'beacon'/'joined' card
        // indistinguishable from a real agent). Symmetric with pending.ts / needs.ts.
        if ((0, beacons_1.isDiscoveredUntrusted)(b)) {
            continue;
        }
        if (knownIds.has(b.agent_id)) {
            continue;
        }
        knownIds.add(b.agent_id);
        fleetAgents.push(beaconToAgent(b));
    }
    // D3/AF-10c: merge cached cross-machine heartbeats (written by the relay
    // pull tick) into the fleet view. Additive like the beacon merge above —
    // host-namespaced card ids, local rows always win, stale rows render
    // stalled. Inert when the relay is disabled: no cache file ⇒ empty list.
    try {
        const remoteRows = await (0, cloud_1.readRemoteHeartbeats)(path.join(wr, '.autoclaw'));
        (0, remotePresence_1.mergeRemotePresence)(fleetAgents, remoteRows);
    }
    catch { /* best-effort — never disrupt the panel refresh */ }
    // LANE C: per-agent LLM-cost metrics. The LLM ledger (.autoclaw/llm/) carries
    // NO agentId, so we attribute each row via session_id → agent. Build the
    // bridge from every agent's primary heartbeat session_id plus its sidecar
    // session heartbeats (a single agent process can host several sessions); the
    // known-agent set lets a row whose callerPersonaId IS an agent id resolve
    // directly. Best-effort + swallowed — a missing ledger ⇒ no metrics attached
    // ⇒ cards render exactly as before. Mirrors the workload read above.
    const metricsByAgent = {};
    try {
        const bySession = {};
        for (const a of fleetAgents) {
            const primary = a.heartbeat?.session_id;
            if (primary) {
                bySession[primary] = a.id;
            }
            for (const s of a.sessions ?? []) {
                if (s?.session_id) {
                    bySession[s.session_id] = a.id;
                }
            }
        }
        const attribution = {
            bySession,
            knownAgents: fleetAgents.map(a => a.id),
        };
        const rows = await (0, fleetMetrics_1.readLlmLedgerRows)(wr);
        const fleetMetrics = (0, fleetMetrics_1.buildAgentMetrics)(rows, attribution, Date.now());
        for (const m of fleetMetrics.perAgent) {
            metricsByAgent[m.agentId] = m;
        }
    }
    catch { /* no llm ledger / unreadable ⇒ no metrics */ }
    // Resolve each agent's role + the single orchestrator via the
    // user-authoritative chain: fleet.json manifest → autoclaw.agentRoles setting
    // → registry role/agent_type/can_orchestrate → live board activity →
    // generalist. The user has ultimate control (the manifest overrides all).
    const manifest = readFleetManifest(wr);
    const declaredRoles = readDeclaredAgentRoles();
    const governancePrimary = readGovernancePrimary(wr);
    const signals = fleetAgents.map(a => ({
        id: a.id,
        role: a.role,
        agent_type: a.agent_type,
        can_orchestrate: a.can_orchestrate,
    }));
    const resolvedFleet = (0, architecture_1.resolveFleet)(signals, {
        manifest,
        settingRoles: declaredRoles,
        governancePrimary,
        inferRole: (id) => (0, webview_render_board_1.inferRoleFromActivity)(id, board),
    });
    const roleOf = {};
    const nameOf = {};
    const modelOf = {};
    // Lane A: agentId → freshest deep-linkable chat session, so board cards can
    // offer an "Open chat ↗" button for their owner/author/agent (cards know the
    // owner id but not that agent's session id). Built from the same session
    // heartbeats the agent cards use; absent for an agent ⇒ no button (graceful).
    const sessionOf = {};
    // Lane A: agentId → task ids it is actively driving on the board right now,
    // for the agent card's "Current task(s)" line.
    const currentTasksByAgent = {};
    for (const t of board?.in_flight ?? []) {
        if (!t.claimed_by) {
            continue;
        }
        (currentTasksByAgent[_a = t.claimed_by] ?? (currentTasksByAgent[_a] = [])).push(t.task_id);
    }
    for (const a of fleetAgents) {
        const rr = resolvedFleet.roles[a.id];
        roleOf[a.id] = rr.canonical;
        // Stamp the resolved canonical role back so the agent cards + team summary
        // (which call agentRole() internally) agree with the board's coloring.
        a.role = rr.canonical;
        // Slice B: attach the per-agent workload rollup (undefined ⇒ card unchanged).
        a.workload = workloadByAgent[a.id];
        // Follow-up #4: attach per-agent cost rollup (undefined ⇒ card unchanged).
        a.cost = costByAgent[a.id];
        // LANE C: attach the per-agent LLM-cost metrics (undefined ⇒ card unchanged).
        a.metrics = metricsByAgent[a.id];
        // Lane A: attach the agent's live tasks (undefined/empty ⇒ no card line).
        a.currentTasks = currentTasksByAgent[a.id];
        nameOf[a.id] = a.name || a.id;
        const model = a.heartbeat?.current_llm
            || (a.llms_available && a.llms_available.length === 1 ? a.llms_available[0] : undefined);
        if (model) {
            modelOf[a.id] = model;
        }
        // Lane A: pick the agent's freshest session heartbeat carrying a session_id
        // for the board's Open-chat deep link. `source` keys the host ladder
        // (claude-code → resume URI), falling back to the agent id.
        const withSessions = a.sessions ?? [];
        let freshest;
        for (const sh of withSessions) {
            if (!sh.session_id) {
                continue;
            }
            if (!freshest || new Date(sh.timestamp).getTime() > new Date(freshest.timestamp).getTime()) {
                freshest = sh;
            }
        }
        if (freshest?.session_id) {
            sessionOf[a.id] = {
                session_id: freshest.session_id,
                source: freshest.adapterId || a.id,
                rawRef: freshest.rawRef,
            };
        }
    }
    // v2.5: per-agent inbox summaries (local agents only) + server-rendered cards
    const summaries = {};
    for (const a of agents) {
        try {
            summaries[a.id] = await (0, comms_1.getInboxSummary)(commsDir, a.id);
        }
        catch { /* skip */ }
    }
    try {
        // Pass the active host identity AND this window's own session id so the card
        // list can mark "your agent" + flag the exact session running in this window
        // (deterministic when the host session id is among the rows; else the card
        // falls back to the freshest live session). Makes the self-scoped "Awaiting
        // You" section legible — same data, only the highlight differs per window.
        const selfId = activeHostAgentId();
        // Per-session LLM + token usage (cost ledger + Trace Ledger) for the
        // session-row chips. Best-effort: missing ledgers → no chips, never a
        // failed refresh.
        let usageBySession;
        try {
            usageBySession = await (0, sessionUsage_1.readSessionUsageChips)(wr);
        }
        catch { /* chips stay off */ }
        view.webview.postMessage({
            command: 'updateAgentCards',
            data: {
                html: (0, webview_render_1.renderAgentList)(fleetAgents, summaries, Date.now(), selfId, sessionId, usageBySession),
                count: fleetAgents.length,
            },
        });
    }
    catch { }
    // v2.5: Awaiting You list — uses the active host agent as "me".
    try {
        const me = activeHostAgentId();
        if (me) {
            const messages = await (0, comms_1.readInbox)(commsDir, me);
            const stateById = {};
            for (const m of messages) {
                const s = await (0, comms_1.readMessageState)(commsDir, me, m.id);
                if (s) {
                    stateById[m.id] = { replied_at: s.replied_at };
                }
            }
            const awaiting = (0, webview_render_1.filterAwaitingYou)(messages, me, stateById);
            const rows = [];
            for (const m of awaiting) {
                const row = {
                    message: m,
                    excerpt: (0, webview_render_1.payloadExcerpt)(m.payload),
                    history: buildAwaitingHistory(m, messages, me),
                };
                // CP-0.4: enrich review_request rows with the live consensus tally +
                // the author's handoff note so the drill-down shows votes / changed
                // files / test results instead of the "report wasn't found" fallback.
                // Best-effort — a missing stub or note degrades to a plain review row.
                if (m.type === 'review_request') {
                    try {
                        const enriched = await buildReviewEnrichment(wr, commsDir, m, me);
                        if (enriched.tally) {
                            row.tally = enriched.tally;
                        }
                        if (enriched.context) {
                            row.context = enriched.context;
                        }
                    }
                    catch { /* degrade to a plain review row */ }
                    // RA-5: attach an already-built advisory so the chip survives refreshes.
                    const adv = m.task_id ? advisoryCache.get(m.task_id) : undefined;
                    if (adv) {
                        row.advisory = adv;
                    }
                }
                rows.push(row);
            }
            view.webview.postMessage({
                command: 'updateAwaitingYou',
                data: {
                    html: (0, webview_render_1.renderAwaitingYou)(rows),
                    count: rows.length,
                },
            });
        }
        else {
            view.webview.postMessage({
                command: 'updateAwaitingYou',
                data: { html: (0, webview_render_1.renderAwaitingYou)([]), count: 0 },
            });
        }
    }
    catch { }
    // Comms log → role-colored message feed + per-task threads for the board.
    let commsLog = [];
    try {
        commsLog = await (0, comms_1.readCommsLog)(commsDir, { limit: 200 });
    }
    catch { }
    const threadEntries = commsLog.map(e => ({
        timestamp: e.timestamp, type: e.type, from: e.from, to: e.to,
        task_id: e.task_id, message: e.message,
    }));
    const boardCtx = {
        roleOf, nameOf, modelOf, threads: (0, webview_render_board_1.buildThreads)(threadEntries),
        // Lane A: per-agent session map so a card's detail can deep-link its owner's chat.
        sessionOf,
        // Worklog context: disambiguate generic task_ids in the Done lane.
        worklogContext,
    };
    try {
        view.webview.postMessage({
            command: 'updateMessages',
            data: { html: (0, webview_render_board_1.renderMessageFeed)(threadEntries.slice(-60), boardCtx), count: commsLog.length },
        });
    }
    catch { }
    // Task board (kanban) — board.json was read once above and is reused here.
    // The Done lane is reconstructed from the durable ledger (board.json drops
    // completed work); the section badge still counts open work only.
    const boardWithDone = board
        ? { ...board, done: (0, taskLedger_1.recentCompletions)(ledger, 30).map(e => ({
                task_id: e.task_id, agent_id: e.agent_id, title: e.title,
                sprint: e.sprint, completed_at: e.completed_at, review_status: e.review_status,
            })) }
        : (ledger.length
            ? { done: (0, taskLedger_1.recentCompletions)(ledger, 30).map(e => ({
                    task_id: e.task_id, agent_id: e.agent_id, title: e.title,
                    sprint: e.sprint, completed_at: e.completed_at, review_status: e.review_status,
                })) }
            : null);
    try {
        view.webview.postMessage({
            command: 'updateBoard',
            data: { html: (0, webview_render_board_1.renderBoard)(boardWithDone, boardCtx), count: (0, webview_render_board_1.boardTaskCount)(board) },
        });
    }
    catch { }
    try {
        const sp = path.join(wr, '.autoclaw', 'orchestrator', 'sprints', 'plan-summary.yaml');
        if (fs.existsSync(sp)) {
            const c = await fsPromises.readFile(sp, 'utf8');
            const m = c.match(/- number: \d+[\s\S]*?(?=\n  - number:|\nnotes:|\n\n|$)/g);
            if (m) {
                const sprints = m.map(b => ({
                    number: parseInt(b.match(/number: (\d+)/)?.[1] || '0'),
                    tasks: parseInt(b.match(/tasks: (\d+)/)?.[1] || '0'),
                    status: b.match(/status: (\w+)/)?.[1] || 'pending',
                }));
                view.webview.postMessage({ command: 'updateSprints', data: sprints });
            }
        }
    }
    catch { }
    try {
        view.webview.postMessage({ command: 'updateTimeline', data: await (0, timetravel_1.readSnapshots)(commsDir) });
    }
    catch { }
    // v2.5: Fabric (push-channel + kg-daemon) health.
    try {
        const health = await probeFabricHealth();
        view.webview.postMessage({
            command: 'updateFabricHealth',
            data: { html: (0, webview_render_1.renderFabricHealth)(health) },
        });
    }
    catch { }
    // FF-3: pending tray — agents with a fresh beacon not yet admitted to
    // fleet.json. Mapped to the webview's render shape (PendingAgentView).
    try {
        const pending = await readPendingTray(path.join(wr, '.autoclaw'));
        view.webview.postMessage({
            command: 'updatePending',
            data: pending.map(p => ({
                agentId: p.agent_id,
                sessionId: p.session_id,
                host: p.host,
                suggestedRole: p.suggested_role,
                suggestedType: p.suggested_agent_type,
                viaInvite: !!p.via_invite,
                trust: p.trust,
            })),
        });
    }
    catch { }
    // FLEET-DIGEST — collapse the same fleet picture into one small, canonical
    // artifact (`fleet-status.json`) every agent reads each SYNC instead of
    // re-walking the whole comms tree. Best-effort: piggybacks this refresh
    // cadence (no new timer), derives from the SAME render model the panel uses
    // (no second data path), and NEVER throws into the refresh path.
    try {
        const selfId = activeHostAgentId() ?? 'claude-code';
        const fleetModel = await (0, fleetData_1.gatherFleetData)({ workspaceRoot: wr, selfAgentId: selfId });
        // The board snapshot was already read once above; attach it the same way
        // the Manager panel does (`{ ...model, board }`).
        const digestModel = board
            ? { ...fleetModel, board: board }
            : fleetModel;
        const digest = (0, fleetDigest_1.buildFleetDigest)(digestModel, new Date().toISOString());
        const serialized = (0, fleetDigest_1.serializeFleetDigest)(digest);
        const outPath = path.join(wr, ...fleetDigest_1.FLEET_STATUS_REL_PATH.split('/'));
        await fsPromises.mkdir(path.dirname(outPath), { recursive: true });
        // Atomic write: tmp file in the same dir, then rename over the target so a
        // reader never sees a half-written digest.
        const tmpPath = `${outPath}.tmp-${process.pid}-${Date.now()}`;
        await fsPromises.writeFile(tmpPath, serialized, 'utf8');
        await fsPromises.rename(tmpPath, outPath);
    }
    catch { /* best-effort; digest write never breaks the refresh */ }
}
// ---------------------------------------------------------------------------
// v2.5 helpers — host-agent identity, fabric health, and reply orchestration.
// ---------------------------------------------------------------------------
/** Read the user-declared agentId → canonical role overrides from settings
 *  (`autoclaw.agentRoles`). Values are normalized through the role taxonomy,
 *  so synonyms ("dev", "qa", "security-auditor") resolve correctly. Unknown
 *  values fall through to 'generalist' and are ignored by the caller. */
function readDeclaredAgentRoles() {
    const out = {};
    try {
        const cfg = vscode.workspace.getConfiguration('autoclaw');
        const raw = cfg.get('agentRoles', {});
        if (raw && typeof raw === 'object') {
            for (const [agentId, roleStr] of Object.entries(raw)) {
                if (typeof roleStr === 'string') {
                    out[agentId] = (0, roles_1.normalizeRole)(roleStr);
                }
            }
        }
    }
    catch { /* no config — empty overrides */ }
    return out;
}
/** Read the user-authoritative fleet manifest (`.autoclaw/orchestrator/fleet.json`).
 *  Returns null when absent or malformed — callers fall back to detection. */
function readFleetManifest(wr) {
    try {
        const p = path.join(wr, '.autoclaw', 'orchestrator', 'fleet.json');
        if (!fs.existsSync(p)) {
            return null;
        }
        return (0, architecture_1.parseFleetManifest)(fs.readFileSync(p, 'utf8'));
    }
    catch {
        return null;
    }
}
/** Read the informational orchestrator from state.json governance.primary. */
function readGovernancePrimary(wr) {
    try {
        const p = path.join(wr, '.autoclaw', 'orchestrator', 'state.json');
        if (!fs.existsSync(p)) {
            return null;
        }
        const s = JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, ''));
        return s.governance?.primary?.agent_id ?? null;
    }
    catch {
        return null;
    }
}
/** Turn a beacon check-in (other IDE / runner / workspace) into a panel agent
 *  row so cross-tool agents appear in the fleet view, grouped by host. */
function beaconToAgent(b) {
    const live = b.stale ? 'stalled' : (b.status === 'active' ? 'active' : 'idle');
    const hb = {
        agent_id: b.agent_id,
        timestamp: b.timestamp,
        status: b.status === 'active' ? 'active' : 'idle',
        current_task: b.current_task ?? null,
        sprint: null,
        session_id: b.session_id,
        current_llm: b.current_llm,
    };
    return {
        id: b.agent_id,
        name: b.agent_id,
        extension_id: null,
        detected: true,
        inbox_path: '',
        hooks_supported: false,
        last_heartbeat: b.timestamp,
        status: live,
        live_status: live,
        heartbeat: hb,
        sessions: [hb],
        role: b.role,
        agent_type: b.agent_type,
        origin: 'beacon',
        host: b.host || b.workspace_id || 'external',
        machine_id: b.machine_id,
    };
}
/**
 * Command: designate the fleet orchestrator. Writes the chosen agent id to
 * `.autoclaw/orchestrator/fleet.json` (the user-authoritative manifest), which
 * the panel reads with top precedence over state.json governance + detection.
 */
async function designateOrchestratorCommand() {
    const wr = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!wr) {
        vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
        return;
    }
    const commsDir = path.join(wr, '.autoclaw', 'orchestrator', 'comms');
    let agentId;
    try {
        const reg = await (0, comms_1.readRegistry)(commsDir);
        const items = (reg?.agents ?? []).map(a => ({ label: a.name || a.id, description: a.id, id: a.id }));
        if (items.length > 0) {
            const pick = await vscode.window.showQuickPick(items, {
                title: 'Designate fleet orchestrator', placeHolder: 'Who coordinates the team?',
            });
            agentId = pick?.id;
        }
    }
    catch { /* fall through to manual entry */ }
    if (!agentId) {
        agentId = await vscode.window.showInputBox({ title: 'Designate fleet orchestrator', prompt: 'Agent id', ignoreFocusOut: true });
    }
    if (!agentId) {
        return;
    }
    try {
        const p = path.join(wr, '.autoclaw', 'orchestrator', 'fleet.json');
        const existing = readFleetManifest(wr) ?? { schema_version: '1.0' };
        const next = { ...existing, orchestrator: agentId };
        await fsPromises.mkdir(path.dirname(p), { recursive: true });
        await fsPromises.writeFile(p, JSON.stringify(next, null, 2), 'utf8');
        vscode.window.showInformationMessage(`AutoClaw: ${agentId} is now the fleet orchestrator.`);
        if (kdreamView) {
            await refreshOrchestratorData(kdreamView);
        }
    }
    catch (e) {
        vscode.window.showWarningMessage(`AutoClaw: could not write fleet.json — ${e.message}`);
    }
}
/**
 * Command: assign a panel role to a detected agent. Pick an agent, pick a role
 * from the canonical taxonomy, and persist it to `autoclaw.agentRoles` in
 * workspace settings. The panel reflects it on the next refresh.
 */
async function setAgentRoleCommand() {
    const wr = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!wr) {
        vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
        return;
    }
    const commsDir = path.join(wr, '.autoclaw', 'orchestrator', 'comms');
    // Offer detected agents; fall back to a free-text id if the registry is empty.
    let agentId;
    try {
        const reg = await (0, comms_1.readRegistry)(commsDir);
        const ids = (reg?.agents ?? []).map(a => ({ label: a.name || a.id, description: a.id, id: a.id }));
        if (ids.length > 0) {
            const pick = await vscode.window.showQuickPick(ids, { title: 'Set agent role — choose an agent', placeHolder: 'Detected agents' });
            agentId = pick?.id;
        }
    }
    catch { /* registry unreadable — fall through to manual entry */ }
    if (!agentId) {
        agentId = await vscode.window.showInputBox({ title: 'Set agent role', prompt: 'Agent id (e.g. claude-code)', ignoreFocusOut: true });
    }
    if (!agentId) {
        return;
    }
    const roleItems = roles_1.ROLE_ORDER.map(r => ({ label: `${roles_1.ROLE_META[r].glyph}  ${roles_1.ROLE_META[r].label}`, description: r, role: r }));
    const rolePick = await vscode.window.showQuickPick(roleItems, { title: `Role for ${agentId}`, placeHolder: 'Pick a role' });
    if (!rolePick) {
        return;
    }
    try {
        const cfg = vscode.workspace.getConfiguration('autoclaw');
        const current = { ...(cfg.get('agentRoles', {}) ?? {}) };
        current[agentId] = rolePick.role;
        const target = vscode.workspace.workspaceFolders?.length
            ? vscode.ConfigurationTarget.Workspace
            : vscode.ConfigurationTarget.Global;
        await cfg.update('agentRoles', current, target);
        vscode.window.showInformationMessage(`AutoClaw: ${agentId} is now ${roles_1.ROLE_META[rolePick.role].label}.`);
        if (kdreamView) {
            await refreshOrchestratorData(kdreamView);
        }
    }
    catch (e) {
        vscode.window.showWarningMessage(`AutoClaw: could not save role — ${e.message}`);
    }
}
/** A non-selectable section header for a QuickPick list. */
function pickSeparator(label) {
    return { label, kind: vscode.QuickPickItemKind.Separator };
}
/** Short, glanceable lane name (shown inline as item.description). */
const LANE_SHORT = {
    mcp: 'MCP lane', http: 'HTTP bridge', fs: 'filesystem', slash: 'native /loop',
};
/** One-line consequence of a tool's join lane (shown as the wrapped item.detail). */
function laneConsequence(conv) {
    const base = (() => {
        switch (conv.lane) {
            case 'mcp': return 'Mounts the autoclaw-mcp server and calls its tools directly; will ask to enable repo writes.';
            case 'http': return 'Heartbeat, claim, and report over REST + SSE through the AutoClaw bridge.';
            case 'slash': return 'Joins in-window using the native /loop skill — no extra setup.';
            case 'fs':
            default: return 'Writes a beacon + message files under the shared comms folder.';
        }
    })();
    return conv.fallbackLane ? `${base} Falls back to the ${LANE_SHORT[conv.fallbackLane] ?? conv.fallbackLane}.` : base;
}
/**
 * Build the target-tool picker items, grouped by federation peers vs in-extension
 * IDE hosts, each row surfacing its join lane (description) + consequence (detail).
 */
/**
 * Resolve a registry/fleet agent id to a {@link JOIN_TARGETS} key so the Start /
 * Onboard card action can pre-select the joining tool. Most agent ids ARE the
 * target key (kilocode, kiro, codex, …); a few announce a different agent_id
 * than their key (e.g. the `antigravity` target announces agent_id `gemini-cli`).
 * We therefore match the key directly first, then fall back to matching a
 * target's announced `agentId`, then finally to the id itself (unknown tools get
 * the safe fs-lane fallback inside the renderer). Returns undefined only for a
 * blank id so the caller falls back to the full picker.
 */
function resolveJoinTargetKey(agentId) {
    const id = (agentId ?? '').trim();
    if (!id) {
        return undefined;
    }
    if (joinPrompt_1.JOIN_TARGETS[id]) {
        return id;
    }
    for (const [key, conv] of Object.entries(joinPrompt_1.JOIN_TARGETS)) {
        if (conv.agentId === id) {
            return key;
        }
    }
    return id;
}
function buildTargetItems() {
    const federation = ['codex', 'codex-ide', 'codex-cli', 'generic-mcp', 'claude-desktop', 'openclaw', 'hermes'];
    const preferredIdeHosts = ['claude-code', 'fable'];
    const toItem = (key) => {
        const c = joinPrompt_1.JOIN_TARGETS[key];
        return { label: c.label, description: LANE_SHORT[c.lane] ?? c.lane, detail: laneConsequence(c), value: key };
    };
    const items = [pickSeparator('Federation peers')];
    for (const k of federation) {
        if (joinPrompt_1.JOIN_TARGETS[k]) {
            items.push(toItem(k));
        }
    }
    items.push(pickSeparator('In-extension IDE hosts'));
    for (const k of preferredIdeHosts) {
        if (joinPrompt_1.JOIN_TARGETS[k]) {
            items.push(toItem(k));
        }
    }
    for (const k of Object.keys(joinPrompt_1.JOIN_TARGETS)) {
        if (!federation.includes(k) && !preferredIdeHosts.includes(k)) {
            items.push(toItem(k));
        }
    }
    return items;
}
/**
 * Build the role picker items, grouped by tier (leadership / build & verify /
 * support). Each row carries the role's glanceable hint (description) + one-line
 * explanation (detail), sourced from ROLE_META so the picker can never drift.
 */
function buildRoleItems() {
    const tiers = [
        ['Leadership', ['orchestrator', 'architect', 'product']],
        ['Build & verify', ['coder', 'reviewer', 'tester', 'security']],
        ['Support', ['designer', 'creative', 'docs', 'researcher', 'ops', 'generalist']],
    ];
    const items = [];
    for (const [title, roles] of tiers) {
        items.push(pickSeparator(title));
        for (const r of roles) {
            const m = roles_1.ROLE_META[r];
            items.push({ label: `${m.glyph}  ${m.label}`, description: m.hint, detail: m.description, value: r });
        }
    }
    return items;
}
/**
 * Build the behavioral-type picker items, data-driven from agentTypeProfile so the
 * trust/consensus/human-in-loop consequences (description) and the plain-language
 * meaning (detail) can never drift from the policy module. When a `suggested` type
 * is given (derived from the chosen role) it is listed FIRST under a "Suggested"
 * header so the user can usually just take the top row.
 */
function buildAgentTypeItems(suggested) {
    const toItem = (t) => {
        const p = (0, agentTypes_1.agentTypeProfile)(t);
        const bits = [`trust: ${p.defaultTrust}`, `review: ${p.consensusRule}`];
        if (p.humanInLoop) {
            bits.push('human-in-loop');
        }
        if (p.canOrchestrate) {
            bits.push('can orchestrate');
        }
        return { label: t, description: bits.join(' · '), detail: p.description, value: t };
    };
    if (!suggested) {
        return agentTypes_1.AGENT_TYPES.map(toItem);
    }
    const rest = agentTypes_1.AGENT_TYPES.filter(t => t !== suggested);
    return [
        pickSeparator('Suggested for this role'),
        toItem(suggested),
        pickSeparator('Or choose another behavioral type'),
        ...rest.map(toItem),
    ];
}
/** Build the admit-policy picker items (auto-preapproved recommended first). */
function buildAdmitItems() {
    return [
        { label: 'auto-preapproved', description: 'recommended', value: 'auto-preapproved', detail: 'Admits the agent automatically if its behavioral type is pre-approved; otherwise it waits in the tray.' },
        { label: 'manual', value: 'manual', detail: 'Every join waits for you to approve it before the agent becomes active.' },
        { label: 'open', value: 'open', detail: 'Anyone holding this invite joins right away, no approval — use only for trusted, short-lived invites.' },
    ];
}
async function mirrorInviteToWorkspace(workspaceRoot, invite) {
    const commsDir = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'comms');
    await (0, invites_1.writeInvite)(invite, { scope: 'workspace', commsDir });
}
async function sendJoinWelcomeMessage(params) {
    const commsDir = path.join(params.workspaceRoot, '.autoclaw', 'orchestrator', 'comms');
    await (0, comms_1.sendMessage)(commsDir, {
        id: '',
        from: activeHostAgentId() ?? 'autoclaw',
        to: params.to,
        type: 'system',
        timestamp: '',
        payload: {
            kind: 'join_welcome',
            target_tool: params.targetTool,
            invite_token: params.invite.token,
            suggested_role: params.role,
            suggested_agent_type: params.agentType,
            scope: params.scope,
            workspace: params.workspaceRoot,
            protocol_candidates: [
                'docs/AGENT_SESSION_PROTOCOL.md',
                '.autoclaw/orchestrator/AGENT_SESSION_PROTOCOL.md',
                `.autoclaw/orchestrator/comms/agents/${params.to}/rules.md`,
                '.claude/rules/cross-agent-protocol.md',
                '.clinerules/cross-agent.md',
                'AGENTS.md',
            ],
            ...(params.bridgeUrl ? { bridge_url: params.bridgeUrl } : {}),
            next_action: 'Begin with REGISTER + SYNC, consume the invite, write a heartbeat/beacon, then report current inbox/board state before claiming work.',
        },
        requires_response: true,
    });
}
/** Issue a scoped, single-use invite token an outside agent can use to join. */
async function fleetInviteCommand() {
    const wr = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!wr) {
        vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
        return;
    }
    const rolePick = await vscode.window.showQuickPick(buildRoleItems(), {
        title: 'Invite agent — role',
        placeHolder: 'What does this agent work on? (its role — shown on the board)',
        matchOnDescription: true, matchOnDetail: true,
    });
    if (!rolePick?.value) {
        return;
    }
    const role = rolePick.value;
    // Behavioral type is DERIVED from the role and offered first; the user overrides
    // it only for the legitimate divergent cases (e.g. a draft-only docs agent).
    const suggestedType = (0, roleType_1.agentTypeForRole)(role);
    const typePick = await vscode.window.showQuickPick(buildAgentTypeItems(suggestedType), {
        title: `Invite agent — behavioral type (suggested: ${suggestedType})`,
        placeHolder: 'How is this agent trusted + reviewed? Take the suggested row unless you need to change it.',
        matchOnDescription: true, matchOnDetail: true,
    });
    if (!typePick?.value) {
        return;
    }
    const agentType = typePick.value;
    const policyPick = await vscode.window.showQuickPick(buildAdmitItems(), {
        title: 'Invite agent — admit policy',
        placeHolder: 'How should a consuming agent be admitted?',
        matchOnDetail: true,
    });
    if (!policyPick?.value) {
        return;
    }
    const admitPolicy = policyPick.value;
    const scopeRaw = await vscode.window.showInputBox({
        title: 'Invite agent — path scope (optional)',
        prompt: 'Comma-separated globs the agent may touch (seeds a scope-lease). Blank = whole repo.',
        placeHolder: 'src/test/**, docs/**',
        ignoreFocusOut: true,
    });
    const scope = (scopeRaw ?? '').split(',').map(s => s.trim()).filter(Boolean);
    try {
        const project = path.basename(wr);
        const invite = await (0, invites_1.createInvite)({
            issued_by: activeHostAgentId() ?? 'claude-code',
            project,
            workspace: wr,
            suggested_role: role,
            suggested_agent_type: agentType,
            admit_policy: admitPolicy,
            preapproved_types: admitPolicy === 'auto-preapproved' ? [agentType] : undefined,
            ...(scope.length ? { scope } : {}),
            transports: ['fs', 'mcp', 'http'],
        });
        try {
            await mirrorInviteToWorkspace(wr, invite);
        }
        catch { /* machine invite remains usable */ }
        await vscode.env.clipboard.writeText(invite.token);
        const pick = await vscode.window.showInformationMessage(`AutoClaw: invite created for a ${role} (${agentType}) on "${project}". Token copied to clipboard — hand it to the agent.\n\n${invite.token}`, { modal: false }, 'Copy token again');
        if (pick === 'Copy token again') {
            await vscode.env.clipboard.writeText(invite.token);
        }
        if (kdreamView) {
            await refreshOrchestratorData(kdreamView);
        }
    }
    catch (e) {
        vscode.window.showWarningMessage(`AutoClaw: could not create invite — ${e.message}`);
    }
}
/**
 * Issue a single-use invite AND render a ready-to-paste "join this project"
 * prompt tailored to a chosen tool's join lane (MCP / HTTP / filesystem / slash).
 * Closes the bare-token gap: the human gets a full prompt to paste into Codex,
 * Claude Desktop, OpenClaw, Hermes, or any in-extension IDE host.
 */
async function fleetJoinPromptCommand(arg) {
    const wr = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!wr) {
        vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
        return;
    }
    // 1. Target tool — drives the join lane + announced agent_id. When invoked
    // from a detected-but-not-live agent card (Start / Onboard), the agent id is
    // already known, so the target-tool picker is skipped and the tool is resolved
    // directly. Otherwise the user picks from the grouped tool list.
    let targetKey = arg?.agentId ? resolveJoinTargetKey(arg.agentId) : undefined;
    if (!targetKey) {
        const targetPick = await vscode.window.showQuickPick(buildTargetItems(), {
            title: 'Generate join prompt — target tool',
            placeHolder: 'Which tool is joining? (its lane is shown on each row)',
            matchOnDescription: true, matchOnDetail: true,
        });
        if (!targetPick?.value) {
            return;
        }
        targetKey = targetPick.value;
    }
    // 2. Role — the only required taxonomy choice (the board-facing job).
    const rolePick = await vscode.window.showQuickPick(buildRoleItems(), {
        title: 'Join prompt — role',
        placeHolder: 'What does this agent work on? (its role — shown on the board)',
        matchOnDescription: true, matchOnDetail: true,
    });
    if (!rolePick?.value) {
        return;
    }
    const role = rolePick.value;
    // 3. Behavioral type — DERIVED from the role and offered first; override only
    // for the legitimate divergent cases. Drives trust / consensus / auto-admit.
    const suggestedType = (0, roleType_1.agentTypeForRole)(role);
    const typePick = await vscode.window.showQuickPick(buildAgentTypeItems(suggestedType), {
        title: `Join prompt — behavioral type (suggested: ${suggestedType})`,
        placeHolder: 'How is this agent trusted + reviewed? Take the suggested row unless you need to change it.',
        matchOnDescription: true, matchOnDetail: true,
    });
    if (!typePick?.value) {
        return;
    }
    const agentType = typePick.value;
    // 4. Optional path scope.
    const scopeRaw = await vscode.window.showInputBox({
        title: 'Join prompt — path scope (optional)',
        prompt: 'Comma-separated globs the agent may touch (seeds a scope-lease). Blank = whole repo.',
        placeHolder: 'src/test/**, docs/**',
        ignoreFocusOut: true,
    });
    const scope = (scopeRaw ?? '').split(',').map(s => s.trim()).filter(Boolean);
    // An unknown agent id (Start / Onboard on a card for a tool without a
    // JOIN_TARGETS convention) resolves to a safe fs-lane fallback, mirroring the
    // renderer's own `conventionFor` fallback so lane-dependent steps below stay
    // sound. renderJoinPromptForInvite re-derives the same fallback from targetKey.
    const target = joinPrompt_1.JOIN_TARGETS[targetKey]
        ?? { agentId: targetKey, label: targetKey, lane: 'fs' };
    // 4b. Admit policy — unified with the Invite command (was hard-coded here).
    const policyPick = await vscode.window.showQuickPick(buildAdmitItems(), {
        title: 'Join prompt — admit policy',
        placeHolder: 'How should this agent be admitted once it consumes the invite?',
        matchOnDetail: true,
    });
    if (!policyPick?.value) {
        return;
    }
    const admitPolicy = policyPick.value;
    // 5. MCP-lane peers are READ-ONLY until allowWrites is enabled. Offer to flip
    // the file flag now — enabling writes is a TRUST decision, so it is explicit
    // opt-in, never silent.
    if ((target.lane === 'mcp' || target.fallbackLane === 'mcp') && !(0, allowWritesConfig_1.isWritesAllowed)(wr)) {
        const enable = await vscode.window.showWarningMessage('Enable MCP writes for this project? Required for MCP-lane agents (Codex, ' +
            'Claude Desktop) to claim tasks / vote. Writes stay gated per-tool by ' +
            '.autoclaw/mcp/config.json.', { modal: true }, 'Enable writes', 'Keep read-only');
        if (enable === 'Enable writes') {
            try {
                await (0, allowWritesConfig_1.setAllowWrites)(wr, true);
                vscode.window.showInformationMessage('AutoClaw: MCP writes enabled (.autoclaw/mcp/config.json).');
            }
            catch (e) {
                vscode.window.showWarningMessage(`AutoClaw: could not enable MCP writes — ${e.message}`);
            }
        }
    }
    // 6. Optional REST bridge URL — only meaningful for the HTTP lane (e.g. Hermes).
    let bridgeUrl;
    if (target.lane === 'http' || target.fallbackLane === 'http') {
        bridgeUrl = (await vscode.window.showInputBox({
            title: 'Join prompt — REST bridge URL (optional)',
            prompt: 'Base URL of the AutoClaw HTTP bridge for this project (HTTP-lane tools only).',
            placeHolder: 'http://127.0.0.1:7878',
            ignoreFocusOut: true,
        }))?.trim() || undefined;
    }
    try {
        const project = path.basename(wr);
        const invite = await (0, invites_1.createInvite)({
            issued_by: activeHostAgentId() ?? 'claude-code',
            project,
            workspace: wr,
            suggested_role: role,
            suggested_agent_type: agentType,
            admit_policy: admitPolicy,
            preapproved_types: admitPolicy === 'auto-preapproved' ? [agentType] : undefined,
            ...(scope.length ? { scope } : {}),
            transports: ['fs', 'mcp', 'http'],
        });
        try {
            await mirrorInviteToWorkspace(wr, invite);
        }
        catch { /* machine invite remains usable */ }
        // Pre-create the comms tree + a registry row so the joining agent arrives to a
        // writable inbox even in a project that has never run orchestrate (fixes the
        // "comms/claims does not exist" case). Idempotent + best-effort: a failure must
        // never block handing over the prompt — the fs-lane prompt also tells the agent
        // to create the tree itself.
        try {
            const commsRoot = path.join(wr, '.autoclaw', 'orchestrator', 'comms');
            await (0, scaffold_1.scaffoldAgent)(commsRoot, {
                agentId: target.agentId,
                role,
                agentType: agentType,
            });
            await sendJoinWelcomeMessage({
                workspaceRoot: wr,
                to: target.agentId,
                targetTool: targetKey,
                invite,
                role,
                agentType,
                scope,
                bridgeUrl,
            });
        }
        catch { /* non-fatal — the prompt's own ensure-tree step covers it */ }
        const prompt = (0, joinPrompt_1.renderJoinPromptForInvite)(targetKey, invite, bridgeUrl ? { bridgeUrl } : {});
        await vscode.env.clipboard.writeText(prompt);
        const pick = await vscode.window.showInformationMessage(`AutoClaw: join prompt for ${target.label} copied — paste it into that tool's chat.`, 'Copy again');
        if (pick === 'Copy again') {
            await vscode.env.clipboard.writeText(prompt);
        }
        if (kdreamView) {
            await refreshOrchestratorData(kdreamView);
        }
    }
    catch (e) {
        vscode.window.showWarningMessage(`AutoClaw: could not generate join prompt — ${e.message}`);
    }
}
/**
 * Add a whole AGENT TEAM from a ready-made template (autoclaw.fleet.addTeam).
 *
 * Closes the "every agent is built from a blank picker" gap: the user picks one of
 * the {@link TEAM_TEMPLATES} recipes, previews the squad (preview-before-mint — no
 * token is created until they confirm), and the command fans out one scoped invite
 * per seat, then opens a single ready-to-paste document with each seat's tailored
 * join prompt. The headline onboarding affordance.
 */
async function fleetAddTeamCommand() {
    const wr = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!wr) {
        vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
        return;
    }
    // 1. Gallery — recommended starter first, each row showing its seat lineup.
    const rec = (0, teamTemplates_1.recommendedTemplate)();
    const ordered = [rec, ...teamTemplates_1.TEAM_TEMPLATES.filter(t => t.id !== rec.id)];
    const galleryItems = ordered.map(t => ({
        label: t.recommended ? `${t.name}  $(star-full)` : t.name,
        description: t.recommended ? 'recommended' : `${t.seats.length} agents`,
        detail: `${t.seats.map(teamTemplates_1.seatSummary).join('   ·   ')} — ${t.whenToUse}`,
        id: t.id,
    }));
    const pick = await vscode.window.showQuickPick(galleryItems, {
        title: 'Add an agent team — pick a template',
        placeHolder: 'Start from a ready-made squad (you can adjust each seat after)',
        matchOnDescription: true, matchOnDetail: true,
    });
    if (!pick) {
        return;
    }
    const tpl = (0, teamTemplates_1.getTeamTemplate)(pick.id);
    if (!tpl) {
        return;
    }
    // 2. Preview-before-mint — show the full squad and confirm BEFORE any token is
    // created, so a cancel never burns invites.
    const lineup = tpl.seats
        .map((s, i) => `  ${i + 1}. ${s.role} / ${s.agentType} → ${joinPrompt_1.JOIN_TARGETS[s.tool]?.label ?? s.tool}  (admit: ${s.admit})`)
        .join('\n');
    const confirm = await vscode.window.showInformationMessage(`Create the "${tpl.name}" team?\n\n${lineup}\n\n${tpl.consensusNote}\n\n` +
        `This mints ${tpl.seats.length} single-use invite${tpl.seats.length === 1 ? '' : 's'} (24h TTL) and opens a document with each seat's join prompt.`, { modal: true }, 'Create team');
    if (confirm !== 'Create team') {
        return;
    }
    // 3. MCP-lane seats need writes enabled to claim/vote. Offer once if any seat
    // joins on the MCP lane and writes are still off (a trust decision → explicit).
    const needsMcpWrites = tpl.seats.some(s => {
        const lane = joinPrompt_1.JOIN_TARGETS[s.tool]?.lane;
        const fb = joinPrompt_1.JOIN_TARGETS[s.tool]?.fallbackLane;
        return (lane === 'mcp' || fb === 'mcp');
    });
    if (needsMcpWrites && !(0, allowWritesConfig_1.isWritesAllowed)(wr)) {
        const enable = await vscode.window.showWarningMessage('This team has MCP-lane agents (e.g. Codex, Claude Desktop). Enable MCP writes so they can claim tasks / vote? Writes stay gated per-tool by .autoclaw/mcp/config.json.', { modal: true }, 'Enable writes', 'Keep read-only');
        if (enable === 'Enable writes') {
            try {
                await (0, allowWritesConfig_1.setAllowWrites)(wr, true);
            }
            catch { /* non-fatal — surfaced in the doc */ }
        }
    }
    // 4. Fan out: one scoped invite per seat, render its tailored join prompt.
    const project = path.basename(wr);
    const issuedBy = activeHostAgentId() ?? 'claude-code';
    const commsRoot = path.join(wr, '.autoclaw', 'orchestrator', 'comms');
    const sections = [];
    let minted = 0;
    for (let i = 0; i < tpl.seats.length; i++) {
        const seat = tpl.seats[i];
        const seatAgentId = joinPrompt_1.JOIN_TARGETS[seat.tool]?.agentId ?? seat.tool;
        try {
            const invite = await (0, invites_1.createInvite)({
                issued_by: issuedBy,
                project,
                workspace: wr,
                suggested_role: seat.role,
                suggested_agent_type: seat.agentType,
                admit_policy: seat.admit,
                preapproved_types: seat.admit === 'auto-preapproved' ? [seat.agentType] : undefined,
                transports: ['fs', 'mcp', 'http'],
            });
            try {
                await mirrorInviteToWorkspace(wr, invite);
            }
            catch { /* machine invite remains usable */ }
            // Pre-create the comms tree + a roster row per seat so each teammate arrives
            // to a writable inbox even in a never-orchestrated project. Idempotent + best-effort.
            try {
                await (0, scaffold_1.scaffoldAgent)(commsRoot, { agentId: seatAgentId, role: seat.role, agentType: seat.agentType });
                await sendJoinWelcomeMessage({
                    workspaceRoot: wr,
                    to: seatAgentId,
                    targetTool: seat.tool,
                    invite,
                    role: seat.role,
                    agentType: seat.agentType,
                    scope: seat.scope ? [seat.scope] : [],
                });
            }
            catch { /* non-fatal */ }
            const prompt = (0, joinPrompt_1.renderJoinPromptForInvite)(seat.tool, invite);
            const toolLabel = joinPrompt_1.JOIN_TARGETS[seat.tool]?.label ?? seat.tool;
            sections.push(`## Seat ${i + 1} — ${seat.role} / ${seat.agentType} → ${toolLabel}\n\n` +
                `- **Why:** ${seat.rationale}\n` +
                `- **Suggested scope:** ${seat.scope}\n` +
                (seat.verifyHint ? `- **Verify with:** ${seat.verifyHint}\n` : '') +
                `- **Admit:** ${seat.admit}\n\n` +
                `Paste this into ${toolLabel}:\n\n` +
                '````text\n' + prompt + '\n````\n');
            minted++;
        }
        catch (e) {
            sections.push(`## Seat ${i + 1} — ${seat.role} / ${seat.agentType} → ${seat.tool}\n\n` +
                `> Could not mint this invite: ${e.message}\n`);
        }
    }
    const doc = `# Join your "${tpl.name}" team\n\n` +
        `${tpl.description}\n\n` +
        `**How review works:** ${tpl.consensusNote}\n\n` +
        `Each section below is one teammate. Open the suggested tool and paste its prompt into the chat. ` +
        `Tokens are single-use and expire in 24 hours — re-run **Add agent team** to mint fresh ones if any expire. ` +
        `Scopes below are suggestions; tighten them when you generate the prompt or in the agent's first message.\n\n` +
        `---\n\n${sections.join('\n---\n\n')}`;
    const td = await vscode.workspace.openTextDocument({ content: doc, language: 'markdown' });
    await vscode.window.showTextDocument(td, { preview: false });
    vscode.window.showInformationMessage(`AutoClaw: created the "${tpl.name}" team — ${minted}/${tpl.seats.length} invites minted. Paste each seat's prompt into its tool.`);
    if (kdreamView) {
        await refreshOrchestratorData(kdreamView);
    }
}
/**
 * Scaffold an arbitrary (non-extension) agent id into the comms tree: create its
 * inbox, ensure a registry row (with keepalive mapping), and write a bootstrap
 * rules file. Lets a brand-new tool join even when it isn't an auto-detected
 * extension.
 */
async function fleetScaffoldAgentCommand() {
    const wr = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!wr) {
        vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
        return;
    }
    const agentId = await vscode.window.showInputBox({
        title: 'Scaffold agent into project',
        prompt: 'Agent id to wire into this project (e.g. codex, hermes, my-bot)',
        placeHolder: 'codex',
        ignoreFocusOut: true,
        validateInput: v => /^[a-z0-9][a-z0-9._-]*$/i.test(v.trim()) ? null : 'Use letters, digits, dot, dash or underscore (no slashes).',
    });
    if (!agentId) {
        return;
    }
    try {
        const commsRoot = path.join(wr, '.autoclaw', 'orchestrator', 'comms');
        const res = await (0, scaffold_1.scaffoldAgent)(commsRoot, { agentId: agentId.trim() });
        vscode.window.showInformationMessage(`AutoClaw: scaffolded "${res.agentId}" (${res.keepalive.loop_mechanism}). ` +
            `${res.registryRowAdded ? 'Registry row added' : 'Registry row refreshed'}; inbox + bootstrap ready.`);
        if (kdreamView) {
            await refreshOrchestratorData(kdreamView);
        }
    }
    catch (e) {
        vscode.window.showWarningMessage(`AutoClaw: could not scaffold agent — ${e.message}`);
    }
}
/**
 * Toggle the MCP server's coarse `allowWrites` gate in .autoclaw/mcp/config.json.
 * MCP-lane peers (Codex, Claude Desktop) are read-only until this is on —
 * enabling it lets them claim tasks / vote. A trust decision, so it's explicit.
 */
async function mcpAllowWritesToggleCommand() {
    const wr = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!wr) {
        vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
        return;
    }
    const currently = (0, allowWritesConfig_1.isWritesAllowed)(wr);
    const pick = await vscode.window.showQuickPick([
        { label: '$(check) Enable MCP writes', description: 'Let MCP-lane agents claim tasks / vote (trust decision)', val: true },
        { label: '$(circle-slash) Disable MCP writes', description: 'Make the MCP server read-only again', val: false },
    ], { title: `MCP writes are currently ${currently ? 'ENABLED' : 'disabled'}`, placeHolder: 'Toggle the .autoclaw/mcp/config.json allowWrites flag' });
    if (!pick) {
        return;
    }
    try {
        await (0, allowWritesConfig_1.setAllowWrites)(wr, pick.val);
        vscode.window.showInformationMessage(`AutoClaw: MCP writes ${pick.val ? 'enabled' : 'disabled'}.`);
        if (kdreamView) {
            await refreshOrchestratorData(kdreamView);
        }
    }
    catch (e) {
        vscode.window.showWarningMessage(`AutoClaw: could not update MCP writes — ${e.message}`);
    }
}
/**
 * Scaffold or refresh fleet.json (and needs.json) from the currently-detected
 * agents. Preserves any hand-set entries; only adds missing agents — so role
 * election finally has a live manifest to read.
 */
async function fleetScaffoldManifestCommand() {
    const wr = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!wr) {
        vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
        return;
    }
    const autoclawDir = path.join(wr, '.autoclaw');
    const commsDir = path.join(autoclawDir, 'orchestrator', 'comms');
    try {
        const statuses = await (0, comms_1.getAgentStatuses)(commsDir);
        if (statuses.length === 0) {
            vscode.window.showWarningMessage('AutoClaw: no agents detected yet — provision the comms tree first.');
            return;
        }
        const agents = statuses.map(s => ({
            id: s.id,
            role: s.role,
            agent_type: s.agent_type ?? null,
            can_orchestrate: s.can_orchestrate ?? false,
        }));
        const res = await (0, authoring_1.scaffoldFleetManifest)(autoclawDir, agents);
        await (0, authoring_1.generateNeedsFile)(autoclawDir);
        vscode.window.showInformationMessage(`AutoClaw fleet manifest: ${res.summary}.`);
        if (kdreamView) {
            await refreshOrchestratorData(kdreamView);
        }
    }
    catch (e) {
        vscode.window.showWarningMessage(`AutoClaw: scaffold failed — ${e.message}`);
    }
}
/** Pick the fleet orchestrator from the detected agents (writes fleet.json). */
async function fleetPickOrchestratorCommand() {
    const wr = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!wr) {
        vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
        return;
    }
    const autoclawDir = path.join(wr, '.autoclaw');
    try {
        const statuses = await (0, comms_1.getAgentStatuses)(path.join(autoclawDir, 'orchestrator', 'comms'));
        if (statuses.length === 0) {
            vscode.window.showWarningMessage('AutoClaw: no agents detected.');
            return;
        }
        const pick = await vscode.window.showQuickPick(statuses.map(s => s.id), { placeHolder: 'Choose the fleet orchestrator' });
        if (!pick) {
            return;
        }
        await (0, authoring_1.setManifestOrchestrator)(autoclawDir, pick);
        vscode.window.showInformationMessage(`AutoClaw: orchestrator set to ${pick}.`);
        if (kdreamView) {
            await refreshOrchestratorData(kdreamView);
        }
    }
    catch (e) {
        vscode.window.showWarningMessage(`AutoClaw: could not set orchestrator — ${e.message}`);
    }
}
/**
 * CL-3: manually release dead-session, expired claims. Safe and release-only —
 * archives each abandoned claim to claims/_reaped/ and frees the task; never
 * touches live work or git. Available on demand regardless of the auto-reap
 * setting (which only governs the background loop).
 */
async function fleetReapClaimsCommand() {
    const wr = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!wr) {
        vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
        return;
    }
    try {
        const report = await (0, claimReaper_1.reapDeadClaims)(wr, { apply: true });
        if (report.reaped.length === 0) {
            vscode.window.showInformationMessage(`AutoClaw: no abandoned claims to reap (${report.scanned} scanned — all owners live or claims unexpired).`);
        }
        else {
            vscode.window.showInformationMessage(`AutoClaw: reaped ${report.reaped.length} dead-session claim(s) of ${report.scanned} scanned — tasks released (archived to claims/_reaped/): ${report.reaped.map(r => r.task_id).join(', ')}`);
        }
        if (kdreamView) {
            await refreshOrchestratorData(kdreamView);
        }
    }
    catch (e) {
        vscode.window.showWarningMessage(`AutoClaw: could not reap claims — ${e.message}`);
    }
}
/* -------------------------------------------------------------------------- */
/*  CL-4: file-scope leases                                                   */
/* -------------------------------------------------------------------------- */
/** Stable per-window session id so two windows of the same agent are distinct. */
let scopeSessionId;
function extScopeSession() {
    if (!scopeSessionId) {
        scopeSessionId = crypto.randomUUID();
    }
    return scopeSessionId;
}
function summarizeScopeConflicts(conflicts) {
    return conflicts
        .map(c => `${c.b.agent_id}/${String(c.b.session_id).slice(0, 8)} holds "${c.glob_b}" (vs your "${c.glob_a}")`)
        .join('; ');
}
/** Declare the globs this window is editing; warn on overlap with other sessions. */
async function fleetDeclareScopeCommand() {
    const wr = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!wr) {
        vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
        return;
    }
    const raw = await vscode.window.showInputBox({
        title: 'Declare file-scope lease',
        prompt: 'Comma-separated globs this window is editing (others see a scope_violation if they overlap).',
        placeHolder: 'src/extension.ts, src/orchestrator/**',
        ignoreFocusOut: true,
    });
    const globs = (raw ?? '').split(',').map(s => s.trim()).filter(Boolean);
    if (globs.length === 0) {
        return;
    }
    try {
        const res = await (0, scopeLease_1.declareScope)(wr, {
            agent_id: activeHostAgentId() ?? 'claude-code',
            session_id: extScopeSession(),
            globs,
        });
        if (res.conflicts.length === 0) {
            vscode.window.showInformationMessage(`AutoClaw: scope lease declared for ${globs.length} glob(s). No overlaps.`);
        }
        else {
            vscode.window.showWarningMessage(`AutoClaw: scope OVERLAP — ${summarizeScopeConflicts(res.conflicts)}. Coordinate before editing; a scope_violation was posted to the board.`);
        }
        if (kdreamView) {
            await refreshOrchestratorData(kdreamView);
        }
    }
    catch (e) {
        vscode.window.showWarningMessage(`AutoClaw: could not declare scope — ${e.message}`);
    }
}
/** Release this window's scope lease. */
async function fleetReleaseScopeCommand() {
    const wr = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!wr) {
        vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
        return;
    }
    const released = await (0, scopeLease_1.releaseScope)(wr, activeHostAgentId() ?? 'claude-code', extScopeSession());
    vscode.window.showInformationMessage(released ? 'AutoClaw: scope lease released.' : 'AutoClaw: no active scope lease for this window.');
    if (kdreamView) {
        await refreshOrchestratorData(kdreamView);
    }
}
/** Show active scope leases across the fleet + any overlaps. */
async function fleetScopeStatusCommand() {
    const wr = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!wr) {
        vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
        return;
    }
    const leases = await (0, scopeLease_1.readLeases)(wr);
    const live = leases.filter(l => !l.expires_at || Date.parse(l.expires_at) > Date.now());
    if (live.length === 0) {
        vscode.window.showInformationMessage('AutoClaw: no active file-scope leases.');
        return;
    }
    const conflicts = (0, scopeLease_1.detectConflicts)(live, Date.now());
    const lines = live.map(l => `• ${l.agent_id}/${l.session_id.slice(0, 8)}: ${l.globs.join(', ')}`);
    const head = conflicts.length ? `⚠ ${conflicts.length} scope overlap(s) — ` : `${live.length} active scope lease(s):\n`;
    vscode.window.showInformationMessage(head + lines.join('\n'), { modal: conflicts.length > 0 });
}
/** CL-5: write fleet-brief.json + show a one-line situational-awareness summary. */
async function fleetBriefCommand() {
    const wr = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!wr) {
        vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
        return;
    }
    try {
        const dest = await (0, fleetBrief_1.writeFleetBrief)(wr);
        const brief = JSON.parse(await fsPromises.readFile(dest, 'utf8'));
        const live = (brief.sessions ?? []).filter((s) => s.live).length;
        const summary = `Fleet brief: ${live}/${(brief.sessions ?? []).length} live · ` +
            `${(brief.claimable_top ?? []).length} claimable · ${brief.in_flight_count ?? 0} in flight · ` +
            `${brief.awaiting_review_count ?? 0} in review · ${brief.stuck_count ?? 0} stuck` +
            ((brief.scope_conflicts ?? []).length ? ` · ⚠ ${brief.scope_conflicts.length} scope overlap(s)` : '');
        vscode.window.showInformationMessage(summary, { modal: (brief.scope_conflicts ?? []).length > 0 });
        if (kdreamView) {
            await refreshOrchestratorData(kdreamView);
        }
    }
    catch (e) {
        vscode.window.showWarningMessage(`AutoClaw: could not build fleet brief — ${e.message}`);
    }
}
/** CL-2: archive aged telemetry / over-cap signals out of the shared inbox. */
async function fleetArchiveTelemetryCommand() {
    const wr = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!wr) {
        vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
        return;
    }
    try {
        const r = await (0, commsGc_1.archiveSharedInbox)(wr);
        vscode.window.showInformationMessage(`AutoClaw: archived ${r.archivedTelemetry} telemetry + ${r.archivedAgedSignals} aged/over-cap signals ` +
            `(scanned ${r.scanned}). Shared inbox is signal again.`);
        if (kdreamView) {
            await refreshOrchestratorData(kdreamView);
        }
    }
    catch (e) {
        vscode.window.showWarningMessage(`AutoClaw: archive failed — ${e.message}`);
    }
}
/** Read the pending tray: agents with a fresh beacon not yet in fleet.json. */
async function readPendingTray(autoclawDir) {
    const commsDir = path.join(autoclawDir, 'orchestrator', 'comms');
    const [beacons, manifestRaw, invitesM, invitesW] = await Promise.all([
        (0, beacons_1.readAllBeacons)({ commsDir }),
        fsPromises.readFile(path.join(autoclawDir, 'orchestrator', 'fleet.json'), 'utf8').then(architecture_1.parseFleetManifest).catch(() => null),
        (0, invites_1.listInvites)({}).catch(() => []),
        (0, invites_1.listInvites)({ scope: 'workspace', commsDir }).catch(() => []),
    ]);
    return (0, pending_1.computePendingAgents)(beacons, manifestRaw, [...invitesM, ...invitesW]);
}
/** Admit a pending agent into fleet.json with an authoritative role. */
async function fleetAdmitCommand() {
    const wr = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!wr) {
        vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
        return;
    }
    const autoclawDir = path.join(wr, '.autoclaw');
    const pending = await readPendingTray(autoclawDir);
    if (pending.length === 0) {
        vscode.window.showInformationMessage('AutoClaw: no agents are waiting to be admitted.');
        return;
    }
    const pick = await vscode.window.showQuickPick(pending.map(p => ({
        label: p.agent_id,
        description: `${p.suggested_role ?? 'generalist'}${p.host ? ' · ' + p.host : ''}${p.via_invite ? ' · invited' : ''}`,
        agent: p,
    })), { title: 'Admit agent', placeHolder: 'Pick a pending agent to admit' });
    if (!pick) {
        return;
    }
    const roleItems = roles_1.ROLE_ORDER.map(r => ({ label: `${roles_1.ROLE_META[r].glyph}  ${roles_1.ROLE_META[r].label}`, description: r, role: r }));
    const rolePick = await vscode.window.showQuickPick(roleItems, {
        title: `Role for ${pick.agent.agent_id}`,
        placeHolder: pick.agent.suggested_role ? `Suggested: ${pick.agent.suggested_role}` : 'Pick a role',
    });
    if (!rolePick) {
        return;
    }
    try {
        await (0, pending_1.admitAgent)(autoclawDir, pick.agent.agent_id, {
            role: rolePick.role,
            ...(pick.agent.suggested_agent_type ? { agent_type: pick.agent.suggested_agent_type } : {}),
        });
        vscode.window.showInformationMessage(`AutoClaw: admitted ${pick.agent.agent_id} as ${roles_1.ROLE_META[rolePick.role].label}.`);
        if (kdreamView) {
            await refreshOrchestratorData(kdreamView);
        }
    }
    catch (e) {
        vscode.window.showWarningMessage(`AutoClaw: could not admit — ${e.message}`);
    }
}
/** Decline a pending agent: revoke its invite (its beacon then ages out). */
async function fleetDeclineCommand() {
    const wr = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!wr) {
        vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
        return;
    }
    const autoclawDir = path.join(wr, '.autoclaw');
    const commsDir = path.join(autoclawDir, 'orchestrator', 'comms');
    const pending = await readPendingTray(autoclawDir);
    if (pending.length === 0) {
        vscode.window.showInformationMessage('AutoClaw: no agents are waiting.');
        return;
    }
    const pick = await vscode.window.showQuickPick(pending.map(p => ({ label: p.agent_id, description: p.via_invite ? 'invited' : 'uninvited beacon', agent: p })), { title: 'Decline agent', placeHolder: 'Pick a pending agent to decline' });
    if (!pick) {
        return;
    }
    if (pick.agent.via_invite) {
        await (0, invites_1.revokeInvite)(pick.agent.via_invite, {}).catch(() => false);
        await (0, invites_1.revokeInvite)(pick.agent.via_invite, { scope: 'workspace', commsDir }).catch(() => false);
    }
    vscode.window.showInformationMessage(`AutoClaw: declined ${pick.agent.agent_id}. Its invite was revoked; the beacon will age out.`);
    if (kdreamView) {
        await refreshOrchestratorData(kdreamView);
    }
}
// ---------------------------------------------------------------------------
// LANE B — per-agent Command & Control (message / pause / resume / reassign /
// evict). The panel posts {command, agentId, sessionId}; these commands accept
// that arg so a button click drives them directly (a palette invocation prompts
// for the agent id instead). All of these are LOCAL single-operator only — the
// cross-machine signing gate (evict §5) is not built, so nothing here is wired
// to the relay/HTTP path.
// ---------------------------------------------------------------------------
/** The workspace comms dir (`.autoclaw/orchestrator/comms`), or null if no ws. */
function workspaceCommsDir() {
    const wr = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!wr) {
        vscode.window.showWarningMessage('AutoClaw: open a workspace folder first.');
        return null;
    }
    return path.join(wr, '.autoclaw', 'orchestrator', 'comms');
}
/** Resolve the target agent id: prefer the panel-supplied arg, else prompt. */
async function resolveTargetAgentId(arg) {
    if (arg && typeof arg === 'object' && typeof arg.agentId === 'string') {
        return arg.agentId;
    }
    if (typeof arg === 'string' && arg.length > 0) {
        return arg;
    }
    return vscode.window.showInputBox({
        title: 'Target agent id', prompt: 'Agent id to act on', placeHolder: 'kilocode',
        ignoreFocusOut: true,
    });
}
/** Pull an optional session id out of the panel-supplied arg. */
function argSessionId(arg) {
    if (arg && typeof arg === 'object' && typeof arg.sessionId === 'string') {
        const s = arg.sessionId;
        return s.length > 0 ? s : undefined;
    }
    return undefined;
}
/**
 * Send a single typed doorbell into a target agent's inbox. Reuses the existing
 * `sendMessage` delivery path (writes inboxes/<to>/ + appends the comms log) —
 * no new transport. `requires_response` is true only for the free-text message
 * (so it lands in the peer's "Awaiting You").
 */
async function sendAgentDoorbell(commsDir, to, type, payload, requiresResponse) {
    await (0, comms_1.sendMessage)(commsDir, {
        id: '', from: activeHostAgentId() ?? 'claude-code', to, type,
        timestamp: new Date().toISOString(),
        payload, requires_response: requiresResponse,
    });
}
/** Per-agent: send a free-text message (a `question`) to the agent's inbox. */
async function fleetMessageAgentCommand(arg) {
    const commsDir = workspaceCommsDir();
    if (!commsDir) {
        return;
    }
    const agentId = await resolveTargetAgentId(arg);
    if (!agentId) {
        return;
    }
    const body = await vscode.window.showInputBox({
        title: `Message ${agentId}`,
        prompt: 'Send a message to this agent (lands in its inbox / Awaiting You).',
        placeHolder: 'Can you pick up task B3 next?',
        ignoreFocusOut: true,
    });
    if (body == null || body.trim().length === 0) {
        return;
    }
    try {
        await sendAgentDoorbell(commsDir, agentId, 'question', { message: body.trim() }, true);
        vscode.window.showInformationMessage(`AutoClaw: message sent to ${agentId}.`);
        if (kdreamView) {
            await refreshOrchestratorData(kdreamView);
        }
    }
    catch (e) {
        vscode.window.showWarningMessage(`AutoClaw: could not message ${agentId} — ${e.message}`);
    }
}
/** Per-agent: ask a cooperating agent to PAUSE (stop claiming new work). */
async function fleetPauseAgentCommand(arg) {
    const commsDir = workspaceCommsDir();
    if (!commsDir) {
        return;
    }
    const agentId = await resolveTargetAgentId(arg);
    if (!agentId) {
        return;
    }
    const sessionId = argSessionId(arg);
    try {
        await sendAgentDoorbell(commsDir, agentId, 'pause', {
            pause: true,
            ...(sessionId ? { session_id: sessionId } : {}),
            reason: 'Operator requested pause — finish your current claim, then stop claiming new work.',
        }, false);
        vscode.window.showInformationMessage(`AutoClaw: pause sent to ${agentId}. It should stop claiming new work after its current task.`);
        if (kdreamView) {
            await refreshOrchestratorData(kdreamView);
        }
    }
    catch (e) {
        vscode.window.showWarningMessage(`AutoClaw: could not pause ${agentId} — ${e.message}`);
    }
}
/** Per-agent: tell a paused agent it may RESUME claiming work. */
async function fleetResumeAgentCommand(arg) {
    const commsDir = workspaceCommsDir();
    if (!commsDir) {
        return;
    }
    const agentId = await resolveTargetAgentId(arg);
    if (!agentId) {
        return;
    }
    const sessionId = argSessionId(arg);
    try {
        await sendAgentDoorbell(commsDir, agentId, 'resume', {
            resume: true,
            ...(sessionId ? { session_id: sessionId } : {}),
            reason: 'Operator cleared the pause — you may claim work again.',
        }, false);
        vscode.window.showInformationMessage(`AutoClaw: resume sent to ${agentId}.`);
        if (kdreamView) {
            await refreshOrchestratorData(kdreamView);
        }
    }
    catch (e) {
        vscode.window.showWarningMessage(`AutoClaw: could not resume ${agentId} — ${e.message}`);
    }
}
/**
 * Per-agent: RELEASE a claim the agent holds so the board can re-dispatch it.
 * The SAFE half — deleting a `comms/claims/<task>.json` file IS the mutex
 * release (the same path the orchestrator's expired-claim sweep uses); we then
 * broadcast a `reassign` doorbell so the fleet picks the freed task back up. We
 * never rewrite the DAG or force-assign to a specific agent (Hard Rule 5).
 */
async function fleetReassignAgentCommand(arg) {
    const commsDir = workspaceCommsDir();
    if (!commsDir) {
        return;
    }
    const agentId = await resolveTargetAgentId(arg);
    if (!agentId) {
        return;
    }
    // List the claims this agent currently holds so the operator picks one.
    const claimsDirPath = path.join(commsDir, 'claims');
    let claimFiles = [];
    try {
        claimFiles = (await fsPromises.readdir(claimsDirPath)).filter(f => f.endsWith('.json'));
    }
    catch { /* none */ }
    const held = [];
    for (const name of claimFiles) {
        try {
            const claim = JSON.parse((await fsPromises.readFile(path.join(claimsDirPath, name), 'utf8')).replace(/^﻿/, ''));
            if (claim.claimed_by === agentId) {
                held.push({ taskId: claim.task_id ?? name.replace(/\.json$/, ''), file: path.join(claimsDirPath, name) });
            }
        }
        catch { /* skip malformed */ }
    }
    if (held.length === 0) {
        vscode.window.showInformationMessage(`AutoClaw: ${agentId} holds no claims to reassign.`);
        return;
    }
    const pick = await vscode.window.showQuickPick(held.map(h => ({ label: h.taskId, description: 'release this claim back to the board', held: h })), { title: `Reassign — release a claim held by ${agentId}`, placeHolder: 'Pick a task to release for re-dispatch' });
    if (!pick) {
        return;
    }
    try {
        await fsPromises.unlink(pick.held.file).catch(() => { });
        // Broadcast that the task is free again so the fleet re-claims it. We do NOT
        // pin it to another agent — the board's normal claim path owns assignment.
        await sendAgentDoorbell(commsDir, 'shared', 'reassign', {
            reassign: true, task_id: pick.held.taskId, released_from: agentId,
            reason: `Operator released ${pick.held.taskId} from ${agentId} — open for re-claim.`,
        }, false);
        vscode.window.showInformationMessage(`AutoClaw: released ${pick.held.taskId} from ${agentId}; it is open for re-claim.`);
        if (kdreamView) {
            await refreshOrchestratorData(kdreamView);
        }
    }
    catch (e) {
        vscode.window.showWarningMessage(`AutoClaw: could not reassign — ${e.message}`);
    }
}
/**
 * Per-agent: EVICT — the one destructive org primitive (releases claims, revokes
 * trust + invite, tears down presence, retires). A REQUIRED confirmation modal
 * gates it; hard mode is refused on a fresh heartbeat (evict.ts gate). Local
 * single-operator only — the cross-machine signing gate (§5) is not built, so
 * this never touches the relay path. Delegates the whole transaction to the
 * tested SAFE-CORE `evictAgent()`.
 */
async function fleetEvictAgentCommand(arg) {
    const commsDir = workspaceCommsDir();
    if (!commsDir) {
        return;
    }
    const agentId = await resolveTargetAgentId(arg);
    if (!agentId) {
        return;
    }
    const sessionId = argSessionId(arg);
    const operator = activeHostAgentId() ?? 'claude-code';
    // REQUIRED confirmation — eviction removes a running participant. Modal so it
    // can't be dismissed by a stray Escape on the toast.
    const scopeNote = sessionId ? ` (session ${sessionId.slice(0, 8)}…)` : ' (all sessions)';
    const choice = await vscode.window.showWarningMessage(`Evict ${agentId}${scopeNote}? This releases its claims, revokes its trust + invite, tears down its presence, and retires it. Its work history is kept.`, { modal: true, detail: 'Graceful drains its current work first. Local single-operator action only — cross-machine evict is blocked.' }, 'Evict (graceful)');
    if (choice !== 'Evict (graceful)') {
        return;
    }
    try {
        const intent = await (0, evict_1.evictAgent)({
            agentId, ...(sessionId ? { sessionId } : {}),
            mode: 'graceful', operator, commsDir,
        }, 
        // authorizedOperators omitted ⇒ single-operator in-IDE default (the local
        // human is the only filesystem writer). The intent record lands under
        // comms/intents/ so the Manager can show requested→acting→done.
        {});
        // Post-evict follow-through (triage #1/#2): re-dispatch doorbells for the
        // released tasks, findings for blocked dependents, and the survivor
        // consensus recompute. Best-effort — a doorbell hiccup must not report a
        // completed evict as failed.
        const wr = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        let followUp = '';
        if (wr) {
            try {
                const { reconcileAfterEvict } = await Promise.resolve().then(() => require('./fleet/evictReconcile'));
                const rec = await reconcileAfterEvict(wr, intent, { fromAgent: operator });
                if (rec.redispatched.length || rec.consensusResolved.length || rec.findings) {
                    followUp = ` Re-dispatched ${rec.redispatched.length}, resolved ${rec.consensusResolved.length} consensus item(s), raised ${rec.findings} finding(s).`;
                }
            }
            catch { /* the loop's liveness pass is the backstop */ }
        }
        const released = intent.released_tasks.length;
        const blocked = intent.blocked_dependents.length;
        vscode.window.showInformationMessage(`AutoClaw: evicted ${agentId} (${intent.state}). Released ${released} claim${released === 1 ? '' : 's'}` +
            `${blocked ? `, ${blocked} dependent${blocked === 1 ? '' : 's'} left blocked (see findings)` : ''}. ` +
            `Intent ${intent.intent_id} recorded in ${path.relative(commsDir, (0, evict_1.intentsDir)(commsDir))}/.` + followUp);
        if (kdreamView) {
            await refreshOrchestratorData(kdreamView);
        }
    }
    catch (e) {
        // Map the typed evict errors to clear operator-facing messages.
        if (e instanceof evict_1.EvictRemoteBlockedError) {
            vscode.window.showErrorMessage('AutoClaw: cross-machine evict is blocked (the §5 signing gate is not built). Evict only agents on this machine.');
        }
        else if (e instanceof evict_1.EvictHardOnFreshError) {
            vscode.window.showWarningMessage(`AutoClaw: ${agentId} has a fresh heartbeat — a forced evict was refused. Use graceful, or wait for the heartbeat to go stale.`);
        }
        else if (e instanceof evict_1.EvictAuthError) {
            vscode.window.showErrorMessage(`AutoClaw: evict refused — ${e.message}`);
        }
        else {
            vscode.window.showWarningMessage(`AutoClaw: evict of ${agentId} failed — ${e.message}`);
        }
    }
}
/** Best-effort "who am I?" for the host running this extension instance.
 *  Used to populate the "Awaiting You" filter. Falls back to undefined. */
function activeHostAgentId() {
    if (currentIde !== 'other' && currentIde !== 'vscode') {
        return currentIde;
    }
    const cfg = vscode.workspace.getConfiguration('autoclaw');
    const explicit = cfg.get('hostAgentId');
    if (explicit && explicit.length > 0) {
        return explicit;
    }
    return 'claude-code';
}
/** Probe the local bridge `/api/v1/health` and the kg-daemon to label header
 *  badges. Always resolves — never throws. */
async function probeFabricHealth() {
    const out = { bridge: 'off', kg: 'disabled' };
    // Bridge state — only meaningful if the extension actually started one.
    if (activeBridge?.running) {
        try {
            const cfg = activeBridge.config;
            const body = await httpGetJson(`http://${cfg.host}:${cfg.port}/api/v1/health`, 1000);
            const sse = typeof body?.sse_clients === 'number' ? body.sse_clients : 0;
            const ws = typeof body?.ws_clients === 'number' ? body.ws_clients : 0;
            out.bridge_port = cfg.port;
            out.sse_clients = sse;
            out.ws_clients = ws;
            if (ws > 0) {
                out.bridge = 'ws';
            }
            else if (sse > 0) {
                out.bridge = 'sse';
            }
            else {
                out.bridge = 'poll';
            }
        }
        catch {
            out.bridge = 'poll';
        }
    }
    else {
        out.bridge = 'off';
    }
    // Knowledge Graph — in-process store on the Intelligence Layer's ABI-proof
    // node:sqlite driver (no child process). `disabled` when opted out; else open
    // the lazily-cached handle and reflect whether a driver loaded.
    const kgCfg = vscode.workspace.getConfiguration('autoclaw.kg');
    if (!kgCfg.get('enabled', true)) {
        out.kg = 'disabled';
    }
    else {
        try {
            const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || undefined;
            const h = (0, service_1.getKnowledgeGraph)({ workspaceRoot });
            out.kg = h.degraded ? 'degraded' : 'ready';
            out.kg_detail = {
                driverKind: h.driverKind,
                caps: h.caps,
                embeddingProvider: h.embedding.provider,
            };
        }
        catch {
            out.kg = 'degraded';
        }
    }
    return out;
}
/** Tiny GET-JSON helper — uses node http. Resolves null on any failure. */
function httpGetJson(url, timeoutMs) {
    return new Promise((resolve) => {
        try {
            const u = new URL(url);
            const http = require('http');
            const req = http.request({
                host: u.hostname,
                port: u.port,
                path: u.pathname + u.search,
                method: 'GET',
                timeout: timeoutMs,
            }, (res) => {
                const chunks = [];
                res.on('data', (c) => chunks.push(c));
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
                    }
                    catch {
                        resolve(null);
                    }
                });
            });
            req.on('error', () => resolve(null));
            req.on('timeout', () => { try {
                req.destroy();
            }
            catch { } resolve(null); });
            req.end();
        }
        catch {
            resolve(null);
        }
    });
}
/** Handle a Reply click from the Awaiting You panel: prompt user for body
 *  text, write a `review_response` or `answer` message back to the sender's
 *  inbox, and mark the original message replied. */
/**
 * Build a compact prior-turn history for an awaiting message so the user sees the
 * context they're replying to: earlier inbox messages in the same task/thread or
 * from the same sender, oldest→newest, last 5. (One-sided for now — received
 * turns only; including the user's own sent replies is a future enhancement.)
 */
function buildAwaitingHistory(m, inbox, me) {
    const mTime = new Date(m.timestamp).getTime();
    const prior = inbox
        .filter(x => x.id !== m.id
        && ((m.task_id && x.task_id === m.task_id) || x.from === m.from)
        && new Date(x.timestamp).getTime() <= mTime)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return prior.slice(-5).map(x => ({
        from: x.from,
        type: x.type,
        text: (0, webview_render_1.payloadExcerpt)(x.payload),
        ts: x.timestamp,
        mine: x.from === me,
    }));
}
/**
 * CP-0.4: resolve the consensus tally + author handoff context for one
 * `review_request` row so the panel drill-down shows votes / changed files /
 * test results. Best-effort and degrade-safe — every read is guarded, so a
 * missing or corrupt stub/note yields an absent field, never a throw.
 *
 * Tally: the OPEN `consensus/active/<task>.json` stub (with any per-agent vote
 * files folded in) while the gate is live, else the CLOSED
 * `consensus/resolved/<task>.json` record. Context: the author's latest
 * handoff note ({@link readHandoffNote}).
 */
async function buildReviewEnrichment(workspaceRoot, commsDir, m, me) {
    const payload = (m.payload ?? {});
    const taskId = String(m.task_id ?? payload.task_id ?? '').trim();
    if (!taskId) {
        return {};
    }
    const out = {};
    const base = path.basename(taskId);
    const activeDir = path.join(commsDir, 'consensus', 'active');
    const resolvedDir = path.join(commsDir, 'consensus', 'resolved');
    // Tally — active stub first (live gate), else the durable resolved record.
    try {
        const stub = await readConsensusJson(path.join(activeDir, `${base}.json`));
        if (stub && typeof stub.task_id === 'string') {
            // Panel castVote writes `<task>-<voter>.json`, not into stub.votes[] — fold
            // those in so the live count reflects votes cast from the panel too.
            const extraVotes = await readPerAgentVotes(activeDir, taskId, base);
            out.tally = (0, webview_render_1.buildReviewTally)({ kind: 'active', stub, extraVotes }, me);
        }
        else {
            const record = await readConsensusJson(path.join(resolvedDir, `${base}.json`));
            if (record && typeof record.task_id === 'string') {
                out.tally = (0, webview_render_1.buildReviewTally)({ kind: 'resolved', record }, me);
            }
        }
    }
    catch { /* no tally */ }
    // Context — the author's latest handoff note (may not exist yet).
    try {
        const note = await (0, handoff_1.readHandoffNote)(workspaceRoot, taskId);
        const sourceId = typeof payload.source_task_complete_id === 'string'
            ? payload.source_task_complete_id : undefined;
        const ctx = (0, webview_render_1.buildReviewContext)(note, {
            sprint: typeof m.sprint === 'number' ? m.sprint : undefined,
            sourceId,
        });
        if (ctx) {
            out.context = ctx;
        }
    }
    catch { /* no context */ }
    return out;
}
/** Read + parse a consensus JSON file, tolerating a BOM. Null on any failure. */
async function readConsensusJson(filePath) {
    try {
        return JSON.parse((await fsPromises.readFile(filePath, 'utf8')).replace(/^﻿/, ''));
    }
    catch {
        return null;
    }
}
/**
 * Read the per-agent vote files (`<task>-<voter>.json`) for one task out of the
 * active consensus dir, normalised into TallyVotes. The file body's `task_id`
 * is authoritative (never the filename); the name prefix is only a cheap
 * pre-filter. Best-effort — a malformed vote file is skipped.
 */
async function readPerAgentVotes(activeDir, taskId, base) {
    const votes = [];
    let names;
    try {
        names = await fsPromises.readdir(activeDir);
    }
    catch {
        return votes;
    }
    const prefix = `${base}-`;
    for (const name of names) {
        if (!name.endsWith('.json') || !name.startsWith(prefix)) {
            continue;
        }
        const obj = await readConsensusJson(path.join(activeDir, name));
        if (!obj || obj.task_id !== taskId) {
            continue;
        }
        const v = (0, consensusTally_1.normalizeTallyVote)(obj);
        if (v) {
            votes.push({ voter: v.voter, vote: v.vote, timestamp: v.timestamp, comments: v.comments });
        }
    }
    return votes;
}
async function handleReplyAwaiting(view, args) {
    const wr = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!wr || !args.messageId || !args.from) {
        return;
    }
    const commsDir = path.join(wr, '.autoclaw', 'orchestrator', 'comms');
    const me = activeHostAgentId();
    if (!me) {
        return;
    }
    // Prefer the inline reply box; fall back to a modal prompt only if it's empty.
    let body = (args.body ?? '').trim();
    if (!body) {
        body = (await vscode.window.showInputBox({
            prompt: `Reply to ${args.from} (${args.type ?? 'message'})`,
            placeHolder: 'Type your reply…',
            ignoreFocusOut: true,
        }))?.trim() ?? '';
    }
    if (!body) {
        return;
    }
    const responseType = args.type === 'question' ? 'answer' : 'review_response';
    try {
        await (0, comms_1.sendMessage)(commsDir, {
            id: '',
            from: me,
            to: args.from,
            type: responseType,
            timestamp: '',
            payload: { in_reply_to: args.messageId, body },
            requires_response: false,
        });
        await (0, comms_1.markMessageReplied)(commsDir, me, args.messageId);
        vscode.window.showInformationMessage(`Reply sent to ${args.from}.`);
        await refreshOrchestratorData(view);
    }
    catch (e) {
        vscode.window.showWarningMessage(`Reply failed: ${e.message}`);
    }
}
/**
 * RV-1: handle a `castVote` message from the review-decision UI. Writes this
 * host agent's own consensus vote file (`<task>-<agent>.json`) under
 * comms/consensus/active/ via the vscode-free voteWriter, then refreshes the
 * panel so the consensus tally reflects the new vote immediately.
 */
async function handleCastVote(view, args) {
    const wr = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!wr) {
        return;
    }
    const me = activeHostAgentId();
    if (!me) {
        return;
    }
    if (!args.taskId || !args.vote) {
        vscode.window.showWarningMessage('Vote ignored: missing task id or vote value.');
        return;
    }
    const consensusActiveDir = path.join(wr, '.autoclaw', 'orchestrator', 'comms', 'consensus', 'active');
    const result = await (0, voteWriter_1.writeConsensusVote)({
        consensusActiveDir,
        taskId: args.taskId,
        voter: me,
        sessionId,
        vote: args.vote,
        comment: args.comment ?? '',
    });
    if (result.ok) {
        const label = args.vote.replace('_', ' ');
        vscode.window.showInformationMessage(`Vote recorded: ${label} on ${args.taskId}.`);
        await refreshOrchestratorData(view);
    }
    else {
        vscode.window.showWarningMessage(`Vote failed: ${result.error}`);
    }
}
/**
 * RA-5: per-window advisory cache — taskId → the last advisory built here, so
 * the chip survives section refreshes without a rebuild. Session-scoped and
 * advisory-only; nothing durable depends on it.
 */
const advisoryCache = new Map();
/**
 * RA-5 `requestAdvisory`: build the review advisory for one review row
 * (deterministic conflict + risk lenses, plus the optional RA-3 LLM reasoner
 * wired to whatever LOCAL provider `autoclaw.autopilot.modelRoutes` routes the
 * `'review'` task class to), cache it, emit the RA-6 bus recommendation
 * (idempotent per content), and push the refreshed section. Best-effort — a
 * failed build toasts, never throws. The reasoner itself never throws either
 * (reviewReasoner.ts) — with no LOCAL provider configured it declines and the
 * advisory is the same deterministic flags-only result as before this wiring
 * (reviewReasonerWiring.ts is local-only until RA-8 lands non-local
 * redaction/consent — see docs/specs/review-advisor/tasks.md).
 */
async function handleRequestAdvisory(view, args) {
    const wr = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!wr || !args.taskId) {
        return;
    }
    try {
        const { LlmRegistry } = await Promise.resolve().then(() => require('./llm/registry'));
        // Top-level function (outside activate()'s closure) — no captured `context`
        // here, so self-look-up the extension path the same way host detection
        // does above. `createPremiumApi`'s ctx.extensionPath is presently unused by
        // both implementations, so an empty fallback is harmless if lookup fails.
        const extensionPath = vscode.extensions.getExtension('ZippyTechnologiesLLC.autoclaw')?.extensionPath ?? '';
        const premium = (0, premium_1.createPremiumApi)({ extensionPath });
        const reasoner = (0, reviewReasonerWiring_1.createRealReviewReasoner)({
            registry: new LlmRegistry({ workspaceRoot: wr }),
            rawConfig: vscode.workspace.getConfiguration('autoclaw.autopilot').get('modelRoutes'),
            premium,
            workspaceRoot: wr,
            listLocalModels: () => (0, embeddings_1.listOllamaModels)(),
            zmlrClientFactory: (endpoint) => new zippymesh_1.ZippyMeshProvider({ host: endpoint }),
        });
        const advisory = await (0, reviewAdvisoryBuild_1.buildReviewAdvisory)(wr, args.taskId, { reasoner });
        if (!advisory) {
            vscode.window.showWarningMessage(`No review evidence found for ${args.taskId} — cannot build an advisory.`);
            return;
        }
        advisoryCache.set(args.taskId, advisory);
        // RA-6: put the recommendation on the bus for the requester + PM seat.
        // Advisory traffic must never block the panel — failures are silent here
        // (the chip still renders from the cache).
        if (args.requester) {
            const me = activeHostAgentId();
            try {
                await (0, reviewRecommendation_1.emitReviewRecommendation)(wr, advisory, args.requester, {
                    ...(me ? { from: me } : {}), sessionId,
                });
            }
            catch { /* bus emit is best-effort */ }
        }
        await refreshOrchestratorData(view);
    }
    catch (e) {
        vscode.window.showWarningMessage(`Advisory build failed: ${e.message}`);
    }
}
/**
 * RA-5 `Dig in ↗`: seed a chat with the advisory brief. The brief is copied to
 * the clipboard (works with EVERY agent chat), then we best-effort try to open
 * a fresh Claude Code chat for it. An honest toast says which rung fired.
 */
async function handleOpenAdvisoryChat(args) {
    if (!args.taskId) {
        return;
    }
    const advisory = advisoryCache.get(args.taskId);
    if (!advisory) {
        vscode.window.showWarningMessage(`No advisory built for ${args.taskId} yet — click "Get advisory" first.`);
        return;
    }
    const prompt = (0, reviewRecommendation_1.buildDigInPrompt)(advisory);
    await vscode.env.clipboard.writeText(prompt);
    const newChatCommands = ['claude-code.newChat', 'anthropic.claude-code.newChat', 'workbench.action.chat.open'];
    for (const cmd of newChatCommands) {
        try {
            await vscode.commands.executeCommand(cmd);
            vscode.window.showInformationMessage(`Advisory brief for ${args.taskId} copied — paste it into the chat that just opened.`);
            return;
        }
        catch { /* try the next rung */ }
    }
    vscode.window.showInformationMessage(`Advisory brief for ${args.taskId} copied to the clipboard — paste it into any agent chat.`);
}
/**
 * RV-2: handle an `openAwaitingFile` message from a review-decision drill-in
 * link. Opens the referenced file in the editor. Paths are resolved relative
 * to the workspace root and rejected if they escape it (a referenced ref
 * could be attacker-influenced bus data). A missing file (post-rebase drift)
 * surfaces a friendly toast instead of an unhandled rejection.
 */
async function handleOpenAwaitingFile(file) {
    const wr = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!wr || !file) {
        return;
    }
    const root = path.resolve(wr);
    const target = path.resolve(root, file);
    const rel = path.relative(root, target);
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
        vscode.window.showWarningMessage(`Refusing to open '${file}' — outside the workspace.`);
        return;
    }
    try {
        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(target));
        await vscode.window.showTextDocument(doc, { preview: true });
    }
    catch {
        vscode.window.showWarningMessage(`Could not open '${file}' — it may have moved or been removed.`);
    }
}
/**
 * Session-tracking ph1 — "Open chat" deep-link ladder for a panel session row.
 * Attempts the highest rung the source supports and tells the user which fired:
 *   1. Claude Code resume-by-id  (`vscode://anthropic.claude-code/open?session=`)
 *   3. Copy `claude --resume <id>` to the clipboard (when the URI is declined)
 *   4. Reveal the raw transcript file/dir (any tool, when `rawRef` is present)
 *   floor. An honest "no deep link for <tool>" notice.
 *
 * The session rows come from THIS workspace's session heartbeats, so a
 * claude-code resume targets the open workspace and won't spawn a blank chat.
 */
async function handleOpenSession(msg) {
    const sessionId = (msg.sessionId || '').trim();
    if (!sessionId) {
        return;
    }
    const source = (msg.source || '').toLowerCase();
    const rawRef = (msg.rawRef || '').trim();
    const isClaudeCode = source === 'claude-code' || source === 'claudecode' || source === 'claude';
    // Rung 1 — Claude Code resume-by-id.
    if (isClaudeCode) {
        const uri = vscode.Uri.parse(`vscode://anthropic.claude-code/open?session=${encodeURIComponent(sessionId)}`);
        let opened = false;
        try {
            opened = await vscode.env.openExternal(uri);
        }
        catch {
            opened = false;
        }
        if (opened) {
            return;
        }
        // Rung 3 — copy a resume command the user can paste in a terminal.
        try {
            await vscode.env.clipboard.writeText(`claude --resume ${sessionId}`);
            vscode.window.showInformationMessage(`Copied resume command: claude --resume ${sessionId.slice(0, 8)}…`);
        }
        catch {
            vscode.window.showInformationMessage(`Resume this session: claude --resume ${sessionId}`);
        }
        return;
    }
    // Some adapters (Cursor, and Claude Desktop's no-transcript-found fallback)
    // record provenance as `<dbOrIndexPath>#<rowOrSessionId>` — a locator into an
    // opaque store, not a file/dir that can be revealed. Resolving that string
    // as a path always misses, which used to surface a misleading "it may have
    // moved or been removed" warning. Treat it as unrevealable up front instead.
    const revealable = rawRef && !rawRef.includes('#');
    // Rung 4 — reveal the transcript file/dir for tools without a resume deep link.
    if (revealable && await openTranscriptRef(rawRef)) {
        return;
    }
    // Floor — honest notice.
    vscode.window.showInformationMessage(`No deep link for ${msg.source || 'this tool'} — session ${sessionId.slice(0, 8)}…` +
        (rawRef
            ? (revealable ? ' (transcript not in a known store).' : " (session lives inside the tool's own store, not a separate file).")
            : '.'));
}
/**
 * Open/reveal a transcript reference, but only when it lives under a known
 * adapter store root — transcripts live OUTSIDE the workspace (e.g. `~/.claude`),
 * so the workspace-confined guard in `handleOpenAwaitingFile` can't be reused.
 * A directory (e.g. a Kilo task dir) is revealed in the OS file explorer; a file
 * is opened read-only. Returns true when something was shown.
 */
async function openTranscriptRef(rawRef) {
    let target;
    try {
        target = path.resolve(rawRef);
    }
    catch {
        return false;
    }
    const home = os.homedir();
    const roots = [
        path.join(home, '.claude'),
        path.join(home, '.codex'),
        path.join(home, '.config'),
        path.join(home, '.autoclaw'),
        path.join(home, 'AppData', 'Roaming'), // VS Code globalStorage (Windows)
        path.join(home, 'Library', 'Application Support'), // macOS
        path.join(home, '.local', 'share'), // Linux
    ];
    const within = (root) => {
        const rel = path.relative(path.resolve(root), target);
        return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
    };
    if (!roots.some(within)) {
        vscode.window.showWarningMessage(`Refusing to open '${rawRef}' — outside known transcript stores.`);
        return false;
    }
    try {
        const stat = await fsPromises.stat(target);
        if (stat.isDirectory()) {
            await vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(target));
        }
        else {
            const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(target));
            await vscode.window.showTextDocument(doc, { preview: true });
        }
        return true;
    }
    catch {
        vscode.window.showWarningMessage(`Could not open transcript '${rawRef}' — it may have moved.`);
        return false;
    }
}
// ---------------------------------------------------------------------------
// Inbox watcher — event-driven task_complete detection
// ---------------------------------------------------------------------------
// Transitions a sprint to 'review' status once all assigned agents have sent task_complete.
// Uses a regex replace against the YAML string — safe because toYAML() writes `status: <word>` on its own line.
async function transitionSprintToReview(workspaceRoot, sprintNum, completedAgents) {
    const sprintPath = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'sprints', `sprint-${sprintNum}.yaml`);
    if (!fs.existsSync(sprintPath)) {
        return;
    }
    const content = await fsPromises.readFile(sprintPath, 'utf8');
    const agentLines = content.match(/^\s*- agent:/gm);
    const expectedCount = agentLines?.length ?? 0;
    if (expectedCount === 0 || completedAgents.size < expectedCount) {
        return;
    }
    if (/^status:\s*(review|approved|merged)\s*$/m.test(content)) {
        return;
    }
    const updated = content.replace(/^status:\s*(pending|assigned|in_progress)\s*$/m, 'status: review');
    if (updated === content) {
        return;
    }
    await fsPromises.writeFile(sprintPath, updated, 'utf8');
    const statePath = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'state.json');
    const state = await (0, orchestrate_1.readStateFile)(statePath);
    if (state) {
        for (const agentId of completedAgents) {
            if (state.agents[agentId]) {
                state.agents[agentId].status = 'review';
            }
        }
        state.last_updated = new Date().toISOString();
        await (0, orchestrate_1.writeStateFile)(statePath, state);
    }
    getOrchestrateOutputChannel().appendLine(`[orchestrate] Sprint ${sprintNum} → review (${completedAgents.size}/${expectedCount} agents complete)`);
}
/**
 * L2 producer-side board watcher. Watches the board's INPUTS (claims, consensus,
 * heartbeats, shared inbox, state.json) and, after a short debounce, refreshes
 * board.json — so cross-IDE state lands sub-second instead of on the 30s tick.
 *
 * Loop-safe: the glob is `*.json` only (the high-churn loop-journal/comms-log are
 * `.jsonl` and never match), and the service's allow-list predicate rejects the
 * producer's own outputs (board.json/board.md/.tmp-*, supervisor.lock, loop-state,
 * dispatch sidecars). `refreshBoardNow` writes only board.json/board.md, which the
 * predicate excludes — so a refresh can never retrigger the watcher.
 *
 * Single-active safe: the injected action reuses the L1 lease gate under the
 * loop's holder id, so only the active supervisor writes; standbys no-op.
 * Off-switchable via `autoclaw.cluster.boardWatch` (default ON).
 */
function startBoardWatch(context, workspaceRoot) {
    const cfg = vscode.workspace.getConfiguration('autoclaw');
    if (!cfg.get('cluster.boardWatch', true)) {
        return;
    }
    const singleActive = cfg.get('cluster.singleActive', true);
    const fencing = cfg.get('cluster.fencing', false);
    const debounceMs = cfg.get('cluster.boardWatchDebounceMs', boardRefresh_1.DEFAULT_BOARD_REFRESH_DEBOUNCE_MS);
    const service = (0, boardRefresh_1.startBoardRefreshService)({
        debounceMs,
        refresh: () => (0, boardRefresh_1.refreshBoardNow)({ workspaceRoot, holderId: orchestratorLoop_1.LOOP_INSTANCE_ID, singleActive, fencing }),
    });
    // Two scoped watchers — the comms subtree (board inputs) + the root state.json.
    // Scoped to `*.json` so `.jsonl` bookkeeping never fires; the service predicate
    // is the second line of defense (rejects supervisor.lock / loop-state / sidecars).
    for (const glob of [
        '.autoclaw/orchestrator/comms/**/*.json',
        '.autoclaw/orchestrator/state.json',
    ]) {
        const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(workspaceRoot, glob));
        const onChange = (uri) => service.notifyChange(uri.fsPath);
        watcher.onDidCreate(onChange);
        watcher.onDidChange(onChange);
        watcher.onDidDelete(onChange);
        context.subscriptions.push(watcher);
    }
    context.subscriptions.push({ dispose: () => service.stop() });
}
/** globalState key for the one-time LAN-discovery network-consent acknowledgement. */
const LAN_CONSENT_KEY = 'autoclaw.cluster.lan.consentAckAt';
/**
 * T0b: start opt-in LAN peer discovery. NETWORK OFF BY DEFAULT — this binds NO
 * socket unless BOTH gates pass: the `autoclaw.cluster.lan` flag is on AND the user
 * has acknowledged the one-time consent modal (persisted in globalState). Turning the
 * flag on but declining consent leaves it inert. The discovered peers are written as
 * origin-'lan' (DISCOVERED, UNTRUSTED) beacons that the existing presence layer
 * already excludes from every trust sink (beacons.isDiscoveredUntrusted).
 *
 * Lifecycle mirrors startBoardWatch: a dispose() on the extension subscriptions
 * stops the socket + announce timer on deactivate.
 */
async function startLanDiscovery(context, workspaceRoot) {
    const cfg = vscode.workspace.getConfiguration('autoclaw');
    const enabled = cfg.get('cluster.lan', false);
    if (!enabled) {
        return;
    } // gate 1: flag off ⇒ never bind.
    // Whole body is best-effort — a rejected modal / globalState write (the call site
    // uses `void startLanDiscovery`) must never surface as an unhandledRejection, and a
    // discovery failure must never break activation. Mirrors startBoardWatch's posture.
    try {
        // gate 2: one-time consent. If not yet acknowledged, ask once — naming exactly what
        // goes on the wire and what is recorded. Decline ⇒ no bind (and no nagging again).
        let consentAckAt = context.globalState.get(LAN_CONSENT_KEY) ?? null;
        if (!consentAckAt) {
            const port = cfg.get('cluster.lan.port', lanDiscovery_1.LAN_DEFAULT_PORT);
            const mode = cfg.get('cluster.lan.mode', 'seed');
            const choice = await vscode.window.showWarningMessage(`Enable AutoClaw LAN peer discovery?\n\n` +
                `This window will bind a UDP socket on port ${port} (${mode} mode) to:\n` +
                `• Broadcast this machine's presence — only an opaque machine id, an IDE label, and this port. ` +
                `NEVER your workspace path, tasks, files, or tokens.\n` +
                `• Listen for other hosts on your LAN and record them as DISCOVERED, UNTRUSTED peers ` +
                `(observe-only — they cannot join, dispatch, or be admitted until a future secure-channel step).\n\n` +
                `Nothing is shared until you enable this. You can turn it off anytime via the autoclaw.cluster.lan setting.`, { modal: true }, 'Enable LAN discovery');
            if (choice !== 'Enable LAN discovery') {
                return;
            }
            consentAckAt = new Date().toISOString();
            await context.globalState.update(LAN_CONSENT_KEY, consentAckAt);
        }
        if (!(0, lanDiscovery_1.shouldStartLanDiscovery)({ enabled, consentAckAt })) {
            return;
        }
        const port = cfg.get('cluster.lan.port', lanDiscovery_1.LAN_DEFAULT_PORT);
        const mode = cfg.get('cluster.lan.mode', 'seed');
        const seeds = (0, lanDiscovery_1.parseSeeds)(cfg.get('cluster.lan.seeds', []), port);
        const commsDir = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'comms');
        // host = a recognizable but non-sensitive LABEL (the wire allowlist bounds it).
        const hostLabel = (os.hostname() || 'host').replace(/[^A-Za-z0-9._-]/g, '-').slice(0, 64) || 'host';
        let machineId = 'unknown';
        try {
            machineId = vscode.env.machineId;
        }
        catch { /* keep fallback */ }
        const discovery = new lanDiscovery_1.LanDiscovery({
            enabled, consentAckAt, // re-enforced inside start() (defense-in-depth gate)
            machineId, host: hostLabel, commsDir, port, mode, seeds,
            log: (m) => getOrchestrateOutputChannel().appendLine(m),
        });
        discovery.start();
        context.subscriptions.push({ dispose: () => discovery.stop() });
        console.log(`[autoclaw] LAN discovery started – mode=${mode} port=${port} seeds=${seeds.length}`);
    }
    catch (err) {
        console.warn(`[autoclaw] LAN discovery failed to start: ${String(err)}`);
    }
}
/** globalState key for the one-time LAN cluster-map-gossip network-consent ack. */
const LAN_GOSSIP_CONSENT_KEY = 'autoclaw.cluster.lan.gossip.consentAckAt';
/**
 * T1: start opt-in LAN relay of cluster-map gossip. NETWORK OFF BY DEFAULT — binds NO
 * socket unless BOTH cluster.lan and cluster.lan.gossip are on AND the user
 * acknowledged a DISTINCT one-time consent (the relay puts cluster TOPOLOGY/membership
 * ids on the wire — more than the T0 discovery consent covered — so it asks separately).
 * Relayed peer beats are advisory/wake-only (the E3b consumer never elects on them) and
 * grant NO trust to an unauthenticated LAN peer (T2 authenticates). Mirrors
 * startLanDiscovery's lifecycle (dispose stops the socket + broadcast timer).
 */
async function startLanGossipRelay(context, workspaceRoot) {
    // Whole body try-wrapped — neither the gate reads nor the awaited modal/globalState
    // (the call site uses `void`) may surface as an unhandledRejection or break activation.
    try {
        const cfg = vscode.workspace.getConfiguration('autoclaw');
        const enabled = cfg.get('cluster.lan', false) && cfg.get('cluster.lan.gossip', false);
        if (!enabled) {
            return;
        } // gate 1: either flag off ⇒ never bind.
        const port = cfg.get('cluster.lan.gossip.port', lanGossipRelay_1.LAN_GOSSIP_DEFAULT_PORT);
        const discoveryPort = cfg.get('cluster.lan.port', lanDiscovery_1.LAN_DEFAULT_PORT);
        // The relay + discovery are independent sockets in ONE process; the same UDP port
        // would fight for datagrams. Refuse rather than double-bind (don't even prompt).
        if (port === discoveryPort) {
            vscode.window.showWarningMessage(`AutoClaw: LAN gossip relay not started — autoclaw.cluster.lan.gossip.port (${port}) must differ ` +
                `from autoclaw.cluster.lan.port (${discoveryPort}). Set distinct ports and reload.`);
            return;
        }
        // gate 2: a SEPARATE one-time consent — the relay puts cluster topology on the wire,
        // which the T0 discovery consent did not name. Decline ⇒ no bind, no nagging.
        let consentAckAt = context.globalState.get(LAN_GOSSIP_CONSENT_KEY) ?? null;
        if (!consentAckAt) {
            const choice = await vscode.window.showWarningMessage(`Enable AutoClaw LAN cluster-map gossip relay?\n\n` +
                `This shares this project's COORDINATION TOPOLOGY with discovered LAN hosts. ` +
                `On UDP port ${port}, this window will:\n` +
                `• Broadcast the cluster map — which window is the active orchestrator, the standby/monitor ` +
                `instance ids, epoch/term. Only opaque ids + timestamps. NEVER your workspace path, tasks, files, or tokens.\n` +
                `• Accept peer cluster maps as ADVISORY only — they accelerate awareness of a takeover but ` +
                `can NEVER elect, dispatch, or be trusted here (a future secure-channel step authenticates peers).\n\n` +
                `Requires LAN discovery (autoclaw.cluster.lan) already on. Turn off anytime via autoclaw.cluster.lan.gossip.`, { modal: true }, 'Enable gossip relay');
            if (choice !== 'Enable gossip relay') {
                return;
            }
            consentAckAt = new Date().toISOString();
            await context.globalState.update(LAN_GOSSIP_CONSENT_KEY, consentAckAt);
        }
        const seeds = (0, lanDiscovery_1.parseSeeds)(cfg.get('cluster.lan.seeds', []), discoveryPort);
        const commsDir = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'comms');
        const relay = new lanGossipRelay_1.LanGossipRelay({
            enabled, consentAckAt, // re-enforced inside start() (defense-in-depth gate)
            workspaceRoot, commsDir, port, seeds, selfOrigin: orchestratorLoop_1.LOOP_INSTANCE_ID,
            log: (m) => getOrchestrateOutputChannel().appendLine(m),
        });
        relay.start();
        context.subscriptions.push({ dispose: () => relay.stop() });
        console.log(`[autoclaw] LAN gossip relay started – port=${port} seeds=${seeds.length}`);
    }
    catch (err) {
        console.warn(`[autoclaw] LAN gossip relay failed to start: ${String(err)}`);
    }
}
function startInboxWatcher(context) {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        return;
    }
    // Tracks which agents have sent task_complete, keyed by sprint number.
    const sprintCompletions = new Map();
    const pattern = new vscode.RelativePattern(workspaceRoot, '.autoclaw/orchestrator/comms/inboxes/shared/*.json');
    const watcher = vscode.workspace.createFileSystemWatcher(pattern);
    watcher.onDidCreate(async (uri) => {
        try {
            const raw = await fsPromises.readFile(uri.fsPath, 'utf8');
            const msg = JSON.parse(raw);
            if (msg.type === 'task_complete') {
                const agentId = String(msg.from ?? 'an agent');
                const payload = msg.payload ?? {};
                const taskId = String(payload.task_id ?? 'a task');
                const sprintNum = typeof msg.sprint === 'number' ? msg.sprint : null;
                // Durable completed-work ledger (Slice B): claims are deleted and
                // board.json is a live snapshot, so this append is the only durable
                // record the panel's Done lane + per-agent history read. Best-effort —
                // recording must never break the watcher.
                try {
                    const commsDir = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'comms');
                    (0, taskLedger_1.appendTaskCompletion)(commsDir, {
                        task_id: taskId,
                        agent_id: agentId,
                        session_id: typeof msg.session_id === 'string' ? msg.session_id : undefined,
                        completed_at: typeof msg.timestamp === 'string' ? msg.timestamp : new Date().toISOString(),
                        sprint: sprintNum ?? undefined,
                        title: typeof payload.title === 'string' ? payload.title : undefined,
                        review_status: typeof payload.review_status === 'string' ? payload.review_status : undefined,
                        branch: typeof payload.branch === 'string' ? payload.branch : undefined,
                        gates: Array.isArray(payload.gates) ? payload.gates.filter((g) => typeof g === 'string') : undefined,
                        tests_run: typeof payload.tests_run === 'number' ? payload.tests_run : undefined,
                        task_ids: Array.isArray(payload.task_ids) ? payload.task_ids.filter((t) => typeof t === 'string') : undefined,
                        summary: typeof payload.summary === 'string' ? payload.summary : undefined,
                    });
                }
                catch { /* ledger is best-effort */ }
                if (sprintNum !== null) {
                    if (!sprintCompletions.has(sprintNum)) {
                        sprintCompletions.set(sprintNum, new Set());
                    }
                    sprintCompletions.get(sprintNum).add(agentId);
                    await transitionSprintToReview(workspaceRoot, sprintNum, sprintCompletions.get(sprintNum)).catch(() => { });
                }
                const action = await vscode.window.showInformationMessage(`AutoClaw: ${agentId} completed ${taskId}.`, 'Run Consensus Review', 'Show Status');
                if (action === 'Run Consensus Review') {
                    vscode.commands.executeCommand('autoclaw.orchestrate.review');
                }
                else if (action === 'Show Status') {
                    vscode.commands.executeCommand('autoclaw.orchestrate.status');
                }
            }
            else if (msg.type === 'finding_report') {
                const from = String(msg.from ?? 'agent');
                const payload = msg.payload;
                const sev = String(payload?.severity ?? 'info');
                if (sev === 'critical' || sev === 'major') {
                    vscode.window.showWarningMessage(`AutoClaw: ${from} reported a ${sev} finding — ${String(payload?.description ?? '').slice(0, 80)}`, 'Show Inbox').then(a => {
                        if (a === 'Show Inbox') {
                            vscode.commands.executeCommand('workbench.action.chat.open');
                        }
                    });
                }
            }
            // Refresh dashboard on any new shared message
            if (kdreamView) {
                refreshOrchestratorData(kdreamView).catch(() => { });
            }
        }
        catch {
            // Malformed JSON — ignore silently
        }
    });
    context.subscriptions.push(watcher);
}
function deactivate() {
    if (reviewFleetController) {
        reviewFleetController.stop();
        reviewFleetController = null;
    }
    if (stateWatcher) {
        stateWatcher.dispose();
    }
    if (boardWatcher) {
        boardWatcher.dispose();
        boardWatcher = undefined;
    }
    if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
        refreshIntervalId = undefined;
    }
    if (autobuildIntervalId) {
        clearInterval(autobuildIntervalId);
        autobuildIntervalId = undefined;
    }
    if (doctorOutputChannel) {
        doctorOutputChannel.dispose();
        doctorOutputChannel = undefined;
    }
    if (autobuildOutputChannel) {
        autobuildOutputChannel.dispose();
        autobuildOutputChannel = undefined;
    }
    if (orchestrateOutputChannel) {
        orchestrateOutputChannel.dispose();
        orchestrateOutputChannel = undefined;
    }
    if (activeBridge?.running) {
        (0, bridge_1.stopBridge)(activeBridge).catch(() => { });
        activeBridge = null;
    }
    stopRefreshService();
    stopIndexWatch();
    (0, workspace_registry_1.unregisterWorker)(process.pid, currentIde);
    if (currentWorkspace) {
        (0, ide_ports_1.releasePorts)(currentIde, currentWorkspace);
    }
    if (activeFabric) {
        activeFabric.close().catch(() => { });
        activeFabric = null;
    }
    // Close the in-process Knowledge Graph store (releases the SQLite handle).
    try {
        (0, service_1.closeKnowledgeGraph)();
    }
    catch { /* ignore */ }
    if (activeKg && activeKg.child && activeKg.child.exitCode === null) {
        (0, kg_1.stopKgDaemon)(activeKg).catch(() => { });
        activeKg = null;
    }
    if (kgOutputChannel) {
        kgOutputChannel.dispose();
        kgOutputChannel = undefined;
    }
    (0, svid_1.stopSvidRefresh)();
    (0, metrics_1.resetMetrics)();
}
// ---------------------------------------------------------------------------
// Program-plane commands (Phase 4)
// ---------------------------------------------------------------------------
async function programCreateCommand(context) {
    const name = await vscode.window.showInputBox({
        prompt: 'Program name (e.g. "My Zippy stack")',
        placeHolder: 'My multi-repo program',
    });
    if (!name) {
        return;
    }
    const homeDir = require('os').homedir();
    const reg = await (0, program_plane_1.createProgram)({ programName: name, homeDir });
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (workspaceRoot) {
        const addSelf = await vscode.window.showQuickPick(['Yes', 'No'], {
            placeHolder: `Add current workspace (${path.basename(workspaceRoot)}) as a participant?`,
        });
        if (addSelf === 'Yes') {
            await (0, program_plane_1.joinProgram)({ programId: reg.program_id, repoPath: workspaceRoot, homeDir });
        }
    }
    vscode.window.showInformationMessage(`Program "${name}" created (ID: ${reg.program_id})`);
}
async function programJoinCommand(context) {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage('Open a workspace first.');
        return;
    }
    const homeDir = require('os').homedir();
    const programs = await (0, program_plane_1.listPrograms)(homeDir);
    if (programs.length === 0) {
        vscode.window.showWarningMessage('No programs found. Use "AutoClaw: Create Program…" first.');
        return;
    }
    const items = programs.map(p => ({ label: p.program_name, description: p.program_id, detail: `${p.participants.length} participant(s)` }));
    const picked = await vscode.window.showQuickPick(items, { placeHolder: 'Select a program to join' });
    if (!picked) {
        return;
    }
    const roleItem = await vscode.window.showQuickPick([{ label: 'orchestrator', description: 'Receives task assignments' }, { label: 'observer', description: 'Read-only; watches without receiving tasks' }], { placeHolder: 'Role for this workspace' });
    const role = (roleItem?.label ?? 'orchestrator');
    await (0, program_plane_1.joinProgram)({ programId: picked.description, repoPath: workspaceRoot, homeDir, role });
    vscode.window.showInformationMessage(`Joined program "${picked.label}" as ${role}.`);
}
async function programLeaveCommand() {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage('Open a workspace first.');
        return;
    }
    const homeDir = require('os').homedir();
    const link = await (0, program_plane_1.readProgramLink)(workspaceRoot);
    if (!link) {
        vscode.window.showInformationMessage('This workspace is not joined to any program.');
        return;
    }
    const confirm = await vscode.window.showQuickPick(['Yes, leave', 'Cancel'], {
        placeHolder: `Leave program ${link.program_id}?`,
    });
    if (!confirm?.startsWith('Yes')) {
        return;
    }
    await (0, program_plane_1.leaveProgram)(workspaceRoot, homeDir);
    vscode.window.showInformationMessage('Left the program. The backref has been removed.');
}
//# sourceMappingURL=extension.js.map