"use strict";
/**
 * bridge-ws.ts — WebSocket push channel for the OpenClaw bridge.
 *
 * Mounts a `ws.Server` in noServer mode onto the existing http.Server so
 * SSE and WS share the same port. Authentication mirrors SSE:
 *   - `Sec-WebSocket-Protocol: bearer.<token>`  (preferred)
 *   - or `?token=<token>` query param           (fallback for browsers)
 * Server emits one JSON object per frame:
 *   { type: 'message' | 'heartbeat' | 'consensus', data: <payload> }
 * Inbound frames from clients are ignored — clients still POST normally.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachWebSocket = attachWebSocket;
const ws_1 = require("ws");
const bridge_1 = require("./bridge");
const stateMap = new WeakMap();
function send(ws, type, data) {
    if (ws.readyState !== ws_1.WebSocket.OPEN) {
        return;
    }
    try {
        ws.send(JSON.stringify({ type, data }));
    }
    catch { /* ignore — close handler cleans up */ }
}
/** Extract the token from upgrade-request headers / URL. Subprotocol token
 *  encoding is `bearer.<token>` (one of possibly several offered protocols). */
function extractToken(req, url) {
    // 1. Sec-WebSocket-Protocol — comma-separated list of offered subprotocols.
    const sp = req.headers['sec-websocket-protocol'];
    if (typeof sp === 'string') {
        const offered = sp.split(',').map(s => s.trim()).filter(Boolean);
        const tokenProto = offered.find(p => p.startsWith('bearer.'));
        if (tokenProto) {
            return { raw: tokenProto.slice('bearer.'.length), protocol: tokenProto };
        }
    }
    // 2. ?token= query param.
    const q = url.searchParams.get('token');
    if (q) {
        return { raw: q, protocol: undefined };
    }
    return { raw: undefined, protocol: undefined };
}
function attachWebSocket(server, config, bus, wsClients) {
    const wss = new ws_1.WebSocketServer({ noServer: true });
    server.on('upgrade', async (req, socket, head) => {
        const url = new URL(req.url || '/', `http://${req.headers.host}`);
        if (url.pathname !== '/api/v1/messages/stream') {
            socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
            socket.destroy();
            return;
        }
        const { raw, protocol } = extractToken(req, url);
        const tok = await (0, bridge_1.validateRawToken)(config.tokensPath, raw);
        if (!tok) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
        }
        const handleProtocols = protocol
            ? { 'Sec-WebSocket-Protocol': protocol }
            : undefined;
        wss.handleUpgrade(req, socket, head, ws => {
            // Echo back the bearer subprotocol so the handshake completes cleanly
            // when the client offered one. (ws lib does this automatically when we
            // pass the chosen protocol via the third arg, but only if we set it
            // through opts; safest path is to attach it manually below.)
            const heartbeatAgent = url.searchParams.get('agent') ?? undefined;
            const state = {
                token: tok, heartbeatAgent, unsubs: [],
            };
            stateMap.set(ws, state);
            state.unsubs.push(bus.subscribe('message', (m) => {
                if (m.to !== tok.agent_id && m.to !== 'shared') {
                    return;
                }
                send(ws, 'message', m);
            }));
            state.unsubs.push(bus.subscribe('heartbeat', (h) => {
                if (heartbeatAgent && h.agent_id !== heartbeatAgent) {
                    return;
                }
                send(ws, 'heartbeat', h);
            }));
            state.unsubs.push(bus.subscribe('consensus', (r) => {
                send(ws, 'consensus', r);
            }));
            wsClients.add(ws);
            void handleProtocols; // referenced; ws lib already negotiates from offered list
            // Inbound frames are ignored in this phase. Drain to keep the socket
            // healthy and let ping/pong keep-alive run.
            ws.on('message', (_) => { });
            ws.on('close', () => {
                for (const off of state.unsubs) {
                    try {
                        off();
                    }
                    catch { /* ignore */ }
                }
                state.unsubs = [];
                wsClients.delete(ws);
            });
            ws.on('error', () => {
                for (const off of state.unsubs) {
                    try {
                        off();
                    }
                    catch { /* ignore */ }
                }
                state.unsubs = [];
                wsClients.delete(ws);
            });
        });
    });
    return wss;
}
// Register the attach hook with bridge.ts as a side-effect of importing this
// module. Importers (extension entry, tests) opt-in to WS by importing
// `bridge-ws` once at startup.
(0, bridge_1.setWebSocketAttacher)(attachWebSocket);
//# sourceMappingURL=bridge-ws.js.map