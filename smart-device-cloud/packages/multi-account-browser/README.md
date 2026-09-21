# Multi-Account Browser

Browser automation and session abstraction for Smart Device Cloud.

## Purpose

Owns browser profiles, profile templates, profile storage, sessions, cookies, proxy configuration, automation, and
scheduling.

## Responsibilities

- Browser profile management
- Profile templates and storage
- Session management
- Cookie encryption at rest
- Proxy configuration with vault-stored credentials
- Automation via workflow-engine interfaces
- Scheduling
- Session isolation between profiles
- Authorization-gated automation

## Dependencies

- `@smart-device-cloud/shared` — Shared domain types and validation

## Public API

- `BrowserManager` — Browser manager interface
- `InMemoryBrowserManager` — In-memory implementation
- `BrowserProfile` — Profile type
- `BrowserSession` — Session type

## Security

- Cookies encrypted at rest
- Proxy credentials stored in vault
- Session isolation between profiles
- All automation authorization-gated

## August 2026 Compliance

- ✅ Cookies encrypted at rest
- ✅ Proxy credentials vault-stored
- ✅ Session isolation
- ✅ Authorization-gated automation
- ⚠️ Vault integration — infrastructure ready

## MCP Tools Exposed

- Browser automation operations exposed via MCP boundary

## Harness Configuration

- N/A (not an agentic package)

## Eval Coverage

- Profile isolation correctness
- Cookie encryption
- Session lifecycle
