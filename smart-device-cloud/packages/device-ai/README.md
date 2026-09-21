# Device AI

Device intelligence layer for Smart Device Cloud.

## Purpose

Owns anomaly detection, pattern recognition, scaling recommendations, capacity planning, cost optimization, device
assistant, workflow recommendations, and fleet intelligence.

## Responsibilities

- Anomaly detection
- Pattern recognition
- Scaling recommendations
- Capacity planning
- Cost optimization
- Device assistant (chat interface)
- Workflow recommendations
- Fleet intelligence

## Dependencies

- `@smart-device-cloud/shared` — Shared domain types, validation
- `@smartcloud/telemetry-service` — Telemetry data
- `@smartcloud/workload-manager` — Workload data
- `@smartcloud/analytics-service` — Analytics data

## Public API

- `DeviceAiEngine` — AI engine interface
- `InMemoryDeviceAiEngine` — In-memory implementation
- `Recommendation` — Recommendation type
- `RecommendationAction` — Action type enum
- `RecommendationStatus` — Status type enum
- `MetricTrend` — Metric trend type
- `ScalingRecommendation` — Scaling recommendation
- `CostOptimization` — Cost optimization

## Requirements

- AI must NOT directly execute arbitrary commands
- All AI outputs must be structured (JSON schema validated)
- Confidence scores must be provided
- Recommendations must be reviewable
- AI → Recommendation → Validation → Authorization → Typed Operation

## August 2026 Compliance

- ✅ AI outputs structured and JSON schema validated
- ✅ Confidence scores provided
- ✅ Recommendations reviewable
- ✅ AI outputs go through RBAC + approval before execution
- ✅ Fleet intelligence support

## MCP Tools Exposed

- `inspect_device` — AI-powered device inspection
- `get_recommendations` — Get AI recommendations

## Harness Configuration

- Device AI implements Model + Harness pattern
- Model: AI analysis and pattern recognition
- Harness: Recommendation validation, authorization gate, observability

## Eval Coverage

- Recommendation accuracy
- Confidence score calibration
- Authorization gate enforcement
- Fleet intelligence predictions
