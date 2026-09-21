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
