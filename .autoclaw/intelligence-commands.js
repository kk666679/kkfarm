"use strict";
/**
 * intelligence-commands.ts — VS Code command surface for the AutoClaw
 * Intelligence Layer (R6.1-R6.4, tasks 7.1-7.4).
 *
 * This is the glue layer between the host (`vscode`) and the host-free
 * Intelligence module under `src/intelligence/`. It is the ONLY file (besides
 * `src/extension.ts`) permitted to import `vscode`. It registers four commands:
 *
 *   - `autoclaw.intelligence.learn`     → learnFromSessions
 *   - `autoclaw.intelligence.indexCode` → indexCodebase (with a --force toggle)
 *   - `autoclaw.intelligence.retrieve`  → retrieveCode
 *   - `autoclaw.intelligence.search`    → semantic search across the vector store
 *
 * Each command resolves the workspace root (warning and returning when none is
 * open), runs heavy work inside `vscode.window.withProgress`, routes module
 * logging into a dedicated OutputChannel, and surfaces results to the user. No
 * intelligence I/O happens at registration time — everything is lazy and runs
 * only on invocation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerIntelligenceCommands = registerIntelligenceCommands;
const child_process_1 = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const vscode = require("vscode");
const installBackend_1 = require("./intelligence/installBackend");
const installEmbeddings_1 = require("./intelligence/installEmbeddings");
const providerChoice_1 = require("./intelligence/providerChoice");
const storage_1 = require("./intelligence/storage");
const systemStore_1 = require("./intelligence/systemStore");
const steering_1 = require("./intelligence/steering");
const toolScaffold_1 = require("./intelligence/toolScaffold");
const intelligence_1 = require("./intelligence");
const OUTPUT_CHANNEL_NAME = 'AutoClaw — Intelligence';
const GUIDANCE = 'No index or learnings found yet. Run /index-code or /learn first.';
let channel;
/**
 * Parse an optional `--limit N` flag (R6.2) out of a free-text query, returning
 * the cleaned query and the parsed limit (when valid and positive).
 */
function parseLimit(raw) {
    const m = raw.match(/(?:^|\s)--limit(?:[=\s]+)(\d+)\b/i);
    if (!m) {
        return { query: raw.trim() };
    }
    const n = parseInt(m[1], 10);
    const query = raw.replace(m[0], ' ').replace(/\s+/g, ' ').trim();
    return { query, limit: Number.isFinite(n) && n > 0 ? n : undefined };
}
/** Lazily create (and cache) the dedicated Intelligence output channel. */
function getChannel() {
    if (!channel) {
        channel = vscode.window.createOutputChannel(OUTPUT_CHANNEL_NAME);
    }
    return channel;
}
const LEVEL_RANK = { error: 0, warn: 1, info: 2, debug: 3, trace: 4 };
/** The configured verbosity (`autoclaw.intelligence.logLevel`, default `info`). */
function configuredLevel() {
    const raw = vscode.workspace
        .getConfiguration('autoclaw.intelligence')
        .get('logLevel', 'info');
    return (raw in LEVEL_RANK ? raw : 'info');
}
/** Emit a line at `level` when the configured verbosity allows it. */
function logAt(level, msg) {
    if (LEVEL_RANK[level] <= LEVEL_RANK[configuredLevel()]) {
        getChannel().appendLine(`[${new Date().toISOString()}] [${level.toUpperCase()}] ${msg}`);
    }
}
/** Append an info-level timestamped line. Back-compat `LogFn` sink. */
function logLine(msg) {
    logAt('info', msg);
}
const logError = (msg) => logAt('error', msg);
const logWarn = (msg) => logAt('warn', msg);
const logDebug = (msg) => logAt('debug', msg);
/**
 * Has the project ever produced a vector store? Used by the R6.4 guard: when the
 * db file is missing or empty, retrieval/search commands point the user at
 * /index-code or /learn instead of returning an empty/confusing result.
 */
function hasVectorStore(workspaceRoot) {
    try {
        const { dbPath } = (0, intelligence_1.intelligencePaths)(workspaceRoot);
        const stat = fs.statSync(dbPath);
        return stat.isFile() && stat.size > 0;
    }
    catch {
        return false;
    }
}
// ---------------------------------------------------------------------------
// Command handlers
// ---------------------------------------------------------------------------
async function runLearn(workspaceRoot) {
    const log = logLine;
    getChannel().show(true);
    logLine(`learn: analyzing sessions for ${workspaceRoot}`);
    const config = await resolveEmbeddingForCommand(workspaceRoot, log);
    const summary = await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'AutoClaw Intelligence: learning from sessions…',
        cancellable: false,
    }, () => (0, intelligence_1.learnFromSessions)({ workspaceRoot, log, config }));
    logLine(`learn: analyzed ${summary.sessionsAnalyzed} session(s), ` +
        `${summary.kept} kept signal(s), ${summary.patterns} pattern(s), ` +
        `${summary.workflowsMined} workflow(s), ` +
        `${summary.coordinationOutcomes} coordination outcome(s) from ` +
        `source(s): ${summary.sources.join(', ') || '(none)'}`);
    void vscode.window.showInformationMessage(`Intelligence: learned ${summary.patterns} pattern(s) + ${summary.workflowsMined} workflow(s) ` +
        `from ${summary.sessionsAnalyzed} session(s).`);
    recordProjectInSystemTier(workspaceRoot, {
        learnSessions: summary.sessionsAnalyzed,
        lastLearnedAt: new Date().toISOString(),
    });
    promoteLatestInsightToSystem(workspaceRoot);
    await refreshHostContext(workspaceRoot, config, log, 'learn');
}
/**
 * Channel C auto-refresh: after an intel-mutating command, refresh any per-host
 * project digests that ALREADY exist (opted-in hosts) so they stay current.
 * `onlyExisting` means we never create a digest as a surprise side effect.
 * Best-effort — never throws, so it can't break `/learn` or `/index-code`.
 */
async function refreshHostContext(workspaceRoot, config, log, trigger) {
    try {
        const res = await (0, intelligence_1.writeHostContextFiles)(workspaceRoot, { onlyExisting: true, config, log });
        if (res.written.length > 0) {
            logLine(`host-context: refreshed ${res.written.map((w) => w.id).join(', ')} after ${trigger}`);
        }
    }
    catch (err) {
        logLine(`host-context: auto-refresh skipped — ${err.message}`);
    }
}
async function runIndexCode(workspaceRoot) {
    const log = logLine;
    // Offer a full re-index toggle (R4.3 --force).
    const pick = await vscode.window.showQuickPick([
        { label: 'Incremental index', description: 'Only files changed since the last index', force: false },
        { label: 'Full re-index', description: 'Re-index every file (--force)', force: true },
    ], { placeHolder: 'How should the codebase be indexed?' });
    if (!pick) {
        return; // user dismissed the picker
    }
    getChannel().show(true);
    logLine(`index-code: ${pick.force ? 'full re-index' : 'incremental'} for ${workspaceRoot}`);
    const config = await resolveEmbeddingForCommand(workspaceRoot, log);
    const result = await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'AutoClaw Intelligence: indexing codebase…',
        cancellable: true,
    }, (progress, token) => {
        let lastPct = 0;
        return (0, intelligence_1.indexCodebase)({
            workspaceRoot,
            force: pick.force,
            log,
            config,
            isCancelled: () => token.isCancellationRequested,
            onProgress: (p) => {
                if (p.total <= 0) {
                    return;
                }
                const pct = Math.min(100, Math.floor((p.done / p.total) * 100));
                const increment = Math.max(0, pct - lastPct);
                lastPct = pct;
                const label = p.phase === 'storing' ? 'saving vectors' : 'embedding';
                progress.report({
                    increment,
                    message: `${label} ${p.done.toLocaleString()}/${p.total.toLocaleString()} (${pct}%)`,
                });
            },
        });
    });
    if (result.degraded) {
        logLine('index-code: vector backend unavailable; nothing was indexed (no-RAG mode).');
        void vscode.window.showWarningMessage('Intelligence: vector backend unavailable, codebase was not indexed.');
        return;
    }
    if (result.abortedProviderDown) {
        logLine(`index-code: full re-index refused — "${config.embedding.provider}" provider not serving ` +
            'embeddings; existing index left untouched (no stale/none poisoning).');
        const choice = await vscode.window.showWarningMessage(`Intelligence: full re-index skipped — the "${config.embedding.provider}" embedding provider ` +
            'is not responding, so your existing index was left intact instead of being refilled with ' +
            'low-quality vectors. Fix the provider or pick another, then re-run.', 'Set Provider…', 'Show Log');
        if (choice === 'Set Provider…') {
            await vscode.commands.executeCommand('autoclaw.intelligence.setEmbeddingProvider');
        }
        else if (choice === 'Show Log') {
            getChannel().show(true);
        }
        return;
    }
    if (result.cancelled) {
        logLine(`index-code: cancelled after ${result.chunksIndexed} chunk(s); partial index retained.`);
        void vscode.window.showWarningMessage('Intelligence: indexing cancelled.');
        return;
    }
    logLine(`index-code: indexed ${result.filesIndexed} file(s), ${result.chunksIndexed} chunk(s), ` +
        `swept ${result.chunksDeleted} stale chunk(s) ` +
        `(${result.incremental ? 'incremental' : 'full'})${result.commit ? ` @ ${result.commit.slice(0, 8)}` : ''}`);
    if (result.staleIndex) {
        logLine('index-code: WARNING — the vector store still holds vectors from a previous ' +
            'embedding model; re-run /index-code --force to rebuild and clear the stale signal.');
        void vscode.window.showWarningMessage('Intelligence: the index is stale (embedding model changed). Run /index-code --force to rebuild.');
    }
    void vscode.window.showInformationMessage(`Intelligence: indexed ${result.filesIndexed} file(s) / ${result.chunksIndexed} chunk(s).`);
    recordProjectInSystemTier(workspaceRoot, {
        indexChunks: result.chunksIndexed,
        lastIndexedAt: new Date().toISOString(),
    });
    await refreshHostContext(workspaceRoot, config, log, 'index');
}
/**
 * Register the project + run stats in the cross-project system registry. No-op
 * unless `autoclaw.intelligence.systemDir` is configured. Best-effort: never
 * blocks or throws into the command.
 */
function recordProjectInSystemTier(workspaceRoot, fields) {
    const sys = (0, storage_1.systemPaths)(systemDirSetting());
    if (!sys) {
        return;
    }
    try {
        (0, systemStore_1.ensureSystemStore)(sys);
        (0, systemStore_1.upsertProject)(sys.registryPath, {
            path: workspaceRoot,
            name: path.basename(workspaceRoot),
            ...fields,
        });
        logLine(`system-tier: registered ${path.basename(workspaceRoot)} in ${sys.registryPath}`);
    }
    catch {
        /* best effort */
    }
}
/**
 * After a learn run, promote the distilled pattern bullets of the newest insight
 * into the cross-project system store (deduped). No-op unless a system dir is set.
 * Best-effort.
 */
/** Read the newest `insight-*.md` from the project's learnings dir, or undefined. */
function latestInsightMarkdown(workspaceRoot) {
    try {
        const learningsDir = (0, intelligence_1.intelligencePaths)(workspaceRoot).learningsDir;
        const insights = fs
            .readdirSync(learningsDir)
            .filter((f) => /^insight-.*\.md$/.test(f))
            .map((f) => ({ f, m: fs.statSync(path.join(learningsDir, f)).mtimeMs }))
            .sort((a, b) => b.m - a.m);
        if (insights.length === 0) {
            return undefined;
        }
        return fs.readFileSync(path.join(learningsDir, insights[0].f), 'utf8');
    }
    catch {
        return undefined;
    }
}
function promoteLatestInsightToSystem(workspaceRoot) {
    const sys = (0, storage_1.systemPaths)(systemDirSetting());
    if (!sys) {
        return;
    }
    const md = latestInsightMarkdown(workspaceRoot);
    if (!md) {
        return;
    }
    try {
        const res = (0, systemStore_1.promoteInsight)(sys, {
            project: workspaceRoot,
            insightMarkdown: md,
            capturedAt: new Date().toISOString(),
        });
        if (res.promoted > 0) {
            logLine(`system-tier: promoted ${res.promoted}/${res.scanned} distilled learning(s) to ${sys.root}`);
        }
    }
    catch {
        /* best effort */
    }
}
/**
 * `autoclaw.intelligence.generateSteering` — write a steering file from the
 * distilled learnings (latest insight + optional system tier) so any agent can
 * pick up this project's learned conventions. Writes `<workspace>/.autoclaw/steering.md`.
 */
async function runGenerateSteering(workspaceRoot) {
    const md = latestInsightMarkdown(workspaceRoot);
    if (!md) {
        void vscode.window.showWarningMessage('Intelligence: no learnings yet. Run "Learn from Sessions" first, then generate steering.');
        return;
    }
    const items = (0, systemStore_1.parseInsightItems)(md);
    const byKind = (kind) => items.filter((i) => i.kind === kind).map((i) => i.text);
    const sys = (0, storage_1.systemPaths)(systemDirSetting());
    const systemLearnings = sys
        ? (0, systemStore_1.readSystemLearnings)(sys).slice(-12).map((l) => ({ text: l.text, kind: l.kind, project: path.basename(l.project) }))
        : undefined;
    const steering = (0, steering_1.buildSteeringMarkdown)({
        projectName: path.basename(workspaceRoot),
        generatedAt: new Date().toISOString(),
        patterns: byKind('pattern'),
        avoid: byKind('avoid'),
        tools: byKind('tool'),
        systemLearnings,
    });
    const outPath = path.join((0, intelligence_1.intelligencePaths)(workspaceRoot).root, 'steering.md');
    try {
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, steering, 'utf8');
    }
    catch (err) {
        void vscode.window.showErrorMessage(`Failed to write steering file: ${String(err)}`);
        return;
    }
    logLine(`generate-steering: wrote ${toForwardSlashLocal(outPath)}`);
    const choice = await vscode.window.showInformationMessage(`Intelligence: steering written to .autoclaw/steering.md (${items.length} learned item(s)).`, 'Open');
    if (choice === 'Open') {
        const doc = await vscode.workspace.openTextDocument(outPath);
        void vscode.window.showTextDocument(doc);
    }
}
/** Local forward-slash helper for log output (paths.ts' toForwardSlash is host-free too). */
function toForwardSlashLocal(p) {
    return p.replace(/\\/g, '/');
}
/**
 * `autoclaw.intelligence.generateScaffold` — scaffold a new skill/tool stub
 * (SKILL.md) seeded with this project's learned conventions, written under
 * `<workspace>/.autoclaw/scaffolds/<slug>.md`.
 */
async function runGenerateScaffold(workspaceRoot) {
    const name = await vscode.window.showInputBox({
        title: 'Generate Skill/Tool Scaffold',
        prompt: 'Name of the new skill/tool',
        placeHolder: 'e.g. Release Checklist',
        ignoreFocusOut: true,
    });
    if (!name || name.trim() === '') {
        return;
    }
    const purpose = (await vscode.window.showInputBox({
        title: 'Generate Skill/Tool Scaffold',
        prompt: 'One-line purpose (optional)',
        ignoreFocusOut: true,
    })) ?? '';
    const md = latestInsightMarkdown(workspaceRoot);
    const items = md ? (0, systemStore_1.parseInsightItems)(md) : [];
    const scaffold = (0, toolScaffold_1.buildSkillScaffold)({
        name: name.trim(),
        purpose: purpose.trim(),
        projectName: path.basename(workspaceRoot),
        conventions: items.filter((i) => i.kind === 'pattern').map((i) => i.text),
        avoid: items.filter((i) => i.kind === 'avoid').map((i) => i.text),
        generatedAt: new Date().toISOString(),
    });
    const outPath = path.join((0, intelligence_1.intelligencePaths)(workspaceRoot).root, 'scaffolds', `${(0, toolScaffold_1.slugify)(name)}.md`);
    try {
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, scaffold, 'utf8');
    }
    catch (err) {
        void vscode.window.showErrorMessage(`Failed to write scaffold: ${String(err)}`);
        return;
    }
    logLine(`generate-scaffold: wrote ${toForwardSlashLocal(outPath)}`);
    const choice = await vscode.window.showInformationMessage(`Intelligence: scaffold written to .autoclaw/scaffolds/${(0, toolScaffold_1.slugify)(name)}.md.`, 'Open');
    if (choice === 'Open') {
        const doc = await vscode.workspace.openTextDocument(outPath);
        void vscode.window.showTextDocument(doc);
    }
}
async function runRetrieve(workspaceRoot) {
    if (!hasVectorStore(workspaceRoot)) {
        void vscode.window.showWarningMessage(`Intelligence: ${GUIDANCE}`);
        logLine(`retrieve: ${GUIDANCE}`);
        return;
    }
    const query = await vscode.window.showInputBox({
        prompt: 'Retrieve code for…',
        placeHolder: 'Describe what you are looking for',
    });
    if (!query) {
        return;
    }
    const log = logLine;
    getChannel().show(true);
    logLine(`retrieve: "${query}"`);
    const config = await resolveEmbeddingForCommand(workspaceRoot, log);
    const hits = await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'AutoClaw Intelligence: retrieving code…',
        cancellable: false,
    }, () => (0, intelligence_1.retrieveCode)(query, { workspaceRoot, log, config }));
    if (hits.length === 0) {
        logLine('retrieve: no matching chunks. The index may be empty or degraded.');
        appendSystemTierCrossRef(query);
        void vscode.window.showInformationMessage(`Intelligence: no local matches. ${GUIDANCE}`);
        return;
    }
    logLine(`retrieve: ${hits.length} result(s):`);
    for (const hit of hits) {
        logLine(`  ${hit.score.toFixed(3)}  ${hit.file}`);
    }
    appendSystemTierCrossRef(query);
    const picked = await vscode.window.showQuickPick(hits.map((h) => ({
        label: h.file,
        description: h.score.toFixed(3),
        detail: h.content.slice(0, 200),
    })), { placeHolder: `${hits.length} result(s) — select to open in the output channel` });
    if (picked) {
        const match = hits.find((h) => h.file === picked.label);
        if (match) {
            logLine(`--- ${match.file} (score ${match.score.toFixed(3)}) ---`);
            logLine(match.content);
        }
    }
}
async function runSearch(workspaceRoot) {
    if (!hasVectorStore(workspaceRoot)) {
        void vscode.window.showWarningMessage(`Intelligence: ${GUIDANCE}`);
        logLine(`search: ${GUIDANCE}`);
        return;
    }
    const rawQuery = await vscode.window.showInputBox({
        prompt: 'Search knowledge (learnings + memory + indexed code)…',
        placeHolder: 'Describe what you are looking for (append --limit N to cap results)',
    });
    if (!rawQuery) {
        return;
    }
    const { query, limit } = parseLimit(rawQuery);
    if (!query) {
        return;
    }
    const log = logLine;
    getChannel().show(true);
    logLine(`search: "${query}"${limit ? ` (--limit ${limit})` : ''}`);
    const config = await resolveEmbeddingForCommand(workspaceRoot, log);
    const results = await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'AutoClaw Intelligence: searching knowledge…',
        cancellable: false,
    }, async () => {
        const { dbPath } = (0, intelligence_1.intelligencePaths)(workspaceRoot);
        const db = await (0, intelligence_1.initVectorBackend)(config, dbPath, (0, intelligence_1.getActiveEmbeddingSignature)(config), log);
        if (db.degraded) {
            log('search: vector backend unavailable; no results');
            db.close();
            return [];
        }
        try {
            const embedding = await (0, intelligence_1.getEmbedding)(query, config.embedding, log);
            return db.semanticVectorSearch(embedding, {
                limit: limit ?? config.search.defaultLimit,
                minSimilarity: config.search.minSimilarity,
                project: (0, intelligence_1.resolveProjectKey)(workspaceRoot),
            });
        }
        finally {
            db.close();
        }
    });
    if (results.length === 0) {
        logLine('search: no matching knowledge. The store may be empty or degraded.');
        appendSystemTierCrossRef(query);
        void vscode.window.showInformationMessage(`Intelligence: no local matches. ${GUIDANCE}`);
        return;
    }
    logLine(`search: ${results.length} result(s):`);
    for (const r of results) {
        const file = typeof r.metadata?.file === 'string' ? r.metadata.file : r.source;
        logLine(`  ${r.score.toFixed(3)}  [${r.source}] ${file}`);
    }
    appendSystemTierCrossRef(query);
    const picked = await vscode.window.showQuickPick(results.map((r) => {
        const file = typeof r.metadata?.file === 'string' ? r.metadata.file : r.source;
        return {
            label: file,
            description: `${r.score.toFixed(3)} · ${r.source}`,
            detail: r.content.slice(0, 200),
            id: r.id,
        };
    }), { placeHolder: `${results.length} result(s) — select to view in the output channel` });
    if (picked) {
        const match = results.find((r) => r.id === picked.id);
        if (match) {
            logLine(`--- [${match.source}] (score ${match.score.toFixed(3)}) ---`);
            logLine(match.content);
        }
    }
}
/**
 * Local→system retrieval fallback: when the system tier is enabled, surface
 * matching cross-project learnings AND which other projects know about the query
 * (from the registry) alongside the local results. No-op when systemDir is unset.
 */
function appendSystemTierCrossRef(query) {
    const sys = (0, storage_1.systemPaths)(systemDirSetting());
    if (!sys) {
        return;
    }
    try {
        const ch = getChannel();
        const hits = (0, systemStore_1.searchSystemLearnings)(sys, query, 6);
        if (hits.length > 0) {
            ch.appendLine(`  ↳ cross-project system knowledge (${hits.length}):`);
            for (const h of hits) {
                ch.appendLine(`      [${h.kind}/${h.tier}] ${h.text}   — ${path.basename(h.project)}`);
            }
        }
        // Which other projects mention the query (registry name/topic match).
        const tokens = query.toLowerCase().split(/\W+/).filter((t) => t.length >= 3);
        const projects = (0, systemStore_1.readRegistry)(sys.registryPath).projects.filter((p) => {
            const hay = `${p.name} ${(p.topics ?? []).join(' ')}`.toLowerCase();
            return tokens.some((t) => hay.includes(t));
        });
        if (projects.length > 0) {
            ch.appendLine(`  ↳ projects that may know about this: ${projects.map((p) => p.name).join(', ')}`);
        }
    }
    catch {
        /* best effort — cross-ref is additive */
    }
}
// ---------------------------------------------------------------------------
// Wave A command handlers (sources / rag-generate / scaffold / metrics)
// ---------------------------------------------------------------------------
async function runSources(workspaceRoot) {
    const log = logLine;
    getChannel().show(true);
    // First-run consent: present available, undecided third-party sources (R3.4).
    const consent = await (0, intelligence_1.pendingConsentSources)({ workspaceRoot, log });
    if (consent.toPrompt.length > 0) {
        const picks = await vscode.window.showQuickPick(consent.toPrompt.map((id) => ({ label: id, picked: false })), {
            canPickMany: true,
            placeHolder: 'Enable ingestion for these third-party sources? (opt-in, local-only)',
        });
        if (picks) {
            const chosen = new Set(picks.map((p) => p.label));
            for (const id of consent.toPrompt) {
                await (0, intelligence_1.setSourceEnabled)(workspaceRoot, id, chosen.has(id), log);
            }
        }
    }
    const rows = await (0, intelligence_1.listSources)({ workspaceRoot, countSessions: true, log });
    logLine('Intelligence — Sources:');
    for (const r of rows) {
        logLine(`  [tier ${r.tier}] ${r.displayName} (${r.id}): ${r.enabled ? 'enabled' : 'disabled'}, ` +
            `${r.available ? 'available' : 'unavailable'}` +
            (typeof r.sessionCount === 'number' ? `, ${r.sessionCount} session(s)` : '') +
            (r.locations[0] ? ` @ ${r.locations[0]}` : '') +
            (r.hint && !r.available ? ` — ${r.hint}` : ''));
    }
    const action = await vscode.window.showQuickPick(rows.map((r) => ({
        label: `${r.enabled ? 'Disable' : 'Enable'} ${r.displayName}`,
        id: r.id,
        enable: !r.enabled,
    })), { placeHolder: 'Toggle a source (Esc to skip)' });
    if (action) {
        await (0, intelligence_1.setSourceEnabled)(workspaceRoot, action.id, action.enable, log);
        void vscode.window.showInformationMessage(`Intelligence: ${action.enable ? 'enabled' : 'disabled'} ${action.id}.`);
    }
}
async function runRagGenerate(workspaceRoot) {
    const task = await vscode.window.showInputBox({
        prompt: 'Describe the task for a RAG-augmented prompt',
        placeHolder: 'e.g. Add pagination to the /users endpoint',
    });
    if (!task) {
        return;
    }
    const log = logLine;
    getChannel().show(true);
    logLine(`rag-generate: "${task}"`);
    const config = await resolveEmbeddingForCommand(workspaceRoot, log);
    const result = await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'AutoClaw Intelligence: generating RAG prompt…',
        cancellable: false,
    }, () => (0, intelligence_1.generateRAGPrompt)(task, { workspaceRoot, log, config }));
    await vscode.env.clipboard.writeText(result.prompt);
    logLine(`rag-generate: ${result.usedCode ? `${result.codeHits} code chunk(s)` : 'no code (degraded/empty)'}, ` +
        `${result.learningHits} learning(s); copied to clipboard.`);
    for (const note of result.notes) {
        logLine(`rag-generate: note — ${note}`);
    }
    logLine('--- RAG PROMPT ---');
    logLine(result.prompt);
    void vscode.window.showInformationMessage(`Intelligence: RAG prompt copied to clipboard${result.usedCode ? '' : ' (code retrieval unavailable)'}.`);
}
/**
 * Orchestrator "context pack" — builds a grounded pack (RAG + learnings + style
 * + memory + durable KG facts) for an assigned agent and writes it to
 * `.autoclaw/orchestrator/sprints/sprint-<N>-<agent>.context.md` so EVERY runner
 * can read it. Backs the `autoclaw.intelligence.contextPack` command; the same
 * producer is available headless via `scripts/context-pack.js`.
 */
async function runContextPack(workspaceRoot) {
    const task = await vscode.window.showInputBox({
        prompt: 'Describe the task/sprint to build a context pack for',
        placeHolder: 'e.g. Sprint 2 — runner contract + MCP server (B1, B2)',
    });
    if (!task) {
        return;
    }
    const agent = (await vscode.window.showInputBox({
        prompt: 'Agent id this pack is for (optional)',
        placeHolder: 'e.g. claude-code',
    }))?.trim();
    const sprintRaw = (await vscode.window.showInputBox({
        prompt: 'Sprint number (optional)',
        placeHolder: 'e.g. 2',
    }))?.trim();
    const sprint = sprintRaw && /^\d+$/.test(sprintRaw) ? Number(sprintRaw) : undefined;
    const log = logLine;
    getChannel().show(true);
    logLine(`context-pack: "${task}"${agent ? ` for ${agent}` : ''}${sprint != null ? ` (sprint ${sprint})` : ''}`);
    const config = await resolveEmbeddingForCommand(workspaceRoot, log);
    const pack = await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'AutoClaw Intelligence: building context pack…',
        cancellable: false,
    }, () => (0, intelligence_1.buildContextPack)({ task, agentId: agent, sprint }, { workspaceRoot, config, log }));
    const sprintPart = sprint != null ? `sprint-${sprint}` : 'pack';
    const agentPart = agent ? `-${agent.toLowerCase().replace(/[^a-z0-9._-]+/g, '-')}` : '';
    const outPath = path.join((0, intelligence_1.intelligencePaths)(workspaceRoot).root, 'orchestrator', 'sprints', `${sprintPart}${agentPart}.context.md`);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, pack.markdown, 'utf8');
    logLine(`context-pack: wrote ${outPath} — ${pack.usedCode ? `${pack.codeHits} code chunk(s)` : 'no code (degraded/empty)'}, ` +
        `${pack.learningHits} learning(s), ${pack.kgHits} KG fact(s)${pack.degraded ? ' [degraded]' : ''}`);
    for (const note of pack.notes) {
        logLine(`context-pack: note — ${note}`);
    }
    const open = await vscode.window.showInformationMessage(`Intelligence: context pack written to ${path.basename(outPath)}.`, 'Open');
    if (open === 'Open') {
        const doc = await vscode.workspace.openTextDocument(outPath);
        await vscode.window.showTextDocument(doc);
    }
}
/**
 * Channel C — write an ambient project-context digest into every detected host
 * rules dir (Cursor/Kiro/Windsurf/Continue/Cline/KiloCode/Antigravity) in that
 * host's auto-load format, so file-only runners get current project intel even
 * outside an orchestrated task. Backs `autoclaw.intelligence.hostContext`.
 */
async function runHostContext(workspaceRoot) {
    const log = logLine;
    getChannel().show(true);
    logLine('host-context: writing per-host project digest');
    const config = await resolveEmbeddingForCommand(workspaceRoot, log);
    const result = await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'AutoClaw Intelligence: writing per-host project context…',
        cancellable: false,
    }, () => (0, intelligence_1.writeHostContextFiles)(workspaceRoot, { config, log }));
    if (result.targetsDetected === 0) {
        void vscode.window.showInformationMessage('Intelligence: no file-based host rules dirs found (.cursor/rules, .kiro/steering, ' +
            '.windsurf/rules, .continue/prompts, .clinerules, .agent/rules). Nothing to write.');
        return;
    }
    for (const w of result.written) {
        logLine(`host-context: wrote ${w.id} → ${w.path}`);
    }
    for (const f of result.failed) {
        logLine(`host-context: FAILED ${f.id} — ${f.error}`);
    }
    void vscode.window.showInformationMessage(`Intelligence: project context written for ${result.written.map((w) => w.id).join(', ') || 'no hosts'}` +
        `${result.degraded ? ' (degraded — code retrieval unavailable)' : ''}.`);
}
async function runScaffold(workspaceRoot) {
    const focus = await vscode.window.showInputBox({
        prompt: 'Focus area for the scaffold (optional)',
        placeHolder: 'e.g. error handling',
    });
    // empty string = no focus; undefined = user cancelled
    if (focus === undefined) {
        return;
    }
    getChannel().show(true);
    const scaffold = (0, intelligence_1.buildScaffold)({ workspaceRoot, focus: focus.trim() || undefined });
    await vscode.env.clipboard.writeText(scaffold);
    logLine(`scaffold:${focus.trim() ? ` focus="${focus.trim()}"` : ''} copied to clipboard.`);
    logLine('--- SCAFFOLD ---');
    logLine(scaffold);
    void vscode.window.showInformationMessage('Intelligence: scaffold copied to clipboard.');
}
async function runMetrics(workspaceRoot) {
    getChannel().show(true);
    const data = (0, intelligence_1.getDashboardData)(workspaceRoot);
    if (data.empty) {
        logLine('metrics: no learning runs recorded yet. Run /learn first.');
        void vscode.window.showInformationMessage('Intelligence: no metrics yet. Run /learn to record a run.');
        return;
    }
    const s = data.summary;
    logLine('Intelligence — Metrics:');
    logLine(`  runs: ${s.totalRuns}, sessions: ${s.totalSessions}, patterns: ${s.totalPatterns}`);
    logLine(`  avg kept rate: ${(s.avgKeptRate * 100).toFixed(1)}%`);
    logLine(`  tokens: ${s.tokens.hasReal ? `${s.tokens.real} real` : `${s.tokens.estimated} estimated`}` +
        (s.totalCostUsd > 0 ? `, cost $${s.totalCostUsd.toFixed(4)}` : ''));
    void vscode.window.showInformationMessage(`Intelligence: ${s.totalRuns} run(s), avg kept ${(s.avgKeptRate * 100).toFixed(0)}%.`);
}
async function runEffectiveness(workspaceRoot) {
    getChannel().show(true);
    const matrix = (0, intelligence_1.getEffectiveness)(workspaceRoot);
    if (matrix.byTool.length === 0) {
        logLine('effectiveness: no matrix recorded yet. Run /learn first.');
        void vscode.window.showInformationMessage('Intelligence: no effectiveness data yet. Run /learn to build the matrix.');
        return;
    }
    logLine(`Intelligence — Effectiveness (from ${matrix.totalSessions} session(s)):`);
    logLine('  By tool (ship rate · sessions · kept/session · tokens/kept):');
    for (const c of matrix.byTool) {
        logLine(`    ${c.tool}: ${(c.shipRate * 100).toFixed(0)}% · ${c.sessions} sess · ` +
            `${c.keptPerSession.toFixed(2)} kept/sess · ${Math.round(c.tokensPerKept)} tok/kept`);
    }
    // Show the strongest tool×project rows (already ranked best-first).
    const topRows = matrix.byToolProject.slice(0, 15);
    if (topRows.length > 0) {
        logLine('  Top tool × project rows:');
        for (const c of topRows) {
            logLine(`    ${c.tool} @ ${c.projectLabel}: ${(c.shipRate * 100).toFixed(0)}% · ${c.sessions} sess`);
        }
    }
    const best = matrix.byTool[0];
    void vscode.window.showInformationMessage(`Intelligence: best tool ${best.tool} (${(best.shipRate * 100).toFixed(0)}% ship over ${best.sessions} session(s)).`);
}
// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------
/**
 * Wrap a command handler so it resolves the workspace root once, warns when no
 * folder is open, and surfaces unexpected errors without crashing the host.
 */
function withWorkspace(getWorkspaceRoot, handler) {
    return async () => {
        const workspaceRoot = getWorkspaceRoot();
        if (!workspaceRoot) {
            void vscode.window.showWarningMessage('AutoClaw Intelligence: open a workspace folder first.');
            return;
        }
        try {
            await handler(workspaceRoot);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            logLine(`error: ${message}`);
            void vscode.window.showErrorMessage(`AutoClaw Intelligence: ${message}`);
        }
    };
}
/** The optional `autoclaw.intelligence.backendDir` setting (empty ⇒ unset). */
function backendDirSetting() {
    const v = vscode.workspace.getConfiguration('autoclaw.intelligence').get('backendDir');
    return v && v.trim() !== '' ? v : undefined;
}
/** The optional `autoclaw.intelligence.systemDir` setting (cross-project tier). */
function systemDirSetting() {
    const v = vscode.workspace.getConfiguration('autoclaw.intelligence').get('systemDir');
    return v && v.trim() !== '' ? v : undefined;
}
/**
 * Returns a smart default path for the system intelligence directory, tailored
 * to the current machine rather than any hardcoded drive letter.
 *
 * On Windows: walks D:→Z: looking for the first reachable non-system drive,
 * so the store lands on a data drive instead of C:. Falls back to a subfolder
 * of the user profile when C: is the only drive.
 *
 * On macOS / Linux: uses the user's home directory.
 */
function suggestSystemDir() {
    const home = os.homedir();
    if (process.platform === 'win32') {
        const candidates = 'DEFGHIJKLMNOPQRSTUVWXYZB'.split('');
        for (const letter of candidates) {
            try {
                if (fs.existsSync(`${letter}:\\`)) {
                    return `${letter}:\\autoclaw-intelligence`;
                }
            }
            catch {
                // inaccessible — skip
            }
        }
        return path.join(home, 'autoclaw-intelligence');
    }
    return path.join(home, 'autoclaw-intelligence');
}
/**
 * `autoclaw.intelligence.pickSystemDir` — opens a native OS folder picker
 * pre-navigated to the best available location for this machine, then writes
 * the chosen path to `autoclaw.intelligence.systemDir` globally.
 */
async function runPickSystemDir() {
    const current = systemDirSetting();
    const suggestion = current ?? suggestSystemDir();
    const picked = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        defaultUri: vscode.Uri.file(suggestion),
        openLabel: 'Set as System Intelligence Directory',
        title: 'AutoClaw: Choose System Intelligence Directory',
    });
    if (!picked || picked.length === 0) {
        return;
    }
    const chosen = picked[0].fsPath;
    await vscode.workspace
        .getConfiguration('autoclaw.intelligence')
        .update('systemDir', chosen, vscode.ConfigurationTarget.Global);
    void vscode.window.showInformationMessage(`AutoClaw: system intelligence directory set to ${chosen}`);
}
/**
 * Where the `sqlite-vec` native peer installs. Defaults PROJECT-LOCAL
 * (`<workspace>/.autoclaw/native`) so nothing is forced onto C:; the
 * `backendDir` setting overrides; the extension globalStorage is only a
 * last-resort fallback when there is no workspace.
 */
function backendDir(context, workspaceRoot) {
    return (0, storage_1.resolveBackendDir)(workspaceRoot, backendDirSetting(), context.globalStorageUri.fsPath);
}
/** Pinned `sqlite-vec` version from the extension manifest's optionalDependencies. */
function pinnedSqliteVecVersion(context) {
    const opt = (context.extension?.packageJSON?.optionalDependencies ?? {});
    return typeof opt['sqlite-vec'] === 'string' ? opt['sqlite-vec'] : 'latest';
}
/** Point the host-free vector loader at the installed backend when present. */
function wireInstalledBackend(context, workspaceRoot) {
    const dir = backendDir(context, workspaceRoot);
    if ((0, installBackend_1.isBackendInstalled)(dir)) {
        process.env[installBackend_1.VEC_DIR_ENV] = dir;
    }
}
// ---------------------------------------------------------------------------
// Embeddings provider — auto-detect ladder + offline install (mirrors backend)
// ---------------------------------------------------------------------------
/**
 * Where the embeddings native peer (`@xenova/transformers`) installs. Reuses the
 * vector `backendDir` so a single project-local `.autoclaw/native` dir holds both
 * peers and Relocate moves them together. Never forced onto C:.
 */
function embeddingsDir(context, workspaceRoot) {
    return backendDir(context, workspaceRoot);
}
/** Pinned `@xenova/transformers` version from the manifest's optionalDependencies. */
function pinnedTransformersVersion(context) {
    const opt = (context.extension?.packageJSON?.optionalDependencies ?? {});
    return typeof opt['@xenova/transformers'] === 'string' ? opt['@xenova/transformers'] : 'latest';
}
/** The optional `autoclaw.intelligence.modelCacheDir` setting (empty ⇒ unset). */
function modelCacheDirSetting() {
    const v = vscode.workspace.getConfiguration('autoclaw.intelligence').get('modelCacheDir');
    return v && v.trim() !== '' ? v : undefined;
}
/**
 * Where offline embedding model weights cache. Defaults PROJECT-LOCAL
 * (`<workspace>/.autoclaw/models`) so multi-hundred-MB downloads stay in the
 * project root and are never forced onto C:; the `modelCacheDir` setting
 * overrides; the extension globalStorage is a last resort when no workspace.
 */
function modelCacheDir(context, workspaceRoot) {
    const override = modelCacheDirSetting();
    if (override) {
        return override;
    }
    if (workspaceRoot) {
        return (0, intelligence_1.intelligencePaths)(workspaceRoot).root + '/models';
    }
    return context.globalStorageUri.fsPath + '/models';
}
/**
 * Point the host-free embeddings loader at an installed offline provider and aim
 * its model cache at a project-local dir (never C:), when present. Mirrors
 * {@link wireInstalledBackend}; called at registration.
 */
function wireInstalledEmbeddings(context, workspaceRoot) {
    const dir = embeddingsDir(context, workspaceRoot);
    if ((0, installEmbeddings_1.isEmbeddingsInstalled)(dir)) {
        process.env[installEmbeddings_1.TRANSFORMERS_DIR_ENV] = dir;
        if (!process.env[installEmbeddings_1.TRANSFORMERS_CACHE_ENV]) {
            process.env[installEmbeddings_1.TRANSFORMERS_CACHE_ENV] = modelCacheDir(context, workspaceRoot);
        }
    }
}
/**
 * Load config and resolve the `auto` embedding provider — probing the ladder
 * (router→ollama→transformers→none) ONCE and pinning the result, so the index
 * signature and the query embedding always agree. Surfaces a one-time nudge on a
 * fresh resolution. Returns the CONCRETE resolved config to hand to the libs.
 */
async function resolveEmbeddingForCommand(workspaceRoot, log) {
    const base = (0, intelligence_1.loadConfig)(workspaceRoot, log);
    const res = await (0, intelligence_1.resolveEmbeddingConfig)(base, workspaceRoot, { log });
    if (res.freshlyResolved) {
        void nudgeFreshEmbedding(res);
    }
    return res.config;
}
/** One-time message after the ladder first resolves: celebrate a real provider, nudge an upgrade off `none`. */
async function nudgeFreshEmbedding(res) {
    const e = res.config.embedding;
    if (res.provider === 'none') {
        const choice = await vscode.window.showWarningMessage(`AutoClaw Intelligence is using basic 'none' embeddings (lower retrieval quality) — no Zippy ` +
            `Mesh router or Ollama embedding model was detected. Set up a provider for semantic search.`, 'Set Provider…', 'Show Log');
        if (choice === 'Set Provider…') {
            await vscode.commands.executeCommand('autoclaw.intelligence.setEmbeddingProvider');
        }
        else if (choice === 'Show Log') {
            getChannel().show(true);
        }
    }
    else {
        void vscode.window.showInformationMessage(`AutoClaw Intelligence: embeddings auto-detected → ${res.provider} (${e.model}, ${e.dimension}-dim). ` +
            `Change it with "AutoClaw: Intelligence — Set Embedding Provider".`);
    }
}
/**
 * `autoclaw.intelligence.installBackend` — install the `sqlite-vec` native peer
 * (the `vec0` loadable) so RAG/indexing works in the packaged extension, where
 * the native peers are excluded from the `.vsix`. Installs PROJECT-LOCAL by
 * default (`<workspace>/.autoclaw/native`, configurable via `backendDir`) — never
 * forced onto C:. The SQLite engine itself is Node-core `node:sqlite` (no
 * install). Idempotent + re-runnable.
 */
async function runInstallBackend(context, workspaceRoot) {
    const dir = backendDir(context, workspaceRoot);
    const version = pinnedSqliteVecVersion(context);
    // Surface the resolved environment up front so a failure report is actionable
    // without re-running. These DEBUG lines also confirm WHICH build is executing.
    getChannel().show(true);
    logLine(`install-backend: starting (extension v${extensionVersion(context)})`);
    logDebug(`install-backend: workspaceRoot=${workspaceRoot ?? '(none)'}`);
    logDebug(`install-backend: backendDir setting=${backendDirSetting() ?? '(unset)'}`);
    logDebug(`install-backend: resolved targetDir=${dir}`);
    logDebug(`install-backend: process.cwd=${process.cwd()}`);
    logDebug(`install-backend: node=${process.versions.node} electron=${process.versions.electron ?? '(n/a)'}`);
    const result = await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `AutoClaw Intelligence: installing vector backend (sqlite-vec@${version}) → ${dir}…`,
        cancellable: false,
    }, () => Promise.resolve((0, installBackend_1.installVectorBackend)({ targetDir: dir, version, log: logLine })));
    if (result.ok) {
        process.env[installBackend_1.VEC_DIR_ENV] = result.installedDir ?? dir;
        logLine(`install-backend: ready at ${result.installedDir ?? dir} (${result.loadablePath}).`);
        void vscode.window.showInformationMessage(`Intelligence vector backend installed (${dir}). Run "Index Codebase" to build the RAG index.`);
        return;
    }
    logError(`install-backend: FAILED — ${result.error}`);
    logError('install-backend: run "AutoClaw: Intelligence — Diagnostics" and share the output to debug.');
    const choice = await vscode.window.showErrorMessage(`Intelligence backend install failed: ${result.error}. ` +
        'Ensure node:sqlite is available (Node 24 / recent Electron) and npm is on PATH.', 'Run Diagnostics', 'Show Log');
    if (choice === 'Run Diagnostics') {
        await runDiagnostics(context, workspaceRoot);
    }
    else if (choice === 'Show Log') {
        getChannel().show(true);
    }
}
/** The running extension's version (the single best signal for "is the new build live?"). */
function extensionVersion(context) {
    const v = context.extension?.packageJSON?.version;
    return typeof v === 'string' ? v : '(unknown)';
}
/**
 * `autoclaw.intelligence.diagnostics` — a one-shot environment dump for debugging
 * install/retrieval issues across many open windows. Read-only: it resolves every
 * path the install flow uses, probes npm, and reports the ACTIVE extension version
 * so we can tell whether a window is running a stale build. Nothing is installed
 * or mutated.
 */
async function runDiagnostics(context, workspaceRoot) {
    const ch = getChannel();
    ch.show(true);
    const dir = backendDir(context, workspaceRoot);
    const folders = vscode.workspace.workspaceFolders ?? [];
    // Probe npm without throwing — its presence/version is a common failure cause.
    let npmInfo = '(not found on PATH)';
    try {
        const probe = (0, child_process_1.spawnSync)('npm', ['--version'], {
            encoding: 'utf8',
            shell: process.platform === 'win32',
        });
        if (!probe.error && probe.status === 0) {
            npmInfo = `v${(probe.stdout || '').toString().trim()}`;
        }
        else if (probe.error) {
            npmInfo = `(spawn error: ${probe.error.message})`;
        }
    }
    catch (err) {
        npmInfo = `(probe failed: ${err.message})`;
    }
    ch.appendLine('════════════════════════════════════════════════════════');
    ch.appendLine('AutoClaw Intelligence — Diagnostics');
    ch.appendLine('════════════════════════════════════════════════════════');
    ch.appendLine('BUILD:');
    ch.appendLine(`  extension version : ${extensionVersion(context)}`);
    ch.appendLine(`  extension path    : ${context.extension?.extensionPath ?? '(unknown)'}`);
    ch.appendLine(`  VS Code version   : ${vscode.version}`);
    ch.appendLine(`  node / electron   : ${process.versions.node} / ${process.versions.electron ?? '(n/a)'}`);
    ch.appendLine(`  process.cwd       : ${process.cwd()}`);
    ch.appendLine('WORKSPACE:');
    ch.appendLine(`  resolved root     : ${workspaceRoot ?? '(no workspace open)'}`);
    ch.appendLine(`  workspaceFolders  : ${folders.length}`);
    folders.forEach((f, i) => ch.appendLine(`    [${i}] ${f.name} → ${f.uri.fsPath}`));
    ch.appendLine('BACKEND:');
    ch.appendLine(`  backendDir setting: ${backendDirSetting() ?? '(unset — using project-local default)'}`);
    ch.appendLine(`  resolved targetDir: ${dir}`);
    ch.appendLine(`  is absolute path  : ${path.isAbsolute(dir)}`);
    ch.appendLine(`  installed?        : ${(0, installBackend_1.isBackendInstalled)(dir)}`);
    ch.appendLine(`  pinned sqlite-vec : ${pinnedSqliteVecVersion(context)}`);
    ch.appendLine(`  ${installBackend_1.VEC_DIR_ENV} : ${process.env[installBackend_1.VEC_DIR_ENV] ?? '(unset)'}`);
    ch.appendLine('EMBEDDINGS:');
    ch.appendLine(`  config provider   : ${workspaceRoot ? (0, intelligence_1.loadConfig)(workspaceRoot).embedding.provider : '(no workspace)'}`);
    ch.appendLine(`  resolved pin      : ${workspaceRoot ? JSON.stringify((0, intelligence_1.readEmbeddingPin)(workspaceRoot) ?? null) : '(no workspace)'}`);
    ch.appendLine(`  offline installed : ${(0, installEmbeddings_1.isEmbeddingsInstalled)(dir)}`);
    ch.appendLine(`  ${installEmbeddings_1.TRANSFORMERS_DIR_ENV} : ${process.env[installEmbeddings_1.TRANSFORMERS_DIR_ENV] ?? '(unset)'}`);
    ch.appendLine(`  ${installEmbeddings_1.TRANSFORMERS_CACHE_ENV} : ${process.env[installEmbeddings_1.TRANSFORMERS_CACHE_ENV] ?? '(unset)'}`);
    ch.appendLine(`  router host       : ${(0, intelligence_1.resolveRouterHost)()}`);
    ch.appendLine(`  npm on PATH       : ${npmInfo}`);
    ch.appendLine(`  systemDir setting : ${systemDirSetting() ?? '(disabled)'}`);
    ch.appendLine(`  log level         : ${configuredLevel()}`);
    ch.appendLine('════════════════════════════════════════════════════════');
    if (backendDirSetting() && !path.isAbsolute(backendDirSetting())) {
        logWarn(`backendDir setting "${backendDirSetting()}" is RELATIVE — it will resolve against ` +
            `the process cwd (${process.cwd()}). Set an absolute path or clear it.`);
    }
    void vscode.window.showInformationMessage(`Intelligence diagnostics (v${extensionVersion(context)}) written to the "AutoClaw — Intelligence" output. ` +
        `Backend ${(0, installBackend_1.isBackendInstalled)(dir) ? 'installed' : 'NOT installed'} at ${dir}.`);
}
/**
 * `autoclaw.intelligence.status` — a visibility report: WHERE every store lives
 * (project root, vector index, backend dir, optional system tier), HOW MUCH data
 * is there, the index watermark, and the learn summary. Read-only.
 */
async function runStatus(context, workspaceRoot) {
    if (!workspaceRoot) {
        void vscode.window.showWarningMessage('AutoClaw Intelligence: open a workspace folder first.');
        return;
    }
    const paths = (0, intelligence_1.intelligencePaths)(workspaceRoot);
    const bdir = backendDir(context, workspaceRoot);
    const status = (0, storage_1.gatherStorageStatus)({
        workspaceRoot,
        contractRoot: paths.root,
        dbPath: paths.dbPath,
        lastIndexPath: paths.lastIndexPath,
        backendDir: bdir,
        backendInstalled: (0, installBackend_1.isBackendInstalled)(bdir),
        systemDir: systemDirSetting(),
    });
    const s = (0, intelligence_1.getDashboardData)(workspaceRoot).summary;
    const ch = getChannel();
    ch.show(true);
    ch.appendLine('────────────────────────────────────────────────────────');
    ch.appendLine('AutoClaw Intelligence — Status');
    ch.appendLine('────────────────────────────────────────────────────────');
    ch.appendLine('STORAGE (locations + sizes):');
    ch.appendLine(`  project data : ${status.projectRoot.path}  (${(0, storage_1.formatBytes)(status.projectRoot.sizeBytes)})`);
    ch.appendLine(`  vector index : ${status.index.dbPath}  (${(0, storage_1.formatBytes)(status.index.dbSizeBytes)})`);
    ch.appendLine(`  backend      : ${status.backend.path}  (${status.backend.installed ? 'installed' : 'NOT installed'})`);
    ch.appendLine(`  system tier  : ${status.system.enabled ? `${status.system.path}` : 'disabled (set autoclaw.intelligence.systemDir to enable)'}`);
    const embCfg = (0, intelligence_1.loadConfig)(workspaceRoot).embedding;
    const embPin = (0, intelligence_1.readEmbeddingPin)(workspaceRoot);
    ch.appendLine('EMBEDDINGS:');
    ch.appendLine(`  provider     : ${embCfg.provider}${embCfg.provider === 'auto'
        ? embPin
            ? ` → pinned ${embPin.provider} (${embPin.model}, ${embPin.dimension}-dim)`
            : ' → not yet resolved (run Index Codebase to detect+pin)'
        : ` (${embCfg.model}, ${embCfg.dimension}-dim)`}`);
    ch.appendLine(`  offline peer : ${(0, installEmbeddings_1.isEmbeddingsInstalled)(bdir) ? `installed (${bdir})` : 'not installed'}`);
    ch.appendLine('INDEX:');
    ch.appendLine(`  last indexed : ${status.index.indexedAt ?? '(never)'}${status.index.commit ? `  @ ${status.index.commit.slice(0, 8)}` : ''}`);
    ch.appendLine('LEARN:');
    ch.appendLine(`  sessions=${s.totalSessions}  patterns=${s.totalPatterns}  kept-rate=${(s.avgKeptRate * 100).toFixed(1)}%  runs=${s.totalRuns}`);
    ch.appendLine(`  tokens(est)=${s.tokens.estimated}  cost=$${s.totalCostUsd.toFixed(4)}`);
    // AMCE-P1B: the unified snapshot adds the sections the legacy report lacked
    // (KG capabilities + counts, per-source watermarks, context-pack activity)
    // and is persisted as machine-readable JSON for the dashboard and agents.
    // Best-effort: a snapshot failure never hides the legacy sections above.
    try {
        const config = (0, intelligence_1.loadConfig)(workspaceRoot);
        const snap = await (0, intelligence_1.collectIntelligenceStatus)(workspaceRoot, {
            config,
            enabledSources: (0, intelligence_1.resolveEnabledSources)(config.sources, (0, intelligence_1.createDefaultRegistry)().ids()),
        });
        ch.appendLine('KNOWLEDGE GRAPH:');
        ch.appendLine(snap.kg.enabled
            ? `  sqlite=${snap.kg.sqlite}  vec=${snap.kg.vec}  fts=${snap.kg.fts}` +
                (snap.kg.thought_count !== undefined
                    ? `  thoughts=${snap.kg.thought_count}  edges=${snap.kg.edge_count}`
                    : '') +
                (snap.kg.decision_open !== undefined
                    ? `  decisions=${snap.kg.decision_open} open/${snap.kg.decision_overdue ?? 0} overdue`
                    : '')
            : snap.kg.degraded
                ? '  DEGRADED (no SQLite driver loaded)'
                : '  no store yet (.autoclaw/kg/kg.db absent — recorded on first KG write)');
        ch.appendLine('SOURCES (session-learning adapters):');
        if (snap.sources.length === 0) {
            ch.appendLine('  none enabled and no extraction bookmarks yet');
        }
        for (const src of snap.sources) {
            ch.appendLine(`  ${src.id.padEnd(16)} ${src.enabled ? 'enabled ' : 'disabled'}  last-extract: ${src.last_watermark ?? '(never)'}`);
        }
        ch.appendLine('CONTEXT PACKS (orchestrator sprints):');
        ch.appendLine(snap.context_packs.count > 0
            ? `  ${snap.context_packs.count} pack(s)  newest: ${snap.context_packs.last_path} @ ${snap.context_packs.last_generated_at}`
            : '  none generated yet');
        for (const note of snap.notes) {
            ch.appendLine(`  note: ${note}`);
        }
        // Persist the snapshot for machine consumers (dashboard, agents, MCP) via
        // the shared helper so the dashboard reads the exact same path.
        const { writePersistedIntelligenceStatus } = await Promise.resolve().then(() => require('./intelligence'));
        await writePersistedIntelligenceStatus(workspaceRoot, snap);
        ch.appendLine(`SNAPSHOT: .autoclaw/intelligence-status.json (${snap.schema})`);
    }
    catch (err) {
        ch.appendLine(`SNAPSHOT: unavailable (${err.message})`);
    }
    ch.appendLine('────────────────────────────────────────────────────────');
    void vscode.window.showInformationMessage(`Intelligence: index ${(0, storage_1.formatBytes)(status.index.dbSizeBytes)} at ${status.index.dbPath} · ${s.totalSessions} sessions learned. Details in the "AutoClaw — Intelligence" output.`);
}
/**
 * `autoclaw.intelligence.benchmarkContextPacks` — AMCE-FIX-2: run the default
 * pack-quality fixture pack against this workspace's live context packs and
 * report retrieval recall / irrelevant-rate / budget per fixture. The report
 * is also persisted under `.autoclaw/workflows/traces/benchmarks/`. Read-only.
 */
async function runBenchmarkContextPacks(workspaceRoot) {
    if (!workspaceRoot) {
        void vscode.window.showWarningMessage('AutoClaw Intelligence: open a workspace folder first.');
        return;
    }
    const ch = getChannel();
    ch.show(true);
    ch.appendLine('────────────────────────────────────────────────────────');
    ch.appendLine('AutoClaw Intelligence — Context Pack Benchmark');
    try {
        const { runDefaultContextPackBenchmark } = await Promise.resolve().then(() => require('./intelligence/bench/contextPackBench'));
        const { report, saved } = await runDefaultContextPackBenchmark(workspaceRoot);
        ch.appendLine(`  fixtures=${report.fixtures}  passed=${report.passed}  pass-rate=${(report.pass_rate * 100).toFixed(0)}%`);
        ch.appendLine(`  avg evidence recall=${(report.avg_evidence_recall * 100).toFixed(0)}%  ` +
            `avg irrelevant=${(report.avg_irrelevant_rate * 100).toFixed(0)}%`);
        for (const r of report.results) {
            const status = r.passed ? 'PASS' : 'FAIL';
            const bits = [`recall ${r.matched}/${r.expected}`];
            if (r.missed.length > 0) {
                bits.push(`missed ${r.missed.length}`);
            }
            if (r.violations.length > 0) {
                bits.push(`violations ${r.violations.length}`);
            }
            if (r.over_budget) {
                bits.push('over-budget');
            }
            if (r.degraded) {
                bits.push('degraded');
            }
            ch.appendLine(`  [${status}] ${r.fixture_id.padEnd(36)} ${bits.join(', ')}`);
        }
        ch.appendLine(saved.ok ? `  report: ${saved.file}` : `  report not saved: ${saved.error}`);
        ch.appendLine('────────────────────────────────────────────────────────');
        void vscode.window.showInformationMessage(`Context pack benchmark: ${report.passed}/${report.fixtures} passed. Details in the "AutoClaw — Intelligence" output.`);
    }
    catch (err) {
        ch.appendLine(`  benchmark failed: ${err.message}`);
        ch.appendLine('────────────────────────────────────────────────────────');
    }
}
/** List `*.context.json` sidecars under the orchestrator sprints dir, newest first. */
function listContextPackSidecars(workspaceRoot) {
    const dir = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'sprints');
    try {
        return fs
            .readdirSync(dir)
            .filter((f) => f.endsWith('.context.json'))
            .map((f) => {
            const file = path.join(dir, f);
            let mtime = 0;
            try {
                mtime = fs.statSync(file).mtimeMs;
            }
            catch { /* ignore */ }
            return { label: f, file, mtime };
        })
            .sort((a, b) => b.mtime - a.mtime);
    }
    catch {
        return [];
    }
}
/**
 * `autoclaw.intelligence.checkPackDrift` — AMCE-FIX-2: pick a context-pack
 * sidecar and report whether it has drifted from live state (aged / changed /
 * sources-advanced) before resuming that task. Read-only.
 */
async function runCheckPackDrift(workspaceRoot) {
    if (!workspaceRoot) {
        void vscode.window.showWarningMessage('AutoClaw Intelligence: open a workspace folder first.');
        return;
    }
    const sidecars = listContextPackSidecars(workspaceRoot);
    if (sidecars.length === 0) {
        void vscode.window.showInformationMessage('No context-pack sidecars found under .autoclaw/orchestrator/sprints/.');
        return;
    }
    const pick = await vscode.window.showQuickPick(sidecars.map((s) => ({ label: s.label, file: s.file })), { placeHolder: 'Pick a context pack to check for drift' });
    if (!pick) {
        return;
    }
    const ch = getChannel();
    ch.show(true);
    ch.appendLine('────────────────────────────────────────────────────────');
    ch.appendLine('AutoClaw Intelligence — Context Pack Drift');
    try {
        const { assessContextPackDriftFromFile, renderDriftBanner } = await Promise.resolve().then(() => require('./intelligence/contextPackDrift'));
        const report = assessContextPackDriftFromFile(pick.file);
        ch.appendLine(`  ${renderDriftBanner(report)}`);
        ch.appendLine(`  age ${report.age_hours}h · aged ${report.aged.length} · changed ${report.changed.length}`);
        for (const n of report.notes) {
            ch.appendLine(`  note: ${n}`);
        }
        ch.appendLine('────────────────────────────────────────────────────────');
    }
    catch (err) {
        ch.appendLine(`  drift check failed: ${err.message}`);
        ch.appendLine('────────────────────────────────────────────────────────');
    }
}
/**
 * `autoclaw.intelligence.diffPacks` — AMCE-FIX-2: pick two context-pack
 * sidecars and report what evidence was added / removed / changed / went stale
 * between them. Works from sidecars alone (no regeneration). Read-only.
 */
async function runDiffPacks(workspaceRoot) {
    if (!workspaceRoot) {
        void vscode.window.showWarningMessage('AutoClaw Intelligence: open a workspace folder first.');
        return;
    }
    const sidecars = listContextPackSidecars(workspaceRoot);
    if (sidecars.length < 2) {
        void vscode.window.showInformationMessage('Need at least two context-pack sidecars to diff.');
        return;
    }
    const opts = sidecars.map((s) => ({ label: s.label, file: s.file }));
    const from = await vscode.window.showQuickPick(opts, { placeHolder: 'Pick the OLDER pack (from)' });
    if (!from) {
        return;
    }
    const to = await vscode.window.showQuickPick(opts.filter((o) => o.file !== from.file), { placeHolder: 'Pick the NEWER pack (to)' });
    if (!to) {
        return;
    }
    const ch = getChannel();
    ch.show(true);
    ch.appendLine('────────────────────────────────────────────────────────');
    ch.appendLine('AutoClaw Intelligence — Context Pack Diff');
    try {
        const { diffContextPackFiles, renderContextPackDiff } = await Promise.resolve().then(() => require('./intelligence/contextPackDiff'));
        ch.appendLine(renderContextPackDiff(diffContextPackFiles(from.file, to.file)));
        ch.appendLine('────────────────────────────────────────────────────────');
    }
    catch (err) {
        ch.appendLine(`  diff failed: ${err.message}`);
        ch.appendLine('────────────────────────────────────────────────────────');
    }
}
/**
 * `autoclaw.intelligence.externalMemoryDryRun` — AMCE-P5E: probe the optional
 * external-memory bridge and show what a redacted export WOULD send, without
 * sending anything. Disabled-by-default: with the setting off or no base URL
 * this prints the local-only state and exits — local intelligence never
 * depends on the bridge. The API key comes from the environment
 * (`AUTOCLAW_EXTERNAL_MEMORY_API_KEY`), never from settings.
 */
async function runExternalMemoryDryRun(workspaceRoot) {
    if (!workspaceRoot) {
        void vscode.window.showWarningMessage('AutoClaw Intelligence: open a workspace folder first.');
        return;
    }
    const ch = getChannel();
    ch.show(true);
    ch.appendLine('────────────────────────────────────────────────────────');
    ch.appendLine('AutoClaw Intelligence — External Memory (dry run)');
    const cfg = vscode.workspace.getConfiguration('autoclaw.intelligence.externalMemory');
    const bridgeConfig = {
        enabled: cfg.get('enabled') === true,
        provider: cfg.get('provider') || undefined,
        baseUrl: cfg.get('baseUrl') || undefined,
        apiKey: process.env.AUTOCLAW_EXTERNAL_MEMORY_API_KEY || undefined,
    };
    try {
        const { resolveExternalMemoryBridge } = await Promise.resolve().then(() => require('./intelligence/externalMemory'));
        const bridge = await resolveExternalMemoryBridge(bridgeConfig, (m) => ch.appendLine(`  ${m}`));
        if (!bridge) {
            ch.appendLine(bridgeConfig.enabled
                ? '  bridge unavailable — check provider/baseUrl. Local intelligence is unaffected.'
                : '  bridge DISABLED (default). Local KG/vector/context-pack intelligence is fully functional without it.');
            ch.appendLine('────────────────────────────────────────────────────────');
            return;
        }
        const health = await bridge.health();
        ch.appendLine(`  provider : ${bridge.displayName}`);
        ch.appendLine(`  health   : ${health.ok ? 'reachable' : `NOT reachable (${health.message ?? 'unknown'})`}`);
        const res = await bridge.exportFacts({
            workspaceRoot, scope: 'project', redact: true, dryRun: true,
        });
        ch.appendLine(`  dry-run  : ${res.manifest.facts} fact(s) would export, redaction ${res.manifest.redacted ? 'ON' : 'off'}`);
        for (const note of res.manifest.notes) {
            ch.appendLine(`  note     : ${note}`);
        }
    }
    catch (err) {
        ch.appendLine(`  bridge error: ${err.message} — local intelligence is unaffected.`);
    }
    ch.appendLine('────────────────────────────────────────────────────────');
}
/**
 * `autoclaw.intelligence.systemTier` — view the cross-project SYSTEM tier: its
 * store location and the project↔store registry (which projects have intelligence,
 * how much). Off until `autoclaw.intelligence.systemDir` is set.
 */
async function runSystemTier() {
    const sys = (0, storage_1.systemPaths)(systemDirSetting());
    if (!sys) {
        const choice = await vscode.window.showInformationMessage('The cross-project system intelligence tier is OFF. Set "autoclaw.intelligence.systemDir" to a directory (any drive) to enable it.', 'Open Settings');
        if (choice === 'Open Settings') {
            void vscode.commands.executeCommand('workbench.action.openSettings', 'autoclaw.intelligence.systemDir');
        }
        return;
    }
    (0, systemStore_1.ensureSystemStore)(sys);
    const reg = (0, systemStore_1.readRegistry)(sys.registryPath);
    const learnings = (0, systemStore_1.readSystemLearnings)(sys);
    const ch = getChannel();
    ch.show(true);
    ch.appendLine('────────────────────────────────────────────────────────');
    ch.appendLine('AutoClaw Intelligence — System Tier (cross-project)');
    ch.appendLine('────────────────────────────────────────────────────────');
    ch.appendLine(`  store     : ${sys.root}`);
    ch.appendLine(`  registry  : ${sys.registryPath}`);
    ch.appendLine(`  projects  : ${reg.projects.length}`);
    ch.appendLine(`  learnings : ${learnings.length} (distilled cross-project patterns)`);
    for (const p of reg.projects) {
        ch.appendLine(`   • ${p.name}  (${p.path})` +
            `${p.indexChunks != null ? `  chunks=${p.indexChunks}` : ''}` +
            `${p.learnSessions != null ? `  sessions=${p.learnSessions}` : ''}` +
            `${p.lastIndexedAt ? `  indexed=${p.lastIndexedAt.slice(0, 10)}` : ''}`);
    }
    ch.appendLine('────────────────────────────────────────────────────────');
    // Offer a cross-project search over the promoted learnings.
    const query = await vscode.window.showInputBox({
        title: 'Search System Intelligence',
        prompt: `Search ${learnings.length} cross-project learning(s) — leave empty to skip`,
        ignoreFocusOut: true,
    });
    if (query && query.trim() !== '') {
        const hits = (0, systemStore_1.searchSystemLearnings)(sys, query.trim(), 15);
        ch.appendLine(`\nSearch "${query.trim()}" → ${hits.length} hit(s):`);
        for (const h of hits) {
            ch.appendLine(`   [${h.kind}/${h.tier}] ${h.text}   — ${path.basename(h.project)}`);
        }
        ch.appendLine('────────────────────────────────────────────────────────');
        void vscode.window.showInformationMessage(`System search "${query.trim()}": ${hits.length} hit(s). See the "AutoClaw — Intelligence" output.`);
        return;
    }
    void vscode.window.showInformationMessage(`Intelligence system tier: ${reg.projects.length} project(s), ${learnings.length} learning(s) at ${sys.root}.`);
}
/**
 * `autoclaw.intelligence.relocateBackend` — move the installed vector backend
 * (sqlite-vec) to a new directory/drive and persist the choice in the
 * `backendDir` setting. Post-install control over where data lives.
 */
async function runRelocateBackend(context, workspaceRoot) {
    const current = backendDir(context, workspaceRoot);
    const target = await vscode.window.showInputBox({
        title: 'Relocate Intelligence Vector Backend',
        prompt: 'New directory for the sqlite-vec backend (any drive). Its contents will be moved here.',
        value: current,
        ignoreFocusOut: true,
    });
    if (!target || target.trim() === '' || target.trim() === current) {
        return;
    }
    const dest = target.trim();
    const result = await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `AutoClaw Intelligence: relocating backend → ${dest}…`,
        cancellable: false,
    }, () => Promise.resolve((0, storage_1.relocateStore)(current, dest)));
    if (!result.ok) {
        logLine(`relocate-backend: FAILED — ${result.error}`);
        void vscode.window.showErrorMessage(`Relocate failed: ${result.error}. (If the backend is in use, reload the window and retry.)`);
        return;
    }
    // Persist the choice so future resolves + installs use the new dir.
    await vscode.workspace
        .getConfiguration('autoclaw.intelligence')
        .update('backendDir', dest, vscode.ConfigurationTarget.Global);
    process.env[installBackend_1.VEC_DIR_ENV] = dest;
    logLine(`relocate-backend: moved ${(0, storage_1.formatBytes)(result.movedBytes ?? 0)} → ${result.to}`);
    void vscode.window.showInformationMessage(`Intelligence backend relocated to ${result.to} (${(0, storage_1.formatBytes)(result.movedBytes ?? 0)}). Reload the window if retrieval was active.`);
}
/**
 * `autoclaw.intelligence.installEmbeddings` — install the OFFLINE embedding peer
 * (`@xenova/transformers`, ~135 MB) project-local so fully-offline, in-process
 * semantic embeddings work with no external service. Most users want the Router
 * or Ollama rungs instead (no install); this is the no-service fallback. The
 * install is cwd-based (spaced-path safe) and the model cache stays project-local.
 */
async function runInstallEmbeddings(context, workspaceRoot) {
    const dir = embeddingsDir(context, workspaceRoot);
    const version = pinnedTransformersVersion(context);
    getChannel().show(true);
    logLine(`install-embeddings: starting (extension v${extensionVersion(context)})`);
    logDebug(`install-embeddings: resolved targetDir=${dir}`);
    const result = await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `AutoClaw Intelligence: installing offline embeddings (@xenova/transformers@${version}, ~135 MB) → ${dir}…`,
        cancellable: false,
    }, () => (0, installEmbeddings_1.installEmbeddingsProvider)({ targetDir: dir, version, log: logLine }));
    if (result.ok) {
        const installed = result.installedDir ?? dir;
        process.env[installEmbeddings_1.TRANSFORMERS_DIR_ENV] = installed;
        if (!process.env[installEmbeddings_1.TRANSFORMERS_CACHE_ENV]) {
            process.env[installEmbeddings_1.TRANSFORMERS_CACHE_ENV] = modelCacheDir(context, workspaceRoot);
        }
        if (workspaceRoot) {
            (0, intelligence_1.setEmbeddingProvider)(workspaceRoot, { provider: 'transformers', model: 'Xenova/nomic-embed-text-v1.5', dimension: 768 }, logLine);
        }
        logLine(`install-embeddings: ready at ${installed} (${result.entryPath}).`);
        void vscode.window.showInformationMessage(`Offline embeddings installed (${dir}). Run "Index Codebase" → Full re-index to rebuild with semantic vectors.`);
        return;
    }
    logError(`install-embeddings: FAILED — ${result.error}`);
    const choice = await vscode.window.showErrorMessage(`Offline embeddings install failed: ${result.error}. Ensure npm is on PATH, or use the Router/Ollama provider instead.`, 'Run Diagnostics', 'Show Log');
    if (choice === 'Run Diagnostics') {
        await runDiagnostics(context, workspaceRoot);
    }
    else if (choice === 'Show Log') {
        getChannel().show(true);
    }
}
/**
 * `autoclaw.intelligence.setEmbeddingProvider` — pick the embedding provider and
 * persist it to `.autoclaw/vector/config.json`. Probes router/ollama to capture
 * the TRUE vector dimension so the signature is correct. Clears any auto-pin.
 */
async function runSetEmbeddingProvider(context, workspaceRoot) {
    if (!workspaceRoot) {
        void vscode.window.showWarningMessage('AutoClaw Intelligence: open a workspace folder first.');
        return;
    }
    const log = logLine;
    const config = (0, intelligence_1.loadConfig)(workspaceRoot, log);
    const pin = (0, intelligence_1.readEmbeddingPin)(workspaceRoot);
    const current = config.embedding.provider !== 'auto'
        ? `${config.embedding.provider} (${config.embedding.model}, ${config.embedding.dimension}-dim)`
        : pin ? `${pin.provider} (${pin.model}, ${pin.dimension}-dim)` : 'auto';
    // Probe every rung IN PARALLEL (each detector is ~1.5s) so the picker can
    // explain itself with LIVE status instead of static labels. The Ollama embed
    // model only matters when Ollama is actually up, so guard the model lookup.
    const probe = await probeEmbeddingProviders(context, workspaceRoot);
    const options = (0, providerChoice_1.buildProviderOptions)(probe, current);
    const pick = await vscode.window.showQuickPick(options.map((o) => ({ label: o.label, description: o.description, id: o.id })), { placeHolder: `Embedding provider (current: ${current})`, matchOnDescription: true });
    if (!pick) {
        return;
    }
    getChannel().show(true);
    // Offline install has its own flow (and sets the provider on success).
    if (pick.id === 'transformers') {
        await runInstallEmbeddings(context, workspaceRoot);
        return;
    }
    let embedding;
    if (pick.id === 'auto') {
        embedding = { provider: 'auto', model: 'Xenova/nomic-embed-text-v1.5', dimension: 768 };
    }
    else if (pick.id === 'none') {
        embedding = { provider: 'none', model: 'none-hashed-bow', dimension: 768 };
    }
    else if (pick.id === 'router') {
        const routerHost = (0, intelligence_1.resolveRouterHost)();
        if (!probe.router.reachable && !(await (0, intelligence_1.detectRouter)(routerHost))) {
            const go = await vscode.window.showWarningMessage(`No Zippy Mesh router reachable at ${routerHost}. Set it anyway (it will work once the router is up)?`, 'Set Anyway', 'Cancel');
            if (go !== 'Set Anyway') {
                return;
            }
        }
        const dim = await probeProviderDimension({ provider: 'router', model: intelligence_1.DEFAULT_EMBED_MODEL, dimension: 768, routerHost }, log);
        embedding = { provider: 'router', model: intelligence_1.DEFAULT_EMBED_MODEL, dimension: dim ?? 768, routerHost };
    }
    else {
        // ollama
        if (!probe.ollama.reachable && !(await (0, intelligence_1.detectOllama)())) {
            void vscode.window.showWarningMessage('No Ollama server reachable (default http://localhost:11434). Start Ollama, then retry.');
            return;
        }
        const model = probe.ollama.embedModel ?? (0, intelligence_1.pickOllamaEmbedModel)(await (0, intelligence_1.listOllamaModels)()) ?? intelligence_1.DEFAULT_EMBED_MODEL;
        const dim = await probeProviderDimension({ provider: 'ollama', model, dimension: 768 }, log);
        if (dim === undefined) {
            const go = await vscode.window.showWarningMessage(`Ollama is running but embedding with "${model}" failed — run \`ollama pull ${intelligence_1.DEFAULT_EMBED_MODEL}\` first. Set it anyway?`, 'Set Anyway', 'Cancel');
            if (go !== 'Set Anyway') {
                return;
            }
        }
        embedding = { provider: 'ollama', model, dimension: dim ?? 768 };
    }
    (0, intelligence_1.setEmbeddingProvider)(workspaceRoot, embedding, log);
    // Closing the loop: a new provider only takes effect once the store is
    // rebuilt under its geometry, so offer an immediate full re-index. `auto`/
    // `none` keep the passive hint — there is no fresh geometry to rebuild for.
    if (embedding.provider === 'router' || embedding.provider === 'ollama') {
        const go = await vscode.window.showInformationMessage(`Provider set to "${embedding.provider}" (${embedding.model}, ${embedding.dimension}-dim). ` +
            'Re-index now to rebuild under it?', 'Full re-index', 'Later');
        if (go === 'Full re-index') {
            await vscode.commands.executeCommand('autoclaw.intelligence.indexCode');
        }
        return;
    }
    void vscode.window.showInformationMessage(`Embedding provider set to "${embedding.provider}" (${embedding.model}, ${embedding.dimension}-dim). ` +
        `Run "Index Codebase" → Full re-index to rebuild under the new provider.`);
}
/**
 * Probe every embedding rung IN PARALLEL so the picker can explain itself with
 * live status. Router/Ollama use the network detectors; the offline rung is an
 * on-disk install check. The Ollama embed-model lookup only runs when Ollama is
 * actually reachable. Never throws — a failed probe degrades to "not available".
 */
async function probeEmbeddingProviders(context, workspaceRoot) {
    const routerHost = (0, intelligence_1.resolveRouterHost)();
    const transformersDir = process.env[installEmbeddings_1.TRANSFORMERS_DIR_ENV] || embeddingsDir(context, workspaceRoot);
    const [router, ollamaUp, ollamaModels] = await Promise.all([
        (0, intelligence_1.detectRouter)(routerHost),
        (0, intelligence_1.detectOllama)(),
        (0, intelligence_1.listOllamaModels)(),
    ]);
    return {
        router: { reachable: router },
        ollama: { reachable: ollamaUp, embedModel: ollamaUp ? (0, intelligence_1.pickOllamaEmbedModel)(ollamaModels) : undefined },
        transformers: { installed: (0, installEmbeddings_1.resolveInstalledTransformersEntry)(transformersDir) !== undefined },
    };
}
/**
 * `autoclaw.intelligence.detectEmbeddingProvider` — clear the auto-pin and
 * re-probe the ladder now, reporting what was chosen. Use after starting a
 * router or pulling an Ollama model.
 */
async function runDetectEmbeddingProvider(workspaceRoot) {
    const log = logLine;
    getChannel().show(true);
    (0, intelligence_1.clearEmbeddingPin)(workspaceRoot);
    const base = (0, intelligence_1.loadConfig)(workspaceRoot, log);
    if (base.embedding.provider !== 'auto') {
        void vscode.window.showInformationMessage(`Embedding provider is pinned to "${base.embedding.provider}" in config.json. ` +
            `Use "Set Embedding Provider" → Auto-detect to enable detection.`);
        return;
    }
    const res = await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'AutoClaw Intelligence: detecting embedding provider…',
        cancellable: false,
    }, () => (0, intelligence_1.resolveEmbeddingConfig)(base, workspaceRoot, { log }));
    const e = res.config.embedding;
    for (const n of res.notes) {
        logLine(`detect-embeddings: ${n}`);
    }
    void vscode.window.showInformationMessage(`Embeddings detected → ${res.provider} (${e.model}, ${e.dimension}-dim). ` +
        (res.provider === 'none'
            ? 'Start Zippy Mesh or run `ollama pull nomic-embed-text` for semantic search.'
            : 'Run "Index Codebase" → Full re-index if the provider changed.'));
}
/** Best-effort probe of a provider's true vector dimension (undefined on failure). */
async function probeProviderDimension(embedding, log) {
    try {
        const vec = await (0, intelligence_1.embedStrict)('autoclaw embedding provider probe', embedding);
        return Array.isArray(vec) && vec.length > 0 ? vec.length : undefined;
    }
    catch (err) {
        log(`set-embeddings: probe (${embedding.provider}) failed: ${err.message}`);
        return undefined;
    }
}
/**
 * Register the Intelligence commands. Registration is side-effect free beyond
 * pushing disposables onto `context.subscriptions` and pointing the vector
 * loader at an already-installed backend; no intelligence I/O runs until a
 * command is invoked.
 */
function registerIntelligenceCommands(context, getWorkspaceRoot) {
    wireInstalledBackend(context, getWorkspaceRoot());
    wireInstalledEmbeddings(context, getWorkspaceRoot());
    context.subscriptions.push(vscode.commands.registerCommand('autoclaw.intelligence.installBackend', () => runInstallBackend(context, getWorkspaceRoot())), vscode.commands.registerCommand('autoclaw.intelligence.installEmbeddings', () => runInstallEmbeddings(context, getWorkspaceRoot())), vscode.commands.registerCommand('autoclaw.intelligence.setEmbeddingProvider', () => runSetEmbeddingProvider(context, getWorkspaceRoot())), vscode.commands.registerCommand('autoclaw.intelligence.detectEmbeddingProvider', withWorkspace(getWorkspaceRoot, runDetectEmbeddingProvider)), vscode.commands.registerCommand('autoclaw.intelligence.status', () => runStatus(context, getWorkspaceRoot())), vscode.commands.registerCommand('autoclaw.intelligence.diagnostics', () => runDiagnostics(context, getWorkspaceRoot())), vscode.commands.registerCommand('autoclaw.intelligence.externalMemoryDryRun', () => runExternalMemoryDryRun(getWorkspaceRoot())), vscode.commands.registerCommand('autoclaw.intelligence.benchmarkContextPacks', () => runBenchmarkContextPacks(getWorkspaceRoot())), vscode.commands.registerCommand('autoclaw.intelligence.checkPackDrift', () => runCheckPackDrift(getWorkspaceRoot())), vscode.commands.registerCommand('autoclaw.intelligence.diffPacks', () => runDiffPacks(getWorkspaceRoot())), vscode.commands.registerCommand('autoclaw.intelligence.systemTier', () => runSystemTier()), vscode.commands.registerCommand('autoclaw.intelligence.pickSystemDir', () => runPickSystemDir()), vscode.commands.registerCommand('autoclaw.intelligence.relocateBackend', () => runRelocateBackend(context, getWorkspaceRoot())), vscode.commands.registerCommand('autoclaw.intelligence.generateSteering', withWorkspace(getWorkspaceRoot, runGenerateSteering)), vscode.commands.registerCommand('autoclaw.intelligence.generateScaffold', withWorkspace(getWorkspaceRoot, runGenerateScaffold)), vscode.commands.registerCommand('autoclaw.intelligence.learn', withWorkspace(getWorkspaceRoot, runLearn)), vscode.commands.registerCommand('autoclaw.intelligence.indexCode', withWorkspace(getWorkspaceRoot, runIndexCode)), vscode.commands.registerCommand('autoclaw.intelligence.retrieve', withWorkspace(getWorkspaceRoot, runRetrieve)), vscode.commands.registerCommand('autoclaw.intelligence.search', withWorkspace(getWorkspaceRoot, runSearch)), vscode.commands.registerCommand('autoclaw.intelligence.sources', withWorkspace(getWorkspaceRoot, runSources)), vscode.commands.registerCommand('autoclaw.intelligence.ragGenerate', withWorkspace(getWorkspaceRoot, runRagGenerate)), vscode.commands.registerCommand('autoclaw.intelligence.contextPack', withWorkspace(getWorkspaceRoot, runContextPack)), vscode.commands.registerCommand('autoclaw.intelligence.hostContext', withWorkspace(getWorkspaceRoot, runHostContext)), vscode.commands.registerCommand('autoclaw.intelligence.scaffold', withWorkspace(getWorkspaceRoot, runScaffold)), vscode.commands.registerCommand('autoclaw.intelligence.metrics', withWorkspace(getWorkspaceRoot, runMetrics)), vscode.commands.registerCommand('autoclaw.intelligence.effectiveness', withWorkspace(getWorkspaceRoot, runEffectiveness)));
}
//# sourceMappingURL=intelligence-commands.js.map