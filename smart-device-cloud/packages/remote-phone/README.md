# Remote Phone

Remote device session management for Smart Device Cloud.

## Purpose

Owns remote sessions, permissions, screen streaming, file transfers, application management, recording, audit logging,
and connectivity.

## Responsibilities

- Remote session management
- Permissions (screen, input, install, record, files)
- Screen streaming with quality adaptation
- File transfers with path validation
- Application management
- Recording
- Audit logging (immutable)
- Connectivity with fallback

## Dependencies

- `@smart-device-cloud/shared` — Shared domain types, OAuth, permissions
- `@smart-device-cloud/device-protocol` — Device protocol abstraction

## Public API

- `RemotePhoneManager` — Remote phone manager interface
- `InMemoryRemotePhoneManager` — In-memory implementation
- `RemoteSession` — Session type
- `Permission` — Permission type

## Security

- Reuses existing OAuth 2.0/OIDC authentication
- No second permission model
- File paths validated (no traversal)
- All operations require authorization
- Streams encrypted in transit
- Audit trail immutable

## August 2026 Compliance

- ✅ OAuth 2.0/OIDC authentication reuse
- ✅ No duplicate permission model
- ✅ File path validation
- ✅ Encrypted streams in transit
- ✅ Immutable audit trail

## MCP Tools Exposed

- Remote session operations exposed via MCP boundary

## Harness Configuration

- N/A (not an agentic package)

## Eval Coverage

- Session isolation
- Permission enforcement
- File path validation
