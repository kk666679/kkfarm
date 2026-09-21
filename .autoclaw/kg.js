"use strict";
/**
 * kg.ts — AutoClaw Knowledge Graph daemon lifecycle.
 *
 * Spawns the `@autoclaw/kg-daemon` Node child process on extension
 * activation when `autoclaw.kg.enabled === true` and tears it down on
 * deactivation. The daemon itself lives in `packages/kg-daemon/` and is
 * a maintainer-installed peer (we deliberately do NOT auto-`npm install`
 * its dependencies — better-sqlite3 has native bindings).
 *
 * No `vscode` import here; the extension passes in an OutputChannel
 * shim and reads settings on its side. Keeps this module unit-testable.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_KG_PORT = exports.KG_PORT_FALLBACK_COUNT = void 0;
exports.isPortAvailable = isPortAvailable;
exports.findAvailablePort = findAvailablePort;
exports.resolveKgEntry = resolveKgEntry;
exports.kgDepsInstalled = kgDepsInstalled;
exports.startKgDaemon = startKgDaemon;
exports.stopKgDaemon = stopKgDaemon;
exports.fetchKgHealth = fetchKgHealth;
const fs = require("fs");
const path = require("path");
const http = require("http");
const net = require("net");
const child_process_1 = require("child_process");
/** Number of fallback ports kg-daemon will try after the configured port if it is busy.
 *  e.g. 9877 in use → 9878, 9879, 9880, 9881 are tried in order. */
exports.KG_PORT_FALLBACK_COUNT = 4;
/**
 * Probe a single (host, port) pair to see if a server can bind there.
 * Resolves `true` when the probe socket binds and closes cleanly,
 * `false` on EADDRINUSE / EACCES / any other listen error.
 *
 * We bind, immediately close, and resolve. The brief listen-then-close
 * round-trip is the standard cross-platform "is this port free?" trick;
 * spawning on a port whose probe just succeeded leaves a microscopic
 * TOCTOU window, but in practice it's far simpler and more reliable
 * than trying to parse EADDRINUSE out of the daemon's stderr.
 */
function isPortAvailable(port, host = '127.0.0.1') {
    return new Promise((resolve) => {
        const probe = net.createServer();
        let settled = false;
        const finish = (ok) => {
            if (settled) {
                return;
            }
            settled = true;
            try {
                probe.close();
            }
            catch { /* ignore */ }
            resolve(ok);
        };
        probe.once('error', () => finish(false));
        probe.once('listening', () => {
            probe.close(() => finish(true));
        });
        try {
            probe.listen(port, host);
        }
        catch {
            finish(false);
        }
    });
}
/**
 * Find the first port in `[startPort, startPort + count]` (inclusive) that
 * is available to bind on. Returns `null` if every probed port is busy.
 */
async function findAvailablePort(startPort, count = exports.KG_PORT_FALLBACK_COUNT, host = '127.0.0.1') {
    for (let i = 0; i <= count; i++) {
        const candidate = startPort + i;
        if (await isPortAvailable(candidate, host)) {
            return candidate;
        }
    }
    return null;
}
/**
 * Resolves the path to the kg-daemon entrypoint script. Prefers the
 * compiled `dist/server.js` shipped after `npm run build`; falls back
 * to a not-found error so callers can surface a clear message.
 */
function resolveKgEntry(extensionPath) {
    const dist = path.join(extensionPath, 'packages', 'kg-daemon', 'dist', 'server.js');
    return { path: dist, exists: fs.existsSync(dist) };
}
/**
 * `true` when `packages/kg-daemon/node_modules/` is populated. We treat
 * presence-of-the-directory as "deps installed" — same heuristic the
 * Doctor section reports.
 */
function kgDepsInstalled(extensionPath) {
    const nm = path.join(extensionPath, 'packages', 'kg-daemon', 'node_modules');
    try {
        return fs.statSync(nm).isDirectory();
    }
    catch {
        return false;
    }
}
/**
 * Spawn the kg-daemon child. Returns a tagged result: `disabled` is
 * never produced here (the caller short-circuits before invoking); we
 * still model it in the union so the extension can pattern-match
 * uniformly across enabled/disabled paths if it wants.
 *
 * Port-fallback: if `config.port` is in use we probe up to
 * `KG_PORT_FALLBACK_COUNT` subsequent ports and spawn on the first one
 * that's free. The actual port is recorded on the returned state so
 * the doctor section + healthCheck can report it. If every probed
 * port is busy we return `no_port_available`.
 */
async function startKgDaemon(config) {
    if (!kgDepsInstalled(config.extensionPath)) {
        return {
            ok: false,
            reason: 'deps_missing',
            message: 'kg-daemon dependencies not installed; run `cd packages/kg-daemon && npm install`',
        };
    }
    const entry = resolveKgEntry(config.extensionPath);
    if (!entry.exists) {
        return {
            ok: false,
            reason: 'entry_missing',
            message: `kg-daemon entry not found at ${entry.path.replace(/\\/g, '/')}; run \`cd packages/kg-daemon && npm run build\``,
        };
    }
    const port = await findAvailablePort(config.port, exports.KG_PORT_FALLBACK_COUNT);
    if (port === null) {
        const last = config.port + exports.KG_PORT_FALLBACK_COUNT;
        const msg = `kg-daemon: no port available in ${config.port}..${last}`;
        config.logger.appendLine(`[kg!] ${msg}`);
        return { ok: false, reason: 'no_port_available', message: msg };
    }
    if (port !== config.port) {
        config.logger.appendLine(`[kg] configured port ${config.port} in use; falling back to ${port}`);
    }
    const env = { ...process.env, KG_PORT: String(port) };
    if (config.dbPath && config.dbPath.trim()) {
        env.KG_DB_PATH = config.dbPath;
    }
    const child = (0, child_process_1.spawn)(process.execPath, [entry.path], {
        cwd: path.join(config.extensionPath, 'packages', 'kg-daemon'),
        env,
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
    });
    const state = {
        child,
        config,
        startedAt: new Date().toISOString(),
        exitCode: null,
        port,
    };
    child.stdout?.setEncoding('utf8');
    child.stderr?.setEncoding('utf8');
    child.stdout?.on('data', (chunk) => {
        for (const line of chunk.split(/\r?\n/)) {
            if (line) {
                config.logger.appendLine(`[kg] ${line}`);
            }
        }
    });
    child.stderr?.on('data', (chunk) => {
        for (const line of chunk.split(/\r?\n/)) {
            if (line) {
                config.logger.appendLine(`[kg!] ${line}`);
            }
        }
    });
    child.on('exit', (code, signal) => {
        state.exitCode = code;
        config.logger.appendLine(`[kg] daemon exited (code=${code ?? 'null'}, signal=${signal ?? 'null'})`);
    });
    child.on('error', (err) => {
        config.logger.appendLine(`[kg!] spawn error: ${err.message}`);
    });
    config.logger.appendLine(`[kg] started pid=${child.pid ?? '?'} port=${port} entry=${entry.path.replace(/\\/g, '/')}`);
    return { ok: true, state };
}
/**
 * Gracefully terminate the daemon: SIGTERM, then SIGKILL after `timeoutMs`
 * if still alive. Resolves once the child reports `exit` or after the
 * kill window elapses (whichever comes first).
 */
function stopKgDaemon(state, timeoutMs = 5000) {
    return new Promise((resolve) => {
        const child = state.child;
        if (!child || child.exitCode !== null || child.signalCode !== null) {
            resolve();
            return;
        }
        let settled = false;
        const onExit = () => {
            if (settled) {
                return;
            }
            settled = true;
            clearTimeout(timer);
            resolve();
        };
        child.once('exit', onExit);
        const timer = setTimeout(() => {
            if (settled) {
                return;
            }
            try {
                child.kill('SIGKILL');
            }
            catch { /* ignore */ }
            // Force-resolve after sending SIGKILL even if 'exit' is delayed.
            setTimeout(onExit, 250);
        }, timeoutMs);
        try {
            child.kill('SIGTERM');
        }
        catch {
            // If even SIGTERM throws (already gone) treat as resolved.
            onExit();
        }
    });
}
function fetchKgHealth(port, host = '127.0.0.1', timeoutMs = 1500) {
    // Guard against port 0/unset (the default when the OPTIONAL standalone daemon
    // isn't running — KG is in-process now). Without this, http.request treats
    // port 0 as :80 and spams ECONNREFUSED. Callers should report the in-process
    // health (getKnowledgeGraph) when no daemon is live.
    if (!Number.isInteger(port) || port <= 0) {
        return Promise.resolve({ ok: false, status: null, body: null, error: 'no daemon (KG runs in-process; port unset)' });
    }
    return new Promise((resolve) => {
        const req = http.request({ host, port, path: '/api/v1/health', method: 'GET', timeout: timeoutMs }, (res) => {
            const chunks = [];
            res.on('data', (c) => chunks.push(c));
            res.on('end', () => {
                const raw = Buffer.concat(chunks).toString('utf8');
                let parsed = raw;
                try {
                    parsed = JSON.parse(raw);
                }
                catch { /* keep raw */ }
                resolve({
                    ok: (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300,
                    status: res.statusCode ?? null,
                    body: parsed,
                });
            });
        });
        req.on('timeout', () => {
            req.destroy(new Error('timeout'));
        });
        req.on('error', (err) => {
            resolve({ ok: false, status: null, body: null, error: err.message });
        });
        req.end();
    });
}
exports.DEFAULT_KG_PORT = 9877;
//# sourceMappingURL=kg.js.map