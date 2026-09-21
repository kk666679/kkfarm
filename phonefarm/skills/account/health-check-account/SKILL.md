---
name: health-check-account
description:
  Check the health status of an account including restrictions, shadowban, engagement metrics. Use periodically or
  before important operations.
license: Apache-2.0
compatibility: Requires phonefarm.account.* MCP tools
metadata:
  author: phonefarm-team
  version: 1.0.0
allowed-tools: Bash(python:*) Read
tags: [account, health, monitoring]
---

# Health Check Account

## Procedure

1. Verify account login status
2. Check for restrictions/bans
3. Measure engagement metrics
4. Detect shadowban indicators
5. Report health score

## Anti-patterns

- Never skip health check before campaigns
- Don't ignore gradual engagement drops
