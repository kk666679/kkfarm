# Workflow Engine

Graph-based workflow orchestration layer for Smart Device Cloud.

## Purpose

Own workflow definitions, validation, nodes, execution, state (durable via Saga pattern), scheduling, triggers, and step
execution.

## Responsibilities

- Workflow definitions and validation
- Graph-based orchestration (not just linear steps)
- Saga compensation for long-running workflows
- Checkpointing for durable execution
- State management with durable execution
- Scheduling and triggers
- ACP integration for editor-triggered workflows
- OpenTelemetry traces for every step

## Dependencies

- `@smart-device-cloud/shared` — Shared domain types
- `@smartcloud/integration-hub` — External integrations
- `@smartcloud/multi-account-browser` — Browser automation
- `@smartcloud/android-emulator` — Emulator management
- `@smartcloud/remote-phone` — Remote device access
- `@smartcloud/device-ai` — Intelligence layer
- `@smartcloud/device-agent` — Device protocol types
- `@smart-device-cloud/device-protocol` — Device protocol abstraction
- `@smartcloud/telemetry-service` — Telemetry
- `@smartcloud/workload-manager` — Workload management

## Public API

- `WorkflowEngine` — Workflow engine interface
- `InMemoryWorkflowEngine` — In-memory implementation
- `WorkflowContext` — Execution context
- `StepRunner` — Step execution interface
- `StepResult` — Step result type
- `WorkflowTriggerType` — Trigger type enum
- `WorkflowStepType` — Step type enum

## August 2026 Compliance

- ✅ Graph-based orchestration support
- ✅ Saga compensation pattern
- ✅ Checkpointing for durable execution
- ✅ OpenTelemetry traces for every step
- ✅ ACP integration support
- ⚠️ Agent Skills nodes — in progress

## MCP Tools Exposed

- `run_workflow` — Delegates to workflow engine

## Harness Configuration

- Workflow Engine implements Model + Harness pattern
- Model: Workflow definitions, graph structure
- Harness: Execution orchestration, checkpointing, fallback

## Eval Coverage

- Workflow execution correctness
- Saga compensation behavior
- Checkpoint recovery
- Graph traversal accuracy
