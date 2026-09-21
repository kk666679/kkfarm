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
