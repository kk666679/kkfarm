"use strict";
/**
 * comms.ts — Cross-agent communication engine.
 *
 * Manages the filesystem-based mailbox protocol:
 *   - Message creation, delivery, and reading
 *   - Comms log (append-only JSONL)
 *   - Heartbeat protocol
 *   - Agent registry
 *   - Message retention/cleanup
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OVERLOAD_ERROR_RATE = exports.OVERLOAD_QUEUE_DEPTH = void 0;
exports.detectAutoclawHostAgent = detectAutoclawHostAgent;
exports.generateMessageId = generateMessageId;
exports.sendMessage = sendMessage;
exports.readInbox = readInbox;
exports.readSharedInbox = readSharedInbox;
exports.appendCommsLog = appendCommsLog;
exports.readCommsLog = readCommsLog;
exports.writeHeartbeat = writeHeartbeat;
exports.readHeartbeat = readHeartbeat;
exports.readAllHeartbeats = readAllHeartbeats;
exports.agentStatusFromHeartbeat = agentStatusFromHeartbeat;
exports.redactErrorMessage = redactErrorMessage;
exports.readClaimAuthor = readClaimAuthor;
exports.readRegistry = readRegistry;
exports.writeRegistry = writeRegistry;
exports.getAgentStatuses = getAgentStatuses;
exports.readMessageState = readMessageState;
exports.markMessageRead = markMessageRead;
exports.markMessageReplied = markMessageReplied;
exports.markMessageArchived = markMessageArchived;
exports.getInboxSummary = getInboxSummary;
exports.cleanupOldMessages = cleanupOldMessages;
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const fsPromises = fs.promises;
// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
/** Heartbeat queue_depth at or above which a fresh agent is treated as overloaded. */
exports.OVERLOAD_QUEUE_DEPTH = 10;
/** Heartbeat error_rate_1m at or above which a fresh agent is treated as overloaded. */
exports.OVERLOAD_ERROR_RATE = 0.5;
/**
 * Identify which agent (if any) corresponds to the host VS Code variant.
 * Used by the heartbeat daemon to decide whose heartbeat may carry the host's
 * sessionId — peer agents own their own session_id and the host must NOT
 * stamp them. Pure (no vscode import) so tests can call it directly.
 */
function detectAutoclawHostAgent(appName) {
    if (/antigravity/i.test(appName)) {
        return 'antigravity';
    }
    if (/kiro/i.test(appName)) {
        return 'kiro';
    }
    if (/cursor/i.test(appName)) {
        return 'cursor';
    }
    if (/windsurf/i.test(appName)) {
        return 'windsurf';
    }
    // VS Code stock + Claude Code variants → claude-code is the canonical host agent.
    return 'claude-code';
}
function generateMessageId() {
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const rand = crypto.randomBytes(4).toString('hex');
    return `msg-${ts}-${rand}`;
}
function messageFilename(msg) {
    const ts = msg.timestamp.replace(/[:.]/g, '-');
    return `${ts}-${msg.type}-${msg.from}-${msg.id.slice(-8)}.json`;
}
async function sendMessage(commsDir, msg) {
    if (!msg.id) {
        msg.id = generateMessageId();
    }
    if (!msg.timestamp) {
        msg.timestamp = new Date().toISOString();
    }
    const inboxDir = path.join(commsDir, 'inboxes', path.basename(msg.to));
    await fsPromises.mkdir(inboxDir, { recursive: true });
    const filename = messageFilename(msg);
    const filePath = path.join(inboxDir, filename);
    await fsPromises.writeFile(filePath, JSON.stringify(msg, null, 2), 'utf8');
    await appendCommsLog(commsDir, {
        timestamp: msg.timestamp, type: msg.type, from: msg.from, to: msg.to,
        message_id: msg.id, task_id: msg.task_id, sprint: msg.sprint,
        message: `${msg.from} → ${msg.to}: ${msg.type}${msg.task_id ? ` (${msg.task_id})` : ''}`,
    });
    return filePath;
}
async function readInbox(commsDir, agentId) {
    const inboxDir = path.join(commsDir, 'inboxes', agentId);
    try {
        const files = await fsPromises.readdir(inboxDir);
        const messages = [];
        for (const file of files.filter(f => f.endsWith('.json'))) {
            try {
                const content = await fsPromises.readFile(path.join(inboxDir, file), 'utf8');
                messages.push(JSON.parse(content.replace(/^﻿/, '')));
            }
            catch { /* skip malformed */ }
        }
        return messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }
    catch {
        return [];
    }
}
async function readSharedInbox(commsDir) {
    return readInbox(commsDir, 'shared');
}
async function appendCommsLog(commsDir, entry) {
    const logPath = path.join(commsDir, 'comms-log.jsonl');
    await fsPromises.appendFile(logPath, JSON.stringify(entry) + '\n', 'utf8');
}
async function readCommsLog(commsDir, options) {
    const logPath = path.join(commsDir, 'comms-log.jsonl');
    try {
        const content = await fsPromises.readFile(logPath, 'utf8');
        let entries = content.trim().split('\n').filter(l => l.length > 0)
            .map(line => { try {
            return JSON.parse(line);
        }
        catch {
            return null;
        } })
            .filter((e) => e !== null);
        if (options?.since) {
            const t = new Date(options.since).getTime();
            entries = entries.filter(e => new Date(e.timestamp).getTime() >= t);
        }
        if (options?.limit) {
            entries = entries.slice(-options.limit);
        }
        return entries;
    }
    catch {
        return [];
    }
}
async function writeHeartbeat(commsDir, hb) {
    const dir = path.join(commsDir, 'heartbeats');
    await fsPromises.mkdir(dir, { recursive: true });
    await fsPromises.writeFile(path.join(dir, `${path.basename(hb.agent_id)}.json`), JSON.stringify(hb, null, 2), 'utf8');
}
async function readHeartbeat(commsDir, agentId) {
    try {
        const content = await fsPromises.readFile(path.join(commsDir, 'heartbeats', `${path.basename(agentId)}.json`), 'utf8');
        return JSON.parse(content.replace(/^﻿/, ''));
    }
    catch {
        return null;
    }
}
async function readAllHeartbeats(commsDir) {
    try {
        const dir = path.join(commsDir, 'heartbeats');
        const files = await fsPromises.readdir(dir);
        const hbs = [];
        for (const f of files.filter(f => f.endsWith('.json'))) {
            try {
                hbs.push(JSON.parse((await fsPromises.readFile(path.join(dir, f), 'utf8')).replace(/^﻿/, '')));
            }
            catch { /* skip */ }
        }
        return hbs;
    }
    catch {
        return [];
    }
}
function agentStatusFromHeartbeat(hb, now = Date.now()) {
    if (!hb) {
        return 'offline';
    }
    const age = now - new Date(hb.timestamp).getTime();
    if (age < 2 * 60 * 1000) {
        // Stage B (v2): even a fresh heartbeat can be flagged 'overloaded' when
        // the agent is signaling distress via queue_depth or error_rate_1m.
        if ((typeof hb.queue_depth === 'number' && hb.queue_depth >= exports.OVERLOAD_QUEUE_DEPTH) ||
            (typeof hb.error_rate_1m === 'number' && hb.error_rate_1m >= exports.OVERLOAD_ERROR_RATE)) {
            return 'overloaded';
        }
        return 'active';
    }
    if (age < 5 * 60 * 1000) {
        return 'idle';
    }
    // Agent has an active sprint assignment but hasn't checked in for >5 min → stalled.
    if (hb.sprint !== null && age < 24 * 60 * 60 * 1000) {
        return 'stalled';
    }
    return 'offline';
}
/** Redact a heartbeat last_error.message for safe local persistence:
 *  truncates to 500 chars, strips ANSI escapes, replaces $HOME and obvious tokens. */
function redactErrorMessage(s) {
    if (typeof s !== 'string') {
        return '';
    }
    let out = s;
    // Strip ANSI escape sequences (CSI SGR).
    out = out.replace(/\x1b\[[0-9;]*m/g, '');
    // Replace user's home directory with $HOME.
    const home = process.env.USERPROFILE || process.env.HOME;
    if (home && home.length > 0) {
        // Escape regex metacharacters in the home path.
        const escaped = home.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        out = out.replace(new RegExp(escaped, 'g'), '$HOME');
    }
    // Redact obvious token-shaped strings.
    out = out.replace(/(acl_|sk-|ghp_)[A-Za-z0-9]+/g, '<redacted>');
    // Truncate to 500 chars.
    if (out.length > 500) {
        out = out.slice(0, 500);
    }
    return out;
}
/**
 * Read the claiming agent id for a task from `claims/<taskId>.json`.
 *
 * Used by the consensus gate to feed `evaluateConsensus(..., { author_agent_id })`
 * so an author's self-vote is excluded (verifier independence). Tolerates a
 * missing file, a leading BOM, or malformed JSON — all return `undefined`, in
 * which case consensus is unchanged (backward-compatible).
 *
 * The canonical claim field is `claimed_by` (written by the claim MCP tool);
 * `agent` is accepted as a legacy fallback (cf. boardWriter's claim reader).
 */
async function readClaimAuthor(commsDir, taskId) {
    try {
        const raw = (await fsPromises.readFile(path.join(commsDir, 'claims', `${path.basename(taskId)}.json`), 'utf8')).replace(/^﻿/, '');
        const claim = JSON.parse(raw);
        return claim.claimed_by ?? claim.agent ?? undefined;
    }
    catch {
        return undefined;
    }
}
async function readRegistry(commsDir) {
    try {
        return JSON.parse((await fsPromises.readFile(path.join(commsDir, 'registry.json'), 'utf8')).replace(/^﻿/, ''));
    }
    catch {
        return null;
    }
}
async function writeRegistry(commsDir, reg) {
    await fsPromises.writeFile(path.join(commsDir, 'registry.json'), JSON.stringify(reg, null, 2), 'utf8');
}
async function getAgentStatuses(commsDir) {
    const reg = await readRegistry(commsDir);
    if (!reg) {
        return [];
    }
    const results = [];
    for (const agent of reg.agents) {
        const hb = await readHeartbeat(commsDir, path.basename(agent.id));
        results.push({ ...agent, live_status: agentStatusFromHeartbeat(hb), heartbeat: hb });
    }
    return results;
}
function stateFilePath(commsDir, agentId, messageId) {
    return path.join(commsDir, 'inboxes', path.basename(agentId), '_state', `${path.basename(messageId)}.json`);
}
async function readStateFile(filePath) {
    try {
        const content = await fsPromises.readFile(filePath, 'utf8');
        return JSON.parse(content.replace(/^﻿/, ''));
    }
    catch {
        return null;
    }
}
async function writeStateFile(filePath, state) {
    await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
    await fsPromises.writeFile(filePath, JSON.stringify(state, null, 2), 'utf8');
}
async function readMessageState(commsDir, agentId, messageId) {
    return readStateFile(stateFilePath(commsDir, agentId, messageId));
}
async function markMessageRead(commsDir, agentId, messageId) {
    const fp = stateFilePath(commsDir, agentId, messageId);
    const existing = await readStateFile(fp);
    if (existing && existing.read_at) {
        return;
    }
    const now = new Date().toISOString();
    await writeStateFile(fp, {
        message_id: messageId,
        read_at: now,
        replied_at: existing?.replied_at ?? null,
        archived_at: existing?.archived_at ?? null,
    });
}
async function markMessageReplied(commsDir, agentId, messageId) {
    const fp = stateFilePath(commsDir, agentId, messageId);
    const existing = await readStateFile(fp);
    const now = new Date().toISOString();
    await writeStateFile(fp, {
        message_id: messageId,
        read_at: existing?.read_at ?? now,
        replied_at: now,
        archived_at: existing?.archived_at ?? null,
    });
}
async function markMessageArchived(commsDir, agentId, messageId) {
    const fp = stateFilePath(commsDir, agentId, messageId);
    const existing = await readStateFile(fp);
    const now = new Date().toISOString();
    await writeStateFile(fp, {
        message_id: messageId,
        read_at: existing?.read_at ?? null,
        replied_at: existing?.replied_at ?? null,
        archived_at: now,
    });
}
/** Returns counts joining inbox messages with their state files. Backwards compatible:
 *  if no state file exists for a given message it counts as unread, and as
 *  awaiting_response when the message itself has requires_response === true. */
async function getInboxSummary(commsDir, agentId) {
    const messages = await readInbox(commsDir, agentId);
    let unread = 0;
    let awaiting_response = 0;
    let archived = 0;
    for (const msg of messages) {
        const state = await readMessageState(commsDir, agentId, msg.id);
        if (!state || !state.read_at) {
            unread++;
        }
        if (state?.archived_at) {
            archived++;
        }
        if (msg.requires_response && (!state || !state.replied_at)) {
            awaiting_response++;
        }
    }
    return { total: messages.length, unread, awaiting_response, archived };
}
async function cleanupOldMessages(commsDir, retentionDays = 7) {
    const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    let cleaned = 0;
    try {
        const agents = await fsPromises.readdir(path.join(commsDir, 'inboxes'));
        for (const agent of agents) {
            const dir = path.join(commsDir, 'inboxes', agent);
            const stat = await fsPromises.stat(dir);
            if (!stat.isDirectory()) {
                continue;
            }
            for (const file of (await fsPromises.readdir(dir)).filter(f => f.endsWith('.json'))) {
                try {
                    const s = await fsPromises.stat(path.join(dir, file));
                    if (s.mtimeMs < cutoff) {
                        await fsPromises.unlink(path.join(dir, file));
                        cleaned++;
                    }
                }
                catch { /* skip */ }
            }
        }
    }
    catch { /* no inboxes */ }
    return cleaned;
}
//# sourceMappingURL=comms.js.map