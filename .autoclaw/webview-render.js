"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATUS_LEGEND = void 0;
exports.agentHost = agentHost;
exports.isRemoteAgent = isRemoteAgent;
exports.buildReviewTally = buildReviewTally;
exports.buildReviewContext = buildReviewContext;
exports.esc = esc;
exports.formatContextWindow = formatContextWindow;
exports.formatAge = formatAge;
exports.shortSessionId = shortSessionId;
exports.shortModel = shortModel;
exports.renderRoleChip = renderRoleChip;
exports.agentRole = agentRole;
exports.renderTeamSummary = renderTeamSummary;
exports.formatTokenCount = formatTokenCount;
exports.openChatButton = openChatButton;
exports.renderSessionList = renderSessionList;
exports.renderAgentWorkload = renderAgentWorkload;
exports.formatTokens = formatTokens;
exports.renderAgentCost = renderAgentCost;
exports.formatMetricTokens = formatMetricTokens;
exports.formatMetricUsd = formatMetricUsd;
exports.renderAgentMetricsPip = renderAgentMetricsPip;
exports.renderAgentMetrics = renderAgentMetrics;
exports.renderAgentActions = renderAgentActions;
exports.renderAgentHistory = renderAgentHistory;
exports.statusBadgeClass = statusBadgeClass;
exports.trustBadgeClass = trustBadgeClass;
exports.renderChips = renderChips;
exports.renderDetailRow = renderDetailRow;
exports.renderProvenanceBadge = renderProvenanceBadge;
exports.loopMechanismMeta = loopMechanismMeta;
exports.renderLoopMechanismBadge = renderLoopMechanismBadge;
exports.isDetectedNotLive = isDetectedNotLive;
exports.renderAgentCard = renderAgentCard;
exports.renderSelfIdentity = renderSelfIdentity;
exports.renderAgentList = renderAgentList;
exports.extractPlatform = extractPlatform;
exports.payloadExcerpt = payloadExcerpt;
exports.filterAwaitingYou = filterAwaitingYou;
exports.renderAdvisory = renderAdvisory;
exports.renderAwaitingYou = renderAwaitingYou;
exports.bridgeTooltip = bridgeTooltip;
exports.kgTooltip = kgTooltip;
exports.kgClickCommand = kgClickCommand;
exports.renderFabricHealth = renderFabricHealth;
exports.renderStatusLegend = renderStatusLegend;
exports.renderPanelFooter = renderPanelFooter;
const roles_1 = require("./roles");
const coordination_1 = require("./orchestrator/coordination");
const consensusTally_1 = require("./orchestrator/consensusTally");
const modelCatalog_1 = require("./llm/modelCatalog");
/** Resolve an agent's display host (CF-2): explicit host → machine_id → 'local'. */
function agentHost(agent) {
    return agent.host || agent.machine_id || 'local';
}
/** True when the agent reached this panel from off this workspace — either a
 *  relay-forwarded remote-host agent (CF-2) or a beacon check-in from another
 *  IDE / runner on this machine (fleet beacons). Both render grouped by host. */
function isRemoteAgent(agent) {
    return agent.origin === 'relay' || agent.origin === 'beacon';
}
/** The reviewer's own recorded vote, if they cast one. Pure — no I/O. */
function findMyVote(votes, me) {
    if (!me || !Array.isArray(votes)) {
        return null;
    }
    const mine = votes.find(v => v && v.voter === me);
    return mine ? mine.vote : null;
}
/**
 * Build the panel's {@link ConsensusTally} from a consensus stub or a resolved
 * record. Pure — the caller does the FS reads and passes the parsed record(s).
 * For an OPEN stub it reuses {@link tallyConsensus} (never re-counts by hand)
 * so the panel's counts/threshold match the orchestrator's own decision.
 *
 * `me` (the current host agent) selects that reviewer's own vote for the
 * "you voted X" affordance; omit it and `myVote` is left null.
 */
function buildReviewTally(source, me) {
    if (source.kind === 'resolved') {
        const r = source.record;
        const votes = Array.isArray(r.votes) ? r.votes : [];
        return {
            approvals: r.approvals ?? 0,
            requestChanges: r.changes_requested ?? 0,
            rejects: r.rejects ?? 0,
            votesReceived: votes.length,
            votesRequired: r.required_approvals ?? 0,
            rule: r.rule === 'unanimous' ? 'unanimous' : 'majority',
            reviewers: Array.isArray(r.reviewers) ? r.reviewers : [],
            myVote: findMyVote(votes, me),
            decided: true,
        };
    }
    const t = (0, consensusTally_1.tallyConsensus)(source.stub, source.extraVotes ? [...source.extraVotes] : []);
    return {
        approvals: t.approvals,
        requestChanges: t.changes,
        rejects: t.rejects,
        votesReceived: t.votesCast,
        votesRequired: t.required,
        rule: t.rule,
        reviewers: t.reviewers,
        myVote: findMyVote(t.votes, me),
        decided: t.status === 'resolved',
    };
}
/** Roll a handoff note's `tests_run[]` into the compact review summary shape. */
function summarizeHandoffTests(tests) {
    if (!Array.isArray(tests) || tests.length === 0) {
        return undefined;
    }
    const rows = tests
        .filter((t) => !!t && typeof t.suite === 'string')
        .map(t => ({
        suite: t.suite,
        passed: Number.isFinite(t.passed) ? t.passed : 0,
        failed: Number.isFinite(t.failed) ? t.failed : 0,
        ...(typeof t.skipped === 'number' ? { skipped: t.skipped } : {}),
    }));
    return rows.length > 0 ? rows : undefined;
}
/**
 * Build the review drill-down {@link ReviewContext} from the author's handoff
 * note. Pure — the caller reads the note (via `readHandoffNote`) and passes it.
 * Returns `undefined` when there is no note so the renderer falls back to its
 * "completion report wasn't found" message. `extra` carries context the note
 * itself doesn't hold (numeric sprint + the source `task_complete` id).
 */
function buildReviewContext(note, extra) {
    if (!note) {
        return undefined;
    }
    const files = Array.isArray(note.files_changed)
        ? note.files_changed.filter(f => typeof f === 'string' && f !== '')
        : undefined;
    const risks = Array.isArray(note.risks)
        ? note.risks.filter(r => typeof r === 'string' && r.trim() !== '')
        : undefined;
    return {
        found: true,
        ...(extra?.sourceId ? { sourceId: extra.sourceId } : {}),
        ...(note.agent_id ? { author: note.agent_id } : {}),
        ...(note.task_id ? { taskId: note.task_id } : {}),
        ...(typeof extra?.sprint === 'number' ? { sprint: extra.sprint } : {}),
        ...(note.summary ? { summary: note.summary } : {}),
        ...(note.branch ? { branch: note.branch } : {}),
        ...(files && files.length > 0 ? { files } : {}),
        ...(summarizeHandoffTests(note.tests_run) ? { tests: summarizeHandoffTests(note.tests_run) } : {}),
        ...(risks && risks.length > 0 ? { risks } : {}),
    };
}
// ---------------------------------------------------------------------------
// Escaping
// ---------------------------------------------------------------------------
/** HTML-escape a value. Mirrors the runtime helper in kdream-dashboard.js. */
function esc(v) {
    return String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------
/** Format a token-count like 1000000 → "1M". Returns empty string for falsy. */
function formatContextWindow(n) {
    if (typeof n !== 'number' || !Number.isFinite(n) || n <= 0) {
        return '';
    }
    if (n >= 1000000) {
        const v = n / 1000000;
        return (Math.round(v * 10) / 10).toString().replace(/\.0$/, '') + 'M';
    }
    if (n >= 1000) {
        const v = n / 1000;
        return (Math.round(v * 10) / 10).toString().replace(/\.0$/, '') + 'K';
    }
    return String(n);
}
/** "2 min ago" / "5h ago" / "never" for an ISO timestamp. */
function formatAge(iso, now = Date.now()) {
    if (!iso) {
        return 'never';
    }
    const t = new Date(iso).getTime();
    if (!Number.isFinite(t)) {
        return 'never';
    }
    const s = Math.max(0, Math.floor((now - t) / 1000));
    if (s < 60) {
        return s + 's ago';
    }
    if (s < 3600) {
        return Math.floor(s / 60) + ' min ago';
    }
    if (s < 86400) {
        return Math.floor(s / 3600) + 'h ago';
    }
    return Math.floor(s / 86400) + 'd ago';
}
/** Short form of a session id — first 8 chars, ellipsis if truncated. */
function shortSessionId(s) {
    if (!s) {
        return '';
    }
    return s.length > 8 ? s.slice(0, 8) + '…' : s;
}
/** Short display form of a model id: drops vendor path prefixes
 *  ("us.anthropic.claude-…" → "claude-…") and trailing date stamps
 *  ("claude-haiku-4-5-20251001" → "claude-haiku-4-5"). */
function shortModel(s) {
    if (!s) {
        return '';
    }
    let m = String(s);
    const slash = m.lastIndexOf('/');
    if (slash >= 0) {
        m = m.slice(slash + 1);
    }
    // vendor-prefixed bedrock-style ids: us.anthropic.claude-x → claude-x
    m = m.replace(/^[a-z]{2}\.[a-z0-9]+\./, '');
    m = m.replace(/-20\d{6}(-v\d+(:\d+)?)?$/, '');
    return m;
}
// ---------------------------------------------------------------------------
// Roles & team summary
// ---------------------------------------------------------------------------
/** Render one colored role chip. `compact` uses the 2–3 letter abbreviation. */
function renderRoleChip(role, compact = false) {
    const meta = roles_1.ROLE_META[role];
    const text = compact ? meta.abbrev : meta.label;
    return `<span class="role-chip ${meta.cssClass}" title="${esc(meta.label)}">` +
        `<span class="role-glyph" aria-hidden="true">${meta.glyph}</span>${esc(text)}</span>`;
}
/** Resolve the canonical role for a panel agent row. */
function agentRole(agent) {
    return (0, roles_1.resolveAgentRole)({
        role: agent.role,
        agent_type: agent.agent_type,
        can_orchestrate: agent.can_orchestrate,
    });
}
/**
 * Render the team-summary strip shown above the agent list: live/total
 * counts, session count, and the role distribution as colored chips.
 * Designed to stay readable from 2 agents up to 50.
 */
function renderTeamSummary(agents, now = Date.now()) {
    if (!agents || agents.length === 0) {
        return '';
    }
    const live = agents.filter(a => {
        const s = a.live_status || a.status;
        return s === 'active' || s === 'idle' || s === 'overloaded';
    }).length;
    const sessionCount = agents.reduce((n, a) => n + (a.sessions?.length ?? 0), 0);
    const roles = (0, roles_1.summarizeRoles)(agents.map(agentRole));
    let h = '<div class="team-summary" role="status" aria-label="Team summary">';
    h += `<span class="team-count" title="agents with a fresh heartbeat / total registered">` +
        `<span class="team-live">${live}</span>/${agents.length} live</span>`;
    if (sessionCount > 0) {
        h += `<span class="team-sessions" title="known sessions across all agents">${sessionCount} session${sessionCount === 1 ? '' : 's'}</span>`;
    }
    h += '<span class="team-roles">';
    for (const { role, count } of roles) {
        const meta = roles_1.ROLE_META[role];
        h += `<span class="role-chip ${meta.cssClass}" title="${count} × ${esc(meta.label)}">` +
            `<span class="role-glyph" aria-hidden="true">${meta.glyph}</span>${esc(meta.label)}` +
            (count > 1 ? `<span class="role-count">${count}</span>` : '') + '</span>';
    }
    h += '</span></div>';
    return h;
}
// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------
/** Compact a token count for chips: 1_000_000→"1M", 200_000→"200k", 8_192→"8k". */
function formatTokenCount(n) {
    if (!Number.isFinite(n) || n <= 0) {
        return '0';
    }
    if (n >= 1000000) {
        const m = n / 1000000;
        return (Number.isInteger(m) ? String(m) : m.toFixed(1).replace(/\.0$/, '')) + 'M';
    }
    if (n >= 1000) {
        return Math.round(n / 1000) + 'k';
    }
    return String(Math.round(n));
}
/** Cents → "$0.12"-style label. Empty for zero/invalid so chips stay quiet. */
function formatCents(cents) {
    if (!Number.isFinite(cents) || cents <= 0) {
        return '';
    }
    return '$' + (cents / 100).toFixed(2);
}
/**
 * The two usage chips for one session row: the last traced task's tokens and
 * the session running total (with cost when known). Renders '' when there is
 * no usage — a row never carries empty chips. `~` marks trace-derived
 * estimates so the panel never presents a guess as a ledger count.
 */
function sessionUsageChips(usage) {
    if (!usage) {
        return '';
    }
    let h = '';
    const lt = usage.last_task;
    if (lt && ((lt.input_tokens ?? 0) > 0 || (lt.output_tokens ?? 0) > 0)) {
        const label = `▲${formatTokenCount(lt.input_tokens ?? 0)} ▼${formatTokenCount(lt.output_tokens ?? 0)}`;
        const title = `Last task${lt.task_id ? ` ${lt.task_id}` : ''}: `
            + `${(lt.input_tokens ?? 0).toLocaleString()} in / ${(lt.output_tokens ?? 0).toLocaleString()} out`;
        h += `<span class="session-usage-last" title="${esc(title)}">${esc(label)}</span>`;
    }
    const total = usage.total_input_tokens + usage.total_output_tokens;
    if (total > 0) {
        const approx = usage.estimated ? '~' : '';
        const cost = formatCents(usage.total_cost_cents);
        const title = `Session total: ${usage.total_input_tokens.toLocaleString()} in / `
            + `${usage.total_output_tokens.toLocaleString()} out across ${usage.calls || usage.task_count || 0} `
            + `${usage.calls ? 'LLM calls' : 'traced tasks'}${cost ? `, ${cost}` : ''}`
            + `${usage.estimated ? ' (estimated from traces)' : ''}`;
        h += `<span class="session-usage-total" title="${esc(title)}">Σ ${approx}${esc(formatTokenCount(total))}${cost ? ' · ' + esc(cost) : ''}</span>`;
    }
    return h;
}
/** Sort sessions newest-first; the primary heartbeat's session (if any) is
 *  not special-cased — every session renders the same way. */
function sortSessions(sessions) {
    return [...sessions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
/** A session is "stale" when its last heartbeat is older than this. */
const SESSION_STALE_MS = 10 * 60000;
/** Resolve the one-word state shown on each session row. The deterministic /
 *  heuristic "this window" wins; otherwise it reflects the heartbeat status. */
function sessionState(status, stale, isThisWindow) {
    if (isThisWindow) {
        return { label: 'this window', cls: 'sst-window',
            title: 'The session running in this window (your active chat). Other rows are background or older sessions of the same agent.' };
    }
    if (stale) {
        return { label: 'stale', cls: 'sst-stale',
            title: 'No heartbeat in over 10 minutes — an old or closed session.' };
    }
    switch ((status || '').toLowerCase()) {
        case 'watch': return { label: 'watch', cls: 'sst-watch', title: 'Idling in watch mode — no claimable work right now.' };
        case 'idle': return { label: 'idle', cls: 'sst-idle', title: 'Connected but not actively working.' };
        case 'active': return { label: 'active', cls: 'sst-active', title: 'A background session, actively working.' };
        default: return { label: (status || 'live').toLowerCase(), cls: 'sst-live', title: 'Live session.' };
    }
}
/**
 * The single canonical "Open chat ↗" button markup, shared by the session list
 * and the board/agent detail views. Renders '' when there is no session id to
 * act on — mirroring the `if (s.session_id)` guard in {@link renderSessionList},
 * so a card never carries a dead button. The host wires it via the `openSession`
 * command (see kdream-dashboard.js) → `handleOpenSession` deep-link ladder.
 */
function openChatButton(ref) {
    if (!ref || !ref.session_id) {
        return '';
    }
    return `<button type="button" class="session-open"`
        + ` data-session-id="${esc(ref.session_id)}"`
        + ` data-source="${esc(ref.source ?? '')}"`
        + ` data-raw-ref="${esc(ref.rawRef ?? '')}"`
        + ` title="Open this chat session">Open chat ↗</button>`;
}
/**
 * Render the per-agent session list (expanded card body). One row per
 * session heartbeat: short id, state, model, current task, last-seen.
 *
 * For the agent running in this window ({@link SessionListOpts.isSelfAgent}),
 * exactly one row is flagged "this window" and floated to the top so the user
 * can tell their active chat apart from background / older sessions of the same
 * agent — the single most useful disambiguation when one tool hosts many chats.
 */
function renderSessionList(sessions, now = Date.now(), opts = {}) {
    if (!sessions || sessions.length === 0) {
        return '';
    }
    const sorted = sortSessions(sessions);
    const isStale = (s) => now - new Date(s.timestamp).getTime() > SESSION_STALE_MS;
    // Which row is "this window"? Deterministic id match first; else, for the self
    // agent, the freshest non-stale session. Never guesses when all are stale.
    let thisWindowId;
    if (opts.selfSessionId && sorted.some(s => s.session_id === opts.selfSessionId)) {
        thisWindowId = opts.selfSessionId;
    }
    else if (opts.isSelfAgent) {
        thisWindowId = sorted.find(s => s.session_id && !isStale(s))?.session_id;
    }
    // Float the this-window row to the top (stable for every other row).
    const ordered = thisWindowId
        ? [...sorted].sort((a, b) => (b.session_id === thisWindowId ? 1 : 0) - (a.session_id === thisWindowId ? 1 : 0))
        : sorted;
    let h = '<div class="session-list" aria-label="Sessions">';
    h += `<div class="session-list-label">Sessions<span class="session-list-count">${sorted.length}</span></div>`;
    for (const s of ordered) {
        const isThisWindow = !!thisWindowId && s.session_id === thisWindowId;
        const stale = !isThisWindow && isStale(s);
        h += `<div class="session-row${isThisWindow ? ' this-window' : ''}${stale ? ' stale' : ''}">`;
        const dotStatus = isThisWindow ? 'status-active' : (stale ? 'status-offline' : 'status-' + esc(s.status || 'idle'));
        h += `<span class="session-dot ${dotStatus}" aria-hidden="true"></span>`;
        h += `<span class="session-id" title="${esc(s.session_id ?? '')}">${esc(shortSessionId(s.session_id) || '(no id)')}</span>`;
        const st = sessionState(s.status, stale, isThisWindow);
        h += `<span class="session-state ${st.cls}" title="${esc(st.title)}">${esc(st.label)}</span>`;
        // Model badge: heartbeat's current_llm wins; the usage ledgers fill in for
        // tools that never stamp one (the "which model is this window on" ask).
        const usage = s.session_id ? opts.usageBySession?.[s.session_id] : undefined;
        const llm = s.current_llm || usage?.model;
        if (llm) {
            h += `<span class="session-model" title="${esc(llm)}">${esc(shortModel(llm))}</span>`;
        }
        // Context-window chip (from the model catalog) + remaining-budget chip when
        // the agent reports one — the per-session token signals the panel can show.
        if (llm) {
            const win = (0, modelCatalog_1.contextWindowForModel)(llm);
            h += `<span class="session-ctx" title="Context window: ${win.toLocaleString()} tokens (${esc(llm)})">ctx ${esc(formatTokenCount(win))}</span>`;
        }
        if (typeof s.token_budget_remaining === 'number' && s.token_budget_remaining >= 0) {
            h += `<span class="session-budget" title="Tokens remaining in this session's budget window: ${s.token_budget_remaining.toLocaleString()}">${esc(formatTokenCount(s.token_budget_remaining))} left</span>`;
        }
        h += sessionUsageChips(usage);
        if (s.current_task) {
            h += `<span class="session-task" title="${esc(s.current_task)}">${esc(s.current_task)}</span>`;
        }
        h += `<span class="session-seen">${esc(formatAge(s.timestamp, now))}</span>`;
        // "Open chat" — only when we have a session id to act on. The host runs a
        // deep-link ladder (resume-by-id → reveal transcript → copy command).
        // Shared helper so the board card detail + agent current-task line emit the
        // byte-identical button (same class, data-attrs, host wiring).
        h += openChatButton({ session_id: s.session_id, source: s.adapterId || s.agent_id || '', rawRef: s.rawRef });
        h += '</div>';
    }
    h += '</div>';
    return h;
}
// ---------------------------------------------------------------------------
// Workload + completed-work history (Slice B)
// ---------------------------------------------------------------------------
/** One review-status badge for a completed-work row. Empty status → no badge. */
function completedStatusBadge(status) {
    const s = (status ?? '').toLowerCase();
    if (!s) {
        return '';
    }
    const cls = s === 'approved' ? 'cw-approved'
        : (s === 'rejected' || s === 'needs_changes' || s === 'request_changes') ? 'cw-rejected'
            : 'cw-pending';
    return `<span class="cw-status ${cls}" title="review: ${esc(s)}">${esc(s.replace(/_/g, ' '))}</span>`;
}
/**
 * Render the per-agent workload rollup line plus an expandable "Completed work"
 * list, both sourced from the durable task ledger (see src/taskLedger.ts). The
 * list uses a native <details> element so it collapses with zero client JS —
 * the existing card-body toggle handles outer expand/collapse, and <details>
 * handles this inner section independently. Returns '' when no workload data is
 * attached, so the card is byte-identical to before for un-augmented models.
 */
function renderAgentWorkload(wl, now = Date.now()) {
    if (!wl) {
        return '';
    }
    let h = '<div class="agent-workload" aria-label="Workload">';
    // Rollup counters — same visual family as the inbox-summary counters.
    h += '<div class="workload-rollup">';
    h += `<div class="wl"><span class="wl-num">${wl.assigned}</span><span class="wl-label">Assigned</span></div>`;
    h += `<div class="wl"><span class="wl-num">${wl.inProgress}</span><span class="wl-label">In progress</span></div>`;
    h += `<div class="wl wl-done"><span class="wl-num">${wl.doneToday}</span><span class="wl-label">Done today</span></div>`;
    h += `<div class="wl"><span class="wl-num">${wl.doneTotal}</span><span class="wl-label">Done total</span></div>`;
    h += '</div>';
    // Completed-work history — collapsible via native <details> (no client JS).
    const items = wl.recentCompleted ?? [];
    if (items.length > 0) {
        h += '<details class="completed-work">';
        h += `<summary class="completed-work-summary">Completed work<span class="cw-count">${wl.doneTotal}</span></summary>`;
        h += '<ul class="completed-work-list">';
        for (const it of items) {
            h += '<li class="cw-row">';
            h += `<span class="cw-task" title="${esc(it.task_id)}">${esc(it.task_id)}</span>`;
            if (it.title) {
                h += `<span class="cw-title" title="${esc(it.title)}">${esc(it.title)}</span>`;
            }
            if (it.initiative) {
                h += `<span class="cw-initiative" title="${esc(it.initiative)}">${esc(it.initiative)}</span>`;
            }
            if (typeof it.sprint === 'number') {
                h += `<span class="cw-sprint">sprint ${esc(it.sprint)}</span>`;
            }
            if (it.sprintLabel) {
                h += `<span class="cw-sprint">${esc(it.sprintLabel)}</span>`;
            }
            h += completedStatusBadge(it.review_status);
            if (it.completed_at) {
                h += `<span class="cw-age" title="${esc(it.completed_at)}">${esc(formatAge(it.completed_at, now))}</span>`;
            }
            h += '</li>';
        }
        h += '</ul>';
        if (wl.doneTotal > items.length) {
            h += `<p class="cw-more">+${wl.doneTotal - items.length} earlier</p>`;
        }
        h += '</details>';
    }
    h += '</div>';
    return h;
}
/** Compact a token count to a "12.3k" / "1.2M" style label. Keeps one decimal
 *  below 100k / 1M so small-but-meaningful counts stay legible, then rounds. */
function formatTokens(n) {
    if (!Number.isFinite(n) || n <= 0) {
        return '0';
    }
    if (n < 1000) {
        return String(Math.round(n));
    }
    if (n < 1000000) {
        const k = n / 1000;
        return (k < 100 ? k.toFixed(1) : Math.round(k).toString()) + 'k';
    }
    const m = n / 1000000;
    return (m < 100 ? m.toFixed(1) : Math.round(m).toString()) + 'M';
}
/**
 * Render the per-agent cost rollup as one compact muted line in the card body,
 * e.g. "▸ 12.3k tok · $0.04 · 7 runs". Mirrors the additive workload pattern:
 * returns '' when no cost is attached (card byte-identical for un-augmented
 * models) and when the rollup has nothing worth showing (no tokens, no cost,
 * no dispatches). Cost ($) and tokens are each dropped when zero/absent.
 */
function renderAgentCost(cost) {
    if (!cost) {
        return '';
    }
    const parts = [];
    if (cost.tokensTotal > 0) {
        parts.push(`<span class="cost-tok">${esc(formatTokens(cost.tokensTotal))} tok</span>`);
    }
    if (typeof cost.costUsd === 'number' && cost.costUsd > 0) {
        parts.push(`<span class="cost-usd">$${esc(cost.costUsd.toFixed(cost.costUsd < 1 ? 2 : 2))}</span>`);
    }
    if (cost.dispatches > 0) {
        parts.push(`<span class="cost-runs">${esc(cost.dispatches)} run${cost.dispatches === 1 ? '' : 's'}</span>`);
    }
    if (parts.length === 0) {
        return '';
    }
    const tip = `${cost.tokensIn} in · ${cost.tokensOut} out · ${cost.tokensTotal} total tokens` +
        (typeof cost.costUsd === 'number' ? ` · $${cost.costUsd.toFixed(4)}` : '') +
        ` · ${cost.dispatches} dispatch${cost.dispatches === 1 ? '' : 'es'}`;
    return `<div class="agent-cost" aria-label="Cost" title="${esc(tip)}"><span class="cost-arrow">▸</span>${parts.join('<span class="cost-sep">·</span>')}</div>`;
}
// ---------------------------------------------------------------------------
// Agent metrics (LANE C)
// ---------------------------------------------------------------------------
/** Coerce an unknown to a finite number, defaulting non-numbers/NaN to 0.
 *  Local to this module so the metric renderers never throw on a malformed
 *  rollup. Mirrors the `num` helper in src/fleet/fleetMetrics.ts. */
function metricNum(v) {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : 0;
}
/** One decimal place, dropping a trailing `.0` (`1.0k` → `1k`). */
function metricTrimZero(n) {
    const s = n.toFixed(1);
    return s.endsWith('.0') ? s.slice(0, -2) : s;
}
/** Compact a token count to `840` / `12.3k` / `1.2M`. Mirrors `formatTokens`
 *  in src/fleet/fleetMetrics.ts so the sidebar card and the wide Manager format
 *  identically; kept inline so this render module stays fs-free. */
function formatMetricTokens(tokens) {
    const n = metricNum(tokens);
    const abs = Math.abs(n);
    if (abs < 1000) {
        return String(Math.round(n));
    }
    if (abs < 1000000) {
        return metricTrimZero(n / 1000) + 'k';
    }
    return metricTrimZero(n / 1000000) + 'M';
}
/** Format a dollar amount: `$0.00` / `$1.20`. Mirrors `formatUsd` in
 *  src/fleet/fleetMetrics.ts. */
function formatMetricUsd(usd) {
    return '$' + metricNum(usd).toFixed(2);
}
/**
 * Render the compact metrics pip for the always-visible card head — the
 * "what has this agent spent / how much has it run" signal at a glance:
 * `$X · Nk tok · Md`. Returns '' when no metrics were attached OR the rollup
 * is fully zero (a local-only fleet that legitimately spent nothing and logged
 * no rows shouldn't carry a noisy all-zero pip). Kept tiny + on one line so it
 * sits beside the workload pip without wrapping.
 */
function renderAgentMetricsPip(m) {
    if (!m) {
        return '';
    }
    const tokens = metricNum(m.tokensTotal) || (metricNum(m.tokensIn) + metricNum(m.tokensOut));
    const cost = metricNum(m.costUsd);
    const runs = metricNum(m.dispatches);
    // Nothing to show — no spend, no tokens, no dispatches.
    if (cost === 0 && tokens === 0 && runs === 0) {
        return '';
    }
    const tip = `${formatMetricUsd(cost)} spent · ${formatMetricTokens(tokens)} tokens · ${runs} dispatch${runs === 1 ? '' : 'es'}`;
    let h = `<span class="metrics-pip" title="${esc(tip)}">`;
    h += `<span class="mp-cost" title="spend (USD)">${esc(formatMetricUsd(cost))}</span>`;
    if (tokens > 0) {
        h += `<span class="mp-tok" title="total tokens">${esc(formatMetricTokens(tokens))} tok</span>`;
    }
    if (runs > 0) {
        h += `<span class="mp-runs" title="dispatches">${runs}d</span>`;
    }
    h += '</span>';
    return h;
}
/**
 * Render the fuller per-agent Metrics block in the expanded card body: a
 * counter row (Tokens in / out / $ / Dispatches) sourced from the LLM cost
 * ledger rollup. Visual family matches the workload-rollup + inbox-summary
 * counters so the body reads consistently. Returns '' when no metrics were
 * attached, so the card is byte-identical to before for un-augmented models.
 */
function renderAgentMetrics(m, _now = Date.now()) {
    if (!m) {
        return '';
    }
    const tIn = metricNum(m.tokensIn);
    const tOut = metricNum(m.tokensOut);
    const total = metricNum(m.tokensTotal) || (tIn + tOut);
    const cost = metricNum(m.costUsd);
    const runs = metricNum(m.dispatches);
    let h = '<div class="agent-metrics" aria-label="Metrics">';
    // Section caption so the block is unambiguous next to the workload rollup.
    h += '<div class="metrics-caption">Metrics<span class="metrics-sub" title="from the LLM cost ledger">LLM ledger</span></div>';
    h += '<div class="metrics-rollup">';
    h += `<div class="mc"><span class="mc-num" title="${tIn}">${esc(formatMetricTokens(tIn))}</span><span class="mc-label">Tokens in</span></div>`;
    h += `<div class="mc"><span class="mc-num" title="${tOut}">${esc(formatMetricTokens(tOut))}</span><span class="mc-label">Tokens out</span></div>`;
    h += `<div class="mc mc-cost"><span class="mc-num">${esc(formatMetricUsd(cost))}</span><span class="mc-label">Spend</span></div>`;
    h += `<div class="mc"><span class="mc-num">${runs}</span><span class="mc-label">Dispatches</span></div>`;
    h += '</div>';
    // Total tokens as a footnote line (the pip shows total; the rollup splits it).
    h += `<p class="metrics-foot">${esc(formatMetricTokens(total))} tokens total</p>`;
    h += '</div>';
    return h;
}
// ---------------------------------------------------------------------------
// Per-agent Command & Control (LANE B)
// ---------------------------------------------------------------------------
/**
 * Render the per-agent action row shown in the expanded card body: Message,
 * Pause, Resume, Reassign, and EVICT. Each button carries `data-agent-id` (+
 * `data-session-id` when a self-session is known) and a `data-action` the
 * webview JS reads to post {command, agentId, sessionId} to the host. The host
 * owns the confirmation (Evict opens a REQUIRED modal). The Evict button is
 * visually distinct (`btn-evict`) because it is the one destructive action.
 *
 * `selfId` suppresses the row on the card for THIS window's own agent — you
 * don't pause/evict yourself from your own panel (the doorbells target peers).
 * Returns '' for the self card so it renders exactly as before.
 */
function renderAgentActions(agent, selfId) {
    const isSelf = !!selfId && agent.id === selfId;
    const id = esc(agent.id);
    const btn = (action, label, title, extraCls = '') => `<button type="button" class="agent-action${extraCls ? ' ' + extraCls : ''}" `
        + `data-action="${esc(action)}" data-agent-id="${id}" title="${esc(title)}">${esc(label)}</button>`;
    // Start / Onboard — the one-click affordance for an agent that is DETECTED
    // (registered / extension present) but NOT LIVE (no recent heartbeat / no
    // running session). Clicking it wires the EXISTING join-prompt onboarding flow
    // for THIS agent id (the host reuses fleetJoinPromptCommand, pre-selecting the
    // agent). Shown even on this window's own card if the host is somehow not live,
    // so the operator always has a way to (re)start a dark agent.
    let startBtn = '';
    if (isDetectedNotLive(agent)) {
        const mech = loopMechanismMeta(agent.loop_mechanism);
        const hint = mech
            ? ` It ${agent.loop_mechanism === 'plain-message' ? 'must be started manually' : 'auto-drives once launched'} (${mech.short}).`
            : '';
        startBtn = `<button type="button" class="agent-action btn-start" `
            + `data-action="startOnboardAgent" data-agent-id="${id}" `
            + `title="Start / onboard ${esc(agent.name || agent.id)} — generate this agent's join prompt so it can join the fleet.${esc(hint)}">`
            + `&#9654; Start / Onboard</button>`;
    }
    // The peer command-and-control doorbells (Message/Pause/…/Evict) never target
    // this window's own agent — you don't pause/evict yourself. So the standard
    // C&C row is suppressed on the self card, but the Start/Onboard button (a
    // recovery affordance) may still render above.
    let cc = '';
    if (!isSelf) {
        cc += btn('messageAgent', 'Message', 'Send this agent a message (lands in its inbox).');
        cc += btn('pauseAgent', 'Pause', 'Ask this agent to stop claiming new work.');
        cc += btn('resumeAgent', 'Resume', 'Tell a paused agent it may claim work again.');
        cc += btn('reassignAgent', 'Reassign', 'Release a claim this agent holds back to the board.');
        cc += btn('evictAgent', 'Evict', 'Evict this agent (releases work, revokes trust, retires it). Confirmation required.', 'btn-evict');
    }
    if (!startBtn && !cc) {
        return '';
    }
    return '<div class="agent-actions" role="group" aria-label="Agent actions">' + startBtn + cc + '</div>';
}
/**
 * Render the per-agent work-history timeline (expanded card body): the tasks the
 * agent is driving right now (from `currentTasks`) followed by its recent
 * completions (from the durable ledger via `workload.recentCompleted`), newest
 * first. This is the "what has this agent been doing" view the operator wants
 * next to the action buttons. Returns '' when there is nothing to show, so the
 * card is byte-identical to before for un-augmented models.
 */
function renderAgentHistory(agent, now = Date.now()) {
    const current = (agent.currentTasks ?? []).filter(Boolean);
    const completed = agent.workload?.recentCompleted ?? [];
    if (current.length === 0 && completed.length === 0) {
        return '';
    }
    let h = '<div class="agent-history" aria-label="Work history">';
    h += '<div class="history-caption">Work history</div>';
    h += '<ol class="history-timeline">';
    // In-flight entries first — the live "now" rung of the timeline.
    for (const t of current) {
        h += '<li class="history-row history-active">';
        h += '<span class="history-dot history-dot-active" aria-hidden="true"></span>';
        h += `<span class="history-task" title="${esc(t)}">${esc(t)}</span>`;
        h += '<span class="history-state">in flight</span>';
        h += '</li>';
    }
    // Then recent completions, newest first (the ledger already orders them).
    for (const it of completed) {
        h += '<li class="history-row history-done">';
        h += '<span class="history-dot history-dot-done" aria-hidden="true"></span>';
        h += `<span class="history-task" title="${esc(it.task_id)}">${esc(it.task_id)}</span>`;
        if (it.title) {
            h += `<span class="history-title" title="${esc(it.title)}">${esc(it.title)}</span>`;
        }
        if (it.initiative) {
            h += `<span class="history-initiative" title="${esc(it.initiative)}">${esc(it.initiative)}</span>`;
        }
        if (typeof it.sprint === 'number') {
            h += `<span class="history-sprint">sprint ${esc(it.sprint)}</span>`;
        }
        if (it.sprintLabel) {
            h += `<span class="history-sprint">${esc(it.sprintLabel)}</span>`;
        }
        h += completedStatusBadge(it.review_status);
        if (it.completed_at) {
            h += `<span class="history-age" title="${esc(it.completed_at)}">${esc(formatAge(it.completed_at, now))}</span>`;
        }
        h += '</li>';
    }
    h += '</ol>';
    const total = agent.workload?.doneTotal ?? completed.length;
    if (total > completed.length) {
        h += `<p class="history-more">+${total - completed.length} earlier completions</p>`;
    }
    h += '</div>';
    return h;
}
// ---------------------------------------------------------------------------
// Agent card
// ---------------------------------------------------------------------------
/** CSS modifier suffix for an agent status badge. */
function statusBadgeClass(status) {
    switch (status) {
        case 'active': return 'status-active';
        case 'idle': return 'status-idle';
        case 'overloaded': return 'status-overloaded';
        case 'stalled': return 'status-stalled';
        case 'offline': return 'status-offline';
        case 'detected': return 'status-detected';
        default: return 'status-detected';
    }
}
/** CSS modifier for a trust-level badge. */
function trustBadgeClass(t) {
    switch (t) {
        case 'high': return 'trust-high';
        case 'medium': return 'trust-medium';
        case 'low': return 'trust-low';
        case 'untrusted': return 'trust-untrusted';
        default: return 'trust-unknown';
    }
}
/** Render a row of pill-shaped chips. Accepts arbitrary string tags. */
function renderChips(label, values) {
    if (!values || values.length === 0) {
        return '';
    }
    const chips = values.map(v => `<span class="chip">${esc(v)}</span>`).join('');
    return `<div class="agent-detail-row"><span class="detail-label">${esc(label)}</span><span class="chip-row">${chips}</span></div>`;
}
/** Render a single key/value detail row. Hidden when value is empty. */
function renderDetailRow(label, value) {
    if (value == null || value === '') {
        return '';
    }
    return `<div class="agent-detail-row"><span class="detail-label">${esc(label)}</span><span class="detail-value">${esc(value)}</span></div>`;
}
/** Badge describing HOW an agent joined the team — a delegated sub-agent
 *  (spawned by an orchestrator, carries `parent_id`) or an external tool that
 *  checked in via a beacon ("joined"). Returns '' for ordinary team agents.
 *  `parent_id` is read defensively: the registry carries it on spawned rows even
 *  though it isn't on the base RegisteredAgent type. */
function renderProvenanceBadge(agent) {
    const parent = agent.parent_id;
    if (parent) {
        return `<span class="prov-badge prov-sub" title="Delegated sub-agent spawned by ${esc(parent)}">sub-agent</span>`;
    }
    if (agent.origin === 'beacon') {
        return '<span class="prov-badge prov-joined" title="Joined from another tool / IDE / runner on this machine (beacon check-in)">joined</span>';
    }
    return '';
}
/** Human-facing label + tooltip for a `loop_mechanism` registry value. Describes
 *  whether the agent auto-polls or needs a manual start, which is exactly the
 *  distinction the operator needs when an agent is detected-but-not-live. */
function loopMechanismMeta(m) {
    switch (m) {
        case 'slash-loop':
            return { short: 'auto /loop', title: 'Auto-loops via its /loop skill — it re-runs its own cycle once started.' };
        case 'plain-message':
            return { short: 'manual start', title: 'Chat-only host — must be manually started/fed a prompt each cycle (no auto-poll).' };
        case 'cli-headless':
            return { short: 'headless runner', title: 'Headless subprocess — a runner re-dispatches it (auto-driven once launched).' };
        case 'bridge-relayed':
            return { short: 'bridge-driven', title: 'A REST bridge / companion auto-submits its next cycle (auto-driven).' };
        default:
            return null; // unknown / absent — render no badge
    }
}
/** Render the compact loop-mechanism badge shown on the card summary line, so the
 *  operator can tell at a glance whether an agent auto-polls or needs a manual
 *  start. Returns '' when the registry row carries no (recognised) mechanism. */
function renderLoopMechanismBadge(agent) {
    const meta = loopMechanismMeta(agent.loop_mechanism);
    if (!meta) {
        return '';
    }
    return `<span class="loop-mech loop-mech-${esc(String(agent.loop_mechanism))}" title="${esc(meta.title)}">${esc(meta.short)}</span>`;
}
/** True when an agent is DETECTED (extension present / a registry row exists) but
 *  NOT LIVE — no recent heartbeat, no running session. These are the agents the
 *  Start / Onboard affordance targets. A live agent is active/idle/overloaded;
 *  offline / stalled / detected all mean "not currently running". */
function isDetectedNotLive(agent) {
    const live = agent.live_status || agent.status;
    return live === 'offline' || live === 'stalled' || live === 'detected';
}
/**
 * Render one agent card. The summary row is always rendered; the expanded
 * body is rendered as a sibling div the JS can toggle by adding/removing
 * the .open class on the surrounding .agent-card element.
 */
function renderAgentCard(agent, summary = null, now = Date.now(), selfId, selfSessionId, usageBySession) {
    const live = agent.live_status || agent.status || 'detected';
    const hb = agent.heartbeat ?? null;
    const lastBeat = hb?.timestamp || agent.last_heartbeat || null;
    const cardId = `agent-card-${esc(agent.id)}`;
    const isSelf = !!selfId && agent.id === selfId;
    // ── Summary line (always visible) ────────────────────────────────────────
    let head = '<div class="agent-card-head" role="button" tabindex="0" aria-expanded="false" ';
    head += `aria-controls="${cardId}-body" data-agent-id="${esc(agent.id)}">`;
    head += '<span class="card-chevron"></span>';
    head += `<span class="status-pill ${statusBadgeClass(live)}" title="${esc(live)}">${esc(live)}</span>`;
    head += `<span class="agent-name">${esc(agent.name || agent.id)}</span>`;
    // "your agent" pill — marks the TOOL running in this window, not a single
    // session. One tool can host many chat sessions, so the precise "this window"
    // flag lives on a session row below; this pill only says which agent is yours
    // (and why the self-scoped "Awaiting You" section attaches here).
    if (isSelf) {
        head += '<span class="you-pill" title="Your agent — the tool running in this window. It can host several chat sessions; the one you are in is flagged “this window” under Sessions below.">your agent</span>';
    }
    // Role chip — the single most useful "what is this agent doing on the team"
    // signal, so it sits right after the name on the always-visible summary line.
    head += renderRoleChip(agentRole(agent), true);
    head += `<span class="agent-id">${esc(agent.id)}</span>`;
    if (agent.extension_id) {
        head += `<span class="agent-platform">${esc(extractPlatform(agent.extension_id))}</span>`;
    }
    // Model the agent is running right now — abbreviated to stay on one line.
    const headModel = hb?.current_llm
        || (agent.llms_available && agent.llms_available.length === 1 ? agent.llms_available[0] : undefined);
    if (headModel) {
        head += `<span class="agent-model" title="${esc(headModel)}">${esc(shortModel(headModel))}</span>`;
    }
    // CF-2: origin/host badge — only for relay-forwarded remote-host agents, so
    // the single-machine view is unchanged (no badge when origin is local/absent).
    if (isRemoteAgent(agent)) {
        const host = agentHost(agent);
        const isBeacon = agent.origin === 'beacon';
        const title = isBeacon
            ? `External agent on ${esc(host)} (beacon check-in)`
            : `Remote agent on ${esc(host)} (via cloud relay)`;
        head += `<span class="origin-badge origin-${isBeacon ? 'beacon' : 'remote'}" title="${title}">⌂ ${esc(host)}</span>`;
    }
    // Provenance — HOW this agent got onto the team (vs the origin badge's WHERE):
    // a delegated sub-agent spawned by an orchestrator, or an external tool that
    // joined via a beacon check-in. Primary team agents carry no provenance badge.
    head += renderProvenanceBadge(agent);
    // loop_mechanism badge — tells the operator whether this agent auto-polls or
    // must be manually started/fed a prompt. Most useful when it is detected-but-
    // not-live (the Start / Onboard case), but shown whenever the row carries a
    // recognised mechanism. Renders '' for legacy rows without the field.
    head += renderLoopMechanismBadge(agent);
    if (summary && summary.awaiting_response > 0) {
        head += `<span class="awaiting-pip" title="${summary.awaiting_response} awaiting your response">${summary.awaiting_response}</span>`;
    }
    // Slice B: compact workload pip on the always-visible summary line — the
    // "is this agent carrying work / has it shipped today" signal at a glance.
    // Only rendered when a ledger-backed workload was attached to the model.
    const wl = agent.workload;
    if (wl && (wl.assigned > 0 || wl.inProgress > 0 || wl.doneTotal > 0)) {
        const tip = `${wl.assigned} assigned · ${wl.inProgress} in progress · ${wl.doneToday} done today · ${wl.doneTotal} done total`;
        head += `<span class="workload-pip" title="${esc(tip)}">`;
        if (wl.inProgress > 0) {
            head += `<span class="wl-inflight" title="in progress">◐${wl.inProgress}</span>`;
        }
        if (wl.assigned > 0) {
            head += `<span class="wl-assigned" title="assigned (open)">≡${wl.assigned}</span>`;
        }
        if (wl.doneToday > 0) {
            head += `<span class="wl-donetoday" title="done today">●${wl.doneToday}</span>`;
        }
        head += '</span>';
    }
    // LANE C: compact metrics pip ($ · tokens · dispatches) right after the
    // workload pip — the "spend / token / run" signal at a glance. Renders '' when
    // no ledger-backed metrics were attached or the rollup is fully zero.
    head += renderAgentMetricsPip(agent.metrics);
    head += '</div>';
    // ── Expanded body ────────────────────────────────────────────────────────
    let body = `<div class="agent-card-body" id="${cardId}-body" hidden>`;
    // Role first, with the colored pill so the body restates the head chip.
    body += `<div class="agent-detail-row"><span class="detail-label">Role</span>`;
    body += `<span class="detail-value">${renderRoleChip(agentRole(agent), false)}</span></div>`;
    // Lane A: "Current task(s)" — the task ids this agent is actively driving on
    // the live board (host-computed from in_flight claims it owns). Each id is a
    // compact chip so the agent's live work reads at a glance. Hidden when empty.
    if (agent.currentTasks && agent.currentTasks.length > 0) {
        const tasks = agent.currentTasks;
        const chips = tasks.map(t => `<span class="current-task-chip" title="${esc(t)}">${esc(t)}</span>`).join('');
        body += `<div class="agent-detail-row"><span class="detail-label">Current task${tasks.length === 1 ? '' : 's'}</span>`;
        body += `<span class="current-task-row">${chips}</span></div>`;
    }
    body += renderChips('Capabilities', agent.capabilities);
    body += renderChips('LLMs', agent.llms_available);
    if (typeof agent.context_window === 'number' && agent.context_window > 0) {
        body += renderDetailRow('Context Window', formatContextWindow(agent.context_window));
    }
    if (agent.trust_level) {
        body += `<div class="agent-detail-row"><span class="detail-label">Trust</span>`;
        body += `<span class="trust-pill ${trustBadgeClass(agent.trust_level)}">${esc(agent.trust_level)}</span></div>`;
    }
    if (agent.cost_budget) {
        const parts = [];
        if (typeof agent.cost_budget.daily_usd === 'number') {
            parts.push(`$${agent.cost_budget.daily_usd}/day`);
        }
        if (typeof agent.cost_budget.hourly_usd === 'number') {
            parts.push(`$${agent.cost_budget.hourly_usd}/hr`);
        }
        if (parts.length) {
            body += renderDetailRow('Budget', parts.join(' · '));
        }
    }
    // CF-2: surface host + origin so a remote agent is unambiguous in the body.
    if (isRemoteAgent(agent)) {
        const suffix = agent.origin === 'beacon' ? ' (external · beacon)' : ' (remote · via relay)';
        body += renderDetailRow('Host', `${agentHost(agent)}${suffix}`);
    }
    // v2 identity + routing fields
    if (agent.machine_id) {
        body += renderDetailRow('Machine', agent.machine_id);
    }
    if (agent.machine_ip) {
        body += renderDetailRow('Machine IP', agent.machine_ip);
    }
    if (typeof agent.max_parallel_tasks === 'number') {
        body += renderDetailRow('Max Parallel', String(agent.max_parallel_tasks));
    }
    if (agent.human_in_loop_required) {
        body += renderDetailRow('Human-in-Loop', 'required');
    }
    body += renderChips('Tools', agent.tools_supported);
    body += renderChips('Skills', agent.skills_loaded);
    body += renderDetailRow('Last Heartbeat', formatAge(lastBeat, now));
    if (hb?.current_llm) {
        body += renderDetailRow('Current LLM', hb.current_llm);
    }
    if (typeof hb?.queue_depth === 'number') {
        const warn = hb.queue_depth >= 10 ? ' warn' : '';
        body += `<div class="agent-detail-row"><span class="detail-label">Queue Depth</span>`;
        body += `<span class="queue-bar${warn}" role="progressbar" aria-valuemin="0" aria-valuemax="20" aria-valuenow="${hb.queue_depth}">`;
        body += `<span class="queue-fill" style="width:${Math.min(100, hb.queue_depth * 5)}%"></span>`;
        body += `<span class="queue-num">${hb.queue_depth}</span></span></div>`;
    }
    if (typeof hb?.token_budget_remaining === 'number') {
        body += renderDetailRow('Tokens Remaining', String(hb.token_budget_remaining));
    }
    if (typeof hb?.error_rate_1m === 'number') {
        const pct = Math.round(hb.error_rate_1m * 1000) / 10;
        body += renderDetailRow('Error Rate (1m)', pct + '%');
    }
    if (hb?.last_error?.message) {
        body += `<div class="agent-detail-row last-error"><span class="detail-label">Last Error</span>`;
        body += `<pre class="error-box">${esc(hb.last_error.message)}</pre></div>`;
    }
    // Per-session breakdown — when sidecar session heartbeats exist, show one
    // row each (a single agent process can host several chat sessions). Falls
    // back to the single primary session id when no sidecars were collected.
    if (agent.sessions && agent.sessions.length > 0) {
        body += renderSessionList(agent.sessions, now, { selfSessionId, isSelfAgent: isSelf, usageBySession });
    }
    else if (hb?.session_id) {
        body += renderDetailRow('Session', shortSessionId(hb.session_id));
    }
    else {
        // Registered/present but no live chat session — e.g. an idle peer that is
        // "not doing anything right now". Say so plainly instead of an empty gap.
        body += '<div class="session-list session-none" aria-label="Sessions">'
            + '<span class="session-none-label">No active chat sessions</span></div>';
    }
    // Inbox summary counters (per agent)
    if (summary) {
        body += '<div class="inbox-summary" aria-label="Inbox counters">';
        body += `<div class="ic"><span class="ic-num">${summary.total}</span><span class="ic-label">Total</span></div>`;
        body += `<div class="ic"><span class="ic-num">${summary.unread}</span><span class="ic-label">Unread</span></div>`;
        body += `<div class="ic ic-awaiting"><span class="ic-num">${summary.awaiting_response}</span><span class="ic-label">Awaiting You</span></div>`;
        body += `<div class="ic"><span class="ic-num">${summary.archived}</span><span class="ic-label">Archived</span></div>`;
        body += '</div>';
    }
    // Slice B: per-agent workload rollup + collapsible completed-work history,
    // sourced from the durable task ledger. Renders nothing when no workload was
    // attached to the model (backward-compatible).
    body += renderAgentWorkload(agent.workload, now);
    // Follow-up #4: per-agent cost line (tokens / $ / dispatches) from the LLM
    // cost ledger. Renders nothing when no cost was attached (backward-compatible).
    body += renderAgentCost(agent.cost);
    // LANE C: per-agent metrics block (tokens in/out · $ · dispatches), rolled up
    // from the LLM cost ledger. Renders nothing when no metrics were attached to
    // the model (backward-compatible).
    body += renderAgentMetrics(agent.metrics, now);
    // LANE B: per-agent work-history timeline (in-flight tasks + recent
    // completions). Renders nothing when no current/completed work is known.
    body += renderAgentHistory(agent, now);
    // LANE B: per-agent Command & Control action row (Message / Pause / Resume /
    // Reassign / Evict). Suppressed on this window's own card. The host owns
    // confirmation; the webview JS wires the data-action buttons to postMessage.
    body += renderAgentActions(agent, selfId);
    body += '</div>';
    const selfClass = isSelf ? ' is-self' : '';
    return `<div class="agent-card${selfClass}" data-agent-id="${esc(agent.id)}"${isSelf ? ' data-self="true"' : ''}>${head}${body}</div>`;
}
/** Render the persistent "you are X" identity banner for the Team view.
 *
 * The same logical mailbox renders under a different card in each IDE because
 * the self-scoped "Awaiting You" section follows whichever agent is running
 * the window. Without telling the user who "you" are, that looks arbitrary —
 * this banner makes it legible. Returns '' when the host identity is unknown.
 */
function renderSelfIdentity(agents, selfId) {
    if (!selfId) {
        return '';
    }
    const self = agents.find(a => a.id === selfId);
    const name = self?.name || selfId;
    const known = !!self;
    const note = known
        ? 'This is your agent — the tool running in this window. The "Awaiting You" section and inbox counts are scoped to it; your active chat is flagged “this window” under its Sessions.'
        : 'This window’s agent is not registered on the team yet.';
    return (`<div class="self-identity${known ? '' : ' unknown'}" title="${esc(note)}">` +
        '<span class="self-identity-label">You are</span>' +
        `<span class="self-identity-name">${esc(name)}</span>` +
        `<span class="agent-id">${esc(selfId)}</span>` +
        '</div>');
}
/** Render the entire agent list. Returns a string the JS sets as innerHTML.
 *
 * CF-2: when any agent is relay-forwarded (cross-machine fleet), cards are
 * grouped under a per-host header — this machine's local agents first, then
 * remote hosts alphabetically. With no relay data the list is flat, exactly
 * as before (single-machine view unchanged). */
function renderAgentList(agents, summaries = {}, now = Date.now(), selfId, selfSessionId, usageBySession) {
    if (!agents || agents.length === 0) {
        return '<p class="empty">No agents detected.</p>';
    }
    const hasRelay = agents.some(isRemoteAgent);
    const card = (a) => renderAgentCard(a, summaries[a.id] ?? null, now, selfId, selfSessionId, usageBySession);
    const summary = renderSelfIdentity(agents, selfId) + renderTeamSummary(agents, now);
    if (!hasRelay) {
        return summary + agents.map(card).join('');
    }
    // Partition into this machine's local agents and remote agents grouped by
    // host. Local agents render first under "This machine"; each remote host is
    // its own group, hosts alphabetical.
    const localAgents = [];
    const remoteByHost = new Map();
    for (const a of agents) {
        if (isRemoteAgent(a)) {
            const host = agentHost(a);
            const list = remoteByHost.get(host) ?? [];
            list.push(a);
            remoteByHost.set(host, list);
        }
        else {
            localAgents.push(a);
        }
    }
    const groupHeader = (cls, glyph, label, count) => `<div class="host-group-header ${cls}"><span class="host-glyph">${glyph}</span>` +
        `<span class="host-label">${esc(label)}</span>` +
        `<span class="host-count">${count}</span></div>`;
    let out = summary;
    if (localAgents.length > 0) {
        out += groupHeader('local', '⚑', 'This machine', localAgents.length);
        out += localAgents.map(card).join('');
    }
    for (const host of Array.from(remoteByHost.keys()).sort((a, b) => a.localeCompare(b))) {
        const list = remoteByHost.get(host);
        out += groupHeader('remote', '⌂', host, list.length);
        out += list.map(card).join('');
    }
    return out;
}
/** Heuristic: derive a short platform tag from extension_id. */
function extractPlatform(extensionId) {
    const id = extensionId.toLowerCase();
    if (id.includes('claude')) {
        return 'claude-code';
    }
    if (id.includes('kilocode')) {
        return 'kilocode';
    }
    if (id.includes('kiro')) {
        return 'kiro';
    }
    if (id.includes('roo')) {
        return 'roo';
    }
    if (id.includes('cursor')) {
        return 'cursor';
    }
    if (id.includes('continue')) {
        return 'continue';
    }
    if (id.includes('windsurf')) {
        return 'windsurf';
    }
    if (id.includes('copilot')) {
        return 'copilot';
    }
    return extensionId.split('.').pop() || extensionId;
}
// ---------------------------------------------------------------------------
// Awaiting You section
// ---------------------------------------------------------------------------
/** Truncate body text for the awaiting-you list excerpt. */
function payloadExcerpt(payload, max = 140) {
    if (!payload) {
        return '';
    }
    // Prefer human-readable fields if present.
    for (const k of ['summary', 'description', 'message', 'body', 'question']) {
        const v = payload[k];
        if (typeof v === 'string' && v.length > 0) {
            return v.length > max ? v.slice(0, max) + '…' : v;
        }
    }
    // Auto-promoted review_requests carry no human text — they point at the
    // work via `source_task_complete_id`. Describe them instead of dumping JSON.
    if (typeof payload.source_task_complete_id === 'string') {
        const author = typeof payload.author === 'string'
            ? ` by ${payload.author}` : '';
        return `Peer review requested${author} — expand to see the completed work.`;
    }
    try {
        const s = JSON.stringify(payload);
        return s.length > max ? s.slice(0, max) + '…' : s;
    }
    catch {
        return '';
    }
}
/**
 * Filter messages to those that genuinely need a response from `me`.
 *
 * CL-2: this is the "Awaiting You" basis, so it must exclude loop telemetry and
 * the orchestrator's auto `task_claim`/`next-<agent>` nudges (which carry
 * `requires_response:true` but are not real asks) and messages I sent myself.
 * The signal-vs-telemetry decision is delegated to {@link isActionableForMe} in
 * the coordination contract — the single source of truth — then the existing
 * reply-state gate is applied on top so already-answered items drop off.
 *
 * `sessionId` is optional and only used to keep a *different* session of my own
 * agent id (cross-window) from being filtered out; omit it for the legacy
 * behavior. Signature is otherwise backward-compatible.
 */
function filterAwaitingYou(messages, me, states = {}, sessionId) {
    return messages.filter(m => m.requires_response === true &&
        (0, coordination_1.isActionableForMe)(m, me, sessionId) &&
        !states[m.id]?.replied_at);
}
/** Render one Approve / Request changes / Reject button. */
function voteButton(vote, label, taskId, m, myVote) {
    const isCast = myVote === vote;
    return '<button class="vote-btn vote-' + vote + (isCast ? ' cast' : '') + '" type="button"'
        + ' data-task-id="' + esc(taskId) + '"'
        + ' data-message-id="' + esc(m.id) + '"'
        + ' data-from="' + esc(m.from) + '"'
        + ' data-vote="' + vote + '"'
        + (isCast ? ' aria-pressed="true"' : '')
        + '>' + esc(label) + (isCast ? ' ✓' : '') + '</button>';
}
/** Render the consensus tally line — counts, threshold, and a plain-English
 *  hint that tells the reviewer whether their decision is still needed. */
function renderTally(t) {
    const need = t.rule === 'unanimous' ? 'unanimous' : 'majority';
    let cls = 'awaiting-tally';
    let hint;
    if (t.decided) {
        hint = 'Decision reached — your vote is optional.';
    }
    else if (t.myVote) {
        hint = 'You voted ' + t.myVote.replace('_', ' ') + ' — you can change it below.';
    }
    else {
        cls += ' needs-you';
        hint = 'Your decision is needed.';
    }
    let h = '<div class="' + cls + '">';
    h += '<span class="tally-counts">';
    h += '<span class="t-approve" title="approvals">✓ ' + t.approvals + '</span> ';
    h += '<span class="t-changes" title="change requests">✎ ' + t.requestChanges + '</span> ';
    h += '<span class="t-reject" title="rejections">✗ ' + t.rejects + '</span>';
    h += '</span>';
    h += '<span class="tally-rule">' + t.votesReceived + '/' + t.votesRequired + ' votes · ' + need + '</span>';
    h += '<span class="tally-hint">' + esc(hint) + '</span>';
    if (typeof t.deadlineIso === 'string' && t.deadlineIso.length >= 16) {
        h += '<span class="tally-deadline">due ' + esc(t.deadlineIso.slice(0, 16).replace('T', ' ')) + '</span>';
    }
    h += '</div>';
    return h;
}
/** One key/value line in the review detail grid. */
function detailKV(label, value) {
    return '<div class="detail-kv"><span class="detail-label">' + esc(label)
        + '</span><span class="detail-val">' + esc(value) + '</span></div>';
}
/** Render the handoff test results: a pass/fail rollup line + per-suite list. */
function renderReviewTests(tests) {
    let passed = 0, failed = 0;
    for (const t of tests) {
        passed += t.passed || 0;
        failed += t.failed || 0;
    }
    const cls = 'detail-tests' + (failed > 0 ? ' has-failures' : '');
    let h = '<div class="' + cls + '"><span class="detail-label">Tests</span>';
    h += '<span class="tests-summary">' + passed + ' passed · ' + failed + ' failed · '
        + tests.length + (tests.length === 1 ? ' suite' : ' suites') + '</span><ul>';
    for (const t of tests.slice(0, 10)) {
        h += '<li>' + esc(t.suite) + ': ' + (t.passed || 0) + '✓ ' + (t.failed || 0) + '✗'
            + (typeof t.skipped === 'number' && t.skipped > 0 ? ' ' + t.skipped + '⤼' : '') + '</li>';
    }
    if (tests.length > 10) {
        h += '<li class="more">+' + (tests.length - 10) + ' more</li>';
    }
    return h + '</ul></div>';
}
/** Render the risks the author flagged on the completed work. */
function renderReviewRisks(risks) {
    let h = '<div class="detail-risks"><span class="detail-label">Risks</span><ul>';
    for (const r of risks.slice(0, 10)) {
        h += '<li>' + esc(r) + '</li>';
    }
    if (risks.length > 10) {
        h += '<li class="more">+' + (risks.length - 10) + ' more</li>';
    }
    return h + '</ul></div>';
}
/** Render the collapsed drill-down panel showing the work under review. */
function renderReviewDetail(ctx) {
    let h = '<div class="awaiting-detail" hidden>';
    if (!ctx || !ctx.found) {
        h += '<p class="detail-missing">The original completion report wasn\'t found in the '
            + 'shared inbox — it may have been archived. Decide from the task history, or ask '
            + 'the author for a recap before voting.</p>';
        if (ctx?.sourceId) {
            h += '<p class="detail-src">source: ' + esc(ctx.sourceId) + '</p>';
        }
        return h + '</div>';
    }
    h += '<div class="detail-grid">';
    if (ctx.author) {
        h += detailKV('Author', ctx.author);
    }
    if (typeof ctx.sprint === 'number') {
        h += detailKV('Sprint', String(ctx.sprint));
    }
    if (ctx.branch) {
        h += detailKV('Branch', ctx.branch);
    }
    h += '</div>';
    if (ctx.summary) {
        h += '<div class="detail-summary">' + esc(ctx.summary) + '</div>';
    }
    if (ctx.files && ctx.files.length > 0) {
        h += '<div class="detail-files"><span class="detail-label">Files changed</span><ul>';
        for (const f of ctx.files.slice(0, 20)) {
            h += '<li><button class="file-link" type="button" data-file="' + esc(f) + '">' + esc(f) + '</button></li>';
        }
        if (ctx.files.length > 20) {
            h += '<li class="more">+' + (ctx.files.length - 20) + ' more</li>';
        }
        h += '</ul></div>';
    }
    if (ctx.tests && ctx.tests.length > 0) {
        h += renderReviewTests(ctx.tests);
    }
    if (ctx.risks && ctx.risks.length > 0) {
        h += renderReviewRisks(ctx.risks);
    }
    h += '<p class="detail-decide">You\'re deciding whether this work is approved. '
        + 'Approve it, request changes, or reject below.</p>';
    return h + '</div>';
}
/** Render prior conversation turns (compact) above the reply box. */
function renderAwaitingHistory(history) {
    if (!history || history.length === 0) {
        return '';
    }
    const shown = history.slice(-6); // last 6 turns keep the sidebar usable
    let h = '<div class="awaiting-history" aria-label="Conversation history">';
    if (history.length > shown.length) {
        h += '<div class="awaiting-history-more">+' + (history.length - shown.length) + ' earlier</div>';
    }
    for (const e of shown) {
        h += '<div class="awaiting-history-row' + (e.mine ? ' mine' : '') + '">';
        h += '<span class="ah-from">' + esc(e.from) + '</span>';
        h += '<span class="ah-text" title="' + esc(e.text) + '">' + esc(e.text) + '</span>';
        h += '</div>';
    }
    return h + '</div>';
}
/** Human label for an advisory verdict chip. */
const ADVISORY_VERDICT_LABEL = {
    approve: 'Looks approvable',
    request_changes: 'Changes suggested',
    reject: 'Recommend reject',
    needs_human: 'Needs your judgment',
};
/**
 * RA-5: the Review Advisor block on an Awaiting-You review row — verdict chip,
 * rationale, flag pills, and `Dig in ↗`. HONEST about provenance: a flags-only
 * advisory says so instead of dressing determinism up as reasoning. This block
 * is ADVISORY — it never touches the castVote buttons rendered next to it.
 */
function renderAdvisory(advisory, taskId, requester = '') {
    if (!taskId) {
        return '';
    }
    if (!advisory) {
        // Not requested yet — offer the (cheap, local) build. data-from = the
        // review requester, so the host can address the RA-6 bus recommendation.
        return '<div class="advisory advisory-empty">'
            + '<button class="advisory-request" type="button" data-action="request-advisory" data-task="' + esc(taskId) + '" data-from="' + esc(requester) + '">🔎 Get advisory</button>'
            + '<span class="advisory-hint">conflict + risk lenses, local</span>'
            + '</div>';
    }
    const flagsOnly = advisory.provider === 'flags_only';
    let h = '<div class="advisory" data-advisory-id="' + esc(advisory.advisory_id) + '">';
    h += '<div class="advisory-head">';
    h += '<span class="advisory-chip advisory-' + esc(advisory.verdict) + '">' + esc(ADVISORY_VERDICT_LABEL[advisory.verdict] ?? advisory.verdict) + '</span>';
    h += flagsOnly
        ? '<span class="advisory-provider" title="Deterministic lenses only — no model ran.">flags only</span>'
        : '<span class="advisory-provider">' + esc(advisory.provider) + ' · ' + Math.round(advisory.confidence * 100) + '%</span>';
    if (advisory.escalate) {
        h += '<span class="advisory-escalate" title="A security-tier flag pins this to needs_human.">security ⇒ human</span>';
    }
    h += '<button class="advisory-dig" type="button" data-action="dig-in" data-task="' + esc(taskId) + '" title="Open a chat seeded with this advisory + the review packet">Dig in ↗</button>';
    h += '</div>';
    if (advisory.rationale) {
        h += '<div class="advisory-rationale">' + esc(advisory.rationale) + '</div>';
    }
    const pills = [];
    for (const f of advisory.risk_flags) {
        pills.push('<span class="advisory-pill risk-' + esc(f.severity) + '" title="' + esc(f.detail) + '">' + esc(f.kind) + '</span>');
    }
    for (const c of advisory.conflict_flags) {
        pills.push('<span class="advisory-pill conflict" title="' + esc(c.detail) + '">' + esc(c.kind) + (c.with_task ? ' · ' + esc(c.with_task) : '') + '</span>');
    }
    if (pills.length) {
        h += '<div class="advisory-pills">' + pills.join('') + '</div>';
    }
    return h + '</div>';
}
/** Render the Awaiting You section body. */
function renderAwaitingYou(rows) {
    if (rows.length === 0) {
        return '<p class="empty">Nothing awaiting your response.</p>';
    }
    let h = '<div class="awaiting-list" aria-live="polite">';
    for (const r of rows) {
        const m = r.message;
        const isReview = m.type === 'review_request';
        const taskId = r.context?.taskId || m.task_id || '';
        h += '<div class="awaiting-row" data-message-id="' + esc(m.id) + '">';
        // Header — clickable to expand the drill-down detail panel.
        h += '<div class="awaiting-head awaiting-meta" data-action="toggle-detail" role="button" tabindex="0" aria-expanded="false">';
        h += '<span class="awaiting-caret" aria-hidden="true">▸</span>';
        h += '<span class="awaiting-from">' + esc(m.from) + '</span>';
        h += '<span class="awaiting-type">' + esc(m.type) + '</span>';
        if (typeof m.sprint === 'number') {
            h += '<span class="awaiting-sprint">sprint ' + esc(m.sprint) + '</span>';
        }
        if (taskId) {
            h += '<span class="awaiting-task">' + esc(taskId) + '</span>';
        }
        h += '</div>';
        // One-line summary, always visible.
        h += '<div class="awaiting-body awaiting-preview">' + esc(r.excerpt) + '</div>';
        // Conversation history (prior turns), so you see what you're answering.
        h += renderAwaitingHistory(r.history);
        // Consensus tally + drill-down (review_request only).
        if (isReview && r.tally) {
            h += renderTally(r.tally);
        }
        if (isReview) {
            h += renderReviewDetail(r.context);
        }
        // RA-5: the non-voting Review Advisor block (chip / flags / Dig in), or the
        // request button when no advisory has been built yet. Never replaces voting.
        if (isReview && taskId) {
            h += renderAdvisory(r.advisory, taskId, m.from);
        }
        // Actions: a real decision for reviews, inline free-text reply otherwise.
        h += '<div class="awaiting-actions">';
        if (isReview && taskId) {
            const my = r.tally?.myVote ?? null;
            h += '<input class="vote-comment" type="text" placeholder="Optional note for the author…" aria-label="Review comment" />';
            h += '<div class="vote-btns">';
            h += voteButton('approve', 'Approve', taskId, m, my);
            h += voteButton('request_changes', 'Request changes', taskId, m, my);
            h += voteButton('reject', 'Reject', taskId, m, my);
            h += '</div>';
        }
        else {
            // Inline reply: type + send right here (the host still falls back to a
            // modal prompt if the box is left empty).
            h += '<div class="reply-row">';
            h += '<input class="reply-input" type="text" placeholder="Type your reply…" aria-label="Reply"'
                + ' data-message-id="' + esc(m.id) + '" data-from="' + esc(m.from) + '" data-type="' + esc(m.type) + '" />';
            h += '<button class="reply-btn" type="button" data-message-id="' + esc(m.id) + '" data-from="' + esc(m.from) + '" data-type="' + esc(m.type) + '">Reply</button>';
            h += '</div>';
        }
        h += '</div>';
        h += '</div>';
    }
    return h + '</div>';
}
// ---------------------------------------------------------------------------
// Fabric health badges
// ---------------------------------------------------------------------------
/** Plain-English explanation of each bridge state, used in tooltips. */
function bridgeTooltip(state, h) {
    const base = (() => {
        switch (state) {
            case 'poll': return 'Bridge transport: filesystem polling (default — no daemon required).';
            case 'sse': return 'Bridge transport: Server-Sent Events stream.';
            case 'ws': return 'Bridge transport: WebSocket stream.';
            case 'off': return 'Bridge transport: disabled. Inter-agent messages will not be relayed.';
        }
    })();
    const clients = h ? ` Connected clients: SSE=${h.sse_clients ?? 0} WS=${h.ws_clients ?? 0}.` : '';
    const port = h?.bridge_port ? ` Port ${h.bridge_port}.` : '';
    return `${base}${clients}${port} Click to open the bridge docs.`;
}
/**
 * Plain-English explanation of each in-process Knowledge Graph state, used in
 * tooltips. The KG is an in-process store (no child process, no native deps),
 * so we NEVER instruct users to install or build a daemon.
 */
function kgTooltip(state, detail) {
    switch (state) {
        case 'disabled':
            return 'Knowledge Graph: disabled. Memory recall + bi-temporal facts off. Click to enable.';
        case 'ready': {
            const driver = detail?.driverKind || 'sqlite';
            const search = detail?.caps?.vec ? 'vector+fts' : 'fts';
            const embeddings = detail?.embeddingProvider || 'none';
            return `Knowledge Graph: ready (${driver}, ${search}, embeddings: ${embeddings}). In-process store — no daemon. Click to open.`;
        }
        case 'degraded':
            return 'Knowledge Graph: degraded — no SQLite driver loaded. Memory recall returns nothing. Click for details.';
    }
}
/** Which command a click on a kg chip should dispatch, given the state. */
function kgClickCommand(state) {
    switch (state) {
        case 'disabled': return 'enableKg';
        case 'ready': return 'openKgDashboard';
        case 'degraded': return 'openKgDoctor';
    }
}
function renderFabricHealth(h) {
    const bridgeState = h?.bridge ?? 'poll';
    const kgState = h?.kg ?? 'disabled';
    const bridgeCls = `bridge-${bridgeState}`;
    const kgCls = `kg-${kgState}`;
    const bridgeLabel = `bridge: ${bridgeState}`;
    const kgLabel = `kg: ${kgState}`;
    const bridgeTip = bridgeTooltip(bridgeState, h);
    const kgTip = kgTooltip(kgState, h?.kg_detail);
    const kgCmd = kgClickCommand(kgState);
    return (`<button type="button" class="health-badge ${esc(bridgeCls)}" ` +
        `data-fabric-action="openBridgeDoc" ` +
        `title="${esc(bridgeTip)}" aria-label="${esc(bridgeTip)}">${esc(bridgeLabel)}</button>` +
        `<button type="button" class="health-badge ${esc(kgCls)}" ` +
        `data-fabric-action="${esc(kgCmd)}" ` +
        `title="${esc(kgTip)}" aria-label="${esc(kgTip)}">${esc(kgLabel)}</button>`);
}
// ---------------------------------------------------------------------------
// UI-3: Status-dot legend popover
// ---------------------------------------------------------------------------
/** Plain-English explanation of each agent status, used in the legend popover. */
exports.STATUS_LEGEND = [
    { status: 'active', label: 'Active', meaning: 'Working a claim right now.' },
    { status: 'idle', label: 'Idle', meaning: 'Heartbeat fresh; no claim in progress.' },
    { status: 'overloaded', label: 'Overloaded', meaning: 'Queue depth ≥ 10 or token budget low.' },
    { status: 'stalled', label: 'Stalled', meaning: 'No heartbeat for ≥5 cycles.' },
    { status: 'offline', label: 'Offline', meaning: 'Heartbeat dead; excluded from quorum.' },
    { status: 'detected', label: 'Detected', meaning: 'Registered but never checked in.' },
];
/**
 * Render the (?) legend chip + collapsible popover that explains every status
 * dot color. Click toggles `.open` on the wrapper; tests assert markup only.
 */
function renderStatusLegend() {
    const rows = exports.STATUS_LEGEND.map(s => `<li class="legend-row"><span class="status-dot ${esc(statusBadgeClass(s.status))}" aria-hidden="true"></span>` +
        `<span class="legend-label">${esc(s.label)}</span>` +
        `<span class="legend-meaning">${esc(s.meaning)}</span></li>`).join('');
    return (`<span class="status-legend" role="group" aria-label="Status legend">` +
        `<button type="button" class="legend-chip" aria-expanded="false" aria-controls="status-legend-popover" ` +
        `title="Show status-dot legend">?</button>` +
        `<div id="status-legend-popover" class="legend-popover" role="region" aria-label="Agent status meanings" hidden>` +
        `<ul class="legend-list">${rows}</ul>` +
        `</div>` +
        `</span>`);
}
// ---------------------------------------------------------------------------
// UI-2: Panel version footer
// ---------------------------------------------------------------------------
// CP-3.0: `readExtensionVersionFromDisk` / `readGitBranchFromDisk` moved to
// `webview-hostContext.ts` — this render module stays browser-safe (no fs/path),
// so the host reads version/git and passes them to `renderPanelFooter` below.
/** Render the panel footer. Missing pieces are omitted, not filled. */
function renderPanelFooter(version, branch) {
    const verLabel = version ? `v${esc(version)}` : 'v?';
    const parts = [`AutoClaw ${verLabel}`];
    if (branch) {
        parts.push(`branch: ${esc(branch)}`);
    }
    return `<footer class="panel-footer" role="contentinfo" aria-label="AutoClaw version">${parts.join(' · ')}</footer>`;
}
//# sourceMappingURL=webview-render.js.map