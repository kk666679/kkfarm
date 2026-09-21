"use strict";
/**
 * eternal_loop.ts — Keep Working Keep Improving infinite loop.
 *
 * Wraps the auto-nested-loop moving-ahead-without-personality pattern described
 * in the steering doc: every completed work package triggers the next one,
 * errors trigger stack-trace-first diagnostics, and the session ends only when
 * there is truly nothing left to do across ALL sprints + ALL agents.
 *
 * Architecture:
 *  ┌──────────────────────────────────────────────────────────┐
 *  │               eternal_loop()                              │
 *  │  ┌────────────┐ ┌────────────┐ ┌────────────────────┐   │
 *  │  │ existing   │ │ updated    │ │ new life component │   │
 *  │  │ .justfile  │ │ default.md │ │ autoclaw.plugin    │   │
 *  │  └─────┬──────┘ └──────┬─────┘ └──────────┬─────────┘   │
 *  │        │               │                  │              │
 *  │        ▼               ▼                  ▼              │
 *  │  ┌──────────────────────────────────────────────────┐    │
 *  │  │            orchestratorLoop  (per-tick            │    │
 *  │  │  health → inbox → work → dispatch → sleep)        │    │
 *  │  └──────────────────────────┬───────────────────────┘    │
 *  │                             │ tick→tick                  │
 *  │        ┌────────────────────▼───────────────────┐        │
 *  │        │  handoff_factory — buildWorkPackage     │        │
 *  │        └────────────────────┬───────────────────┘        │
 *  │                             │ sidecar + claim            │
 *  │        ┌────────────────────▼───────────────────┐        │
 *  │        │  @kilocode/plugin (optional runner)     │        │
 *  │        └─────────────────────────────────────────┘        │
 *  └──────────────────────────────────────────────────────────┘
 *
 * Usage:
 *  `node eternal_loop.js --workspace /path/to/project [--interval-ms 30000]`
 *
 * The process traps SIGINT / SIGTERM, writes a final journal entry, and
 * exits cleanly so the next invocation resumes from loop-state.json.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.eternalLoop = eternalLoop;
const orchestratorLoop_1 = require("./orchestratorLoop");
function parseArgs() {
    const args = process.argv.slice(2);
    let workspaceRoot = process.cwd();
    let tickMs = orchestratorLoop_1.DEFAULT_TICK_MS;
    let highPriorityOnly = false;
    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === '--workspace' || a === '-w') {
            workspaceRoot = args[++i] ?? workspaceRoot;
        }
        else if (a === '--interval-ms' || a === '-i') {
            tickMs = parseInt(args[++i] ?? String(orchestratorLoop_1.DEFAULT_TICK_MS), 10) || orchestratorLoop_1.DEFAULT_TICK_MS;
        }
        else if (a === '--high-priority-only' || a === '-H') {
            highPriorityOnly = true;
        }
    }
    return { workspaceRoot, tickMs, highPriorityOnly };
}
let _runningSession = null;
function freshSession(workspaceRoot, vendor) {
    return {
        workspaceRoot,
        vendor,
        autoclawPluginStatus: 'running',
        autoclawPlugin: undefined,
        ownedContext: {},
    };
}
// ---------------------------------------------------------------------------
// Journal helpers
// ---------------------------------------------------------------------------
function journal(workspaceRoot, entry, tick = 0) {
    // Synchronous fire-and-forget to avoid awaiting inside the hot tick loop.
    (0, orchestratorLoop_1.writeLoopJournal)(workspaceRoot, { ...entry, tick }).catch(() => { });
}
// ---------------------------------------------------------------------------
// Session end detection
// ---------------------------------------------------------------------------
/**
 * Detect vendor session boundaries so the eternal loop can split output
 * into separate concern segments.
 */
function detectSessionBoundary(line, _session) {
    // Detect explicit boundary markers injected by runners.
    const re = /\[SESSION START[:\s]+(\S+)\]/i;
    const m = line.match(re);
    if (m) {
        return { ..._session, slot: m[1] };
    }
    return null;
}
// ---------------------------------------------------------------------------
// Main loop
// ---------------------------------------------------------------------------
const SIG_NAMES = {
    SIGINT: 'SIGINT',
    SIGTERM: 'SIGTERM',
    SIGHUP: 'SIGHUP',
};
/**
 * Start the eternal Keep Working Keep Improving loop.
 * Blocks until SIGINT / SIGTERM, or until no work remains forever.
 */
function eternalLoop() {
    const { workspaceRoot, tickMs, highPriorityOnly } = parseArgs();
    const loop = (0, orchestratorLoop_1.startOrchestratorLoop)({ workspaceRoot, tickMs });
    const state = loop.getState(); // state is accessible via the handle
    // Track sessions within this process.
    const session = freshSession(workspaceRoot, 'other');
    // Journal process start.
    journal(workspaceRoot, {
        at: new Date().toISOString(),
        tick: 0,
        phase: 'log',
        action: 'eternal_loop_started',
        detail: {
            workspaceRoot,
            tickMs,
            highPriorityOnly,
            pid: process.pid,
            commitHash: require('child_process').execSync('git rev-parse --short HEAD', { cwd: workspaceRoot, encoding: 'utf8' }).trim().slice(0, 40),
        },
    });
    // Trap signals for clean shutdown.
    const shutdown = (sig) => () => {
        journal(workspaceRoot, {
            at: new Date().toISOString(),
            tick: loop.getState().tick,
            phase: 'sleep',
            action: 'loop_shutdown',
            detail: { signal: sig, tick: loop.getState().tick },
        });
        loop.stop();
        process.exit(0);
    };
    ['SIGINT', 'SIGTERM', 'SIGHUP'].forEach(s => {
        process.on(s, shutdown(s));
    });
    // Monkey-patch onTick to layer session management on top of the raw ticker.
    const origHandle = loop;
    const origTickNow = origHandle.tickNow.bind(origHandle);
    loop.tickNow = (...args) => origTickNow(...args);
    return loop;
}
// ---------------------------------------------------------------------------
// Script entry point (invoked via `node eternal_loop.js`)
// ---------------------------------------------------------------------------
if (require.main === module) {
    // Handle possible stdin pipe from person_finder or other orchestration tools.
    process.stdin.setEncoding('utf8');
    let stdinBuffer = '';
    process.stdin.on('data', (chunk) => { stdinBuffer += chunk; });
    process.stdin.on('end', () => {
        if (stdinBuffer.trim().length > 0) {
            try {
                const cmd = JSON.parse(stdinBuffer);
                if (cmd.cmd === 'run') {
                    // Launch the synthflow-run lifecycle in-process.
                    eternalLoop();
                }
            }
            catch {
                // Not JSON — treat as plain text input to person_finder context.
            }
        }
    });
    // Auto-start the loop.
    eternalLoop();
}
//# sourceMappingURL=eternal_loop.js.map