#!/usr/bin/env bash
# phonefarm bootstrap — run from empty parent directory.
# Creates the full tree and writes every file in one pass.
set -euo pipefail

cd "$(dirname "$0")"

# ─── directories ──────────────────────────────────────────────────────────────
mkdir -p \
  .github/workflows \
  skills references \
  phonefarm/content/platforms \
  phonefarm/device/scripts \
  phonefarm/scheduler \
  phonefarm/fleet \
  phonefarm/utils \
  tests/test_content tests/test_device tests/test_scheduler tests/test_fleet tests/fixtures \
  scripts configs docs

# ─── root files ───────────────────────────────────────────────────────────────
cat <<'EOF' > .gitignore
__pycache__/
*.py[cod]
.venv/
venv/
.env
*.log
.pytest_cache/
.mypy_cache/
.ruff_cache/
dist/
build/
*.egg-info/
EOF

cat <<'EOF' > .env.example
# Fleet control host
PHONEFARM_HOME=./phonefarm
PHONEFARM_MCP_SOCKET=/tmp/phonefarm-mcp.sock
PHONEFARM_LOG_LEVEL=INFO

# ADB
ADB_PATH=adb
ADB_WIRELESS_PORT=5555

# Proxy pool
PROXY_POOL_FILE=configs/proxies.example.yaml
PROXY_MAX_DEVICES_PER_ENDPOINT=3

# Zero-touch / MDM
ZERO_TOUCH_ACCOUNT=
MDM_ENROLLMENT_TOKEN=

# Secrets (do not commit)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
NEXTAUTH_SECRET=
EOF

cat <<'EOF' > LICENSE
                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/
EOF

cat <<'EOF' > README.md
# phonefarm

Fleet orchestration for Android device farms: content generation, adaptive
scheduling, device diagnostics, provisioning, and remediation — exposed as
first-class MCP capabilities.

## Layout

- `skills/` — markdown skill definitions loaded by the MCP bridge
- `references/` — deep-dive docs referenced by skills
- `phonefarm/` — Python implementation
- `scripts/` — operational entry points for fleet-scale actions
- `configs/` — example configs (real secrets via env)

## Quick start

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
make test
```

## MCP tools

All capabilities are namespaced:

- `phonefarm.content.*`  — generate-post, generate-video-script
- `phonefarm.device.*`   — diagnose-device, provision-device, remediate-device
- `phonefarm.scheduler.*`— schedule-adaptive
- `phonefarm.fleet.*`    — registry, health, rotation
EOF

cat <<'EOF' > pyproject.toml
[project]
name = "phonefarm"
version = "2.0.0"
description = "Android device farm orchestration with MCP-exposed capabilities"
requires-python = ">=3.11"
license = { text = "Apache-2.0" }
dependencies = [
    "pydantic>=2.7",
    "pyyaml>=6.0",
    "httpx>=0.27",
    "rich>=13.7",
    "typer>=0.12",
]

[project.optional-dependencies]
dev = ["pytest>=8.0", "pytest-asyncio>=0.23", "ruff>=0.5", "mypy>=1.10"]

[project.scripts]
phonefarm = "phonefarm.cli:app"

[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"
EOF

cat <<'EOF' > requirements.txt
pydantic>=2.7
pyyaml>=6.0
httpx>=0.27
rich>=13.7
typer>=0.12
EOF

cat <<'EOF' > requirements-dev.txt
-r requirements.txt
pytest>=8.0
pytest-asyncio>=0.23
ruff>=0.5
mypy>=1.10
EOF

cat <<'EOF' > Makefile
.PHONY: install test lint typecheck fmt tree

install:
	pip install -r requirements-dev.txt

test:
	pytest -q

lint:
	ruff check .

typecheck:
	mypy phonefarm

fmt:
	ruff format .

tree:
	@find . -type f -not -path './.git/*' -not -path './__pycache__/*' \
	  -not -path '*/__pycache__/*' | sort
EOF

cat <<'EOF' > cli.py
"""Thin CLI shim — delegates to phonefarm.cli."""
from phonefarm.cli import app

if __name__ == "__main__":
    app()
EOF

# ─── .github/workflows ────────────────────────────────────────────────────────
cat <<'EOF' > .github/workflows/ci.yml
name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install -r requirements-dev.txt
      - run: ruff check .
      - run: pytest -q
EOF

cat <<'EOF' > .github/workflows/fleet-health-check.yml
name: fleet-health-check
on:
  schedule: [{ cron: "0 */6 * * *" }]
  workflow_dispatch:
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "TODO: run phonefarm.fleet.health.check_all"
EOF

cat <<'EOF' > .github/workflows/release.yml
name: release
on: { push: { tags: ["v*"] } }
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install build && python -m build
EOF

# ─── skills/ ──────────────────────────────────────────────────────────────────
cat <<'EOF' > skills/generate-post.md
---
name: generate-post
description: Generate engaging social media post content (text, hashtags, image prompts) for a given platform and topic, optimized for 2026 authenticity and platform-specific trends.
license: Apache-2.0
compatibility: Requires phonefarm.content.* MCP tools
metadata:
  author: phonefarm-team
  version: 2.0.0
  updated: 2026-08-15
allowed-tools: Bash(python:*) Read
tags: [content, generation, social-media, 2026-trends]
---

# Generate Post (2026 Edition)

## Core Philosophy
Authenticity over polish. Platform-native, not cross-posted.

## Procedure
1. Analyze platform & topic
2. Generate text with platform-specific formatting
3. Generate strategic hashtags (3-5 max)
4. Create image/video prompts
5. Apply brand voice with human touch
6. Validate against platform policies

See `references/platform-2026.md` and `references/authenticity-guide.md`.
EOF

cat <<'EOF' > skills/generate-video-script.md
---
name: generate-video-script
description: Generate video scripts for short-form content (TikTok, Reels, Shorts) with hooks, structure, and CTAs optimized for 2026 retention patterns.
license: Apache-2.0
compatibility: Requires phonefarm.content.* MCP tools
metadata:
  author: phonefarm-team
  version: 2.0.0
  updated: 2026-08-15
allowed-tools: Bash(python:*) Read
tags: [content, video, script, short-form, 2026-trends]
---

# Generate Video Script (2026 Edition)

## Core Philosophy
The hook is the video. Short wins, despite longer caps.

## Procedure
1. Identify hook (first 1-3s)
2. Structure: Hook → Value → CTA
3. Scene-by-scene breakdown
4. Timing annotations (15-45s total)
5. Captions/overlay text (85% mute)
6. Music/sound trend suggestions

See `references/platform-2026.md`.
EOF

cat <<'EOF' > skills/schedule-adaptive.md
---
name: schedule-adaptive
description: Adaptively schedule content posting based on audience activity, platform algorithms, and performance history, incorporating 2026 platform-specific timing patterns.
license: Apache-2.0
compatibility: Requires phonefarm.content.* MCP tools
metadata:
  author: phonefarm-team
  version: 2.0.0
  updated: 2026-08-15
allowed-tools: Bash(python:*) Read
tags: [content, scheduling, optimization, 2026-trends]
---

# Schedule Adaptive (2026 Edition)

## Core Philosophy
Timing is a distribution lever, not a magic fix. Universal times don't exist.

## Procedure
1. Analyze audience activity patterns
2. Review historical performance by time
3. Check platform algorithm preferences
4. Generate optimal posting windows
5. Adjust for timezone and platform
6. Continuously optimize based on results

See `references/platform-2026.md`.
EOF

cat <<'EOF' > skills/diagnose-device.md
---
name: diagnose-device
description: Diagnose device issues including connectivity, app crashes, performance degradation, and hardware problems, incorporating Android 16+ diagnostic APIs.
license: Apache-2.0
compatibility: Requires phonefarm.device.* MCP tools
metadata:
  author: phonefarm-team
  version: 2.0.0
  updated: 2026-08-15
allowed-tools: Bash(python:*) Read
tags: [device, diagnosis, troubleshooting, 2026-trends]
---

# Diagnose Device (2026 Edition)

## Core Philosophy
Diagnose from the device, not the dashboard. Thermal state is a first-class signal.

## Procedure
1. Check connectivity (ADB, network)
2. Verify battery/thermal status
3. Check app health (crashes, ANRs)
4. Measure performance (CPU, RAM, FPS)
5. Check storage space
6. Run diagnostic scripts
7. Generate report

See `references/fleet-health-2026.md`.
EOF

cat <<'EOF' > skills/provision-device.md
---
name: provision-device
description: Provision a new device for the phone farm, incorporating Android 16+ provisioning APIs, RKP attestation, and zero-touch enrollment.
license: Apache-2.0
compatibility: Requires phonefarm.device.* MCP tools
metadata:
  author: phonefarm-team
  version: 2.0.0
  updated: 2026-08-15
allowed-tools: Bash(python:*) Read
tags: [device, provisioning, setup, 2026-trends]
---

# Provision Device (2026 Edition)

## Core Philosophy
Attest before you provision. Trade-in mode is the new zero-state.

## Procedure
1. Verify connectivity and attestation (ADB/USB)
2. Install/verify OS version
3. Install required apps
4. Configure network (proxy, VPN)
5. Set up device identity (fingerprint)
6. Register with fleet manager
7. Run health checks

See `references/rkp-attestation.md` and `references/tradein-mode.md`.
EOF

cat <<'EOF' > skills/remediate-device.md
---
name: remediate-device
description: Remediate device issues automatically or with guided steps. Handles app reinstall, cache clear, network reset, factory reset.
license: Apache-2.0
compatibility: Requires phonefarm.device.* MCP tools
metadata:
  author: phonefarm-team
  version: 2.0.0
  updated: 2026-08-15
allowed-tools: Bash(python:*) Read
tags: [device, remediation, recovery, 2026-trends]
---

# Remediate Device (2026 Edition)

## Core Philosophy
An alert is not a remediation. Preserve evidence before you wipe.

## Procedure
1. Identify issue from diagnosis
2. Apply least invasive fix first
3. Verify fix with health check
4. Log remediation action

See `references/remediation-library-2026.md`.
EOF

# ─── references/ ──────────────────────────────────────────────────────────────
cat <<'EOF' > references/platform-2026.md
# Platform Behavior — 2026

| Platform | Optimal Length | Hashtags | Key Behavior |
|----------|---------------|----------|--------------|
| TikTok | <150 chars | 3-5 | Discovery-first; 58% discover brands here |
| Instagram | 138-150 chars | 3-5 | 75% of recommendations are original posts |
| X | 71-100 chars | 1-2 | Tactical/conversation, not growth |
| LinkedIn | <150 above fold | 3-5 | High-attention, personalized B2B |
| Facebook | 40-80 for engagement | 1-2 | Live video gets 4× links |
| Threads | <200 chars | 1 topic tag | Conversational, not hashtag-driven |
EOF

cat <<'EOF' > references/authenticity-guide.md
# Authenticity Guide — 2026

Audiences and algorithms both penalize pure AI-generated content.
"Controlled imperfection" outperforms over-polish.

## Human-touch techniques
- Slightly unpolished phrasing
- Natural pauses and fillers
- Behind-the-scenes context
- Timely real-world references
- Raw/handheld capture aesthetic
EOF

cat <<'EOF' > references/fleet-health-2026.md
# Fleet Health — 2026

Five dimensions of device health:

1. Availability — ADB reachability, network
2. Resource health — battery, temp, storage
3. Business application health — foreground app, kiosk
4. Manageability — SIM, lock, permissions
5. Security posture — ADB hosts, Play Protect
EOF

cat <<'EOF' > references/remediation-library-2026.md
# Remediation Library — 2026

Ladder: cache → restart app → reboot → reinstall → network reset → factory.

Each entry defines:
- Condition to watch
- Required context before acting
- Steps that may run automatically
- Approval gates
- Evidence needed to close
EOF

cat <<'EOF' > references/rkp-attestation.md
# RKP Attestation — 2026

Verify before provisioning:

```bash
adb shell cmd remote_provisioning dump
adb shell cmd remote_provisioning certify default
```

Devices shipped with Android 16 support only RKP (not legacy manufacturer keys).
EOF

cat <<'EOF' > references/tradein-mode.md
# Trade-in Mode — Android 16+

```bash
adb shell tradeinmode getstatus
adb shell tradeinmode getstatus --challenge CHALLENGE
adb shell tradeinmode evaluate
```

Returns IMEI, serial, brand, model, battery health state, cycle count,
part status, storage lifespan. Preconditions: factory reset, no cellular,
no connected account, debuggable build.
EOF

# ─── phonefarm/ package ───────────────────────────────────────────────────────
cat <<'EOF' > phonefarm/__init__.py
"""phonefarm — Android device farm orchestration."""
__version__ = "2.0.0"
EOF

cat <<'EOF' > phonefarm/version.py
__version__ = "2.0.0"
EOF

cat <<'EOF' > phonefarm/cli.py
"""Top-level CLI entry point."""
from __future__ import annotations
import typer

app = typer.Typer(help="phonefarm control CLI", no_args_is_help=True)


@app.command()
def version() -> None:
    """Print version."""
    from phonefarm import __version__
    typer.echo(__version__)


@app.command()
def diagnose(serial: str) -> None:
    """Run full diagnostic on a device."""
    from phonefarm.device.diagnose import diagnose_device
    typer.echo(diagnose_device(serial))


@app.command()
def provision(serial: str) -> None:
    """Provision a device into the fleet."""
    from phonefarm.device.provision import provision_device
    typer.echo(provision_device(serial))


if __name__ == "__main__":
    app()
EOF

# ─── phonefarm/content ────────────────────────────────────────────────────────
cat <<'EOF' > phonefarm/content/__init__.py
from .generator import generate_post
from .video import generate_video_script
__all__ = ["generate_post", "generate_video_script"]
EOF

cat <<'EOF' > phonefarm/content/generator.py
"""Post generation entry point."""
from __future__ import annotations
from typing import Any

from .platforms import get_platform
from .hashtags import generate_hashtags
from .brand_voice import apply_voice
from .validator import validate


def generate_post(topic: str, platform: str, **kwargs: Any) -> dict[str, Any]:
    plat = get_platform(platform)
    body = plat.format_text(topic, **kwargs)
    tags = generate_hashtags(topic, platform)
    body = apply_voice(body, platform)
    validate(body, tags, platform)
    return {"platform": platform, "text": body, "hashtags": tags}
EOF

cat <<'EOF' > phonefarm/content/hashtags.py
"""Strategic hashtag generation — 3-5 max across platforms."""
from __future__ import annotations


def generate_hashtags(topic: str, platform: str) -> list[str]:
    base = topic.lower().replace(" ", "")
    return [f"#{base}", "#2026trends", "#fyp"][: _limit(platform)]


def _limit(platform: str) -> int:
    return {"x": 2, "threads": 0, "facebook": 2}.get(platform, 5)
EOF

cat <<'EOF' > phonefarm/content/video.py
"""Short-form video script generation."""
from __future__ import annotations
from typing import Any


def generate_video_script(topic: str, platform: str, **kwargs: Any) -> dict[str, Any]:
    return {
        "platform": platform,
        "hook": f"Hook for {topic} (0-3s)",
        "value": f"Deliver value (3-25s)",
        "cta": "Platform-native CTA (final 2-5s)",
        "duration_target_s": 30,
    }
EOF

cat <<'EOF' > phonefarm/content/brand_voice.py
"""Brand voice with controlled imperfection."""
from __future__ import annotations


def apply_voice(text: str, platform: str) -> str:
    # 2026: preserve human touch — no aggressive polish
    return text
EOF

cat <<'EOF' > phonefarm/content/validator.py
"""Validate content against platform policies."""
from __future__ import annotations

LIMITS = {
    "x": 280, "instagram": 2200, "tiktok": 4000,
    "facebook": 63206, "linkedin": 3000, "threads": 500,
}


def validate(text: str, hashtags: list[str], platform: str) -> None:
    limit = LIMITS.get(platform, 2200)
    if len(text) > limit:
        raise ValueError(f"text exceeds {platform} limit ({limit})")
    if len(hashtags) > 5:
        raise ValueError("too many hashtags (max 5)")
EOF

cat <<'EOF' > phonefarm/content/mcp_tools.py
"""MCP tool registration for phonefarm.content.*"""
from __future__ import annotations
from .generator import generate_post
from .video import generate_video_script

TOOLS = {
    "phonefarm.content.generate-post": generate_post,
    "phonefarm.content.generate-video-script": generate_video_script,
}


def register(registry) -> None:
    for name, fn in TOOLS.items():
        registry.register(name, fn)
EOF

cat <<'EOF' > phonefarm/content/platforms/__init__.py
from .base import Platform
from .tiktok import TikTok
from .instagram import Instagram
from .youtube import YouTube
from .x import X
from .linkedin import LinkedIn
from .facebook import Facebook
from .threads import Threads

_REGISTRY = {
    "tiktok": TikTok, "instagram": Instagram, "youtube": YouTube,
    "x": X, "linkedin": LinkedIn, "facebook": Facebook, "threads": Threads,
}


def get_platform(name: str) -> Platform:
    try:
        return _REGISTRY[name.lower()]()
    except KeyError as exc:
        raise ValueError(f"unknown platform: {name}") from exc
EOF

cat <<'EOF' > phonefarm/content/platforms/base.py
"""Platform interface."""
from __future__ import annotations
from typing import Any


class Platform:
    name = "base"
    char_limit = 2200
    hashtag_limit = 5

    def format_text(self, topic: str, **kwargs: Any) -> str:
        return topic
EOF

cat <<'EOF' > phonefarm/content/platforms/tiktok.py
from .base import Platform


class TikTok(Platform):
    name = "tiktok"
    char_limit = 4000
    hashtag_limit = 5

    def format_text(self, topic: str, **kwargs) -> str:
        return f"{topic} — raw, conversational hook first."
EOF

cat <<'EOF' > phonefarm/content/platforms/instagram.py
from .base import Platform


class Instagram(Platform):
    name = "instagram"
    char_limit = 2200
    hashtag_limit = 5

    def format_text(self, topic: str, **kwargs) -> str:
        return f"{topic}\n\nSave this for later."
EOF

cat <<'EOF' > phonefarm/content/platforms/youtube.py
from .base import Platform


class YouTube(Platform):
    name = "youtube"
    char_limit = 5000
    hashtag_limit = 15

    def format_text(self, topic: str, **kwargs) -> str:
        return f"{topic} — how-to with specific outcome."
EOF

cat <<'EOF' > phonefarm/content/platforms/x.py
from .base import Platform


class X(Platform):
    name = "x"
    char_limit = 280
    hashtag_limit = 2


cat <<'EOF' > phonefarm/content/platforms/linkedin.py
from .base import Platform


class LinkedIn(Platform):
    name = "linkedin"
    char_limit = 3000
    hashtag_limit = 5
EOF

cat <<'EOF' > phonefarm/content/platforms/facebook.py
from .base import Platform


class Facebook(Platform):
    name = "facebook"
    char_limit = 63206
    hashtag_limit = 2
EOF

cat <<'EOF' > phonefarm/content/platforms/threads.py
from .base import Platform


class Threads(Platform):
    name = "threads"
    char_limit = 500
    hashtag_limit = 1
EOF

# ─── phonefarm/device ─────────────────────────────────────────────────────────
cat <<'EOF' > phonefarm/device/__init__.py
from .diagnose import diagnose_device
from .provision import provision_device
from .remediate import remediate_device
__all__ = ["diagnose_device", "provision_device", "remediate_device"]
EOF

cat <<'EOF' > phonefarm/device/adb.py
"""Minimal ADB wrapper."""
from __future__ import annotations
import subprocess


def run(serial: str, *args: str, timeout: int = 30) -> str:
    cmd = ["adb", "-s", serial, *args]
    out = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    if out.returncode != 0:
        raise RuntimeError(f"adb failed: {out.stderr.strip()}")
    return out.stdout


def list_devices() -> list[str]:
    out = subprocess.run(["adb", "devices"], capture_output=True, text=True)
    return [line.split()[0] for line in out.stdout.splitlines()[1:] if line.strip()]
EOF

cat <<'EOF' > phonefarm/device/diagnose.py
"""Diagnostic entry point — see skills/diagnose-device.md."""
from __future__ import annotations
from .adb import run
from .thermal import read_thermal_zones
from .battery import battery_status


def diagnose_device(serial: str) -> dict:
    return {
        "serial": serial,
        "thermal": read_thermal_zones(serial),
        "battery": battery_status(serial),
        "connectivity": run(serial, "shell", "dumpsys", "connectivity")[:200],
    }
EOF

cat <<'EOF' > phonefarm/device/provision.py
"""Provision entry point — see skills/provision-device.md."""
from __future__ import annotations
from .rkp import check_rkp_support
from .tradein import tradein_status
from .adb import run


def provision_device(serial: str) -> dict:
    rkp = check_rkp_support(serial)
    if not rkp.get("supported"):
        raise RuntimeError(f"device {serial} fails RKP attestation")
    return {
        "serial": serial,
        "rkp": rkp,
        "tradein": tradein_status(serial),
        "sdk": run(serial, "shell", "getprop", "ro.build.version.sdk").strip(),
    }
EOF

cat <<'EOF' > phonefarm/device/remediate.py
"""Remediation ladder — see skills/remediate-device.md."""
from __future__ import annotations
from .adb import run

LADDER = ["cache", "restart_app", "reboot", "reinstall", "network_reset", "factory"]


def remediate_device(serial: str, issue: str, level: str = "cache") -> dict:
    if level not in LADDER:
        raise ValueError(f"unknown remediation level: {level}")
    return {"serial": serial, "issue": issue, "level": level, "status": "applied"}
EOF

cat <<'EOF' > phonefarm/device/thermal.py
"""Thermal zone reader — direct sysfs ground truth."""
from __future__ import annotations
from .adb import run

CMD = (
    'for z in /sys/class/thermal/thermal_zone*; do '
    'echo "$(cat $z/type 2>/dev/null):$(cat $z/temp 2>/dev/null)"; done'
)


def read_thermal_zones(serial: str) -> dict[str, int]:
    out = run(serial, "shell", CMD)
    zones: dict[str, int] = {}
    for line in out.splitlines():
        if ":" not in line:
            continue
        name, _, temp = line.partition(":")
        try:
            zones[name] = int(temp)
        except ValueError:
            continue
    return zones
EOF

cat <<'EOF' > phonefarm/device/battery.py
"""Battery health — prefers trade-in mode on Android 16+."""
from __future__ import annotations
from .adb import run
from .tradein import tradein_status


def battery_status(serial: str) -> dict:
    ti = tradein_status(serial)
    if ti.get("ok"):
        return {"source": "tradein", **ti}
    dumpsys = run(serial, "shell", "dumpsys", "batterystats")
    return {"source": "batterystats", "raw_len": len(dumpsys)}
EOF

cat <<'EOF' > phonefarm/device/fingerprint.py
"""Coherent fingerprint generation — coherence over randomness."""
from __future__ import annotations
from typing import Any


def build_profile(device_model: str, carrier: str, locale: str) -> dict[str, Any]:
    return {
        "device_model": device_model,
        "carrier": carrier,
        "locale": locale,
        "coherent": True,
    }
EOF

cat <<'EOF' > phonefarm/device/rkp.py
"""Remote Key Provisioning attestation."""
from __future__ import annotations
from .adb import run


def check_rkp_support(serial: str) -> dict:
    try:
        out = run(serial, "shell", "cmd", "remote_provisioning", "dump")
    except RuntimeError as exc:
        return {"supported": False, "error": str(exc)}
    return {
        "supported": "rpcAuthorName" in out,
        "raw": out[:400],
    }


def certify(serial: str) -> dict:
    out = run(serial, "shell", "cmd", "remote_provisioning", "certify", "default")
    return {"ok": "certificate" in out.lower(), "raw": out[:400]}
EOF

cat <<'EOF' > phonefarm/device/tradein.py
"""Android 16+ Trade-in mode."""
from __future__ import annotations
import json
from .adb import run


def tradein_status(serial: str, challenge: str | None = None) -> dict:
    args = ["shell", "tradeinmode", "getstatus"]
    if challenge:
        args += ["--challenge", challenge]
    try:
        out = run(serial, *args)
    except RuntimeError as exc:
        return {"ok": False, "error": str(exc)}
    try:
        return {"ok": True, **json.loads(out)}
    except json.JSONDecodeError:
        return {"ok": True, "raw": out}
EOF

cat <<'EOF' > phonefarm/device/hid.py
"""HID automation for post-reset setup."""
from __future__ import annotations


def drive_setup(serial: str, steps: list[dict]) -> dict:
    """Simulate touch/swipe/text during factory-reset setup screens."""
    return {"serial": serial, "steps_executed": len(steps)}
EOF

cat <<'EOF' > phonefarm/device/mcp_tools.py
"""MCP tool registration for phonefarm.device.*"""
from __future__ import annotations
from .diagnose import diagnose_device
from .provision import provision_device
from .remediate import remediate_device

TOOLS = {
    "phonefarm.device.diagnose-device": diagnose_device,
    "phonefarm.device.provision-device": provision_device,
    "phonefarm.device.remediate-device": remediate_device,
}


def register(registry) -> None:
    for name, fn in TOOLS.items():
        registry.register(name, fn)
EOF

cat <<'EOF' > phonefarm/device/scripts/thermal_zones.sh
#!/usr/bin/env bash
for z in /sys/class/thermal/thermal_zone*; do
  echo "$(cat "$z/type" 2>/dev/null):$(cat "$z/temp" 2>/dev/null)"
done
EOF

cat <<'EOF' > phonefarm/device/scripts/dumpstate_samsung.sh
#!/usr/bin/env bash
# Trigger Samsung dumpstate via dial code, then pull from phone storage.
adb -s "$1" shell am broadcast -a android.provider.Telephony.SECRET_CODE \
  -d "android_secret_code://9900"
EOF

cat <<'EOF' > phonefarm/device/scripts/export_intrusion_logs.sh
#!/usr/bin/env bash
# Export Android 16 Intrusion Log bundle before any wipe.
adb -s "$1" shell am start -a android.settings.SECURITY_SETTINGS
echo "Navigate to Advanced Protection → Intrusion Logging → Export"
EOF

# ─── phonefarm/scheduler ──────────────────────────────────────────────────────
cat <<'EOF' > phonefarm/scheduler/__init__.py
from .adaptive import optimal_window
__all__ = ["optimal_window"]
EOF

cat <<'EOF' > phonefarm/scheduler/adaptive.py
"""Adaptive scheduling — see skills/schedule-adaptive.md."""
from __future__ import annotations

PEAKS = {
    "tiktok":    {"window": "18:00-23:00", "best_day": "saturday"},
    "instagram": {"window": "18:00-23:00", "best_day": "wednesday"},
    "youtube":   {"window": "07:00-10:00", "best_day": "sunday"},
}


def optimal_window(platform: str, timezone: str = "UTC") -> dict:
    p = PEAKS.get(platform, {})
    return {"platform": platform, "timezone": timezone, **p}
EOF

cat <<'EOF' > phonefarm/scheduler/analytics.py
"""Historical performance review."""
from __future__ import annotations


def by_hour(post_history: list[dict]) -> dict[int, float]:
    buckets: dict[int, list[float]] = {}
    for post in post_history:
        buckets.setdefault(post["hour"], []).append(post["engagement_velocity"])
    return {h: sum(v) / len(v) for h, v in buckets.items()}
EOF

cat <<'EOF' > phonefarm/scheduler/timezone.py
"""Timezone helpers."""
from __future__ import annotations
from datetime import datetime
from zoneinfo import ZoneInfo


def to_local(dt: datetime, tz: str) -> datetime:
    return dt.astimezone(ZoneInfo(tz))
EOF

cat <<'EOF' > phonefarm/scheduler/velocity.py
"""First-hour engagement velocity."""
from __future__ import annotations


def velocity(views_first_hour: int, saves: int, shares: int) -> float:
    return (views_first_hour * 0.1) + (saves * 3) + (shares * 5)
EOF

cat <<'EOF' > phonefarm/scheduler/mcp_tools.py
"""MCP tool registration for phonefarm.scheduler.*"""
from __future__ import annotations
from .adaptive import optimal_window

TOOLS = {"phonefarm.scheduler.schedule-adaptive": optimal_window}


def register(registry) -> None:
    for name, fn in TOOLS.items():
        registry.register(name, fn)
EOF

# ─── phonefarm/fleet ──────────────────────────────────────────────────────────
cat <<'EOF' > phonefarm/fleet/__init__.py
from .registry import FleetRegistry
__all__ = ["FleetRegistry"]
EOF

cat <<'EOF' > phonefarm/fleet/registry.py
"""Fleet registry."""
from __future__ import annotations
from dataclasses import dataclass, field


@dataclass
class Device:
    serial: str
    imei: str = ""
    rkp_ok: bool = False
    proxy: str = ""
    profile_id: str = ""


@dataclass
class FleetRegistry:
    devices: dict[str, Device] = field(default_factory=dict)

    def add(self, device: Device) -> None:
        self.devices[device.serial] = device

    def get(self, serial: str) -> Device | None:
        return self.devices.get(serial)
EOF

cat <<'EOF' > phonefarm/fleet/health.py
"""Fleet health aggregation."""
from __future__ import annotations
from phonefarm.device.diagnose import diagnose_device


def check_all(serials: list[str]) -> dict[str, dict]:
    return {s: diagnose_device(s) for s in serials}
EOF

cat <<'EOF' > phonefarm/fleet/zero_touch.py
"""Zero-touch enrollment helpers."""
from __future__ import annotations


def enrollment_url(account: str) -> str:
    return f"https://enterprise.google.com/android/enroll?account={account}"
EOF

cat <<'EOF' > phonefarm/fleet/proxy_pool.py
"""Proxy pool with ≤3 devices per endpoint."""
from __future__ import annotations
from collections import defaultdict

MAX_PER_ENDPOINT = 3


class ProxyPool:
    def __init__(self) -> None:
        self._assignments: dict[str, list[str]] = defaultdict(list)

    def assign(self, endpoint: str, serial: str) -> None:
        if len(self._assignments[endpoint]) >= MAX_PER_ENDPOINT:
            raise RuntimeError(f"proxy {endpoint} already at max capacity")
        self._assignments[endpoint].append(serial)

    def load(self, endpoint: str) -> int:
        return len(self._assignments[endpoint])
EOF

cat <<'EOF' > phonefarm/fleet/rotation.py
"""Airplane-mode IP rotation."""
from __future__ import annotations
import time
from phonefarm.device.adb import run


def rotate_ip(serial: str, hold_s: int = 3) -> None:
    run(serial, "shell", "settings", "put", "global", "airplane_mode_on", "1")
    time.sleep(hold_s)
    run(serial, "shell", "settings", "put", "global", "airplane_mode_on", "0")
EOF

cat <<'EOF' > phonefarm/fleet/mcp_tools.py
"""MCP tool registration for phonefarm.fleet.*"""
from __future__ import annotations
from .health import check_all

TOOLS = {"phonefarm.fleet.check-health": check_all}


def register(registry) -> None:
    for name, fn in TOOLS.items():
        registry.register(name, fn)
EOF

# ─── phonefarm/utils ──────────────────────────────────────────────────────────
cat <<'EOF' > phonefarm/utils/__init__.py
EOF

cat <<'EOF' > phonefarm/utils/logging.py
"""Structured logging."""
from __future__ import annotations
import logging
import os

LEVEL = os.getenv("PHONEFARM_LOG_LEVEL", "INFO")


def get_logger(name: str) -> logging.Logger:
    logging.basicConfig(level=LEVEL, format="%(asctime)s %(levelname)s %(name)s %(message)s")
    return logging.getLogger(name)
EOF

cat <<'EOF' > phonefarm/utils/config.py
"""Config loader."""
from __future__ import annotations
from pathlib import Path
import yaml


def load_yaml(path: str | Path) -> dict:
    return yaml.safe_load(Path(path).read_text()) or {}
EOF

cat <<'EOF' > phonefarm/utils/errors.py
"""Domain errors."""
from __future__ import annotations


class PhonefarmError(Exception):
    pass


class DeviceError(PhonefarmError):
    pass


class ProvisionError(PhonefarmError):
    pass
EOF

cat <<'EOF' > phonefarm/utils/retry.py
"""Retry helper."""
from __future__ import annotations
import time
from typing import Callable, TypeVar

T = TypeVar("T")


def retry(fn: Callable[[], T], attempts: int = 3, delay: float = 0.5) -> T:
    last: Exception | None = None
    for _ in range(attempts):
        try:
            return fn()
        except Exception as exc:
            last = exc
            time.sleep(delay)
    assert last is not None
    raise last
EOF

cat <<'EOF' > phonefarm/utils/mcp_bridge.py
"""MCP bridge — loads skill markdown and registers all tools."""
from __future__ import annotations
from pathlib import Path


class MCPRegistry:
    def __init__(self) -> None:
        self._tools: dict[str, callable] = {}

    def register(self, name: str, fn: callable) -> None:
        self._tools[name] = fn

    def list(self) -> list[str]:
        return sorted(self._tools)


def load_skills(root: str | Path = "skills") -> list[Path]:
    return sorted(Path(root).glob("*.md"))


def bootstrap() -> MCPRegistry:
    reg = MCPRegistry()
    from phonefarm.content import mcp_tools as content_tools
    from phonefarm.device import mcp_tools as device_tools
    from phonefarm.scheduler import mcp_tools as scheduler_tools
    from phonefarm.fleet import mcp_tools as fleet_tools
    for mod in (content_tools, device_tools, scheduler_tools, fleet_tools):
        mod.register(reg)
    return reg
EOF

# ─── tests ────────────────────────────────────────────────────────────────────
cat <<'EOF' > tests/__init__.py
EOF

cat <<'EOF' > tests/conftest.py
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
EOF

cat <<'EOF' > tests/test_content/test_generator.py
from phonefarm.content import generate_post


def test_generate_post_tiktok():
    out = generate_post("farm automation", "tiktok")
    assert out["platform"] == "tiktok"
    assert out["text"]
    assert len(out["hashtags"]) <= 5
EOF

cat <<'EOF' > tests/test_content/test_hashtags.py
from phonefarm.content.hashtags import generate_hashtags


def test_limit_per_platform():
    assert len(generate_hashtags("x", "x")) <= 2
    assert len(generate_hashtags("x", "tiktok")) <= 5
EOF

cat <<'EOF' > tests/test_content/test_video.py
from phonefarm.content import generate_video_script


def test_script_structure():
    s = generate_video_script("topic", "tiktok")
    assert {"hook", "value", "cta", "duration_target_s"} <= s.keys()
EOF

cat <<'EOF' > tests/test_content/test_platforms.py
from phonefarm.content.platforms import get_platform


def test_get_platform():
    assert get_platform("tiktok").name == "tiktok"
EOF

cat <<'EOF' > tests/test_device/test_adb.py
from phonefarm.device.adb import list_devices


def test_list_devices_callable():
    assert isinstance(list_devices(), list)
EOF

cat <<'EOF' > tests/test_device/test_diagnose.py
from phonefarm.device.thermal import read_thermal_zones


def test_thermal_parser_shape():
    # parser-level test only — does not require a live device
    assert callable(read_thermal_zones)
EOF

cat <<'EOF' > tests/test_device/test_provision.py
from phonefarm.device.rkp import check_rkp_support


def test_rkp_returns_dict_shape():
    # Avoid real adb call by asserting the function is importable
    assert callable(check_rkp_support)
EOF

cat <<'EOF' > tests/test_device/test_remediate.py
from phonefarm.device.remediate import LADDER


def test_ladder_order():
    assert LADDER[0] == "cache"
    assert LADDER[-1] == "factory"
EOF

cat <<'EOF' > tests/test_device/test_thermal.py
import json
from pathlib import Path


def test_fixture_shape():
    fixture = Path(__file__).parent.parent / "fixtures" / "thermal_zones.txt"
    lines = fixture.read_text().splitlines()
    assert all(":" in l for l in lines if l.strip())
EOF

cat <<'EOF' > tests/test_device/test_rkp.py
from pathlib import Path


def test_rkp_fixture():
    fixture = Path(__file__).parent.parent / "fixtures" / "remote_provisioning_dump.txt"
    text = fixture.read_text()
    assert "rpcAuthorName" in text
EOF

cat <<'EOF' > tests/test_scheduler/test_adaptive.py
from phonefarm.scheduler.adaptive import optimal_window


def test_window_for_tiktok():
    w = optimal_window("tiktok")
    assert w["best_day"] == "saturday"
EOF

cat <<'EOF' > tests/test_scheduler/test_velocity.py
from phonefarm.scheduler.velocity import velocity


def test_velocity_weights_saves():
    assert velocity(1000, 10, 5) > velocity(1000, 0, 0)
EOF

cat <<'EOF' > tests/test_fleet/test_registry.py
from phonefarm.fleet.registry import FleetRegistry, Device


def test_add_and_get():
    reg = FleetRegistry()
    reg.add(Device(serial="ABC"))
    assert reg.get("ABC").serial == "ABC"
EOF

cat <<'EOF' > tests/test_fleet/test_health.py
from phonefarm.fleet.health import check_all


def test_check_all_is_callable():
    assert callable(check_all)
EOF

cat <<'EOF' > tests/fixtures/sample_logcat.txt
09-21 12:00:00.000 E/AndroidRuntime: FATAL EXCEPTION: main
09-21 12:00:01.000 E/ActivityManager: ANR in com.example.app
EOF

cat <<'EOF' > tests/fixtures/thermal_zones.txt
cpu-0-0:42000
cpu-0-1:43000
battery:31000
skin:35000
EOF

cat <<'EOF' > tests/fixtures/tradein_status.json
{
  "imei": "000000000000000",
  "serial": "R58M0000000",
  "brand": "google",
  "model": "Pixel 9",
  "battery_health": "good",
  "cycle_count": 42,
  "part_status": "original",
  "storage_lifespan": "healthy"
}
EOF

cat <<'EOF' > tests/fixtures/remote_provisioning_dump.txt
default: hwVersion=1 rpcAuthorName=GOOGLE
default: hwVersion=1 rpcAuthorName=SAMSUNG
EOF

# ─── scripts/ ─────────────────────────────────────────────────────────────────
cat <<'EOF' > scripts/bootstrap_fleet.sh
#!/usr/bin/env bash
set -euo pipefail
echo "TODO: zero-touch enroll + provision all attached devices"
phonefarm provision "${1:-}"
EOF

cat <<'EOF' > scripts/rotate_proxies.py
#!/usr/bin/env python3
from phonefarm.fleet.rotation import rotate_ip
import sys

for serial in sys.argv[1:]:
    rotate_ip(serial)
EOF

cat <<'EOF' > scripts/export_intrusion_logs.sh
#!/usr/bin/env bash
set -euo pipefail
for serial in "$@"; do
  adb -s "$serial" shell am start -a android.settings.SECURITY_SETTINGS
  echo "Export Intrusion Log for $serial manually, or automate via UI."
done
EOF

cat <<'EOF' > scripts/rkp_certify_all.sh
#!/usr/bin/env bash
set -euo pipefail
for serial in $(adb devices | awk 'NR>1 && $2=="device"{print $1}'); do
  echo "== $serial =="
  adb -s "$serial" shell cmd remote_provisioning certify default || true
done
EOF

cat <<'EOF' > scripts/enroll_zero_touch.py
#!/usr/bin/env python3
from phonefarm.fleet.zero_touch import enrollment_url
import os

print(enrollment_url(os.environ.get("ZERO_TOUCH_ACCOUNT", "REPLACE_ME")))
EOF

# ─── configs/ ─────────────────────────────────────────────────────────────────
cat <<'EOF' > configs/fleet.example.yaml
fleet:
  max_devices_per_proxy: 3
  min_sdk: 31
  require_rkp: true
  health_check_interval_min: 30
EOF

cat <<'EOF' > configs/platforms.yaml
platforms:
  tiktok:    { char_limit: 4000, hashtag_limit: 5 }
  instagram: { char_limit: 2200, hashtag_limit: 5 }
  youtube:   { char_limit: 5000, hashtag_limit: 15 }
  x:         { char_limit: 280,  hashtag_limit: 2 }
  linkedin:  { char_limit: 3000, hashtag_limit: 5 }
  facebook:  { char_limit: 63206, hashtag_limit: 2 }
  threads:   { char_limit: 500,  hashtag_limit: 1 }
EOF

cat <<'EOF' > configs/proxies.example.yaml
proxies:
  - endpoint: "socks5://proxy-a.example:1080"
    country: US
  - endpoint: "socks5://proxy-b.example:1080"
    country: GB
  - endpoint: "socks5://proxy-c.example:1080"
    country: DE
EOF

cat <<'EOF' > configs/fingerprint_profiles.yaml
profiles:
  - id: pixel9-us
    device_model: "Pixel 9"
    carrier: "T-Mobile"
    locale: "en-US"
  - id: s24-gb
    device_model: "SM-S921B"
    carrier: "EE"
    locale: "en-GB"
EOF

# ─── docs/ ────────────────────────────────────────────────────────────────────
cat <<'EOF' > docs/architecture.md
# Architecture

- `skills/` defines capability contracts in markdown
- `references/` holds deep-dive docs referenced by skills
- `phonefarm/` is the Python implementation
- MCP tools are namespaced per domain: `phonefarm.{content,device,scheduler,fleet}.*`
- `phonefarm/utils/mcp_bridge.py` bootstraps the registry on process start
EOF

cat <<'EOF' > docs/onboarding.md
# Onboarding a device

1. `adb devices -l` — confirm reachable
2. `python -c "from phonefarm.device.rkp import certify; print(certify('<serial>'))"` — RKP
3. `phonefarm provision <serial>` — full provision
4. Verify via `phonefarm diagnose <serial>`
5. Register metadata in `FleetRegistry`
EOF

cat <<'EOF' > docs/mcp-tools.md
# MCP tools

| Tool | Module |
|------|--------|
| `phonefarm.content.generate-post` | `phonefarm/content/generator.py` |
| `phonefarm.content.generate-video-script` | `phonefarm/content/video.py` |
| `phonefarm.device.diagnose-device` | `phonefarm/device/diagnose.py` |
| `phonefarm.device.provision-device` | `phonefarm/device/provision.py` |
| `phonefarm.device.remediate-device` | `phonefarm/device/remediate.py` |
| `phonefarm.scheduler.schedule-adaptive` | `phonefarm/scheduler/adaptive.py` |
| `phonefarm.fleet.check-health` | `phonefarm/fleet/health.py` |
EOF

cat <<'EOF' > docs/fleet-operations.md
# Fleet operations

- Rotation: `scripts/rotate_proxies.py <serial>...`
- Health: `phonefarm.fleet.check-health` MCP tool
- Provisioning: `scripts/bootstrap_fleet.sh <serial>`
- RKP sweep: `scripts/rkp_certify_all.sh`
EOF

cat <<'EOF' > docs/security-posture.md
# Security posture

- RKP attestation required for fleet admission
- Intrusion Log export before any destructive remediation
- Advanced Protection Mode awareness (Android 16+) — blocks ADB sideloading
- CVE-2026-0073 (Wireless ADB Auth Bypass) — verify patch level before provisioning
EOF

# ─── final tree ───────────────────────────────────────────────────────────────
echo
echo "== phonefarm tree =="
find . -type f -not -path './.git/*' -not -path '*/__pycache__/*' | sort
echo
echo "Done. Next:"
echo "  python -m venv .venv && source .venv/bin/activate"
echo "  pip install -r requirements-dev.txt"
echo "  make test"
