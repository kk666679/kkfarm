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
