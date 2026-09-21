"use strict";
/**
 * KDream Helper Functions
 *
 * Pure logic functions extracted from extension.ts for testability.
 * These functions have no vscode dependencies and can be unit tested directly.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HOST_FORK_IDS = exports.DEFAULT_ADAPTERS = exports.TODO_SCAN_EXCLUDE_FILE_GLOBS = exports.TODO_SCAN_EXCLUDE_DIRS = void 0;
exports.parseMemoryTasks = parseMemoryTasks;
exports.formatTask = formatTask;
exports.addTaskToContent = addTaskToContent;
exports.createInitialMemoryContent = createInitialMemoryContent;
exports.isAutoclawInGitignore = isAutoclawInGitignore;
exports.addAutoclawToGitignore = addAutoclawToGitignore;
exports.parseLogEntries = parseLogEntries;
exports.parseTodosFromContent = parseTodosFromContent;
exports.buildTodoScanExcludeGlob = buildTodoScanExcludeGlob;
exports.isExcludedTodoPath = isExcludedTodoPath;
exports.getAdapterHealthEntry = getAdapterHealthEntry;
exports.isAdapterDetected = isAdapterDetected;
exports.checkZippyMeshHealth = checkZippyMeshHealth;
exports.generateNonce = generateNonce;
exports.shouldShowNotification = shouldShowNotification;
exports.getTodayDate = getTodayDate;
exports.getKdreamDirPath = getKdreamDirPath;
exports.getMemoryPath = getMemoryPath;
exports.getStatePath = getStatePath;
exports.getTodayLogPath = getTodayLogPath;
const fs = require("fs");
const path = require("path");
/**
 * Parses MEMORY.md content and extracts tasks.
 * @param memoryContent - The raw content of MEMORY.md
 * @returns Array of parsed tasks
 */
function parseMemoryTasks(memoryContent) {
    const taskRegex = /^- \[([ xX])\] (.+)$/gm;
    const tasks = [];
    let match;
    while ((match = taskRegex.exec(memoryContent)) !== null) {
        const completed = match[1].toLowerCase() === 'x';
        const description = match[2];
        tasks.push({ completed, description });
    }
    return tasks;
}
/**
 * Formats a task for insertion into MEMORY.md
 * @param task - The task description
 * @returns Formatted task string with checkbox
 */
function formatTask(task) {
    return `- [ ] ${task}`;
}
/**
 * Adds a task to existing MEMORY.md content, placing it under the Follow-ups section.
 * @param existingContent - Current MEMORY.md content
 * @param task - Task description to add
 * @returns Updated MEMORY.md content with the new task
 */
function addTaskToContent(existingContent, task) {
    const followUpsHeader = '## Follow-ups';
    const formattedTask = formatTask(task);
    if (!existingContent.includes(followUpsHeader)) {
        // No Follow-ups section exists, append it
        return existingContent + '\n## Follow-ups\n\n' + formattedTask + '\n';
    }
    // Insert task immediately after the Follow-ups header
    const headerIndex = existingContent.indexOf(followUpsHeader);
    const afterHeader = headerIndex + followUpsHeader.length;
    // Find the end of the header line (including any trailing whitespace)
    let insertPos = afterHeader;
    while (insertPos < existingContent.length &&
        (existingContent[insertPos] === ' ' || existingContent[insertPos] === '\t')) {
        insertPos++;
    }
    // Skip the newline after the header
    if (insertPos < existingContent.length && existingContent[insertPos] === '\n') {
        insertPos++;
        // Skip any additional blank lines
        while (insertPos < existingContent.length && existingContent[insertPos] === '\n') {
            insertPos++;
        }
    }
    // Insert the task at this position
    return existingContent.slice(0, insertPos) + formattedTask + '\n' + existingContent.slice(insertPos);
}
/**
 * Creates initial MEMORY.md content with a task
 * @param task - First task to add
 * @returns Complete MEMORY.md content
 */
function createInitialMemoryContent(task) {
    return '# KDream Memory\n\n## Follow-ups\n\n' + formatTask(task) + '\n';
}
/**
 * Checks if .autoclaw/ is mentioned in .gitignore content
 * @param gitignoreContent - Content of .gitignore file
 * @returns true if .autoclaw/ is already in .gitignore
 */
function isAutoclawInGitignore(gitignoreContent) {
    return gitignoreContent.includes('.autoclaw/');
}
/**
 * Adds .autoclaw/ to .gitignore content
 * @param existingContent - Current .gitignore content
 * @returns Updated .gitignore content with .autoclaw/ entry
 */
function addAutoclawToGitignore(existingContent) {
    return existingContent + '\n# AutoClaw KDream data\n.autoclaw/\n';
}
/**
 * Parses log content and returns recent entries
 * @param logContent - Raw log file content
 * @param maxEntries - Maximum number of entries to return
 * @returns Array of log entries
 */
function parseLogEntries(logContent, maxEntries = 10) {
    return logContent.split('\n').filter(line => line.trim()).slice(-maxEntries);
}
/**
 * Parses TODO/FIXME comments from source file content
 * @param content - Source file content
 * @param relativePath - Relative path of the file (for reporting)
 * @returns Array of found TODO/FIXME items
 */
function parseTodosFromContent(content, relativePath) {
    const todoRegex = /(TODO|FIXME)\s*[:\-]?\s*(.*)/i;
    const results = [];
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(todoRegex);
        if (match) {
            results.push({
                file: relativePath,
                line: i + 1,
                type: match[1].toUpperCase(),
                text: match[2].trim()
            });
        }
    }
    return results;
}
/**
 * Directory segments the TODO scanner must never descend into: build output,
 * dependency trees, AutoClaw's own state, and — critically — nested git
 * worktrees / agent checkouts (`.kilo/worktrees/**`, `.claude/worktrees/**`).
 * Each nested worktree is a full copy of the repo, so scanning them duplicates
 * every TODO N times and floods the panel. `.kilo` and `.claude` are gitignored
 * tool dirs; excluding them keeps the scan aligned with what git tracks, and a
 * bare `worktrees` segment catches any other tool that nests checkouts.
 */
exports.TODO_SCAN_EXCLUDE_DIRS = [
    'node_modules',
    '.vscode-test',
    'out',
    'dist',
    '.autoclaw',
    '.git',
    '.kilo',
    '.claude',
    'worktrees',
];
/** File globs excluded from the TODO scan (generated / minified bundles). */
exports.TODO_SCAN_EXCLUDE_FILE_GLOBS = [
    '**/*.min.js',
    '**/*.bundle.js',
];
/**
 * Build the VS Code `findFiles` exclude brace-pattern from the exclude sets.
 * Single source of truth so the glob and {@link isExcludedTodoPath} agree.
 */
function buildTodoScanExcludeGlob() {
    const dirGlobs = exports.TODO_SCAN_EXCLUDE_DIRS.map((d) => `**/${d}/**`);
    return `{${[...dirGlobs, ...exports.TODO_SCAN_EXCLUDE_FILE_GLOBS].join(',')}}`;
}
/**
 * Defense-in-depth path filter applied to scan results after `findFiles`.
 * Returns true when a workspace-relative path lives inside an excluded
 * directory or is an excluded generated file — a safety net for hosts whose
 * glob engine misses a deeply nested worktree. Separators are normalized so it
 * works for Windows backslash paths.
 */
function isExcludedTodoPath(relativePath) {
    const segments = relativePath.replace(/\\/g, '/').split('/').filter(Boolean);
    if (segments.some((seg) => exports.TODO_SCAN_EXCLUDE_DIRS.includes(seg))) {
        return true;
    }
    const base = segments[segments.length - 1] ?? '';
    return base.endsWith('.min.js') || base.endsWith('.bundle.js');
}
/**
 * Determines adapter health based on whether it's installed
 * @param adapterName - Human-readable adapter name
 * @param isInstalled - Whether the adapter is installed
 * @returns Adapter health object
 */
function getAdapterHealthEntry(adapterName, isInstalled) {
    return {
        name: adapterName,
        status: isInstalled ? 'healthy' : 'warning',
        details: isInstalled ? 'Installed' : 'Not detected'
    };
}
exports.DEFAULT_ADAPTERS = [
    { name: 'Claude Code', id: 'Anthropic.claude-code' },
    { name: 'Cline', id: 'saoudrizwan.claude-dev' },
    { name: 'KiloCode', id: 'kilocode.kilo-code' },
    { name: 'Kiro', id: 'amazon.kiro' },
    { name: 'Windsurf', id: 'codeium.windsurf' },
    { name: 'Continue', id: 'Continue.continue' },
    { name: 'Cursor', id: null },
    { name: 'Antigravity', id: null }
];
/**
 * Host IDEs that are *forks* of VS Code rather than extensions loaded inside an
 * editor (Cursor, Kiro, Windsurf, Antigravity). They are detected by the running
 * application name — NOT by `vscode.extensions.getExtension(...)`, because the
 * IDE itself is never registered as an extension in its own extension host. So
 * `getExtension('amazon.kiro')` returns `undefined` even while running in Kiro.
 *
 * Maps an adapter `name` → the lowercase host id reported by `detectIde()`.
 */
exports.HOST_FORK_IDS = {
    Cursor: 'cursor',
    Kiro: 'kiro',
    Windsurf: 'windsurf',
    Antigravity: 'antigravity'
};
/** Workspace markers that indicate a fork's project, independent of the host. */
function hasCursorMarker(workspaceRoot) {
    return ['.cursorrules', '.cursor'].some(f => fs.existsSync(path.join(workspaceRoot, f)));
}
/**
 * Decides whether an adapter should report as "detected/installed". Any one of
 * three independent signals suffices:
 *   1. We are running *as* this host IDE fork (appName → `hostId`).
 *   2. The adapter's VS Code extension is installed in the current host.
 *   3. A fork's workspace marker is present (Cursor `.cursor*`, Antigravity
 *      `.agent/`) — covers a fork's project opened in a different editor.
 *
 * Signal 1 is checked first so host forks are reported correctly even though
 * their extension id (if any) can never resolve inside their own extension host.
 *
 * @param adapter       adapter config (name + optional extension id)
 * @param hostId        result of `detectIde(appName)`
 * @param hasExtension  predicate: is this extension id installed?
 * @param workspaceRoot open workspace root, if any
 */
function isAdapterDetected(adapter, hostId, hasExtension, workspaceRoot) {
    if (exports.HOST_FORK_IDS[adapter.name] && exports.HOST_FORK_IDS[adapter.name] === hostId) {
        return true;
    }
    if (adapter.id && hasExtension(adapter.id)) {
        return true;
    }
    if (adapter.name === 'Cursor') {
        return !!workspaceRoot && hasCursorMarker(workspaceRoot);
    }
    if (adapter.name === 'Antigravity') {
        return !!workspaceRoot && fs.existsSync(path.join(workspaceRoot, '.agent'));
    }
    return false;
}
/**
 * Checks if ZippyMesh LLM Router is running locally.
 *
 * "Healthy" requires more than a 200 OK on the port — many unrelated services
 * happen to listen on the same port and answer HEAD with 200. We require the
 * `/health` (or `/api/health`) endpoint to either return JSON identifying the
 * service or send an `x-zippymesh` / `server: zippymesh` header.
 *
 * @param baseUrl - Base URL to check (default: http://localhost:20128)
 * @returns Promise resolving to health status object
 */
async function checkZippyMeshHealth(baseUrl = 'http://localhost:20128') {
    const healthEndpoints = [`${baseUrl}/health`, `${baseUrl}/api/health`];
    for (const url of healthEndpoints) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 2000);
            const res = await fetch(url, { signal: controller.signal, method: 'GET' });
            clearTimeout(timeout);
            if (!res.ok) {
                continue;
            }
            // Require either a recognizable header or a JSON body that names ZippyMesh.
            const headerHit = /zippymesh/i.test(res.headers.get('server') || '') ||
                res.headers.has('x-zippymesh') ||
                res.headers.has('x-zippymesh-version');
            let bodyHit = false;
            const ctype = res.headers.get('content-type') || '';
            if (ctype.includes('application/json')) {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const body = await res.json();
                    const text = JSON.stringify(body || '').toLowerCase();
                    bodyHit = text.includes('zippymesh') || text.includes('zmlr');
                }
                catch {
                    // ignore parse error
                }
            }
            if (headerHit || bodyHit) {
                return {
                    name: 'ZippyMesh LLM Router',
                    status: 'healthy',
                    details: `Running at ${baseUrl}`
                };
            }
            // Reachable but doesn't identify as ZippyMesh — degraded.
            return {
                name: 'ZippyMesh LLM Router',
                status: 'warning',
                details: `Service responded at ${url} but did not identify as ZippyMesh`
            };
        }
        catch {
            // Try next endpoint
        }
    }
    return {
        name: 'ZippyMesh LLM Router',
        status: 'warning',
        details: 'Optional router not detected at localhost:20128'
    };
}
/**
 * Generates nonce for CSP using cryptographically secure random bytes
 * @param length - Length of nonce (default 32)
 * @returns Random nonce string
 */
function generateNonce(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = require('crypto').randomBytes(length);
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(bytes[i] % chars.length);
    }
    return result;
}
/**
 * Determines if a notification should be shown based on notification level setting
 * @param notificationLevel - Current notification level setting
 * @param messageLevel - Level of the message to show
 * @returns true if notification should be shown
 */
function shouldShowNotification(notificationLevel, messageLevel) {
    switch (notificationLevel) {
        case 'none':
            return false;
        case 'errors':
            return messageLevel === 'error';
        case 'warnings':
            return messageLevel === 'error' || messageLevel === 'warning';
        case 'all':
        default:
            return true;
    }
}
/**
 * Gets today's date in YYYY-MM-DD format
 * @returns Today's date string
 */
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}
/**
 * Constructs the path to the .autoclaw/kdream directory for a workspace
 * @param workspaceRoot - Root path of the workspace
 * @returns Path to .autoclaw/kdream directory
 */
function getKdreamDirPath(workspaceRoot) {
    return path.join(workspaceRoot, '.autoclaw', 'kdream');
}
/**
 * Constructs the path to MEMORY.md for a workspace
 * @param workspaceRoot - Root path of the workspace
 * @returns Path to MEMORY.md
 */
function getMemoryPath(workspaceRoot) {
    return path.join(workspaceRoot, '.autoclaw', 'kdream', 'memory', 'MEMORY.md');
}
/**
 * Constructs the path to state.json for a workspace
 * @param workspaceRoot - Root path of the workspace
 * @returns Path to state.json
 */
function getStatePath(workspaceRoot) {
    return path.join(workspaceRoot, '.autoclaw', 'kdream', 'state.json');
}
/**
 * Constructs the path to today's log file for a workspace
 * @param workspaceRoot - Root path of the workspace
 * @returns Path to today's log file
 */
function getTodayLogPath(workspaceRoot) {
    const today = getTodayDate();
    return path.join(workspaceRoot, '.autoclaw', 'kdream', 'logs', `${today}.md`);
}
//# sourceMappingURL=kdream-helpers.js.map