---
name: diagnose-device
description: Diagnose device issues including connectivity, app crashes, performance degradation, and hardware problems.
license: Apache-2.0
compatibility: Requires phonefarm.device.* MCP tools
metadata:
  author: phonefarm-team
  version: 1.0.0
allowed-tools: Bash(python:*) Read
tags: [device, diagnosis, troubleshooting]
---

# Diagnose Device

## Procedure

1. Check connectivity (ADB, network)
2. Verify battery/thermal status
3. Check app health (crashes, ANRs)
4. Measure performance (CPU, RAM, FPS)
5. Check storage space
6. Run diagnostic scripts
7. Generate report

## Anti-patterns

- Never ignore thermal throttling
- Don't run diagnostics during active tasks
