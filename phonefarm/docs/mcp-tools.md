# MCP Tools

**Last updated:** 2026-09-21
**Bridge module:** `phonefarm/utils/mcp_bridge.py`
**Registry pattern:** one `mcp_tools.py` per domain, loaded at process start

---

## Overview

Every capability in `phonefarm` is exposed as a namespaced MCP tool. Tools are **registered** by domain modules and **dispatched** by the bridge. The naming convention is strict:

```
phonefarm.<domain>.<verb>-<object>
```

| Segment | Values | Source |
|---------|--------|--------|
| `phonefarm` | fixed | namespace root |
| `<domain>` | `content`, `device`, `scheduler`, `fleet` | subpackage under `phonefarm/` |
| `<verb>-<object>` | kebab-case action | function in the domain's `mcp_tools.py` |

Skills (`skills/*.md`) declare which namespace they require via the `compatibility` field. A skill cannot call tools outside its declared namespace.

---

## Registry & bootstrapping

The bridge loads every domain's `mcp_tools.register()` at startup. Adding a new domain is a two-line change: create `phonefarm/<domain>/mcp_tools.py` with a `register(registry)` function, then add the module to `_DOMAINS` in the bridge.

```python
# phonefarm/utils/mcp_bridge.py
class MCPRegistry:
    def __init__(self) -> None:
        self._tools: dict[str, Callable] = {}

    def register(self, name: str, fn: Callable) -> None:
        if not name.startswith("phonefarm."):
            raise ValueError(f"tool name must be namespaced: {name}")
        if name in self._tools:
            raise ValueError(f"duplicate tool: {name}")
        self._tools[name] = fn

    def list(self) -> list[str]:
        return sorted(self._tools)


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

---

## Tool catalog

### Content domain — `phonefarm.content.*`

| Tool | Module | Skill |
|------|--------|-------|
| `phonefarm.content.generate-post` | `phonefarm/content/generator.py` | `generate-post.md` |
| `phonefarm.content.generate-video-script` | `phonefarm/content/video.py` | `generate-video-script.md` |

#### `phonefarm.content.generate-post`

Generate platform-native post text, hashtags, and image prompts.

```python
def generate_post(
    topic: str,
    platform: Literal["tiktok", "instagram", "youtube", "x", "linkedin", "facebook", "threads"],
    **kwargs,
) -> dict
```

**Returns:**
```json
{
  "platform": "tiktok",
  "text": "...",
  "hashtags": ["#...", "#..."],
  "image_prompt": "..."
}
```

**Errors:**
- `ValueError` — unknown platform, or text exceeds platform character limit
- `ValueError` — more than 5 hashtags

#### `phonefarm.content.generate-video-script`

Generate a short-form script with hook, value, CTA, and timing.

```python
def generate_video_script(
    topic: str,
    platform: Literal["tiktok", "instagram", "youtube"],
    duration_s: int = 30,
    **kwargs,
) -> dict
```

**Returns:**
```json
{
  "platform": "tiktok",
  "hook": "...",
  "value": "...",
  "cta": "...",
  "scene_breakdown": [...],
  "duration_target_s": 30,
  "captions": [...]
}
```

---

### Device domain — `phonefarm.device.*`

| Tool | Module | Skill |
|------|--------|-------|
| `phonefarm.device.diagnose-device` | `phonefarm/device/diagnose.py` | `diagnose-device.md` |
| `phonefarm.device.provision-device` | `phonefarm/device/provision.py` | `provision-device.md` |
| `phonefarm.device.remediate-device` | `phonefarm/device/remediate.py` | `remediate-device.md` |

#### `phonefarm.device.diagnose-device`

Run the five-dimension health check.

```python
def diagnose_device(serial: str) -> dict
```

**Returns:**
```json
{
  "serial": "...",
  "thermal": {"cpu-0-0": 42000, "battery": 31000},
  "battery": {"source": "tradein", "battery_health": "good", "cycle_count": 42},
  "connectivity": "...",
  "app_health": {"fatal": 0, "anr": 0},
  "security_posture": {"patch_level": "2026-05-01"}
}
```

**Errors:**
- `RuntimeError` — ADB command failed (device offline, unknown serial)

#### `phonefarm.device.provision-device`

Full provisioning pipeline with RKP gate.

```python
def provision_device(
    serial: str,
    *,
    proxy_endpoint: str | None = None,
    profile_id: str | None = None,
) -> dict
```

**Returns:**
```json
{
  "serial": "...",
  "rkp": {"supported": true, "raw": "..."},
  "tradein": {"ok": true, "battery_health": "good"},
  "sdk": "35",
  "apps_installed": [...],
  "proxy": "socks5://proxy-a.example:1080",
  "profile_id": "pixel9-us"
}
```

**Errors:**
- `RuntimeError` — RKP attestation failed (`device <serial> fails RKP attestation`)
- `RuntimeError` — proxy endpoint at capacity (already 3 devices)
- `RuntimeError` — Advanced Protection Mode blocks ADB sideloading

#### `phonefarm.device.remediate-device`

Apply a step from the remediation ladder.

```python
def remediate_device(
    serial: str,
    issue: str,
    level: Literal["cache", "restart_app", "reboot", "reinstall", "network_reset", "factory"] = "cache",
) -> dict
```

**Returns:**
```json
{
  "serial": "...",
  "issue": "...",
  "level": "cache",
  "status": "applied",
  "verified": true
}
```

**Errors:**
- `ValueError` — unknown remediation level
- `RuntimeError` — verification failed after applying the fix

**Ladder order** (least → most invasive):
```
cache → restart_app → reboot → reinstall → network_reset → factory
```

---

### Scheduler domain — `phonefarm.scheduler.*`

| Tool | Module | Skill |
|------|--------|-------|
| `phonefarm.scheduler.schedule-adaptive` | `phonefarm/scheduler/adaptive.py` | `schedule-adaptive.md` |

#### `phonefarm.scheduler.schedule-adaptive`

Compute the optimal posting window for a platform, audience timezone, and historical performance.

```python
def optimal_window(
    platform: str,
    timezone: str = "UTC",
    history: list[dict] | None = None,
) -> dict
```

**Returns:**
```json
{
  "platform": "tiktok",
  "timezone": "America/New_York",
  "window": "18:00-23:00",
  "best_day": "saturday",
  "confidence": 0.72,
  "source": "defaults+history"
}
```

**Notes:**
- With no `history`, returns research-backed defaults from `references/platform-2026.md`.
- With `history`, blends historical engagement velocity with the defaults.

---

### Fleet domain — `phonefarm.fleet.*`

| Tool | Module | Skill |
|------|--------|-------|
| `phonefarm.fleet.check-health` | `phonefarm/fleet/health.py` | — |

#### `phonefarm.fleet.check-health`

Run diagnostics across a set of devices and aggregate results.

```python
def check_all(serials: list[str]) -> dict[str, dict]
```

**Returns:**
```json
{
  "R58M0000001": { "thermal": {...}, "battery": {...}, "status": "healthy" },
  "R58M0000002": { "thermal": {...}, "battery": {...}, "status": "degraded" }
}
```

**Fleet-level abort thresholds** (from `references/remediation-library-2026.md`):
- Abort if crash rate > 1% of updated canaries within 30 minutes
- Abort if device offline rate > 0.5% within 1 hour

---

## Invocation patterns

### Python (in-process)

```python
from phonefarm.utils.mcp_bridge import bootstrap

reg = bootstrap()
result = reg._tools["phonefarm.device.diagnose-device"]("R58M0000001")
print(result)
```

### CLI

The `phonefarm` CLI is a thin wrapper. Each command maps to one MCP tool:

```bash
phonefarm version                          # → phonefarm.__version__
phonefarm diagnose R58M0000001             # → phonefarm.device.diagnose-device
phonefarm provision R58M0000001            # → phonefarm.device.provision-device
```

### MCP server (external)

When exposed over MCP, each tool appears with its namespaced name. Clients discover them via `tools/list` and invoke via `tools/call` with a JSON payload matching the function signature.

---

## Error model

All MCP tools raise typed exceptions from `phonefarm/utils/errors.py`:

| Exception | Meaning | Caller action |
|-----------|---------|---------------|
| `PhonefarmError` | Base class — catch-all | Inspect message |
| `DeviceError` | ADB / device-level failure | Route to `remediate-device` |
| `ProvisionError` | Provisioning gate failed | Exclude device or retry |
| `ValueError` | Invalid argument | Fix input and retry |
| `RuntimeError` | Unexpected state | Inspect and escalate |

**Retry policy:** `phonefarm/utils/retry.py` provides a `retry()` helper. Default: 3 attempts, 0.5s delay. **Never** retry a factory-reset remediation step.

---

## Tool contract rules

1. **Namespacing is mandatory.** A tool name must start with `phonefarm.`. The bridge rejects anything else.
2. **No duplicate registration.** Two domains registering the same name raises at bootstrap.
3. **Sync by default.** Async tools are opt-in and must be marked in the domain's `mcp_tools.py`.
4. **Idempotency where possible.** `diagnose`, `check-health`, and `schedule-adaptive` are safe to re-run. `provision` and `remediate` are **not** idempotent — always check current state before invoking.
5. **Return dicts, not objects.** MCP transports JSON. Domain functions may use dataclasses internally but must serialise at the boundary.
6. **Skill–tool alignment.** Every skill listed in `skills/` must reference a tool that exists in the registry. A startup consistency check (planned, see below) enforces this.

---

## Planned tools (2026 roadmap)

| Tool | Purpose |
|------|---------|
| `phonefarm.device.export-intrusion-log` | Automated Intrusion Log bundle export before wipe |
| `phonefarm.fleet.rotate-proxy` | Airplane-mode IP rotation via HID/modem |
| `phonefarm.device.verify-tradein` | Trade-in mode health check with OS authenticity challenge |
| `phonefarm.content.generate-image-prompt` | Standalone image-prompt generator for 2026 visual trends |

---

## References

- `phonefarm/utils/mcp_bridge.py` — registry and bootstrapping
- `phonefarm/utils/errors.py` — typed exception hierarchy
- `docs/architecture.md` — overall system layout
- `docs/onboarding.md` — provisioning pipeline
- `docs/fleet-operations.md` — operational entry points
- `docs/security-posture.md` — RKP, Intrusion Logging, Advanced Protection

---

*Review quarterly. Adding a tool is a three-file change: domain module, `mcp_tools.py` registration, and a skills/ or references/ entry that documents its contract.*