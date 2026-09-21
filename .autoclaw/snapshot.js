"use strict";
/**
 * AutoClaw Snapshot — Health Snapshot Export
 *
 * Builds a single Markdown report combining the doctor output with a snapshot
 * of `state.json`, the tail of today's log, and currently open `- [ ]`
 * follow-ups from MEMORY.md. Pure logic; no `vscode` import — uses the same
 * `DoctorVscodeShim` dependency-injection seam as `runDoctor` so it can be
 * unit-tested under plain Mocha.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.readAutoclawVersion = readAutoclawVersion;
exports.extractOpenFollowups = extractOpenFollowups;
exports.tailLines = tailLines;
exports.buildSnapshot = buildSnapshot;
const fs = require("fs");
const path = require("path");
const doctor_1 = require("./doctor");
const kdream_helpers_1 = require("./kdream-helpers");
const LOG_TAIL_LINES = 30;
function safeReadFile(p) {
    try {
        return fs.readFileSync(p, 'utf8');
    }
    catch {
        return null;
    }
}
/**
 * Read the AutoClaw extension version from `package.json`. Returns 'unknown'
 * if the file is missing or malformed — never throws.
 */
function readAutoclawVersion(extensionPath) {
    const pkgPath = path.join(extensionPath, 'package.json');
    const raw = safeReadFile(pkgPath);
    if (raw === null) {
        return 'unknown';
    }
    try {
        const parsed = JSON.parse(raw);
        return typeof parsed.version === 'string' ? parsed.version : 'unknown';
    }
    catch {
        return 'unknown';
    }
}
/**
 * Extract the `- [ ] …` follow-up lines (open items only) from MEMORY.md
 * content. Returns each line trimmed of leading whitespace, original ordering
 * preserved.
 */
function extractOpenFollowups(memoryContent) {
    const out = [];
    for (const rawLine of memoryContent.split(/\r?\n/)) {
        if (/^\s*-\s*\[\s\]/.test(rawLine)) {
            out.push(rawLine.replace(/^\s+/, ''));
        }
    }
    return out;
}
/**
 * Return the last N lines of `content`, ignoring trailing blank lines so the
 * tail is meaningful even when the file ends with a newline.
 */
function tailLines(content, n) {
    const lines = content.split(/\r?\n/);
    // Drop trailing empty lines.
    while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
        lines.pop();
    }
    if (lines.length <= n) {
        return lines;
    }
    return lines.slice(lines.length - n);
}
/**
 * Build the full Markdown snapshot string. Composes the rendered doctor
 * report and appends sections for state.json, today's log tail, and open
 * follow-ups.
 *
 * Read-only: never mutates anything under `.autoclaw/`.
 */
async function buildSnapshot(workspaceRoot, extensionPath, shim) {
    // Run doctor against the same shim — caller is expected to pass the same
    // synthetic shim it uses for `autoclaw.doctor`.
    const effectiveShim = { ...shim, workspaceRoot: shim.workspaceRoot ?? workspaceRoot };
    const report = await (0, doctor_1.runDoctor)(extensionPath, effectiveShim);
    const doctorMd = (0, doctor_1.renderReport)(report);
    const today = (0, kdream_helpers_1.getTodayDate)();
    const version = readAutoclawVersion(extensionPath);
    const out = [];
    out.push('# AutoClaw Health Snapshot');
    out.push('');
    out.push(`- Date:    ${today}`);
    out.push(`- Version: ${version}`);
    out.push(`- Workspace: ${workspaceRoot.replace(/\\/g, '/')}`);
    out.push('');
    out.push('---');
    out.push('');
    out.push('## Doctor Report');
    out.push('');
    out.push(doctorMd.trimEnd());
    out.push('');
    out.push('---');
    out.push('');
    // KDream state.json
    out.push('## KDream state.json');
    out.push('');
    const statePath = (0, kdream_helpers_1.getStatePath)(workspaceRoot);
    const stateRaw = safeReadFile(statePath);
    if (stateRaw === null) {
        out.push('_not initialised — `.autoclaw/kdream/state.json` not present_');
    }
    else {
        let pretty = stateRaw;
        try {
            pretty = JSON.stringify(JSON.parse(stateRaw), null, 2);
        }
        catch {
            // Leave the raw content; will be wrapped in a fence below.
        }
        out.push('```json');
        out.push(pretty.trimEnd());
        out.push('```');
    }
    out.push('');
    // Today's log tail
    out.push(`## Recent Log (last ${LOG_TAIL_LINES} lines of ${today}.md)`);
    out.push('');
    const logPath = (0, kdream_helpers_1.getTodayLogPath)(workspaceRoot);
    const logRaw = safeReadFile(logPath);
    if (logRaw === null) {
        out.push("_no log for today — `.autoclaw/kdream/logs/<today>.md` not present_");
    }
    else {
        const tail = tailLines(logRaw, LOG_TAIL_LINES);
        if (tail.length === 0) {
            out.push('_log file present but empty_');
        }
        else {
            out.push('```');
            for (const line of tail) {
                out.push(line);
            }
            out.push('```');
        }
    }
    out.push('');
    // Open follow-ups from MEMORY.md
    out.push('## Open Follow-ups (from MEMORY.md)');
    out.push('');
    const memPath = (0, kdream_helpers_1.getMemoryPath)(workspaceRoot);
    const memRaw = safeReadFile(memPath);
    if (memRaw === null) {
        out.push('_MEMORY.md not present — KDream not initialised in this workspace_');
    }
    else {
        const openFollowups = extractOpenFollowups(memRaw);
        if (openFollowups.length === 0) {
            out.push('_no open follow-ups_');
        }
        else {
            for (const line of openFollowups) {
                out.push(line);
            }
        }
    }
    out.push('');
    return out.join('\n');
}
//# sourceMappingURL=snapshot.js.map