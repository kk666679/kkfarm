---
name: remediate-device
description:
  Remediate device issues automatically or with guided steps. Handles app reinstall, cache clear, network reset, factory
  reset.
license: Apache-2.0
compatibility: Requires phonefarm.device.* MCP tools
metadata:
  author: phonefarm-team
  version: 1.0.0
allowed-tools: Bash(python:*) Read
tags: [device, remediation, recovery]
---

# Remediate Device

## Procedure

1. Identify issue from diagnosis
2. Apply least invasive fix first:
   - Clear app cache/data
   - Restart app
   - Restart device
   - Reinstall app
   - Network reset
   - Factory reset (last resort)
3. Verify fix with health check
4. Log remediation action

## Anti-patterns

- Never factory reset without backup
- Don't skip verification after fix
