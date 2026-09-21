# @sdc/api-gateway

Single ingress for smart-device-cloud. Handles REST, tRPC, MCP, and WebSocket.

## Responsibilities

- Authentication (OAuth 2.0/OIDC via JWKS)
- Authorization (RBAC)
- Rate limiting (per-tenant)
- CORS (unified)
- OpenTelemetry tracing
- Structured logging
- RFC 7807 error formatting
- API versioning
- Backend routing (via adapters)
- MCP federation
- WebSocket fan-in

## What it never does

- Own database connections
- Contain business rules
- Transform domain data
- Cache business data
- Hold state between requests

## Run

```bash
pnpm install
pnpm dev
```

## Endpoints

| Route       | Protocol  | Purpose                              |
| ----------- | --------- | ------------------------------------ |
| `/health`   | HTTP      | Liveness                             |
| `/ready`    | HTTP      | Readiness                            |
| `/metrics`  | HTTP      | Prometheus                           |
| `/api/v1/*` | REST      | External API                         |
| `/trpc/*`   | tRPC      | Internal API                         |
| `/mcp`      | MCP       | Stateless tool protocol (2026-07-28) |
| `/ws`       | WebSocket | Realtime events                      |
