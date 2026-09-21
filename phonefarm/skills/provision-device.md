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
