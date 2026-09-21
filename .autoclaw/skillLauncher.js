"use strict";
/**
 * Host-aware skill referencing for the AutoClaw "Launch Skill" picker.
 *
 * Each integrated IDE reads its always-on rules / skills from its OWN directory
 * and file format, and Claude Code invokes skills as slash commands rather than
 * by file path. These helpers render a skill invocation for whichever host is
 * active, so the picker never hands users a path that doesn't exist for their
 * setup (the classic ".clinerules/kdream.md on a Claude-Code-only install" bug).
 *
 * Pure module — no vscode / fs imports — so the rendering is trivially testable.
 * The host-resolution + on-disk presence checks live in extension.ts because
 * they need vscode + fs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HOST_SKILL_CONVENTIONS = exports.SHIPPED_SKILLS = void 0;
exports.renderSkillPrompt = renderSkillPrompt;
exports.renderInboxPrompt = renderInboxPrompt;
/**
 * Skills generated into adapters/ by `npm run adapters:build`. Keep in sync with
 * SKILL_NAMES in scripts/adapters/index.ts — the launcher only offers skills
 * listed here, because anything else resolves to a file that exists in no host.
 */
exports.SHIPPED_SKILLS = [
    'kdream', 'autobuild', 'mateam', 'orchestrate', 'security-auditor', 'doc-writer',
];
/**
 * How each host references an installed skill. Mirrors the per-host adapter
 * transforms in scripts/adapters/ and the rulesDir column of AGENT_DEFINITIONS
 * in extension.ts. Hosts that ship no skill adapters (e.g. Codex) are absent
 * here on purpose, and render a plain fallback instruction.
 */
exports.HOST_SKILL_CONVENTIONS = {
    'claude-code': { style: 'slash' },
    cline: { style: 'rule-file', dir: '.clinerules', ext: '.md' },
    kilocode: { style: 'rule-file', dir: '.clinerules', ext: '.md' },
    kiro: { style: 'rule-file', dir: '.kiro/steering', ext: '.md' },
    cursor: { style: 'rule-file', dir: '.cursor/rules', ext: '.mdc' },
    continue: { style: 'rule-file', dir: '.continue/prompts', ext: '.prompt' },
    windsurf: { style: 'rule-file', dir: '.windsurf/rules', ext: '.md' },
    antigravity: { style: 'rule-file', dir: '.agent/rules', ext: '.md' },
};
/**
 * Render a skill invocation for `hostId`. `command` is the natural phrase that
 * follows "run " and begins with the skill name (e.g. "kdream start"). Pure.
 */
function renderSkillPrompt(hostId, skill, command) {
    const conv = exports.HOST_SKILL_CONVENTIONS[hostId];
    if (!conv) {
        // Host without skill adapters (e.g. Codex): a plain instruction is the best we can do.
        return `Run ${command}.`;
    }
    if (conv.style === 'slash') {
        return `/${command}`;
    }
    return `Follow the instructions in ${conv.dir}/${skill}${conv.ext} — run ${command}`;
}
/**
 * Render the cross-agent "check inbox" prompt for `hostId`. cross-agent ships as
 * a rule file to every rule-file host and as an always-on rule to Claude Code,
 * where no file pointer is needed.
 */
function renderInboxPrompt(hostId) {
    const conv = exports.HOST_SKILL_CONVENTIONS[hostId];
    const tail = 'Check your inbox at .autoclaw/orchestrator/comms/inboxes/ for new cross-agent messages and process them';
    if (!conv || conv.style === 'slash') {
        return `${tail}, following the AutoClaw cross-agent coordination protocol.`;
    }
    return `Read ${conv.dir}/cross-agent${conv.ext} for the protocol. ${tail}.`;
}
//# sourceMappingURL=skillLauncher.js.map