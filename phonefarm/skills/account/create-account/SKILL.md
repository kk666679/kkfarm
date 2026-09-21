---
name: create-account
description:
  Create a new account on a device for a given platform (TikTok, Instagram, YouTube, LinkedIn). Use when onboarding a
  new device or expanding platform coverage. Handles email verification, profile setup, and initial warmup.
license: Apache-2.0
compatibility: Requires phonefarm.device.* MCP tools
metadata:
  author: phonefarm-team
  version: 1.0.0
allowed-tools: Bash(python:*) Read
tags: [account, creation, onboarding]
---

# Create Account

## Procedure

1. Verify device is online and healthy
2. Check platform quota (max accounts per device)
3. Generate credentials (email, password, profile)
4. Register via platform API or UI automation
5. Verify email/phone
6. Complete profile setup
7. Log creation to audit trail

## Anti-patterns

- Never create > 3 accounts per device per day
- Never reuse emails across devices
- Never skip warmup phase
