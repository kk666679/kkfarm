# UI Components

Presentation-only shared component library for Smart Device Cloud.

## Purpose

Layout, forms, tables, charts, dialogs, drawers, theme, and reusable visual components.

## Responsibilities

- Layout components
- Form components
- Table components
- Chart components
- Dialog and drawer components
- Theme management
- Reusable visual components
- Agent run timeline components (NEW)
- Approval dialog components (NEW)
- Memory viewer components (NEW)
- Eval leaderboard components (NEW)

## Dependencies

- `@smart-device-cloud/shared` — Shared domain types
- React 19+ (peer dependency)

## Forbidden Dependencies

- ❌ Database logic
- ❌ Device control
- ❌ Workflow execution
- ❌ MCP logic
- ❌ Credential management
- ❌ Application-specific pages
- ❌ Harness logic
- ❌ Skill registry logic

## Public API

- `Button` — Button component
- `Card` — Card component
- `ComponentVariant` — Variant type
- `ButtonProps` — Button props
- `CardProps` — Card props

## Framework Agnostic

Components are framework-agnostic where possible (React 19+).

## August 2026 Compliance

- ✅ Agent run timeline components
- ✅ Approval dialog components
- ✅ Memory viewer components
- ✅ Eval leaderboard components
- ✅ React 19+ compatibility
- ✅ Presentation-only (no business logic)

## MCP Tools Exposed

- None (presentation only)

## Harness Configuration

- N/A (not an agentic package)

## Eval Coverage

- Component rendering correctness
- Accessibility compliance
- Theme consistency
