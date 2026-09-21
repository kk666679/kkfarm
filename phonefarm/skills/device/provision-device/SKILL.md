---
name: provision-device
description:
  Provision a new device for the phone farm. Sets up OS, installs required apps, configures network, and registers with
  the fleet.
license: Apache-2.0
compatibility: Requires phonefarm.device.* MCP tools
metadata:
  author: phonefarm-team
  version: 1.0.0
allowed-tools: Bash(python:*) Read
tags: [device, provisioning, setup]
---

# Provision Device

## Procedure

1. Verify device connectivity (ADB/USB)
2. Install/verify OS version
3. Install required apps (TikTok, Instagram, etc.)
4. Configure network (proxy, VPN)
5. Set up device identity (fingerprint)
6. Register with fleet manager
7. Run health checks

## Anti-patterns

- Never skip fingerprint randomization
- Never use same proxy for > 3 devices
- Never provision without health check
