# MCP Integration Boundary

MCP 2026-07-28 stateless integration boundary for Smart Device Cloud.

## Purpose

Provide type-safe tool definitions and controlled integration access to domain packages. The MCP core is stateless — no
session IDs, no handshake, no sticky sessions.

## Responsibilities

- MCP tool registration and dispatch
- OAuth 2.0/OIDC authenticated tool execution
- Capability discovery via `server/discover`
- Governed extensions (MCP Apps, MCP Tasks)
- Stateless error handling (`-32602` for missing resources)
- Horizontal scalability via plain round-robin load balancing

## Dependencies

- `@smart-device-cloud/shared` — Shared domain types
- `@smartcloud/workflow-engine` — Workflow execution
- `@smartcloud/integration-hub` — External integrations
- `@smartcloud/device-ai` — Intelligence layer
- `@smartcloud/remote-phone` — Remote device access
- `@smartcloud/android-emulator` — Emulator management
- `@smartcloud/multi-account-browser` — Browser automation
- `@smartcloud/device-agent` — Device protocol types

## Public API

- `McpToolDefinition` — Tool interface with name, description, execute
- `createTool()` — Tool factory function
- `registerTool()` — Tool registration
- `mcpTools` — Registered tools array
- `McpToolContext` — Tool execution context
- `MCP_ERRORS` — Standard error codes
- `server/discover` — Capability discovery endpoint

## August 2026 Compliance

- ✅ Stateless core (no handshake, no session ID, no sticky sessions)
- ✅ OAuth 2.0/OIDC auth for all mutations
- ✅ `server/discover` for capabilities
- ✅ Error code `-32602` for missing resources (was `-32002`)
- ⚠️ Governed extensions (MCP Apps, MCP Tasks) — in progress
- ⚠️ Horizontal round-robin load balancing — architecture ready

## MCP Tools Exposed

- Tool definitions registered via `registerTool()` — delegate to domain packages
- Tool execution requires OAuth 2.0/OIDC Bearer token validation

## Harness Configuration

- MCP = Model + Harness pattern applied
- Model: Tool definitions and execution logic
- Harness: Stateless routing, OAuth validation, guardrails, observability

## Eval Coverage

- Tool dispatch correctness
- OAuth scope validation
- Error code conformance
- Stateless behavior under load
