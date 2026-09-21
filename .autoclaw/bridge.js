"use strict";
/**
 * bridge.ts — OpenClaw HTTP bridge for remote agents.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IDE_BRIDGE_PORT_RANGES = exports.DEFAULT_BRIDGE_CONFIG = exports.BRIDGE_PORT_FALLBACK_COUNT = exports.SSE_KEEPALIVE_MS = exports.BridgeEventBus = void 0;
exports.generateToken = generateToken;
exports.readTokens = readTokens;
exports.writeTokens = writeTokens;
exports.createRemoteAgentToken = createRemoteAgentToken;
exports.validateToken = validateToken;
exports.validateRawToken = validateRawToken;
exports.revokeToken = revokeToken;
exports.isLoopbackOrigin = isLoopbackOrigin;
exports.resolveCorsAllowOrigin = resolveCorsAllowOrigin;
exports.createBridgeServer = createBridgeServer;
exports.setWebSocketAttacher = setWebSocketAttacher;
exports.startBridge = startBridge;
exports.stopBridge = stopBridge;
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const comms_1 = require("./comms");
const orchestrate_1 = require("./orchestrate");
const evidence_1 = require("./evidence");
const reputation_1 = require("./reputation");
const kgRecord_1 = require("./intelligence/kgRecord");
const hookEvents_1 = require("./hooks/hookEvents");
const hookBus_1 = require("./hooks/hookBus");
const biscuit_1 = require("./biscuit");
const svid_1 = require("./svid");
const service_1 = require("./intelligence/kg/service");
const intelligence_1 = require("./intelligence");
const contextPack_1 = require("./intelligence/contextPack");
const hybridRetrieval_1 = require("./intelligence/hybridRetrieval");
const invites_1 = require("./fleet/invites");
const fsPromises = fs.promises;
/** Minimal in-memory pub/sub. Per-event subscriber lists; subscribe returns
 *  an unsubscribe function. publish() catches handler errors so one bad
 *  subscriber can't break the others. */
class BridgeEventBus {
    constructor() {
        this.handlers = new Map();
    }
    subscribe(eventType, handler) {
        let set = this.handlers.get(eventType);
        if (!set) {
            set = new Set();
            this.handlers.set(eventType, set);
        }
        set.add(handler);
        return () => { set.delete(handler); };
    }
    publish(eventType, data) {
        const set = this.handlers.get(eventType);
        if (!set) {
            return;
        }
        for (const h of set) {
            try {
                h(data);
            }
            catch (e) {
                console.error(`BridgeEventBus handler error (${eventType}):`, e);
            }
        }
    }
    /** Test/diagnostic helper: number of subscribers for an event type. */
    subscriberCount(eventType) {
        return this.handlers.get(eventType)?.size ?? 0;
    }
}
exports.BridgeEventBus = BridgeEventBus;
function generateToken() { return `acl_${crypto.randomBytes(32).toString('hex')}`; }
async function readTokens(p) {
    try {
        return JSON.parse(await fsPromises.readFile(p, 'utf8'));
    }
    catch {
        return [];
    }
}
async function writeTokens(p, t) {
    await fsPromises.writeFile(p, JSON.stringify(t, null, 2), 'utf8');
}
async function createRemoteAgentToken(tokensPath, agentId, days = 30) {
    const tokens = await readTokens(tokensPath);
    const t = {
        agent_id: agentId, token: generateToken(),
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + days * 86400000).toISOString(),
        scopes: ['message', 'heartbeat', 'consensus', 'status'],
    };
    tokens.push(t);
    await writeTokens(tokensPath, tokens);
    return t;
}
async function validateToken(tokensPath, auth) {
    if (!auth?.startsWith('Bearer ')) {
        return null;
    }
    return validateRawToken(tokensPath, auth.slice(7));
}
/** Validate a raw token string (no "Bearer " prefix). Used for SSE/WS where
 *  the token comes via subprotocol or query param rather than Authorization.
 *
 *  Supports three token formats, tried in order:
 *  1. JWT-SVID (SPIFFE Phase 4) — detected by 3-part JWT shape + spiffe:// sub.
 *  2. Biscuit capability tokens (Phase 4) — base64url envelope with HMAC/WASM.
 *  3. UUID-style bearer tokens stored in tokens.json (existing behaviour).
 */
async function validateRawToken(tokensPath, raw) {
    if (!raw) {
        return null;
    }
    // Try JWT-SVID path (3-part JWT with spiffe:// subject)
    if (raw.split('.').length === 3) {
        const svidResult = await (0, svid_1.verifySvid)(raw).catch(() => ({ ok: false, reason: 'exception' }));
        if (svidResult.ok) {
            const expiresAt = new Date(svidResult.claims.exp * 1000).toISOString();
            return {
                agent_id: svidResult.claims.agent_id,
                token: raw,
                created_at: new Date(svidResult.claims.iat * 1000).toISOString(),
                expires_at: expiresAt,
                scopes: [],
            };
        }
    }
    // Try Biscuit path (dynamic — no WASM required; mock is always available)
    const biscuitResult = await (0, biscuit_1.verifyBiscuitToken)(raw).catch(() => ({ ok: false, reason: 'exception' }));
    if (biscuitResult.ok) {
        return {
            agent_id: biscuitResult.facts.agent_id,
            token: raw,
            created_at: biscuitResult.facts.expires_at, // use expiry as proxy — Biscuit tokens are self-contained
            expires_at: biscuitResult.facts.expires_at,
            scopes: biscuitResult.effective_capabilities,
        };
    }
    // Fall back to bearer token DB lookup
    const tokens = await readTokens(tokensPath);
    const m = tokens.find(t => t.token === raw);
    if (!m || new Date(m.expires_at).getTime() < Date.now()) {
        return null;
    }
    if (m.revoked_at) {
        return null;
    }
    return m;
}
/**
 * Mark a token as revoked by stamping `revoked_at` with the current time.
 * Returns `true` if a matching token was found (and persisted), `false`
 * otherwise. Already-revoked tokens are re-stamped (last-revocation-wins);
 * the operation stays idempotent in the sense that the token remains
 * non-validating either way.
 */
async function revokeToken(tokensPath, tokenValue) {
    if (!tokenValue) {
        return false;
    }
    const tokens = await readTokens(tokensPath);
    const idx = tokens.findIndex(t => t.token === tokenValue);
    if (idx < 0) {
        return false;
    }
    tokens[idx] = { ...tokens[idx], revoked_at: new Date().toISOString() };
    await writeTokens(tokensPath, tokens);
    return true;
}
function readBody(req) {
    return new Promise((resolve, reject) => {
        const c = [];
        req.on('data', (d) => c.push(d));
        req.on('end', () => resolve(Buffer.concat(c).toString('utf8')));
        req.on('error', reject);
    });
}
function json(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}
function err(res, status, msg) {
    json(res, status, { error: { code: status, message: msg } });
}
/**
 * Is `origin` a loopback/localhost browser origin? Such a page is served from
 * the user's own machine and is trusted for the bridge. Anything else must be
 * explicitly allow-listed.
 */
function isLoopbackOrigin(origin) {
    let hostname;
    try {
        hostname = new URL(origin).hostname;
    }
    catch {
        return false;
    }
    // URL keeps IPv6 brackets in `hostname` (e.g. "[::1]") — strip them.
    const h = hostname.replace(/^\[|\]$/g, '').toLowerCase();
    return h === 'localhost' || h === '127.0.0.1' || h === '::1' || h.endsWith('.localhost');
}
/**
 * Decide the `Access-Control-Allow-Origin` value for a request (CP-1.7 item 5).
 *
 * The KG routes (`/api/v1/kg/*`) are UNAUTHENTICATED on loopback, so serving a
 * blanket `Access-Control-Allow-Origin: *` turned any web page in the user's
 * browser into a confused deputy that could read/write the local KG. Instead we
 * reflect the request Origin ONLY when it is loopback/localhost or explicitly
 * allow-listed; a foreign Origin gets `null` ⇒ NO ACAO header ⇒ the browser
 * blocks the cross-origin read (and, because a JSON `POST` is preflighted, the
 * write too). A request with no `Origin` header (curl, server-to-server, remote
 * agents) is not a browser CORS request and also returns `null` — it needs no
 * ACAO and is unaffected.
 */
function resolveCorsAllowOrigin(originHeader, allowedOrigins) {
    if (!originHeader) {
        return null;
    }
    const origin = originHeader.trim();
    if (origin === '') {
        return null;
    }
    if (isLoopbackOrigin(origin)) {
        return origin;
    }
    if (allowedOrigins && allowedOrigins.some(o => o.trim() === origin)) {
        return origin;
    }
    return null;
}
function createBridgeServer(config, opts = {}) {
    const bus = opts.bus ?? new BridgeEventBus();
    const sseClients = opts.sseClients ?? new Set();
    const wsClients = opts.wsClients ?? new Set();
    const server = http.createServer(async (req, res) => {
        const url = new URL(req.url || '/', `http://${req.headers.host}`);
        const method = req.method?.toUpperCase() || 'GET';
        const p = url.pathname;
        // Origin allowlist (replaces the old `Access-Control-Allow-Origin: *`, which
        // let any browser page read/write the unauthenticated KG routes). Reflect the
        // Origin only for loopback/localhost or configured origins; a foreign Origin
        // gets no ACAO so the browser blocks the cross-origin response.
        const corsOrigin = resolveCorsAllowOrigin(req.headers.origin, config.allowedOrigins);
        if (corsOrigin) {
            res.setHeader('Access-Control-Allow-Origin', corsOrigin);
            res.setHeader('Vary', 'Origin');
        }
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        if (method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }
        if (p === '/health' && method === 'GET') {
            return json(res, 200, {
                status: 'ok', version: '2.0.0', port: config.port,
                sse_clients: sseClients.size, ws_clients: wsClients.size,
            });
        }
        if (p === '/api/v1/health' && method === 'GET') {
            return json(res, 200, {
                status: 'ok', version: '2.0.0', port: config.port,
                sse_clients: sseClients.size, ws_clients: wsClients.size,
            });
        }
        // Knowledge Graph routes (KGC-3). The in-process KG is exposed over the
        // bridge under `/api/v1/kg/*`, replacing the old standalone kg-daemon on
        // :9877 — no child process. These routes are UNAUTHENTICATED localhost
        // (the daemon was), so they sit BEFORE the `/api/` bearer-token gate. The
        // KG is resolved per-process (cached) and never throws — a missing SQLite
        // driver yields a degraded handle whose writes no-op and reads return [].
        if (p.startsWith('/api/v1/kg/')) {
            const { kg, caps, embedding, degraded, disabled } = (0, service_1.getKnowledgeGraph)({
                workspaceRoot: config.workspaceRoot ?? process.cwd(),
            });
            const qp = (name) => {
                const v = url.searchParams.get(name);
                return v !== null && v.length > 0 ? v : undefined;
            };
            const qn = (name, fallback) => {
                const v = url.searchParams.get(name);
                if (v === null) {
                    return fallback;
                }
                const n = Number(v);
                return Number.isFinite(n) ? n : fallback;
            };
            try {
                if (p === '/api/v1/kg/health' && method === 'GET') {
                    return json(res, 200, {
                        ok: !degraded && !disabled,
                        sqlite: caps.sqlite, vec: caps.vec, fts: caps.fts,
                        embedding, degraded, disabled,
                    });
                }
                if (p === '/api/v1/kg/thoughts' && method === 'POST') {
                    const raw = await readBody(req);
                    let body;
                    try {
                        body = JSON.parse(raw);
                    }
                    catch {
                        return err(res, 400, 'Invalid JSON');
                    }
                    if (!body || typeof body !== 'object') {
                        return err(res, 400, 'JSON body required');
                    }
                    for (const f of ['project', 'agent', 'kind', 'text']) {
                        if (typeof body[f] !== 'string' || body[f].length === 0) {
                            return err(res, 400, `field '${f}' must be a non-empty string`);
                        }
                    }
                    if (body.embedding !== undefined && !Array.isArray(body.embedding)) {
                        return err(res, 400, "field 'embedding' must be a number[]");
                    }
                    if (body.meta !== undefined && (typeof body.meta !== 'object' || body.meta === null)) {
                        return err(res, 400, "field 'meta' must be an object");
                    }
                    const id = await kg.recordThought({
                        project: body.project,
                        agent: body.agent,
                        kind: body.kind,
                        text: body.text,
                        sprint: typeof body.sprint === 'string' ? body.sprint : undefined,
                        task_id: typeof body.task_id === 'string' ? body.task_id : undefined,
                        embedding: body.embedding,
                        valid_from: typeof body.valid_from === 'string' ? body.valid_from : undefined,
                        valid_to: typeof body.valid_to === 'string' ? body.valid_to : undefined,
                        meta: body.meta,
                    });
                    return json(res, 201, { id });
                }
                if (p === '/api/v1/kg/relations' && method === 'POST') {
                    const raw = await readBody(req);
                    let body;
                    try {
                        body = JSON.parse(raw);
                    }
                    catch {
                        return err(res, 400, 'Invalid JSON');
                    }
                    const { from, kind, to, meta } = (body ?? {});
                    if (typeof from !== 'string' || typeof kind !== 'string' || typeof to !== 'string') {
                        return err(res, 400, "fields 'from', 'kind', 'to' must all be strings");
                    }
                    if (meta !== undefined && (typeof meta !== 'object' || meta === null)) {
                        return err(res, 400, "field 'meta' must be an object");
                    }
                    await kg.recordRelation(from, kind, to, meta);
                    return json(res, 201, { ok: true });
                }
                if (p === '/api/v1/kg/thoughts/search' && method === 'GET') {
                    const q = qp('q');
                    if (!q) {
                        return err(res, 400, "query param 'q' required");
                    }
                    const strategy = qp('strategy');
                    const edgeKindsRaw = qp('graph_edge_kinds');
                    const thoughts = await kg.searchSimilar(q, {
                        k: qn('k', 10),
                        project: qp('project'),
                        agent: qp('agent'),
                        since: qp('since'),
                        at: qp('at'),
                        strategy: (strategy === 'vec' || strategy === 'fts' || strategy === 'multi') ? strategy : undefined,
                        graph_seed: qp('graph_seed'),
                        graph_edge_kinds: edgeKindsRaw
                            ? edgeKindsRaw.split(',').map(s => s.trim()).filter(Boolean)
                            : undefined,
                        graph_depth: qn('graph_depth', 2),
                    });
                    return json(res, 200, { thoughts });
                }
                if (p === '/api/v1/kg/thoughts/traverse' && method === 'GET') {
                    const seed = qp('seed');
                    if (!seed) {
                        return err(res, 400, "query param 'seed' required");
                    }
                    const kindsRaw = qp('kinds');
                    const kinds = kindsRaw ? kindsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
                    const thoughts = await kg.traverseFrom(seed, kinds, qn('depth', 2));
                    return json(res, 200, { thoughts });
                }
                if (p === '/api/v1/kg/thoughts/export' && method === 'GET') {
                    const fmt = (qp('format') ?? 'jsonl');
                    if (fmt !== 'jsonl' && fmt !== 'md') {
                        return err(res, 400, "format must be 'jsonl' or 'md'");
                    }
                    res.writeHead(200, {
                        'Content-Type': fmt === 'jsonl' ? 'application/x-ndjson' : 'text/markdown; charset=utf-8',
                    });
                    try {
                        for await (const chunk of kg.export({ project: qp('project'), format: fmt })) {
                            res.write(chunk);
                        }
                        res.end();
                    }
                    catch (e) {
                        if (!res.headersSent) {
                            return err(res, 500, e.message);
                        }
                        res.end();
                    }
                    return;
                }
                if (p === '/api/v1/kg/thoughts' && method === 'GET') {
                    const agent = qp('agent');
                    const project = qp('project');
                    const since = qp('since');
                    let thoughts;
                    if (agent) {
                        thoughts = await kg.forAgent(agent, { since });
                    }
                    else if (project) {
                        thoughts = await kg.forProject(project, { since });
                    }
                    else if (since) {
                        thoughts = await kg.since(since);
                    }
                    else {
                        return err(res, 400, "one of 'agent', 'project', 'since' required");
                    }
                    return json(res, 200, { thoughts });
                }
            }
            catch (e) {
                console.error('Bridge KG error:', e);
                return err(res, 500, 'Internal server error');
            }
            return err(res, 404, 'Not found');
        }
        if (p.startsWith('/api/')) {
            if (p === '/api/v1/invites/consume' && method === 'POST') {
                const raw = await readBody(req);
                let body;
                try {
                    body = JSON.parse(raw);
                }
                catch {
                    return err(res, 400, 'Invalid JSON');
                }
                const inviteToken = typeof body.token === 'string' ? body.token.trim() : '';
                const agentId = typeof body.agent_id === 'string' ? body.agent_id.trim() : '';
                const sessionId = typeof body.session_id === 'string' ? body.session_id.trim() : '';
                if (!inviteToken) {
                    return err(res, 400, 'Missing token');
                }
                if (!agentId) {
                    return err(res, 400, 'Missing agent_id');
                }
                const consumed = await (0, invites_1.consumeInviteEverywhere)(inviteToken, { agent_id: agentId, ...(sessionId ? { session_id: sessionId } : {}) }, { commsDir: config.commsDir });
                if (!consumed.ok) {
                    const code = consumed.reason === 'not_found' ? 404 : consumed.reason === 'already_consumed' ? 409 : 410;
                    return json(res, code, { ok: false, reason: consumed.reason });
                }
                const bridgeToken = await createRemoteAgentToken(config.tokensPath, agentId);
                await (0, comms_1.appendCommsLog)(config.commsDir, {
                    timestamp: new Date().toISOString(),
                    type: 'invite_consume',
                    from: agentId,
                    message: `${agentId} consumed invite via bridge`,
                });
                return json(res, 201, {
                    ok: true,
                    agent_id: agentId,
                    bearer_token: bridgeToken.token,
                    expires_at: bridgeToken.expires_at,
                    suggested_role: consumed.invite.suggested_role,
                    suggested_agent_type: consumed.invite.suggested_agent_type,
                    scope: consumed.invite.scope ?? [],
                    trust: consumed.invite.trust,
                    admit_policy: consumed.invite.admit_policy,
                });
            }
            // SSE stream: handled separately because handshake needs different headers
            // and a long-lived response. Token comes from Authorization header OR a
            // ?token= query param so plain `EventSource` can authenticate.
            if (p === '/api/v1/messages/stream' && method === 'GET') {
                const headerTok = req.headers.authorization?.startsWith('Bearer ')
                    ? req.headers.authorization.slice(7) : undefined;
                const queryTok = url.searchParams.get('token') ?? undefined;
                const tok = await validateRawToken(config.tokensPath, headerTok ?? queryTok);
                if (!tok) {
                    return err(res, 401, 'Invalid or expired token');
                }
                return handleSseStream(req, res, url, tok, bus, sseClients);
            }
            const token = await validateToken(config.tokensPath, req.headers.authorization);
            if (!token) {
                return err(res, 401, 'Invalid or expired token');
            }
            try {
                if (p === '/api/v1/messages' && method === 'POST') {
                    const body = await readBody(req);
                    let msg;
                    try {
                        msg = JSON.parse(body);
                    }
                    catch {
                        return err(res, 400, 'Invalid JSON');
                    }
                    if (msg.from !== token.agent_id) {
                        return err(res, 403, 'Agent ID mismatch');
                    }
                    const fp = await (0, comms_1.sendMessage)(config.commsDir, msg);
                    bus.publish('message', msg);
                    return json(res, 201, { ok: true, message_id: msg.id, path: fp });
                }
                if (p === '/api/v1/messages' && method === 'GET') {
                    const inbox = await (0, comms_1.readInbox)(config.commsDir, token.agent_id);
                    const shared = await (0, comms_1.readSharedInbox)(config.commsDir);
                    return json(res, 200, { inbox, shared });
                }
                if (p === '/api/v1/heartbeat' && method === 'POST') {
                    const body = await readBody(req);
                    let hb;
                    try {
                        hb = JSON.parse(body);
                    }
                    catch {
                        return err(res, 400, 'Invalid JSON');
                    }
                    if (hb.agent_id !== token.agent_id) {
                        return err(res, 403, 'Agent ID mismatch');
                    }
                    await (0, comms_1.writeHeartbeat)(config.commsDir, hb);
                    bus.publish('heartbeat', hb);
                    return json(res, 200, { ok: true });
                }
                if (p === '/api/v1/status' && method === 'GET') {
                    const statuses = await (0, comms_1.getAgentStatuses)(config.commsDir);
                    const registry = await (0, comms_1.readRegistry)(config.commsDir);
                    return json(res, 200, { agents: statuses, registry });
                }
                // Event Spine read surface (CP-1.8) — the bearer-gated twin of the
                // `spine.events` MCP tool, so an HTTP-only peer can tail "events since
                // cursor N" without ever opening spine.db. Read-only; empty when no
                // ingest tick has run yet.
                if (p === '/api/v1/spine/events' && method === 'GET') {
                    const { readSpineEvents } = await Promise.resolve().then(() => require('./spine/read'));
                    const numParam = (name) => {
                        const v = url.searchParams.get(name);
                        if (v === null) {
                            return undefined;
                        }
                        const n = Number(v);
                        return Number.isFinite(n) ? n : undefined;
                    };
                    const limit = numParam('limit');
                    const family = url.searchParams.get('family');
                    const type = url.searchParams.get('type');
                    const taskId = url.searchParams.get('task_id');
                    const out = readSpineEvents(config.workspaceRoot ?? process.cwd(), {
                        cursor: numParam('cursor') ?? 0,
                        ...(limit !== undefined ? { limit } : {}),
                        ...(family ? { family } : {}),
                        ...(type ? { type } : {}),
                        ...(taskId ? { taskId } : {}),
                    });
                    return json(res, 200, out);
                }
                // Intelligence context pack over HTTP (Channel D) — the bearer-gated twin
                // of the `intelligence.contextPack` MCP tool, so cross-machine / HTTP-only
                // peers (Hermes, OpenClaw REST) can pull a grounded pack. Read-only;
                // degrades to a learnings/style/memory pack when the backend is down.
                if (p === '/api/v1/intelligence/context' && method === 'GET') {
                    const task = (url.searchParams.get('task') ?? '').trim();
                    if (task === '') {
                        return err(res, 400, "query param 'task' required");
                    }
                    const capped = (name) => {
                        const v = url.searchParams.get(name);
                        if (v === null) {
                            return undefined;
                        }
                        const n = Number(v);
                        return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), 20) : undefined;
                    };
                    const sprintRaw = url.searchParams.get('sprint');
                    const sprintN = sprintRaw !== null && /^\d+$/.test(sprintRaw) ? Number(sprintRaw) : undefined;
                    const idsRaw = url.searchParams.get('task_ids');
                    // AMCE-P2E: optional mode params; absent = unchanged, invalid = 400.
                    const modeRaw = url.searchParams.get('mode');
                    if (modeRaw !== null && !(0, contextPack_1.isContextPackMode)(modeRaw)) {
                        return err(res, 400, `mode must be one of ${contextPack_1.CONTEXT_PACK_MODES.join(', ')}`);
                    }
                    const queryModeRaw = url.searchParams.get('query_mode');
                    if (queryModeRaw !== null && !(0, hybridRetrieval_1.isHybridQueryMode)(queryModeRaw)) {
                        return err(res, 400, `query_mode must be one of ${hybridRetrieval_1.HYBRID_QUERY_MODES.join(', ')}`);
                    }
                    const pack = await (0, intelligence_1.buildContextPack)({
                        task,
                        agentId: url.searchParams.get('agent') ?? token.agent_id,
                        sprint: sprintN,
                        role: url.searchParams.get('role') ?? undefined,
                        taskIds: idsRaw ? idsRaw.split(',').map(s => s.trim()).filter(Boolean) : undefined,
                    }, {
                        workspaceRoot: config.workspaceRoot ?? process.cwd(),
                        maxCodeChunks: capped('max_code_chunks'),
                        maxLearnings: capped('max_learnings'),
                        maxKgFacts: capped('max_kg_facts'),
                        ...(modeRaw !== null ? { mode: modeRaw } : {}),
                        ...(queryModeRaw !== null ? { queryMode: queryModeRaw } : {}),
                    });
                    return json(res, 200, {
                        markdown: pack.markdown,
                        summary: pack.summary,
                        used_code: pack.usedCode,
                        code_hits: pack.codeHits,
                        learning_hits: pack.learningHits,
                        kg_hits: pack.kgHits,
                        degraded: pack.degraded,
                        notes: pack.notes,
                    });
                }
                if (p === '/api/v1/consensus/vote' && method === 'POST') {
                    const body = await readBody(req);
                    let vote;
                    try {
                        vote = JSON.parse(body);
                    }
                    catch {
                        return err(res, 400, 'Invalid JSON');
                    }
                    const taskId = vote.task_id;
                    if (!taskId) {
                        return err(res, 400, 'Missing task_id');
                    }
                    const voteDir = path.join(config.commsDir, 'consensus', 'active');
                    await fsPromises.mkdir(voteDir, { recursive: true });
                    await fsPromises.writeFile(path.join(voteDir, `${taskId}-${token.agent_id}.json`), JSON.stringify(vote, null, 2), 'utf8');
                    await (0, comms_1.appendCommsLog)(config.commsDir, { timestamp: new Date().toISOString(), type: 'consensus_vote', from: token.agent_id, task_id: taskId, message: `${token.agent_id} voted on ${taskId}` });
                    return json(res, 201, { ok: true, task_id: taskId });
                }
                // Task claim over HTTP — mirrors the claim.task MCP tool so HTTP-only
                // peers (Hermes, OpenClaw REST) can claim a board task. Create-exclusive
                // write to claims/<taskId>.json; 409 with the current owner on conflict.
                const claimMatch = p.match(/^\/api\/v1\/claims\/([^/]+)$/);
                if (claimMatch && method === 'POST') {
                    const taskId = decodeURIComponent(claimMatch[1]).trim();
                    // The id becomes a filename — reject separators / traversal.
                    if (!taskId || /[\\/]/.test(taskId) || taskId.includes('..')) {
                        return err(res, 400, 'Invalid task_id (no path separators or "..")');
                    }
                    let body = {};
                    const raw = await readBody(req);
                    if (raw) {
                        try {
                            body = JSON.parse(raw);
                        }
                        catch {
                            return err(res, 400, 'Invalid JSON');
                        }
                    }
                    const ttlHours = typeof body.ttl_hours === 'number' && body.ttl_hours > 0 ? body.ttl_hours : 2;
                    const sprintId = typeof body.sprint_id === 'string' ? body.sprint_id.trim() : '';
                    const claimsDir = path.join(config.commsDir, 'claims');
                    const claimFile = path.join(claimsDir, `${taskId}.json`);
                    const now = new Date();
                    const claimToken = crypto.randomUUID();
                    const claim = {
                        task_id: taskId,
                        ...(sprintId ? { sprint_id: sprintId } : {}),
                        claimed_by: token.agent_id,
                        claim_token: claimToken,
                        claimed_at: now.toISOString(),
                        expires_at: new Date(now.getTime() + ttlHours * 3600000).toISOString(),
                    };
                    try {
                        await fsPromises.mkdir(claimsDir, { recursive: true });
                        // 'wx' = O_CREAT | O_EXCL — fails with EEXIST if already claimed.
                        await fsPromises.writeFile(claimFile, JSON.stringify(claim, null, 2) + '\n', { encoding: 'utf8', flag: 'wx' });
                    }
                    catch (e) {
                        if (e.code === 'EEXIST') {
                            let owner = 'unknown';
                            try {
                                const prior = JSON.parse((await fsPromises.readFile(claimFile, 'utf8')).replace(/^﻿/, ''));
                                owner = prior.claimed_by ?? 'unknown';
                            }
                            catch { /* ignore */ }
                            return json(res, 409, { ok: false, reason: 'conflict', task_id: taskId, owner });
                        }
                        return err(res, 500, e.message);
                    }
                    await (0, comms_1.appendCommsLog)(config.commsDir, { timestamp: now.toISOString(), type: 'task_claim', from: token.agent_id, task_id: taskId, message: `${token.agent_id} claimed ${taskId} via bridge` });
                    return json(res, 201, { ok: true, task_id: taskId, claim_token: claimToken, expires_at: claim.expires_at });
                }
                // Idempotent consensus evaluation. Reads votes from
                // consensus/active/{tid}-*.json, runs evaluateConsensus, returns
                // the ConsensusResult. Does NOT move any vote files.
                const em = p.match(/^\/api\/v1\/consensus\/([^/]+)\/evaluate$/);
                if (em && method === 'POST') {
                    const tid = em[1];
                    const vd = path.join(config.commsDir, 'consensus', 'active');
                    const votes = [];
                    try {
                        const files = (await fsPromises.readdir(vd))
                            .filter(f => f.startsWith(`${tid}-`) && f.endsWith('.json'));
                        for (const f of files) {
                            try {
                                const raw = (await fsPromises.readFile(path.join(vd, f), 'utf8'))
                                    .replace(/^﻿/, '');
                                votes.push(JSON.parse(raw));
                            }
                            catch { /* skip malformed */ }
                        }
                    }
                    catch { /* no votes yet */ }
                    const body = await readBody(req).catch(() => '');
                    let round = 1;
                    try {
                        const parsed = JSON.parse(body || '{}');
                        if (typeof parsed.round === 'number') {
                            round = parsed.round;
                        }
                    }
                    catch { /* default round */ }
                    // Verifier independence: drop the task author's self-vote from the tally.
                    const author = await (0, comms_1.readClaimAuthor)(config.commsDir, tid);
                    const result = (0, orchestrate_1.evaluateConsensus)(votes, round, orchestrate_1.DEFAULT_CONSENSUS_CONFIG, { author_agent_id: author });
                    result.task_id = tid;
                    // QLT-0b: acceptance command gate (bridge path).
                    // When workspaceRoot is configured, run manifest-declared acceptance
                    // commands in the correct directory — safe because the bridge owner
                    // controls the workspace. Absent workspaceRoot → skip (safe default).
                    // Acceptance recipe (the checks themselves) — captured onto the capsule
                    // so a verifier can replay only the failed gates later.
                    let acceptanceChecks;
                    if (config.workspaceRoot) {
                        try {
                            const manifestDir = path.join(config.commsDir, '..', 'sprints');
                            const { tasks: gateMap } = await (0, orchestrate_1.readManifestTaskGates)(manifestDir);
                            const taskGates = gateMap.get(tid);
                            if (taskGates?.acceptance && taskGates.acceptance.length > 0) {
                                acceptanceChecks = taskGates.acceptance;
                                const gateChecks = await (0, orchestrate_1.runAcceptanceChecks)(taskGates.acceptance, { cwd: config.workspaceRoot });
                                (0, orchestrate_1.applyAcceptanceGate)(result, gateChecks, { criticality: taskGates.criticality });
                            }
                        }
                        catch { /* best-effort: gate failure does not block consensus */ }
                    }
                    // Persist a durable evidence capsule (crabbox run-handle pattern): a
                    // re-inspectable bundle a fresh-context verifier can read or replay,
                    // instead of discarding the result after evaluation.
                    const capsule = (0, evidence_1.buildCapsule)(result, {
                        author_agent_id: author, evaluated_by: token.agent_id, acceptance_checks: acceptanceChecks,
                    });
                    await (0, evidence_1.writeCapsule)(config.commsDir, capsule).catch(() => { });
                    // Reputation join (REP-1): when consensus is reached, record the
                    // outcome for the agent whose work was reviewed so the router can later
                    // prefer agents with a track record. Dedup-guarded (evaluate is polled)
                    // and best-effort — never blocks the response.
                    if (author && result.status === 'consensus_reached') {
                        await (0, reputation_1.recordOutcomeOnce)(config.commsDir, {
                            task_id: tid,
                            agent_id: author,
                            verdict: result.final_verdict,
                            gate_passed: capsule.gates_passed,
                            rework_rounds: result.rounds,
                            timestamp: capsule.evaluated_at,
                        }).catch(() => { });
                        // A co-design fan-out: mirror the SAME outcome event as a structural
                        // KG edge (agent--completed-->task, agent--reviewed-->task). One
                        // event → { reputation row above + KG edge here }. Best-effort, never
                        // blocks the response. reviewers = distinct voters excluding assignee.
                        (0, kgRecord_1.recordOutcomeEdge)(path.resolve(config.commsDir, '..', '..', '..'), {
                            taskId: tid,
                            agentId: author,
                            verdict: result.final_verdict,
                            gatePassed: capsule.gates_passed,
                            resolvedAt: capsule.evaluated_at,
                            reviewers: result.votes ? Array.from(new Set(result.votes.map(v => v.agent_id).filter(a => a !== author))) : undefined,
                        }).catch(() => { });
                    }
                    await (0, comms_1.appendCommsLog)(config.commsDir, {
                        timestamp: new Date().toISOString(),
                        type: 'consensus_result',
                        from: token.agent_id,
                        task_id: tid,
                        message: `${token.agent_id} evaluated ${tid}: ${(0, evidence_1.summarizeCapsule)(capsule)}`,
                    });
                    bus.publish('consensus', result);
                    // HKS-5: emit a consensus event so trigger hooks can react (e.g.
                    // re-dispatch the author on needs_changes). Best-effort, in-process.
                    void (0, hookBus_1.emitHookEvent)((0, hookEvents_1.buildConsensusEvent)({
                        task_id: tid, status: result.status, final_verdict: result.final_verdict,
                        gate_checks: result.gate_checks, author_agent_id: author,
                    }), config.workspaceRoot);
                    return json(res, 200, { ...result, run_id: capsule.run_id });
                }
                // Evidence capsules (crabbox run-handle analog). List by task, or fetch one
                // by run handle so a fresh-context verifier can re-inspect a review cycle.
                if (p === '/api/v1/capsules' && method === 'GET') {
                    const task = url.searchParams.get('task') ?? undefined;
                    const capsules = await (0, evidence_1.listCapsules)(config.commsDir, task);
                    return json(res, 200, { capsules, count: capsules.length });
                }
                const km = p.match(/^\/api\/v1\/capsules\/([^/]+)$/);
                if (km && method === 'GET') {
                    const capsule = await (0, evidence_1.readCapsule)(config.commsDir, km[1]);
                    if (!capsule) {
                        return err(res, 404, 'No such capsule');
                    }
                    return json(res, 200, capsule);
                }
                const cm = p.match(/^\/api\/v1\/consensus\/(.+)$/);
                if (cm && method === 'GET') {
                    const tid = cm[1];
                    const vd = path.join(config.commsDir, 'consensus', 'active');
                    try {
                        const files = (await fsPromises.readdir(vd)).filter(f => f.startsWith(tid));
                        const votes = [];
                        for (const f of files) {
                            try {
                                votes.push(JSON.parse(await fsPromises.readFile(path.join(vd, f), 'utf8')));
                            }
                            catch { /* skip */ }
                        }
                        return json(res, 200, { task_id: tid, votes, vote_count: votes.length });
                    }
                    catch {
                        return json(res, 200, { task_id: tid, votes: [], vote_count: 0 });
                    }
                }
            }
            catch (e) {
                console.error('Bridge error:', e);
                return err(res, 500, 'Internal server error');
            }
        }
        err(res, 404, 'Not found');
    });
    // Stash the bus & client sets on the server object so startBridge can wire
    // the WebSocket upgrade handler against the same instances.
    server.__bridgeBus = bus;
    server.__sseClients = sseClients;
    server.__wsClients = wsClients;
    return server;
}
// ---------------------------------------------------------------------------
// SSE handler — long-lived `text/event-stream` response.
// ---------------------------------------------------------------------------
/** SSE keepalive interval (ms). Must be < typical proxy idle timeout (~60s). */
exports.SSE_KEEPALIVE_MS = 25000;
function sseWrite(res, eventType, data) {
    // Each SSE event is `event: <type>\ndata: <json>\n\n`. We JSON.stringify the
    // payload on a single line; SSE forbids a literal newline inside a data
    // field unless it's split into multiple `data:` lines.
    const line = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    try {
        res.write(line);
    }
    catch { /* client gone — disconnect handler will clean up */ }
}
function handleSseStream(req, res, url, token, bus, sseClients) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
    });
    // Initial flush so the client sees the response headers immediately.
    res.write(': connected\n\n');
    sseClients.add(res);
    // Per-stream filters. ?agent= scopes heartbeat events to a single agent.
    // Inbox messages are scoped server-side: we only forward messages whose
    // `to` matches the authenticated agent or 'shared'.
    const heartbeatAgent = url.searchParams.get('agent') ?? undefined;
    const onMessage = (msg) => {
        if (msg.to !== token.agent_id && msg.to !== 'shared') {
            return;
        }
        sseWrite(res, 'message', msg);
    };
    const onHeartbeat = (hb) => {
        if (heartbeatAgent && hb.agent_id !== heartbeatAgent) {
            return;
        }
        sseWrite(res, 'heartbeat', hb);
    };
    const onConsensus = (result) => {
        sseWrite(res, 'consensus', result);
    };
    const unsubMessage = bus.subscribe('message', onMessage);
    const unsubHeartbeat = bus.subscribe('heartbeat', onHeartbeat);
    const unsubConsensus = bus.subscribe('consensus', onConsensus);
    // Keepalive: SSE comments (`: ...\n\n`) keep idle proxies from culling.
    const keepalive = setInterval(() => {
        try {
            res.write(': keepalive\n\n');
        }
        catch { /* ignore */ }
    }, exports.SSE_KEEPALIVE_MS);
    // Don't keep the event loop alive solely on this timer.
    if (typeof keepalive.unref === 'function') {
        keepalive.unref();
    }
    const cleanup = () => {
        clearInterval(keepalive);
        unsubMessage();
        unsubHeartbeat();
        unsubConsensus();
        sseClients.delete(res);
        try {
            res.end();
        }
        catch { /* ignore */ }
    };
    req.on('close', cleanup);
    req.on('error', cleanup);
}
/** Hook for WebSocket support. Replaced with the real implementation in
 *  bridge-ws.ts once the `ws` dependency lands. Default no-op so SSE works
 *  on its own. */
let attachWebSocketIfAvailable = () => { };
/** Internal: replace the WS attach hook. Called by bridge-ws.ts at module load. */
function setWebSocketAttacher(fn) {
    attachWebSocketIfAvailable = fn;
}
/** Number of fallback ports the bridge will try after the configured port if it is busy.
 *  e.g. 9876 in use → 9877, 9878, 9879, 9880 are tried in order. */
exports.BRIDGE_PORT_FALLBACK_COUNT = 4;
/** Try to bind a single server instance on the supplied (host, port).
 *  Resolves on `listening`; rejects with the first `error` event. */
function tryListen(server, host, port) {
    return new Promise((resolve, reject) => {
        const onError = (e) => {
            server.removeListener('listening', onListening);
            reject(e);
        };
        const onListening = () => {
            server.removeListener('error', onError);
            resolve();
        };
        server.once('error', onError);
        server.once('listening', onListening);
        server.listen(port, host);
    });
}
async function startBridge(config) {
    const blockBase = config.portBlockBase ?? config.port;
    const maxPort = blockBase + exports.BRIDGE_PORT_FALLBACK_COUNT;
    const startPort = config.port;
    let lastErr;
    let currentPort = startPort;
    while (currentPort <= maxPort) {
        const port = currentPort;
        const bus = new BridgeEventBus();
        const sseClients = new Set();
        const wsClients = new Set();
        const server = createBridgeServer({ ...config, port }, { bus, sseClients, wsClients });
        try {
            await tryListen(server, config.host, port);
            const effectiveConfig = { ...config, port };
            try {
                await Promise.resolve().then(() => require('./bridge-ws'));
            }
            catch (e) {
                console.warn('Bridge: WebSocket support unavailable:', e.message);
            }
            attachWebSocketIfAvailable(server, effectiveConfig, bus, wsClients);
            console.log(`AutoClaw bridge on ${config.host}:${port}`);
            return { server, config: effectiveConfig, running: true, bus, sseClients, wsClients };
        }
        catch (e) {
            lastErr = e;
            try {
                server.close();
            }
            catch { /* ignore */ }
            if (lastErr.code !== 'EADDRINUSE') {
                throw lastErr;
            }
        }
        currentPort++;
    }
    throw lastErr ?? new Error(`Bridge could not bind to any port in range ${startPort}-${maxPort}`);
}
function stopBridge(state) {
    return new Promise(resolve => {
        // Force-close any active SSE responses so server.close() can complete.
        if (state.sseClients) {
            for (const res of state.sseClients) {
                try {
                    res.end();
                }
                catch { /* ignore */ }
            }
            state.sseClients.clear();
        }
        // Force-close any open WS clients.
        if (state.wsClients) {
            for (const ws of state.wsClients) {
                try {
                    ws.terminate?.();
                }
                catch { /* ignore */ }
            }
            state.wsClients.clear();
        }
        if (state.server) {
            state.server.close(() => { state.running = false; resolve(); });
        }
        else {
            resolve();
        }
    });
}
exports.DEFAULT_BRIDGE_CONFIG = { port: 9876, host: '127.0.0.1' };
exports.IDE_BRIDGE_PORT_RANGES = {
    vscode: { base: 9876, count: 4 },
    cursor: { base: 10876, count: 4 },
    kiro: { base: 11876, count: 4 },
    windsurf: { base: 12876, count: 4 },
    antigravity: { base: 13876, count: 4 },
    other: { base: 14876, count: 4 },
};
//# sourceMappingURL=bridge.js.map