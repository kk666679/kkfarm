# Android Emulator

Android emulator management abstraction for Smart Device Cloud.

## Purpose

Owns emulator lifecycle, Android versions/images, device profiles, snapshots, APK analysis, APK installation, ADB bridge
(typed and allowlisted), performance monitoring, and test automation.

## Responsibilities

- Emulator lifecycle management
- Android versions and image management
- Device profiles
- Snapshots
- APK analysis and installation
- ADB bridge (typed, allowlisted)
- Performance monitoring
- Test automation

## Dependencies

- `@smart-device-cloud/shared` — Shared domain types
- `@smart-device-cloud/device-protocol` — Device protocol abstraction

## Public API

- `EmulatorManager` — Emulator manager interface
- `InMemoryEmulatorManager` — In-memory implementation
- `EmulatorProfile` — Profile type
- `EmulatorInstance` — Instance type
- `AllowedAdbAction` — Allowlisted ADB actions
- `AdbCommand` — Typed ADB command

## Security

- ADB operations typed and allowlisted
- Every ADB command has declared scope
- Resource allocation governed (CPU, memory, disk)
- Emulator lifecycle observable (OpenTelemetry)
- No arbitrary shell execution (no eval/exec/shell)

## August 2026 Compliance

- ✅ Typed allowlisted ADB commands
- ✅ Declared scope per ADB command
- ✅ Resource governance
- ✅ OpenTelemetry lifecycle observability
- ✅ No arbitrary shell execution

## MCP Tools Exposed

- Emulator operations exposed via MCP boundary

## Harness Configuration

- N/A (not an agentic package)

## Eval Coverage

- ADB allowlist enforcement
- Resource governance
- Snapshot management
