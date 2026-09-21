"use strict";
/**
 * sessionUsage.ts — per-session LLM + token usage for the fleet panel.
 *
 * Answers the question the Team view could not: "which model is THIS window
 * on, what did the last task cost, what has the whole session cost?" — for
 * every session row, across tools.
 *
 * Two prompt-free ledgers feed it:
 *   - the LLM cost ledger (`.autoclaw/llm/cost-ledger.jsonl`) — authoritative
 *     per-call tokens/cost/model, keyed by `sessionId` when the caller passed
 *     one ({@link ../llm/costLedger});
 *   - the Trace Ledger (`.autoclaw/workflows/traces/`) — per-TASK episodes
 *     with task ids and usage snapshots ({@link ../workflows/traces/ledger}).
 *
 * Merge rule (no double counting): session TOTALS come from the cost ledger
 * when it has rows for the session — trace usage for the same session is
 * assumed to describe the same calls. Traces contribute what the cost ledger
 * cannot: per-task attribution (`last_task`, `task_count`) and a fallback
 * total (flagged `estimated`) for tools that never write cost-ledger rows.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.foldLedgerRows = foldLedgerRows;
exports.foldTraceRows = foldTraceRows;
exports.readSessionUsageChips = readSessionUsageChips;
const costLedger_1 = require("../llm/costLedger");
const ledger_1 = require("../workflows/traces/ledger");
function chip(sessionId) {
    return {
        session_id: sessionId,
        models: [],
        calls: 0,
        total_input_tokens: 0,
        total_output_tokens: 0,
        total_cost_cents: 0,
        task_count: 0,
        estimated: false,
    };
}
function noteModel(c, model) {
    if (!model) {
        return;
    }
    c.model = model;
    c.models = [model, ...c.models.filter((m) => m !== model)];
}
/** Fold cost-ledger rows (oldest-first) into chips. Rows without a sessionId are skipped. */
function foldLedgerRows(rows, into) {
    const sorted = [...rows].sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
    for (const row of sorted) {
        if (!row.sessionId) {
            continue;
        }
        const c = into.get(row.sessionId) ?? chip(row.sessionId);
        into.set(row.sessionId, c);
        c.calls += 1;
        c.total_input_tokens += row.tokens?.input ?? 0;
        c.total_output_tokens += row.tokens?.output ?? 0;
        c.total_cost_cents += row.costCents ?? 0;
        noteModel(c, row.model);
        if (!c.last_at || row.timestamp > c.last_at) {
            c.last_at = row.timestamp;
        }
    }
}
/**
 * Fold trace episodes into chips. Task attribution always comes from traces;
 * usage totals only when the cost ledger had nothing for the session.
 */
function foldTraceRows(rows, into) {
    // AMCE-P1E: pack-generation event rows carry no usage and must not overwrite
    // a session's last-task chip — fold verified episodes only.
    const episodes = rows.filter((r) => !r.event || r.event === 'episode');
    const oldestFirst = [...episodes].sort((a, b) => (a.at < b.at ? -1 : 1));
    const tasksBySession = new Map();
    for (const row of oldestFirst) {
        if (!row.session_id) {
            continue;
        }
        const c = into.get(row.session_id) ?? chip(row.session_id);
        into.set(row.session_id, c);
        const fromLedger = c.calls > 0;
        if (!fromLedger && row.usage) {
            c.total_input_tokens += row.usage.input_tokens ?? 0;
            c.total_output_tokens += row.usage.output_tokens ?? 0;
            c.total_cost_cents += row.usage.cost_cents ?? 0;
            c.estimated = true;
        }
        if (!c.model) {
            noteModel(c, row.model);
        }
        c.last_task = {
            task_id: row.task_id,
            input_tokens: row.usage?.input_tokens,
            output_tokens: row.usage?.output_tokens,
            at: row.at,
        };
        if (!c.last_at || row.at > c.last_at) {
            c.last_at = row.at;
        }
        if (row.task_id) {
            const set = tasksBySession.get(row.session_id) ?? new Set();
            set.add(row.task_id);
            tasksBySession.set(row.session_id, set);
        }
    }
    for (const [sessionId, tasks] of tasksBySession) {
        const c = into.get(sessionId);
        if (c) {
            c.task_count = tasks.size;
        }
    }
}
/**
 * Read + merge both ledgers into a per-session map the panel can index by
 * heartbeat `session_id`. Best-effort: a missing/unreadable ledger contributes
 * nothing rather than failing the panel refresh.
 */
async function readSessionUsageChips(workspaceRoot, opts = {}) {
    const into = new Map();
    try {
        let rows = await new costLedger_1.CostLedger(workspaceRoot).readAll();
        if (opts.sinceIso) {
            rows = rows.filter((r) => r.timestamp >= opts.sinceIso);
        }
        foldLedgerRows(rows, into);
    }
    catch { /* ledger unreadable — traces may still attribute */ }
    try {
        const traces = await (0, ledger_1.readTraces)(workspaceRoot, { sinceIso: opts.sinceIso, limit: opts.traceLimit ?? 2000 });
        foldTraceRows(traces, into);
    }
    catch { /* traces unreadable — ledger rollup stands alone */ }
    return Object.fromEntries(into);
}
//# sourceMappingURL=sessionUsage.js.map