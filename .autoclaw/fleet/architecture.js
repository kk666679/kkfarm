"use strict";
/**
 * architecture.ts — user-authoritative fleet architecture resolver.
 *
 * Answers "who is the orchestrator, who is a runner, who is a worker, and what
 * role is each agent playing?" with the USER in ultimate control. A project's
 * `.autoclaw/orchestrator/fleet.json` manifest (hand-editable, git-trackable)
 * overrides every auto-detected/inferred signal. See docs/FLEET_ARCHITECTURE.md.
 *
 * Pure module: no fs / vscode imports. The extension reads fleet.json + the
 * settings override + the board and passes them in; this module decides.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toResolvedRole = toResolvedRole;
exports.resolveRole = resolveRole;
exports.resolveType = resolveType;
exports.resolveOrchestrator = resolveOrchestrator;
exports.resolveFleet = resolveFleet;
exports.parseFleetManifest = parseFleetManifest;
const roles_1 = require("../roles");
const KNOWN_TYPES = new Set([
    'coder', 'runner', 'auditor', 'supervisor', 'assistant', 'governance',
]);
/** True when `raw` normalizes to a known canonical role (not a custom label). */
function isCanonicalRoleString(raw) {
    // A string is "canonical" when normalizeRole maps it to something other than
    // generalist, OR it literally is "generalist".
    const n = (0, roles_1.normalizeRole)(raw);
    return n !== 'generalist' || raw.trim().toLowerCase() === 'generalist';
}
/** Build a ResolvedRole from a free-form string (canonical or custom). */
function toResolvedRole(raw) {
    const s = (raw ?? '').trim();
    if (s.length === 0) {
        const m = roles_1.ROLE_META.generalist;
        return { canonical: 'generalist', label: m.label, custom: false, cssClass: m.cssClass };
    }
    if (isCanonicalRoleString(s)) {
        const canonical = (0, roles_1.normalizeRole)(s);
        const m = roles_1.ROLE_META[canonical];
        return { canonical, label: m.label, custom: false, cssClass: m.cssClass };
    }
    // Custom user label — keep the user's text, color it neutrally.
    return { canonical: 'generalist', label: s, custom: true, cssClass: 'role-custom' };
}
/**
 * Resolve one agent's display role with full precedence:
 *   fleet.json → settings override → registry role/agent_type/can_orchestrate
 *   → activity inference → generalist.
 * Custom (non-canonical) labels are preserved.
 */
function resolveRole(agent, input) {
    const decl = input.manifest?.agents?.[agent.id];
    if (decl?.role && decl.role.trim().length > 0) {
        return toResolvedRole(decl.role);
    }
    const setting = input.settingRoles?.[agent.id];
    if (setting && setting.trim().length > 0) {
        return toResolvedRole(setting);
    }
    const fromRegistry = (0, roles_1.resolveAgentRole)({
        role: agent.role, agent_type: agent.agent_type, can_orchestrate: agent.can_orchestrate,
    });
    if (fromRegistry !== 'generalist') {
        return toResolvedRole(fromRegistry);
    }
    if (input.inferRole) {
        const inferred = input.inferRole(agent.id);
        if (inferred !== 'generalist') {
            return toResolvedRole(inferred);
        }
    }
    return toResolvedRole('generalist');
}
/**
 * Resolve one agent's behavioral type:
 *   fleet.json → registry agent_type → 'coder'.
 * Unknown declared types are returned verbatim (caller maps to a profile that
 * degrades to coder behavior).
 */
function resolveType(agent, manifest) {
    const declared = manifest?.agents?.[agent.id]?.agent_type;
    if (declared && declared.trim().length > 0) {
        return KNOWN_TYPES.has(declared) ? declared : 'coder';
    }
    if (agent.agent_type && KNOWN_TYPES.has(agent.agent_type)) {
        return agent.agent_type;
    }
    return 'coder';
}
/**
 * Designate the single fleet orchestrator:
 *   fleet.json.orchestrator → governance.primary → first can_orchestrate → null.
 * Only returns an id that is actually present in `agents` (so a stale manifest
 * entry for a departed agent doesn't crown a ghost).
 */
function resolveOrchestrator(agents, input) {
    const present = new Set(agents.map(a => a.id));
    const declared = input.manifest?.orchestrator;
    if (declared && present.has(declared)) {
        return declared;
    }
    if (input.governancePrimary && present.has(input.governancePrimary)) {
        return input.governancePrimary;
    }
    const canOrch = agents.find(a => a.can_orchestrate);
    return canOrch ? canOrch.id : null;
}
/**
 * Convenience: resolve roles for the whole fleet at once. The designated
 * orchestrator is forced to the 'orchestrator' role even if it would otherwise
 * resolve lower (so the coordinator always reads as such), unless the user gave
 * it an explicit custom label in the manifest.
 */
function resolveFleet(agents, input) {
    const orchestrator = resolveOrchestrator(agents, input);
    const roles = {};
    for (const a of agents) {
        let r = resolveRole(a, input);
        const hasExplicitDecl = !!input.manifest?.agents?.[a.id]?.role
            || !!input.settingRoles?.[a.id];
        if (a.id === orchestrator && !hasExplicitDecl && r.canonical !== 'orchestrator') {
            r = toResolvedRole('orchestrator');
        }
        roles[a.id] = r;
    }
    return { roles, orchestrator };
}
/** Parse a fleet.json string defensively. Returns null on any problem. */
function parseFleetManifest(raw) {
    try {
        const obj = JSON.parse(raw.replace(/^﻿/, ''));
        if (!obj || typeof obj !== 'object') {
            return null;
        }
        const m = obj;
        if (m.agents && typeof m.agents !== 'object') {
            return null;
        }
        return m;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=architecture.js.map