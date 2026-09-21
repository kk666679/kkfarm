"use strict";
/**
 * agent-card.ts — A2A Agent Card builder for AutoClaw (Phase 1).
 *
 * Spec sources:
 *   - docs/specs/agent-card-schema.md (AutoClaw mapping, including the
 *     `capabilities.extensions[]` mirroring rule)
 *   - A2A v0.2.5 specification
 *     (https://github.com/a2aproject/A2A/tree/v0.2.5)
 *
 * The function input is the AutoClaw side's view (machine info, llms,
 * capabilities, etc.) per `docs/specs/agent-card-schema.md`. The output
 * conforms to the A2A v0.2.5 AgentCard shape (we use the canonical field
 * names: `protocolVersion`, `url`, `defaultInputModes`, `defaultOutputModes`,
 * etc.).
 *
 * IMPORTANT — `x-autoclaw.*` mirroring:
 * The canonical A2A extension surface is `capabilities.extensions[]` keyed
 * by URI (per A2A v0.2.5 §5.5.2.1), NOT arbitrary `x-` prefixed top-level
 * keys. {@link buildAgentCard} therefore mirrors every populated
 * `x-autoclaw.*` field into a single
 *   `capabilities.extensions[{ uri, required: false, description, params }]`
 * entry so strict A2A consumers see the canonical form. The top-level
 * `x-autoclaw` block is also kept for backwards compatibility with existing
 * AutoClaw tooling — this is transitional and may be dropped in a future
 * phase once all known consumers read the canonical extension.
 *
 * This module MUST NOT import `vscode` — it is unit-tested in plain Mocha.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.A2A_PROTOCOL_VERSION = exports.AUTOCLAW_EXTENSION_URI = void 0;
exports.buildAgentCard = buildAgentCard;
// ---------------------------------------------------------------------------
// AutoClaw extension URI
// ---------------------------------------------------------------------------
/** Canonical URI used to key the AutoClaw extension entry inside
 *  `capabilities.extensions[]`. */
exports.AUTOCLAW_EXTENSION_URI = 'https://github.com/GoZippy/autoclaw/extensions/v1';
/** Pinned A2A protocol version for Phase 1. */
exports.A2A_PROTOCOL_VERSION = '0.2.5';
// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------
/**
 * Build a canonical A2A v0.2.5 Agent Card from AutoClaw inputs.
 *
 * The returned card always:
 *   - Pins `protocolVersion` to `"0.2.5"`.
 *   - Carries an `endpoints.http` URL.
 *   - Carries a `capabilities.extensions[]` array containing exactly one
 *     entry whose `uri` is {@link AUTOCLAW_EXTENSION_URI}, mirroring the
 *     `x-autoclaw.*` fields into `params`.
 *   - Carries the legacy top-level `x-autoclaw` block too — see the module
 *     header for the deprecation rationale.
 */
function buildAgentCard(opts) {
    const inputModes = opts.inputModes ?? ['text/plain', 'application/json'];
    const outputModes = opts.outputModes ?? ['text/plain', 'application/json'];
    // Mirror x-autoclaw fields into capabilities.extensions[].params. We strip
    // undefined entries so consumers don't see noise from unset optional
    // fields.
    const params = {};
    for (const [k, v] of Object.entries(opts.autoclaw)) {
        if (v !== undefined) {
            params[k] = v;
        }
    }
    const autoclawExt = {
        uri: exports.AUTOCLAW_EXTENSION_URI,
        required: false,
        description: 'AutoClaw extension fields',
        params,
    };
    // Caller-supplied extensions are preserved and the AutoClaw extension is
    // appended (or replaces a pre-existing entry with the same URI).
    const extraExtensions = (opts.capabilities?.extensions ?? [])
        .filter(e => e.uri !== exports.AUTOCLAW_EXTENSION_URI);
    const extensions = [...extraExtensions, autoclawExt];
    const capabilities = {
        streaming: opts.capabilities?.streaming,
        pushNotifications: opts.capabilities?.pushNotifications,
        stateTransitionHistory: opts.capabilities?.stateTransitionHistory,
        extensions,
    };
    const httpEndpoint = opts.endpoints?.http ?? opts.url;
    const endpoints = { http: httpEndpoint };
    if (opts.endpoints?.ws !== undefined) {
        endpoints.ws = opts.endpoints.ws;
    }
    if (opts.endpoints?.nats !== undefined) {
        endpoints.nats = opts.endpoints.nats;
    }
    const card = {
        protocolVersion: exports.A2A_PROTOCOL_VERSION,
        name: opts.name,
        description: opts.description,
        url: opts.url,
        endpoints,
        version: opts.version,
        capabilities,
        defaultInputModes: inputModes,
        defaultOutputModes: outputModes,
        inputModes,
        outputModes,
        skills: opts.skills ?? [],
        supportsAuthenticatedExtendedCard: opts.supportsAuthenticatedExtendedCard ?? false,
        'x-autoclaw': { ...opts.autoclaw },
    };
    return card;
}
//# sourceMappingURL=agent-card.js.map