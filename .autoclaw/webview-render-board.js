"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_CARDS_PER_COLUMN = void 0;
exports.renderBoard = renderBoard;
exports.inferRoleFromActivity = inferRoleFromActivity;
exports.resolveDisplayRole = resolveDisplayRole;
exports.boardTaskCount = boardTaskCount;
exports.renderMessageFeed = renderMessageFeed;
exports.buildThreads = buildThreads;
/**
 * webview-render-board.ts — pure HTML renderers for the panel's task board
 * and per-task message threads.
 *
 * The board is a four-lane kanban built from `board.json` (see
 * src/orchestrator/board.ts):
 *   Backlog (claimable) → In progress (in_flight) → Review (awaiting_review) → Blocked (stuck)
 *
 * Each card shows the task, its assignee (with role color + model), age, and
 * a count of the messages exchanged about that task. Clicking a card's thread
 * toggle reveals the conversation between the agents working it — exactly the
 * "who is talking to whom about this task" view the fleet needs.
 *
 * Split into TypeScript so it is unit-testable without the Electron host
 * (see src/test/board-rendering.test.ts). Every interpolated value passes
 * through {@link esc}. No fs / vscode imports.
 */
const webview_render_1 = require("./webview-render");
const roles_1 = require("./roles");
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function roleClass(ctx, agentId) {
    const role = ctx.roleOf?.[agentId];
    return role ? roles_1.ROLE_META[role].cssClass : 'role-generalist';
}
function roleGlyph(ctx, agentId) {
    const role = ctx.roleOf?.[agentId];
    return role ? roles_1.ROLE_META[role].glyph : roles_1.ROLE_META.generalist.glyph;
}
function displayName(ctx, agentId) {
    return ctx.nameOf?.[agentId] || agentId;
}
/** A small colored avatar + name for a fleet participant. */
function participant(ctx, agentId) {
    return `<span class="who ${roleClass(ctx, agentId)}" title="${(0, webview_render_1.esc)(displayName(ctx, agentId))}">` +
        `<span class="who-glyph" aria-hidden="true">${roleGlyph(ctx, agentId)}</span>` +
        `<span class="who-name">${(0, webview_render_1.esc)(displayName(ctx, agentId))}</span></span>`;
}
/** Count messages for a task (0 when none / no thread map). */
function threadCount(ctx, taskId) {
    return ctx.threads?.[taskId]?.length ?? 0;
}
/** Emit the shared "Open chat ↗" button for `agentId`, or '' when no session
 *  is known for that agent. Reuses the canonical button from webview-render so
 *  the markup + host `openSession` wiring is byte-identical to the session list. */
function openChatButton(ctx, agentId) {
    if (!agentId) {
        return '';
    }
    const s = ctx.sessionOf?.[agentId];
    if (!s) {
        return '';
    }
    return (0, webview_render_1.openChatButton)({ session_id: s.session_id, source: s.source, rawRef: s.rawRef });
}
/** One key/value line in a card detail grid — same visual family as the
 *  Awaiting-You drill-down (.detail-kv). Hidden when value is empty. */
function detailKV(label, value) {
    if (value === '') {
        return '';
    }
    return `<div class="detail-kv"><span class="detail-label">${(0, webview_render_1.esc)(label)}</span>` +
        `<span class="detail-val">${(0, webview_render_1.esc)(value)}</span></div>`;
}
function priorityTag(p) {
    if (!p) {
        return '';
    }
    return `<span class="prio prio-${(0, webview_render_1.esc)(p)}" title="${(0, webview_render_1.esc)(p)} priority">${(0, webview_render_1.esc)(p)}</span>`;
}
/** Render the collapsible message thread for one task. */
function renderThread(ctx, taskId) {
    const msgs = ctx.threads?.[taskId];
    if (!msgs || msgs.length === 0) {
        return '';
    }
    const now = ctx.now ?? Date.now();
    let h = `<div class="task-thread" hidden>`;
    for (const m of msgs) {
        h += '<div class="thread-msg">';
        h += `<span class="thread-time">${(0, webview_render_1.esc)((0, webview_render_1.formatAge)(m.timestamp, now))}</span>`;
        h += participant(ctx, m.from);
        if (m.to && m.to !== 'shared') {
            h += `<span class="thread-arrow" aria-hidden="true">→</span>${participant(ctx, m.to)}`;
        }
        else if (m.to === 'shared') {
            h += `<span class="thread-arrow" aria-hidden="true">→</span><span class="who who-shared">all</span>`;
        }
        h += `<span class="thread-type type-${(0, webview_render_1.esc)(m.type)}">${(0, webview_render_1.esc)(m.type)}</span>`;
        if (m.message) {
            h += `<span class="thread-text">${(0, webview_render_1.esc)(m.message)}</span>`;
        }
        h += '</div>';
    }
    h += '</div>';
    return h;
}
/** The shared card chrome: task id/title, a thread toggle, and the body.
 *  When `opts.detail` is supplied (Lane A), a "▸" toggle appears in the card
 *  top and a collapsed `.card-detail[hidden]` block is appended after the meta
 *  line — the lane passes pre-rendered detail HTML. With no `detail` the card
 *  is byte-identical to before (no toggle, no detail block). */
function card(opts) {
    const { ctx, taskId, title, meta, detail } = opts;
    const count = threadCount(ctx, taskId);
    const hasDetail = !!(detail && detail.length > 0);
    let h = `<div class="board-card ${opts.extraClass ?? ''}" data-task-id="${(0, webview_render_1.esc)(taskId)}">`;
    h += '<div class="board-card-top">';
    h += `<span class="task-id">${(0, webview_render_1.esc)(taskId)}</span>`;
    // KG-P3: drill-down to this task's provenance (created-by/why + activity
    // timeline + lineage) in the Knowledge Graph viewer. Posts
    // { command:'openTaskProvenance', taskId } — the host runs
    // autoclaw.kg.taskProvenance. stopPropagation in the webview keeps it from
    // toggling the card's detail/thread.
    h += `<button type="button" class="card-provenance-btn" data-task-id="${(0, webview_render_1.esc)(taskId)}" ` +
        `title="Why does this task exist? — open its provenance timeline + lineage in the Knowledge Graph">` +
        `<span aria-hidden="true">◎</span> why</button>`;
    // Lane A: detail toggle. Distinct class + uiState map from the thread toggle
    // so the two coexist (💬 thread + ▸ detail) without colliding.
    if (hasDetail) {
        h += `<button type="button" class="card-detail-toggle" data-task-id="${(0, webview_render_1.esc)(taskId)}" ` +
            `aria-expanded="false" title="Show task detail">` +
            `<span class="card-detail-caret" aria-hidden="true">▸</span></button>`;
    }
    if (count > 0) {
        h += `<button type="button" class="thread-toggle" data-task-id="${(0, webview_render_1.esc)(taskId)}" ` +
            `aria-expanded="false" title="${count} message${count === 1 ? '' : 's'} about this task">` +
            `<span class="thread-icon" aria-hidden="true">💬</span>${count}</button>`;
    }
    h += '</div>';
    if (title) {
        h += `<div class="task-title">${(0, webview_render_1.esc)(title)}</div>`;
    }
    h += `<div class="board-card-meta">${meta}</div>`;
    if (hasDetail) {
        h += `<div class="card-detail" hidden>${detail}</div>`;
    }
    h += renderThread(ctx, taskId);
    h += '</div>';
    return h;
}
/** Wrap pre-built detail rows + an optional Open-chat button into the shared
 *  detail body. `gridRows` are .detail-kv lines; `extra` is free-form trailing
 *  HTML (e.g. a files list, a stuck-reason note). Returns '' when there is
 *  nothing to show, so card() omits the toggle entirely. */
function buildDetail(opts) {
    const { gridRows, extra, openChat } = opts;
    if (!gridRows && !extra && !openChat) {
        return '';
    }
    let h = '';
    if (gridRows) {
        h += `<div class="detail-grid">${gridRows}</div>`;
    }
    if (extra) {
        h += extra;
    }
    if (openChat) {
        h += `<div class="card-detail-actions">${openChat}</div>`;
    }
    return h;
}
/** A bounded files list for a card detail (claimable). Caps at 12 with a
 *  "+N more" footer so a wide task never blows out the narrow lane. */
function detailFiles(files) {
    if (!files || files.length === 0) {
        return '';
    }
    const shown = files.slice(0, 12);
    let h = '<div class="detail-files"><span class="detail-label">Files</span><ul>';
    for (const f of shown) {
        h += `<li title="${(0, webview_render_1.esc)(f)}">${(0, webview_render_1.esc)(f)}</li>`;
    }
    if (files.length > shown.length) {
        h += `<li class="more">+${files.length - shown.length} more</li>`;
    }
    h += '</ul></div>';
    return h;
}
/** Max cards rendered per lane; the rest collapse into a "+N more" footer so
 *  a 100-task board stays usable in a narrow sidebar. */
exports.MAX_CARDS_PER_COLUMN = 30;
function renderColumn(opts) {
    const total = opts.cards.length;
    const shown = opts.cards.slice(0, exports.MAX_CARDS_PER_COLUMN);
    const hidden = total - shown.length;
    let h = `<div class="board-col board-col-${opts.key}">`;
    h += `<div class="board-col-head"><span class="col-glyph" aria-hidden="true">${opts.glyph}</span>` +
        `<span class="col-label">${(0, webview_render_1.esc)(opts.label)}</span><span class="col-count">${total}</span></div>`;
    h += `<div class="board-col-body">`;
    h += total > 0 ? shown.join('') : `<p class="board-empty">${(0, webview_render_1.esc)(opts.emptyHint)}</p>`;
    if (hidden > 0) {
        h += `<p class="board-more">+${hidden} more</p>`;
    }
    h += '</div></div>';
    return h;
}
// ---------------------------------------------------------------------------
// Public renderer
// ---------------------------------------------------------------------------
/**
 * Render the four-lane task board. Returns a string the webview sets as
 * innerHTML. Empty board → a friendly hint (no kanban shell).
 */
function renderBoard(board, ctx = {}) {
    if (!board) {
        return '<p class="empty">No board yet. Run /orchestrate to plan sprints, ' +
            'or wait for the orchestrator to publish board.json.</p>';
    }
    const now = ctx.now ?? Date.now();
    const claimable = board.claimable ?? [];
    const inFlight = board.in_flight ?? [];
    const review = board.awaiting_review ?? [];
    const stuck = board.stuck ?? [];
    // Backlog
    const claimableCards = claimable.map(t => card({
        ctx, taskId: t.task_id, title: t.title,
        meta: [
            priorityTag(t.priority),
            typeof t.sprint === 'number' ? `<span class="meta-sprint">sprint ${(0, webview_render_1.esc)(t.sprint)}</span>` : '',
            (t.files && t.files.length) ? `<span class="meta-files" title="${(0, webview_render_1.esc)(t.files.join(', '))}">${t.files.length} file${t.files.length === 1 ? '' : 's'}</span>` : '',
        ].filter(Boolean).join(''),
        extraClass: 'is-claimable',
        detail: buildDetail({
            gridRows: detailKV('Task', t.task_id) +
                (t.title ? detailKV('Title', t.title) : '') +
                (typeof t.sprint === 'number' ? detailKV('Sprint', String(t.sprint)) : '') +
                (t.priority ? detailKV('Priority', t.priority) : '') +
                detailKV('Status', 'claimable'),
            extra: detailFiles(t.files),
        }),
    }));
    // In progress
    const inFlightCards = inFlight.map(t => {
        const model = ctx.modelOf?.[t.claimed_by];
        const age = typeof t.age_ms === 'number' ? (0, webview_render_1.formatAge)(new Date(now - t.age_ms).toISOString(), now) : '';
        const meta = participant(ctx, t.claimed_by) +
            (model ? `<span class="meta-model" title="${(0, webview_render_1.esc)(model)}">${(0, webview_render_1.esc)((0, webview_render_1.shortModel)(model))}</span>` : '') +
            (age ? `<span class="meta-age">${(0, webview_render_1.esc)(age)}</span>` : '') +
            (t.owner_healthy === false ? `<span class="meta-warn" title="owner heartbeat is stale">owner stalled</span>` : '');
        const detail = buildDetail({
            gridRows: detailKV('Task', t.task_id) +
                (t.title ? detailKV('Title', t.title) : '') +
                detailKV('Owner', displayName(ctx, t.claimed_by)) +
                (model ? detailKV('Model', (0, webview_render_1.shortModel)(model)) : '') +
                (age ? detailKV('Age', age) : '') +
                detailKV('Status', 'in progress') +
                (t.owner_healthy === false ? detailKV('Health', 'owner heartbeat stale') : ''),
            openChat: openChatButton(ctx, t.claimed_by),
        });
        return card({ ctx, taskId: t.task_id, title: t.title, meta, extraClass: 'is-inflight', detail });
    });
    // Review
    const reviewCards = review.map(t => {
        const received = t.votes_received ?? 0;
        const required = t.votes_required ?? 0;
        const reviewers = (t.reviewers ?? []).map(r => participant(ctx, r)).join('');
        const meta = `<span class="meta-author">by ${participant(ctx, t.author)}</span>` +
            (reviewers ? `<span class="meta-reviewers"><span class="meta-label">reviewers</span>${reviewers}</span>` : '') +
            `<span class="meta-votes" title="${(0, webview_render_1.esc)(t.rule ?? 'majority')}">✓${t.approvals ?? 0} ✎${t.request_changes ?? 0} · ${received}/${required}</span>`;
        // Reviewers row: colored participants (not a plain .detail-kv) so role
        // coloring carries into the detail. Built as raw HTML appended via `extra`.
        const reviewersRow = reviewers
            ? `<div class="detail-reviewers"><span class="detail-label">Reviewers</span>` +
                `<span class="detail-reviewers-list">${reviewers}</span></div>`
            : '';
        const detail = buildDetail({
            gridRows: detailKV('Task', t.task_id) +
                detailKV('Author', displayName(ctx, t.author)) +
                detailKV('Status', 'awaiting review') +
                detailKV('Approvals', String(t.approvals ?? 0)) +
                detailKV('Change requests', String(t.request_changes ?? 0)) +
                detailKV('Votes', `${received}/${required}`) +
                detailKV('Rule', t.rule ?? 'majority'),
            extra: reviewersRow,
            openChat: openChatButton(ctx, t.author),
        });
        return card({ ctx, taskId: t.task_id, meta, extraClass: 'is-review', detail });
    });
    // Blocked
    const stuckCards = stuck.map(t => {
        const reason = (t.reason ?? 'blocked').replace(/_/g, ' ');
        const age = typeof t.age_ms === 'number' ? (0, webview_render_1.formatAge)(new Date(now - t.age_ms).toISOString(), now) : '';
        return card({
            ctx, taskId: t.task_id,
            meta: `<span class="meta-stuck" title="${(0, webview_render_1.esc)(t.detail ?? '')}">${(0, webview_render_1.esc)(reason)}</span>` +
                (age ? `<span class="meta-age">${(0, webview_render_1.esc)(age)}</span>` : ''),
            extraClass: 'is-stuck',
            detail: buildDetail({
                gridRows: detailKV('Task', t.task_id) +
                    detailKV('Status', 'blocked') +
                    detailKV('Reason', reason) +
                    (age ? detailKV('Age', age) : ''),
                extra: t.detail ? `<div class="detail-summary">${(0, webview_render_1.esc)(t.detail)}</div>` : '',
            }),
        });
    });
    // Done — reconstructed from the durable task ledger (claims/board.json drop
    // completed work). Newest first; the caller passes them pre-sorted but we
    // sort defensively so ordering never depends on the producer.
    const doneSorted = [...(board.done ?? [])].sort((a, b) => new Date(b.completed_at ?? 0).getTime() - new Date(a.completed_at ?? 0).getTime());
    const doneCards = doneSorted.map(t => {
        const status = (t.review_status ?? '').toLowerCase();
        const statusCls = status === 'approved' ? 'done-approved'
            : (status === 'rejected' || status === 'needs_changes' || status === 'request_changes') ? 'done-rejected'
                : status ? 'done-pending' : '';
        // Worklog context: resolve initiative + sprint for this task_id so a generic
        // id like "a task" is disambiguated by the initiative it shipped under.
        const wlCtx = ctx.worklogContext?.get(t.task_id);
        const initiative = wlCtx?.initiative;
        const sprint = wlCtx?.sprint;
        const meta = `<span class="meta-done-by">by ${participant(ctx, t.agent_id)}</span>` +
            (typeof t.sprint === 'number' ? `<span class="meta-sprint">sprint ${(0, webview_render_1.esc)(t.sprint)}</span>` : '') +
            (sprint ? `<span class="meta-sprint">sprint ${(0, webview_render_1.esc)(sprint)}</span>` : '') +
            (initiative ? `<span class="meta-initiative" title="${(0, webview_render_1.esc)(initiative)}">${(0, webview_render_1.esc)(initiative)}</span>` : '') +
            (status ? `<span class="meta-review ${statusCls}" title="review: ${(0, webview_render_1.esc)(status)}">${(0, webview_render_1.esc)(status.replace(/_/g, ' '))}</span>` : '') +
            (t.completed_at ? `<span class="meta-age" title="${(0, webview_render_1.esc)(t.completed_at)}">${(0, webview_render_1.esc)((0, webview_render_1.formatAge)(t.completed_at, now))}</span>` : '');
        const detail = buildDetail({
            gridRows: detailKV('Task', t.task_id) +
                (t.title ? detailKV('Title', t.title) : '') +
                detailKV('By', displayName(ctx, t.agent_id)) +
                (typeof t.sprint === 'number' ? detailKV('Sprint', String(t.sprint)) : '') +
                (sprint ? detailKV('Sprint', sprint) : '') +
                (initiative ? detailKV('Initiative', initiative) : '') +
                detailKV('Status', 'done') +
                (status ? detailKV('Review', status.replace(/_/g, ' ')) : '') +
                (t.completed_at ? detailKV('Completed', (0, webview_render_1.formatAge)(t.completed_at, now)) : ''),
            openChat: openChatButton(ctx, t.agent_id),
        });
        return card({ ctx, taskId: t.task_id, title: t.title, meta, extraClass: 'is-done', detail });
    });
    let h = '<div class="board-kanban" aria-label="Task board">';
    h += renderColumn({ key: 'backlog', label: 'Backlog', glyph: '○', cards: claimableCards, emptyHint: 'Nothing claimable.' });
    h += renderColumn({ key: 'inflight', label: 'In progress', glyph: '◐', cards: inFlightCards, emptyHint: 'No active work.' });
    h += renderColumn({ key: 'review', label: 'Review', glyph: '◔', cards: reviewCards, emptyHint: 'Nothing in review.' });
    h += renderColumn({ key: 'blocked', label: 'Blocked', glyph: '✕', cards: stuckCards, emptyHint: 'Nothing stuck.' });
    h += renderColumn({ key: 'done', label: 'Done', glyph: '●', cards: doneCards, emptyHint: 'No completed work yet.' });
    h += '</div>';
    h += renderRecentEvidence(board.recent_capsules ?? []);
    return h;
}
/**
 * Recent-evidence strip below the kanban: a compact, read-only log of the latest
 * review-cycle / ingested-run capsules (verdict + gate state). Each row carries
 * the run handle so an operator can fetch or replay the capsule. Empty ⇒ nothing.
 */
function renderRecentEvidence(capsules) {
    if (capsules.length === 0) {
        return '';
    }
    const rows = capsules.map(c => {
        const gate = c.gates_passed === undefined
            ? '<span class="ev-gate ev-gate-none" title="no acceptance gate ran">—</span>'
            : c.gates_passed
                ? '<span class="ev-gate ev-gate-pass" title="acceptance gate passed">✓</span>'
                : '<span class="ev-gate ev-gate-fail" title="acceptance gate failed">✗</span>';
        const verdictClass = c.verdict === 'approved' ? 'ev-ok' : (c.verdict === 'blocked' || c.verdict === 'needs_changes') ? 'ev-bad' : '';
        return '<tr>' +
            `<td class="ev-task">${(0, webview_render_1.esc)(c.task_id)}</td>` +
            `<td class="ev-verdict ${verdictClass}">${(0, webview_render_1.esc)(c.verdict ?? '—')}</td>` +
            `<td class="ev-gatecell">${gate}</td>` +
            `<td class="ev-votes">${(0, webview_render_1.esc)(c.votes_count ?? 0)}</td>` +
            `<td class="ev-source">${(0, webview_render_1.esc)(c.source ?? '—')}</td>` +
            `<td class="ev-run" title="${(0, webview_render_1.esc)(c.run_id)}">${(0, webview_render_1.esc)(c.run_id)}</td>` +
            '</tr>';
    }).join('');
    return '<div class="board-evidence" aria-label="Recent evidence">' +
        '<div class="board-evidence-title">Recent evidence</div>' +
        '<table class="board-evidence-table"><thead><tr>' +
        '<th>Task</th><th>Verdict</th><th>Gate</th><th>Votes</th><th>Source</th><th>Run</th>' +
        '</tr></thead><tbody>' + rows + '</tbody></table></div>';
}
/**
 * Infer the role an agent is *playing right now* from live board activity,
 * for fleets where no agent declares an explicit role. Grounded in real
 * orchestrator state (claims, authorship, reviews) — never guessed from text:
 *
 *   - actively holds an in-flight claim, or authored work now in review → coder
 *   - is a named reviewer on an open review (and not building)            → reviewer
 *   - otherwise                                                            → generalist
 *
 * Caller applies this only as a fallback BELOW explicit registry role /
 * agent_type / can_orchestrate.
 */
function inferRoleFromActivity(agentId, board) {
    if (!board) {
        return 'generalist';
    }
    const claiming = (board.in_flight ?? []).some(t => t.claimed_by === agentId);
    if (claiming) {
        return 'coder';
    }
    const authoring = (board.awaiting_review ?? []).some(t => t.author === agentId);
    if (authoring) {
        return 'coder';
    }
    const reviewing = (board.awaiting_review ?? []).some(t => (t.reviewers ?? []).includes(agentId));
    if (reviewing) {
        return 'reviewer';
    }
    return 'generalist';
}
/**
 * Resolve the single role to display for an agent, applying the full
 * precedence chain in one place so the panel, board, and tests agree:
 *
 *   1. declared    — user override from `autoclaw.agentRoles` (already normalized)
 *   2. registry    — explicit `role` / fabric `agent_type` / `can_orchestrate`
 *   3. activity     — what the agent is doing on the live board right now
 *   4. generalist  — nothing known
 */
function resolveDisplayRole(input) {
    if (input.declared && input.declared !== 'generalist') {
        return input.declared;
    }
    const registry = (0, roles_1.resolveAgentRole)({
        role: input.role, agent_type: input.agent_type, can_orchestrate: input.can_orchestrate,
    });
    if (registry !== 'generalist') {
        return registry;
    }
    return inferRoleFromActivity(input.agentId, input.board);
}
/** Count of all tasks on the board — used for the section badge. */
function boardTaskCount(board) {
    if (!board) {
        return 0;
    }
    return (board.claimable?.length ?? 0) + (board.in_flight?.length ?? 0) +
        (board.awaiting_review?.length ?? 0) + (board.stuck?.length ?? 0);
}
/**
 * Render the flat message feed (newest first) with role-colored participants
 * and task/sprint tags, so message traffic between agents is legible at a
 * glance. Replaces the old plain-text feed.
 */
function renderMessageFeed(entries, ctx = {}) {
    if (!entries || entries.length === 0) {
        return '<p class="empty">No messages yet.</p>';
    }
    const now = ctx.now ?? Date.now();
    let h = '<div class="msg-feed">';
    for (const e of [...entries].reverse()) {
        h += '<div class="msg-entry">';
        h += `<span class="msg-time">${(0, webview_render_1.esc)((0, webview_render_1.formatAge)(e.timestamp, now))}</span>`;
        h += participant(ctx, e.from);
        if (e.to && e.to !== 'shared') {
            h += `<span class="thread-arrow" aria-hidden="true">→</span>${participant(ctx, e.to)}`;
        }
        else if (e.to === 'shared') {
            h += `<span class="thread-arrow" aria-hidden="true">→</span><span class="who who-shared">all</span>`;
        }
        h += `<span class="msg-type type-${(0, webview_render_1.esc)(e.type)}">${(0, webview_render_1.esc)(e.type)}</span>`;
        if (e.task_id) {
            h += `<span class="msg-task">${(0, webview_render_1.esc)(e.task_id)}</span>`;
        }
        h += '</div>';
    }
    h += '</div>';
    return h;
}
/**
 * Group comms-log entries by task id into oldest-first threads, keeping only
 * entries that carry a task_id. Used to feed {@link BoardRenderContext.threads}.
 */
function buildThreads(entries) {
    var _a;
    const out = {};
    for (const e of entries) {
        if (!e.task_id) {
            continue;
        }
        (out[_a = e.task_id] ?? (out[_a] = [])).push(e);
    }
    for (const k of Object.keys(out)) {
        out[k].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }
    return out;
}
//# sourceMappingURL=webview-render-board.js.map