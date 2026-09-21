# Device Agent

Shared device protocol types for Smart Device Cloud.

## Purpose

Device protocol types and interfaces for device-to-cloud communication. Protocol-specific message types (heartbeat,
command, response, error) for device agent communication.

## Responsibilities

- Device protocol message types
- Heartbeat message definitions
- Command message definitions
- Agent communication protocol

## Dependencies

- `@smart-device-cloud/shared` — Shared domain types (re-exported)
- `uuid` — UUID generation

## Public API

- `DeviceState` — Device state enum
- `DeviceMetrics` — Device metrics type
- `HeartbeatMessage` — Heartbeat message type
- `CommandMessage` — Command message type
- `AgentMessage` — Union of all message types
- `AgentCommand` — Agent command type
- Re-exports from `@smart-device-cloud/shared`: `Device`, `Workflow`, `WorkflowStep`, `WorkflowTrigger`, `WorkflowExecution`,
  `Alert`, `AuditLogEntry`, `FleetMetrics`, `HealthMetrics`, `User`

## August 2026 Compliance

- ✅ Protocol-specific types separated from domain types
- ✅ Domain types re-exported from shared
- ✅ No duplicate type definitions

## MCP Tools Exposed

- None (type definitions only)

## Harness Configuration

- N/A (not an agentic package)

## Eval Coverage

- Protocol message correctness
- Type compatibility
- Re-export integrity
