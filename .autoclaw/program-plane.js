"use strict";
/**
 * program-plane.ts — Cross-repo program registry (Phase 4).
 *
 * Manages `~/.autoclaw/programs/<program_id>/registry.json` and the
 * per-workspace backref `<repo>/.autoclaw/program-link.json`.
 *
 * Design: vscode-free so this module is fully unit-testable with plain Node.
 * The extension passes `homedir` and workspace paths in; this module does
 * only pure FS I/O.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.programsRoot = programsRoot;
exports.programDir = programDir;
exports.registryPath = registryPath;
exports.linkPath = linkPath;
exports.listPrograms = listPrograms;
exports.readRegistry = readRegistry;
exports.readProgramLink = readProgramLink;
exports.createProgram = createProgram;
exports.joinProgram = joinProgram;
exports.leaveProgram = leaveProgram;
exports.touchParticipant = touchParticipant;
exports.fanInCommsLog = fanInCommsLog;
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const fsPromises = fs.promises;
// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------
function programsRoot(homeDir) {
    return path.join(homeDir, '.autoclaw', 'programs');
}
function programDir(homeDir, programId) {
    return path.join(programsRoot(homeDir), programId);
}
function registryPath(homeDir, programId) {
    return path.join(programDir(homeDir, programId), 'registry.json');
}
function linkPath(repoPath) {
    return path.join(repoPath, '.autoclaw', 'program-link.json');
}
// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------
async function listPrograms(homeDir) {
    const root = programsRoot(homeDir);
    try {
        const entries = await fsPromises.readdir(root, { withFileTypes: true });
        const registries = [];
        for (const e of entries) {
            if (!e.isDirectory()) {
                continue;
            }
            try {
                const reg = await readRegistry(homeDir, e.name);
                registries.push(reg);
            }
            catch { /* skip malformed */ }
        }
        return registries.sort((a, b) => a.program_name.localeCompare(b.program_name));
    }
    catch {
        return [];
    }
}
async function readRegistry(homeDir, programId) {
    const p = registryPath(homeDir, programId);
    const raw = await fsPromises.readFile(p, 'utf8');
    return JSON.parse(raw.replace(/^﻿/, ''));
}
async function readProgramLink(repoPath) {
    try {
        const raw = await fsPromises.readFile(linkPath(repoPath), 'utf8');
        return JSON.parse(raw.replace(/^﻿/, ''));
    }
    catch {
        return null;
    }
}
// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------
async function writeRegistry(reg, homeDir) {
    const dir = programDir(homeDir, reg.program_id);
    await fsPromises.mkdir(dir, { recursive: true });
    reg.updated_at = new Date().toISOString();
    await fsPromises.writeFile(registryPath(homeDir, reg.program_id), JSON.stringify(reg, null, 2), 'utf8');
}
async function writeProgramLink(repoPath, link) {
    const dir = path.join(repoPath, '.autoclaw');
    await fsPromises.mkdir(dir, { recursive: true });
    await fsPromises.writeFile(linkPath(repoPath), JSON.stringify(link, null, 2), 'utf8');
}
async function createProgram(opts) {
    const now = new Date().toISOString();
    const programId = `prog_${now.slice(0, 10)}_${crypto.randomBytes(4).toString('hex')}`;
    const reg = {
        schema_version: '1.0',
        program_id: programId,
        program_name: opts.programName,
        created_at: now,
        updated_at: now,
        bus_driver: opts.busDriver ?? 'fs',
        participants: [],
        ...(opts.kgDaemonUrl ? { kg_daemon_url: opts.kgDaemonUrl } : {}),
        ...(opts.notes ? { notes: opts.notes } : {}),
    };
    await writeRegistry(reg, opts.homeDir);
    return reg;
}
async function joinProgram(opts) {
    const reg = await readRegistry(opts.homeDir, opts.programId);
    const now = new Date().toISOString();
    const existing = reg.participants.findIndex(p => p.repo_path === opts.repoPath);
    if (existing >= 0) {
        reg.participants[existing].last_seen = now;
        reg.participants[existing].role = opts.role ?? reg.participants[existing].role;
    }
    else {
        reg.participants.push({
            repo_path: opts.repoPath,
            role: opts.role ?? 'orchestrator',
            linked_at: now,
            last_seen: now,
        });
    }
    await writeRegistry(reg, opts.homeDir);
    await writeProgramLink(opts.repoPath, {
        program_id: opts.programId,
        registry_path: programDir(opts.homeDir, opts.programId),
    });
    return reg;
}
async function leaveProgram(repoPath, homeDir) {
    const link = await readProgramLink(repoPath);
    if (!link) {
        return;
    }
    try {
        const reg = await readRegistry(homeDir, link.program_id);
        reg.participants = reg.participants.filter(p => p.repo_path !== repoPath);
        await writeRegistry(reg, homeDir);
    }
    catch { /* registry already gone — still remove link */ }
    await fsPromises.unlink(linkPath(repoPath)).catch(() => { });
}
/** Update last_seen timestamp for this repo in its linked program. */
async function touchParticipant(repoPath, homeDir) {
    const link = await readProgramLink(repoPath);
    if (!link) {
        return;
    }
    try {
        const reg = await readRegistry(homeDir, link.program_id);
        const p = reg.participants.find(q => q.repo_path === repoPath);
        if (p) {
            p.last_seen = new Date().toISOString();
            await writeRegistry(reg, homeDir);
        }
    }
    catch { /* swallow — program registry may be on an unmounted drive */ }
}
// ---------------------------------------------------------------------------
// Fan-in comms-log (lightweight — no daemon, runs in reconcile tick)
// ---------------------------------------------------------------------------
/**
 * Merge comms-log entries from all participants into
 * `<program_root>/comms-log.jsonl`. Tracks per-repo byte offsets in
 * `<program_root>/.fan-in-state.json` for crash-safe, no-duplicate merges.
 *
 * Returns the number of new lines appended across all repos.
 */
async function fanInCommsLog(programId, homeDir) {
    const dir = programDir(homeDir, programId);
    let reg;
    try {
        reg = await readRegistry(homeDir, programId);
    }
    catch {
        return 0;
    }
    const stateFile = path.join(dir, '.fan-in-state.json');
    let offsets = {};
    try {
        const raw = await fsPromises.readFile(stateFile, 'utf8');
        offsets = JSON.parse(raw);
    }
    catch { /* first run */ }
    const outPath = path.join(dir, 'comms-log.jsonl');
    let appended = 0;
    for (const participant of reg.participants) {
        const srcLog = path.join(participant.repo_path, '.autoclaw', 'orchestrator', 'comms-log.jsonl');
        const offset = offsets[participant.repo_path] ?? 0;
        try {
            const fd = await fsPromises.open(srcLog, 'r');
            const stat = await fd.stat();
            if (stat.size <= offset) {
                await fd.close();
                continue;
            }
            const buf = Buffer.alloc(stat.size - offset);
            const { bytesRead } = await fd.read(buf, 0, buf.length, offset);
            await fd.close();
            if (bytesRead === 0) {
                continue;
            }
            const lines = buf.slice(0, bytesRead).toString('utf8').split('\n').filter(Boolean);
            const tagged = lines.map(line => {
                try {
                    const entry = JSON.parse(line);
                    return JSON.stringify({ ...entry, _repo: participant.repo_path });
                }
                catch {
                    return JSON.stringify({ _repo: participant.repo_path, _raw: line });
                }
            });
            if (tagged.length > 0) {
                await fsPromises.appendFile(outPath, tagged.join('\n') + '\n', 'utf8');
                appended += tagged.length;
            }
            offsets[participant.repo_path] = offset + bytesRead;
        }
        catch { /* repo log absent or inaccessible — skip */ }
    }
    await fsPromises.writeFile(stateFile, JSON.stringify(offsets, null, 2), 'utf8').catch(() => { });
    return appended;
}
//# sourceMappingURL=program-plane.js.map