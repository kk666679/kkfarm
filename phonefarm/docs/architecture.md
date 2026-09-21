# Architecture

**Last updated:** 2026-09-21
**Version:** 2.0.0
**Audience:** Contributors, operators, and integrators

---

## Overview

`phonefarm` is a **capability-oriented** system. Capabilities are declared in markdown, implemented in Python, and dispatched through a single MCP registry. The design separates three concerns that traditionally blur together:

1. **Contract** — what a capability promises to do (markdown, human-readable, versioned)
2. **Implementation** — how it does it (Python, testable, typed)
3. **Dispatch** — how it is invoked (MCP registry, namespaced, one entry per capability)

The separation is deliberate. Contracts change slower than code; dispatch changes slower than both. Any of the three can evolve independently without breaking the other two.

---

## Repository layout

```
phonefarm/
├── skills/              # capability contracts (markdown)
├── references/          # deep-dive docs referenced by skills
├── phonefarm/           # Python implementation
│   ├── content/         # post + video generation
│   ├── device/          # diagnose, provision, remediate
│   ├── scheduler/       # adaptive scheduling
│   ├── fleet/           # registry, health, rotation
│   └── utils/           # mcp_bridge, config, errors, retry
├── scripts/             # operational entry points
├── configs/             # example configs (secrets via env)
├── tests/               # unit + fixture-driven integration tests
└── docs/                # this directory
```

| Directory | Role | Change cadence |
|-----------|------|----------------|
| `skills/` | Contracts | Slow — reviewed quarterly |
| `references/` | Deep-dive context | Medium — updated as platform/OS evolves |
| `phonefarm/` | Implementation | Fast — normal dev cadence |
| `scripts/` | Operational glue | Medium — added as operational needs arise |
| `configs/` | Examples only | Rare |
| `tests/` | Correctness | Continuous |
| `docs/` | Orientation + operations | Medium |

---

## The three layers

### 1. Contracts — `skills/`

Every capability has a markdown contract. The contract declares:

- **`name`** — matches the MCP tool's verb-object
- **`description`** — what it does, in one sentence
- **`compatibility`** — the MCP namespace it requires (e.g. `phonefarm.content.*`)
- **`metadata`** — author, version, `updated` date
- **`allowed-tools`** — OS-level tool permissions
- **`tags`** — discovery hints

Contracts are **not** documentation for the implementation. They are the source of truth for *what the capability is*, independent of how it is implemented. This means a capability can be reimplemented (say, moving from a shell script to a native Python module) without changing the contract.

```
skills/
├── generate-post.md
├── generate-video-script.md
├── schedule-adaptive.md
├── diagnose-device.md
├── provision-device.md
└── remediate-device.md
```

### 2. References — `references/`

References hold the deep context that contracts allude to. A contract might say "apply 2026 visual trends" — the reference explains what those trends are and why they matter. References are the layer that absorbs external change (platform algorithm shifts, Android API updates, new CVEs) without forcing contract rewrites.

```
references/
├── platform-2026.md                 # platform behaviours, limits, algorithms
├── authenticity-guide.md            # human-touch writing techniques
├── fleet-health-2026.md             # five-dimension health model
├── remediation-library-2026.md      # reusable remediation workflows
├── rkp-attestation.md               # RKP verification workflow
└── tradein-mode.md                  # Android 16+ device health API
```

**Convention:** a skill may reference zero or more reference documents. A reference document may be referenced by zero or more skills. The relationship is many-to-many, resolved by filename in prose — not by a schema. This is deliberate: prose tolerates ambiguity that schemas cannot, and the mapping between skills and references changes as understanding deepens.

### 3. Implementation — `phonefarm/`

The Python package implements the contracts. Each domain subpackage is self-contained:

```
phonefarm/
├── content/          # implements generate-post, generate-video-script
├── device/           # implements diagnose-device, provision-device, remediate-device
├── scheduler/        # implements schedule-adaptive
├── fleet/            # implements check-health and rotation helpers
└── utils/            # cross-cutting: mcp_bridge, config, errors, retry, logging
```

Each domain contains:

| File | Role |
|------|------|
| `<verb>.py` | One module per capability |
| `mcp_tools.py` | Registers the domain's tools with the bridge |
| `platforms/` (content only) | Platform-specific formatting |
| `scripts/` (device only) | Raw shell fragments, versioned as files |

**Rule:** domain modules do not import from each other. Cross-domain coordination happens at the MCP layer (`fleet.check-health` calls into `device.diagnose`) or via utility modules — never by direct sibling import. This keeps domains independently testable and replaceable.

---

## MCP dispatch layer

The bridge (`phonefarm/utils/mcp_bridge.py`) is the single point where implementation becomes capability.

```python
class MCPRegistry:
    def register(self, name: str, fn: Callable) -> None: ...
    def list(self) -> list[str]: ...

def bootstrap() -> MCPRegistry:
    reg = MCPRegistry()
    from phonefarm.content   import mcp_tools as content_tools
    from phonefarm.device    import mcp_tools as device_tools
    from phonefarm.scheduler import mcp_tools as scheduler_tools
    from phonefarm.fleet     import mcp_tools as fleet_tools
    for mod in (content_tools, device_tools, scheduler_tools, fleet_tools):
        mod.register(reg)
    return reg
```

### Namespace convention

```
phonefarm.<domain>.<verb>-<object>
```

| Segment | Values |
|---------|--------|
| `phonefarm` | fixed root |
| `<domain>` | `content`, `device`, `scheduler`, `fleet` |
| `<verb>-<object>` | kebab-case action |

### Registration rules

1. Names must start with `phonefarm.`
2. Names must be unique across all domains (enforced at bootstrap)
3. Registration is **synchronous** by default — async is opt-in
4. Returns must be JSON-serialisable dicts at the boundary
5. Domain dataclasses may be used internally; serialisation is explicit

### Invocation paths

```
┌────────────────────┐      ┌────────────────────┐      ┌────────────────────┐
│  External client   │      │   CLI wrapper      │      │  In-process Python │
│  (MCP server)      │      │   (phonefarm ...)  │      │  (bootstrap())     │
└─────────┬──────────┘      └─────────┬──────────┘      └─────────┬──────────┘
          │                           │                           │
          └───────────────┬───────────┴───────────────┬───────────┘
                          ▼                           ▼
                 ┌──────────────────────────────────────────┐
                 │          MCPRegistry                     │
                 │   phonefarm.content.*                    │
                 │   phonefarm.device.*                     │
                 │   phonefarm.scheduler.*                  │
                 │   phonefarm.fleet.*                      │
                 └──────────────────┬───────────────────────┘
                                    ▼
                 ┌──────────────────────────────────────────┐
                 │          Domain implementations          │
                 └──────────────────┬───────────────────────┘
                                    ▼
                 ┌──────────────────────────────────────────┐
                 │          ADB / HTTP / local I/O          │
                 └──────────────────────────────────────────┘
```

All three invocation paths go through the same registry. There is no "special" path for CLI commands — they are one-line wrappers around the same tools.

---

## Data flow — end-to-end example

Provisioning a device exercises all four layers:

```
1. Operator runs:      phonefarm provision R58M0000001
2. CLI dispatches:     phonefarm.device.provision-device
3. Domain loads:       phonefarm/device/provision.py
4. Gates evaluated:    rkp.check_rkp_support → tradein.tradein_status
5. Side effects:       adb run(...) → apps installed, network configured
6. Metadata written:   fleet.registry.FleetRegistry.add(Device(...))
7. Result returned:    dict → JSON → stdout
```

Each step is observable, testable, and replaceable. Step 4's gates come from `references/rkp-attestation.md`; step 5's commands come from `skills/provision-device.md`.

---

## Cross-cutting concerns

### Error model

Typed exceptions live in `phonefarm/utils/errors.py`:

```
PhonefarmError
├── DeviceError       (ADB / device-level failure)
└── ProvisionError    (provisioning gate failed)
```

Built-in exceptions (`ValueError`, `RuntimeError`) are also used where they carry clear semantics. Every MCP tool raises exactly one of these at the boundary.

### Retry policy

`phonefarm/utils/retry.py` provides a simple `retry(fn, attempts, delay)` helper. Default: 3 attempts, 0.5s delay. **Never retried:** factory-reset remediation, RKP certification (idempotency not guaranteed across attempts).

### Configuration

Config is loaded from `configs/*.yaml` via `phonefarm/utils/config.py`. Secrets come from environment variables (`.env.example` is the reference). Config files are examples only — real deployments inject via env or secret manager.

### Logging

Structured logging via `phonefarm/utils/logging.py`. Level is set by `PHONEFARM_LOG_LEVEL`. Format is fixed: timestamp, level, name, message. The bridge logs every tool registration and every dispatch — useful for debugging skill/tool mismatches.

---

## Design principles

**1. Contracts before code.** Write the skill first. If the contract is unclear, the implementation will be too.

**2. One capability per module.** `generator.py` does one thing. `diagnose.py` does one thing. Composition happens at the MCP layer.

**3. Domains are islands.** No cross-domain imports. Coordination via the registry or shared utilities.

**4. Namespacing is structural, not cosmetic.** `phonefarm.device.provision-device` tells you exactly which file implements it and which skill documents it.

**5. Fixture-driven testing.** Real device outputs (logcat, thermal zones, `tradein_status.json`) are checked in as fixtures. Parsers are tested against the shape real hardware produces, not synthetic mocks.

**6. Fail gates, not pipelines.** A device that fails RKP does not get "partially provisioned" — it is excluded. Gates are hard, not advisory.

**7. References absorb churn.** Platform algorithms, Android APIs, and CVEs change constantly. References isolate that churn from contracts and code.

---

## What this architecture deliberately does not do

- **No plugin system.** Domains are known at build time. Adding a domain is a commit, not a runtime discovery.
- **No async-by-default.** Most operations are sequential and I/O-bound on ADB. Async is opt-in per tool.
- **No schema validation of skill↔reference links.** Links are prose. The trade-off is flexibility in exchange for weak guarantees.
- **No distributed state.** `FleetRegistry` is in-memory. Persistent fleet state is delegated to MDM / zero-touch consoles.

---

## Extending the system

Adding a new capability is a **four-file change**:

| File | Purpose |
|------|---------|
| `skills/<name>.md` | Contract |
| `phonefarm/<domain>/<verb>.py` | Implementation |
| `phonefarm/<domain>/mcp_tools.py` | Registration (edit) |
| `tests/test_<domain>/test_<verb>.py` | Verification |

Adding a new **domain** additionally requires editing `phonefarm/utils/mcp_bridge.py` to load its `mcp_tools` module — this is the only place in the codebase that hardcodes the domain list. It is intentional: the set of domains should be small, stable, and explicit.

---

## References

- `docs/onboarding.md` — device onboarding pipeline
- `docs/mcp-tools.md` — full tool catalog
- `docs/fleet-operations.md` — operational loops
- `docs/security-posture.md` — RKP, Intrusion Logging, Advanced Protection, CVE-2026-0073
- `skills/*.md` — capability contracts
- `references/*.md` — deep-dive context

---

*Review when the domain set changes, when a new transport is added, or when the skill/reference split stops paying for itself. The three-layer split is only worth maintaining if contracts genuinely outlive implementations — if they do not, collapse the layers.*