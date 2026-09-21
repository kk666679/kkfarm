"use strict";
/**
 * invites.ts — Join tokens for inviting an outside agent onto a project (FF-2).
 *
 * An invite is a single-use, scoped, TTL'd token a human (or an orchestrator)
 * issues so a specific outside agent — from OpenClaw, Hermes, another chat
 * session, or another IDE — can JOIN this project bounded by construction. The
 * token carries the path scope it's allowed (a lease seed), a trust ceiling
 * (default off — the agent arrives non-acting), and the admit policy that
 * governs whether consuming it auto-admits the agent or drops it in the
 * pending tray for a human.
 *
 * This module is pure of vscode and touches fs only for the invite files. It
 * mirrors beacons.ts: two homes (machine-global + workspace), `now` injectable
 * for tests, deny-by-default on anything malformed.
 *
 * See docs/ideas/FLEET-FEDERATION-SELF-HEALING.md §2 (invite) + §8 (admit policy).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.INVITE_TTL_MS = void 0;
exports.machineInviteDir = machineInviteDir;
exports.workspaceInviteDir = workspaceInviteDir;
exports.isValidInvite = isValidInvite;
exports.isExpired = isExpired;
exports.createInvite = createInvite;
exports.writeInvite = writeInvite;
exports.readInvite = readInvite;
exports.listInvites = listInvites;
exports.consumeInvite = consumeInvite;
exports.consumeInviteEverywhere = consumeInviteEverywhere;
exports.revokeInvite = revokeInvite;
exports.admitDecision = admitDecision;
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const fsp = fs.promises;
/** Default invite lifetime — 24 hours. */
exports.INVITE_TTL_MS = 24 * 60 * 60000;
// ---------------------------------------------------------------------------
// Path helpers (mirror beacons.ts)
// ---------------------------------------------------------------------------
/** The machine-global invite directory (`~/.autoclaw/invites`). */
function machineInviteDir(homeDir = os.homedir()) {
    return path.join(homeDir, '.autoclaw', 'invites');
}
/** A workspace's invite directory (under the comms tree). */
function workspaceInviteDir(commsDir) {
    return path.join(commsDir, 'invites');
}
/** Resolve the directory an op should target, mirroring writeBeacon's opts. */
function resolveDir(opts) {
    return opts.scope === 'workspace' && opts.commsDir
        ? workspaceInviteDir(opts.commsDir)
        : machineInviteDir(opts.homeDir);
}
/** Sanitize a token for use as a filename. */
function safeToken(t) {
    return t.replace(/[^A-Za-z0-9_-]/g, '_');
}
// ---------------------------------------------------------------------------
// Validate / normalize
// ---------------------------------------------------------------------------
/** True if `v` has the minimum fields to be a usable invite. */
function isValidInvite(v) {
    if (!v || typeof v !== 'object') {
        return false;
    }
    const o = v;
    return typeof o.token === 'string' && o.token.length > 0
        && typeof o.project === 'string'
        && typeof o.expires === 'string' && o.expires.length > 0;
}
/** True if `inv` is past its TTL relative to `now`. */
function isExpired(inv, now) {
    const t = new Date(inv.expires).getTime();
    return !Number.isFinite(t) || now > t;
}
/**
 * Create + persist a new invite. Returns the written Invite. The token is
 * random unless `input.token` is supplied (tests). `now` is injectable.
 */
async function createInvite(input, opts = {}) {
    const now = opts.now ?? Date.now();
    const ttl = input.ttlMs ?? exports.INVITE_TTL_MS;
    const token = input.token ?? `join-${crypto.randomBytes(9).toString('hex')}`;
    const invite = {
        token,
        issued_by: input.issued_by,
        project: input.project,
        ...(input.workspace ? { workspace: input.workspace } : {}),
        ...(input.sprint ? { sprint: input.sprint } : {}),
        ...(input.suggested_role ? { suggested_role: input.suggested_role } : {}),
        ...(input.suggested_agent_type ? { suggested_agent_type: input.suggested_agent_type } : {}),
        ...(input.scope && input.scope.length ? { scope: input.scope } : {}),
        ...(input.transports && input.transports.length ? { transports: input.transports } : {}),
        trust: input.trust ?? 'off',
        admit_policy: input.admit_policy ?? 'auto-preapproved',
        ...(input.preapproved_types && input.preapproved_types.length
            ? { preapproved_types: input.preapproved_types }
            : {}),
        issued_at: new Date(now).toISOString(),
        expires: new Date(now + ttl).toISOString(),
        consumed_by: null,
    };
    await writeInvite(invite, opts);
    return invite;
}
/** Persist an invite to the resolved invite home. Useful for mirroring one token. */
async function writeInvite(invite, opts = {}) {
    const dir = resolveDir(opts);
    await fsp.mkdir(dir, { recursive: true });
    const file = path.join(dir, `${safeToken(invite.token)}.json`);
    await fsp.writeFile(file, JSON.stringify(invite, null, 2) + '\n', 'utf8');
    return file;
}
// ---------------------------------------------------------------------------
// Read / list
// ---------------------------------------------------------------------------
/** Read one invite by token. Returns null if missing or malformed. */
async function readInvite(token, opts = {}) {
    const dir = resolveDir(opts);
    try {
        const raw = await fsp.readFile(path.join(dir, `${safeToken(token)}.json`), 'utf8');
        const parsed = JSON.parse(raw.replace(/^﻿/, ''));
        return isValidInvite(parsed) ? parsed : null;
    }
    catch {
        return null;
    }
}
/** List every invite in the resolved directory. Malformed files are skipped. */
async function listInvites(opts = {}) {
    const dir = resolveDir(opts);
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
            const parsed = JSON.parse(raw.replace(/^﻿/, ''));
            if (isValidInvite(parsed)) {
                out.push(parsed);
            }
        }
        catch {
            /* skip malformed */
        }
    }
    return out;
}
/**
 * Consume an invite for a joining agent. Single-use: stamps `consumed_by` and
 * writes it back. Fails if the token is unknown, expired, or already consumed.
 * `now` is injectable.
 */
async function consumeInvite(token, consumer, opts = {}) {
    const now = opts.now ?? Date.now();
    const inv = await readInvite(token, opts);
    if (!inv) {
        return { ok: false, reason: 'not_found' };
    }
    if (inv.consumed_by) {
        return { ok: false, reason: 'already_consumed' };
    }
    if (isExpired(inv, now)) {
        return { ok: false, reason: 'expired' };
    }
    inv.consumed_by = {
        agent_id: consumer.agent_id,
        ...(consumer.session_id ? { session_id: consumer.session_id } : {}),
        at: new Date(now).toISOString(),
    };
    const dir = resolveDir(opts);
    await fsp.writeFile(path.join(dir, `${safeToken(token)}.json`), JSON.stringify(inv, null, 2) + '\n', 'utf8');
    return { ok: true, invite: inv };
}
/** Read invite copies from both workspace and machine homes. */
async function readInviteCopies(token, opts = {}) {
    const homes = [];
    if (opts.commsDir) {
        homes.push({ scope: 'workspace', commsDir: opts.commsDir, homeDir: opts.homeDir });
    }
    homes.push({ scope: 'machine', homeDir: opts.homeDir });
    const copies = [];
    const seen = new Set();
    for (const home of homes) {
        const dir = resolveDir(home);
        const key = path.join(dir, `${safeToken(token)}.json`);
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        const inv = await readInvite(token, home);
        if (inv) {
            copies.push({ invite: inv, opts: home });
        }
    }
    return copies;
}
/**
 * Consume an invite across the workspace and machine homes as one logical token.
 * If the same token was mirrored into both places, every unconsumed copy is
 * stamped in the same call so a later consumer cannot reuse the other copy.
 */
async function consumeInviteEverywhere(token, consumer, opts = {}) {
    const now = opts.now ?? Date.now();
    const copies = await readInviteCopies(token, opts);
    if (copies.length === 0) {
        return { ok: false, reason: 'not_found' };
    }
    if (copies.some(c => c.invite.consumed_by)) {
        return { ok: false, reason: 'already_consumed' };
    }
    if (copies.every(c => isExpired(c.invite, now))) {
        return { ok: false, reason: 'expired' };
    }
    const selected = copies.find(c => !isExpired(c.invite, now)).invite;
    const consumed = {
        ...selected,
        consumed_by: {
            agent_id: consumer.agent_id,
            ...(consumer.session_id ? { session_id: consumer.session_id } : {}),
            at: new Date(now).toISOString(),
        },
    };
    for (const copy of copies) {
        await writeInvite({ ...copy.invite, consumed_by: consumed.consumed_by }, copy.opts);
    }
    return { ok: true, invite: consumed };
}
/** Revoke (delete) an invite. Returns true if a file was removed. */
async function revokeInvite(token, opts = {}) {
    const dir = resolveDir(opts);
    try {
        await fsp.unlink(path.join(dir, `${safeToken(token)}.json`));
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Decide whether an agent consuming `invite` is auto-admitted. Pure — the panel
 * / orchestrator calls this after a successful consume. `consumerType` is the
 * joining agent's declared `agent_type` (matched against `preapproved_types`).
 *
 *   open             → admit
 *   auto-preapproved → admit iff consumerType ∈ preapproved_types
 *   manual           → never auto (human decides in the tray)
 */
function admitDecision(invite, consumerType) {
    switch (invite.admit_policy) {
        case 'open':
            return { admit: true, reason: 'admit policy is open' };
        case 'auto-preapproved': {
            const list = invite.preapproved_types ?? [];
            if (consumerType && list.includes(consumerType)) {
                return { admit: true, reason: `type "${consumerType}" is pre-approved` };
            }
            return {
                admit: false,
                reason: consumerType
                    ? `type "${consumerType}" not pre-approved — awaiting admit`
                    : 'no agent_type declared — awaiting admit',
            };
        }
        case 'manual':
        default:
            return { admit: false, reason: 'admit policy is manual — awaiting human' };
    }
}
//# sourceMappingURL=invites.js.map