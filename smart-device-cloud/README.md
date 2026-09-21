# Smart Device Cloud

A TypeScript/Node.js microservices platform for IoT device management, workflow orchestration, and cloud services. Part of the **KK Farm** monorepo.

## Overview

Smart Device Cloud is an enterprise-grade platform for managing fleets of IoT devices (primarily mobile/phone devices) at scale. It provides device registration, telemetry ingestion, workflow orchestration, billing, analytics, and multi-tenant administration.

**Key Features:**
- Device fleet management with real-time telemetry
- Graph-based workflow orchestration with Saga compensation
- MCP (Model Context Protocol) integration for AI-powered automation
- Multi-tenant architecture with RBAC
- Multi-region deployment support (Singapore, Tokyo, London, Frankfurt, Virginia)
- Fleet intelligence, cost management, and workflow automation

## Project Structure

```
smart-device-cloud/
├── apps/                     # Frontend applications
│   ├── admin-dashboard/      # Internal admin dashboard
│   ├── partner-portal/       # Partner-facing portal
│   └── web/                  # Public web application
├── packages/                 # Shared libraries & SDKs
│   ├── shared/              # Core types, validation, auth, observability
│   ├── sdk/                 # Partner SDK
│   ├── workflow-engine/     # Graph-based workflow orchestration
│   ├── mcp/                 # MCP integration boundary
│   ├── device-ai/           # Intelligence layer
│   ├── device-protocol/     # Device protocol abstraction
│   ├── integration-hub/     # External integrations
│   ├── remote-phone/        # Remote device access
│   ├── android-emulator/    # Emulator management
│   ├── multi-account-browser/# Browser automation
│   ├── users-dashboard/     # User-facing dashboard
│   └── ui-components/       # Shared React components
├── services/                 # Backend microservices
│   ├── api-gateway/         # Single ingress (Fastify, tRPC, MCP, WS)
│   ├── api/                 # Core REST API
│   ├── telemetry-service/   # Device heartbeats, metrics (TCP/WS)
│   ├── workload-manager/    # Job queue, task execution (Bull/Redis)
│   ├── analytics-service/   # Aggregation, reporting (Postgres/TimescaleDB)
│   ├── billing-service/     # Metering, pricing, invoicing
│   └── device-agent/        # On-device agent communication
├── infrastructure/           # DevOps & deployment
│   ├── docker-compose.dev.yml
│   ├── docker-compose.yml
│   ├── helm/                # Kubernetes charts
│   ├── k8s/                 # Kubernetes manifests
│   ├── terraform/           # IaC
│   ├── grafana/             # Monitoring dashboards
│   ├── prometheus/          # Metrics config
│   ├── nginx/               # Reverse proxy config
│   ├── otel/                # OpenTelemetry config
│   └── scripts/             # DevOps automation scripts
├── shared/                   # Shared code (also a package)
├── tests/                    # Cross-project tests
│   ├── e2e/                 # End-to-end tests
│   ├── integration/         # Integration tests
│   └── security/            # Security tests
├── .env.example              # Environment template
├── docker-compose.yml        # Production stack
├── turbo.json               # Turborepo config
└── tsconfig.base.json        # Base TypeScript config
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Monorepo** | Turborepo + npm workspaces |
| **Language** | TypeScript 6 (strict mode) |
| **Runtime** | Node.js >= 24 |
| **API Gateway** | Fastify + tRPC + MCP + WebSocket |
| **Frontend** | React 19 + Vite + Tailwind CSS 4 |
| **Database** | PostgreSQL 15, TimescaleDB, Elasticsearch |
| **Cache/Queue** | Redis 7 (Bull queue) |
| **Observability** | OpenTelemetry, Prometheus, Grafana, Jaeger |
| **Auth** | OAuth 2.0/OIDC (JWKS), JWT (jose) |
| **Validation** | Zod 4 |
| **Testing** | Vitest, Jest |
| **Container** | Docker, Kubernetes (Helm) |

## Prerequisites

- **Node.js** >= 24.21.0
- **npm** >= 12.0.2
- **Docker & Docker Compose** (for local infrastructure)
- **Git**

## Quick Start (Local Development)

### 1. Install Dependencies

```bash
cd smart-device-cloud
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your local configuration
```

### 3. Start Infrastructure

```bash
cd infrastructure
docker-compose -f docker-compose.dev.yml up -d
```

This starts all required services: PostgreSQL, TimescaleDB, Redis, Elasticsearch, MinIO, Jaeger, Prometheus, Grafana, OTel Collector, and Nginx.

### 4. Build & Run

```bash
# Build all packages and services
npm run build

# Start all services in dev mode
npm run dev

# Type check all
npm run type-check

# Run all tests
npm run test

# Lint all
npm run lint
```

### 5. Access Services

| Service | URL |
|---------|-----|
| **API Gateway** | http://localhost:3000 |
| **Web App** | http://localhost:5173 |
| **Prometheus** | http://localhost:9090 |
| **Grafana** | http://localhost:3000 (admin/admin) |
| **Jaeger** | http://localhost:16686 |
| **Elasticsearch** | http://localhost:9200 |
| **MinIO** | http://localhost:9000 (minioadmin/minioadmin) |

## Services Reference

### API Gateway (`services/api-gateway`)

Single ingress point handling all external traffic. Responsibilities:

- **Authentication**: OAuth 2.0/OIDC via JWKS
- **Authorization**: RBAC
- **Rate Limiting**: Per-tenant
- **CORS**: Unified configuration
- **OpenTelemetry**: Distributed tracing
- **Error Formatting**: RFC 7807
- **API Versioning**: URL-based (`/api/v1/*`)

**Endpoints:**

| Route | Protocol | Purpose |
|-------|----------|---------|
| `/health` | HTTP | Liveness probe |
| `/ready` | HTTP | Readiness probe |
| `/metrics` | HTTP | Prometheus metrics |
| `/api/v1/*` | REST | External API |
| `/trpc/*` | tRPC | Internal API |
| `/mcp` | MCP | Model Context Protocol tools |
| `/ws` | WebSocket | Real-time events |

**Run:**
```bash
cd services/api-gateway
pnpm install
pnpm dev
```

### Telemetry Service (`services/telemetry-service`)

Handles device telemetry ingestion via TCP and WebSocket.

- TCP server for device heartbeat data
- In-memory buffer (1000 samples per device)
- Real-time WebSocket broadcast
- Pino structured logging

**Run:**
```bash
cd services/telemetry-service
npm install
npm run dev
```

### Workload Manager (`services/workload-manager`)

Job queue and task execution engine powered by BullMQ + Redis.

- Workload task queue (configurable concurrency)
- Workflow task queue (Saga pattern)
- Redis connection with fallback support
- Graceful shutdown handling

**Run:**
```bash
cd services/workload-manager
npm install
npm start
```

### Analytics Service (`services/analytics-service`)

Time-series analytics and aggregation service.

- PostgreSQL/TimescaleDB connectivity
- Redis-backed caching
- Periodic aggregation jobs
- Configurable retention policies

**Run:**
```bash
cd services/analytics-service
npm install
npm start
```

## Packages Reference

### @smart-device-cloud/shared

Core shared library used across all packages. Provides:

- **Types & Models**: Device, Workload, Workflow, Tenant schemas (Zod)
- **Validation**: Schema validation exports
- **Auth**: JWT, OAuth helpers
- **Observability**: OpenTelemetry utilities, loggers
- **Constants**: Device states, alert thresholds, billing config
- **Utils**: Transformers, serializers, guards, factories, mocks
- **Agent**: Tool-call, task, plan abstractions
- **Federation**: MCP, ACP, Trust-bridge federation protocols

**Build:**
```bash
cd shared
npm run build
```

### @smartcloud/sdk

Partner SDK for external integrations. Provides typed clients for the Smart Device Cloud API.

**Build:**
```bash
cd packages/sdk
npm run build
```

### @smartcloud/workflow-engine

Graph-based workflow orchestration with:

- Workflow definitions and validation
- Saga compensation for long-running workflows
- Checkpointing for durable execution
- State management and scheduling
- OpenTelemetry traces for every step

**Key Types:**
- `WorkflowEngine` - Engine interface
- `InMemoryWorkflowEngine` - In-memory implementation
- `WorkflowContext` - Execution context
- `StepRunner` - Step execution interface
- `WorkflowTriggerType` - Trigger types

### @smartcloud/mcp

MCP 2026-07-28 stateless integration boundary:

- Stateless tool definitions and dispatch
- OAuth 2.0/OIDC authenticated execution
- Capability discovery via `server/discover`
- Horizontal scalability (round-robin)
- Error code conformance (-32602 for missing resources)

### Other Packages

| Package | Description |
|---------|-------------|
| `device-ai` | AI/intelligence layer for device analytics |
| `device-protocol` | Protocol abstraction for heterogeneous devices |
| `integration-hub` | External system integrations |
| `remote-phone` | Remote device access and control |
| `android-emulator` | Android emulator lifecycle management |
| `multi-account-browser` | Browser automation for testing |
| `users-dashboard` | User-facing dashboard app |
| `ui-components` | Shared React component library |

## Application Reference

### Admin Dashboard (`apps/admin-dashboard`)

Internal admin dashboard for platform operators. Built with React 19, tRPC, TanStack Query, Tailwind CSS.

**Run:**
```bash
cd apps/admin-dashboard
npm install
npm run dev
```

### Partner Portal (`apps/partner-portal`)

Partner-facing portal for device onboarding and management. Uses partner SDK and shared types.

**Run:**
```bash
cd apps/partner-portal
npm install
npm run dev
```

### Web Application (`apps/web`)

Public web application with AI-assisted workflows. Uses AI SDK, React Flow, and advanced visualization.

**Run:**
```bash
cd apps/web
npm install
npm run dev
```

## Environment Variables

All environment variables are documented in [`.env.example`](.env.example). Key categories:

| Category | Key Prefix | Description |
|----------|------------|-------------|
| Database | `DATABASE_URL`, `DB_*` | PostgreSQL connection |
| Cache | `REDIS_URL`, `REDIS_*` | Redis connection |
| Time-series | `TIMESERIES_*` | TimescaleDB connection |
| Search | `ELASTICSEARCH_*` | Elasticsearch connection |
| Auth | `JWT_*`, `OAUTH_*` | Authentication config |
| API Gateway | `API_GATEWAY_*` | Gateway server config |
| Telemetry | `TELEMETRY_SERVICE_*` | Telemetry service config |
| Workload | `WORKLOAD_*` | Workload manager config |
| Analytics | `ANALYTICS_*` | Analytics service config |
| Security | `TLS_*`, `SECURITY_*` | Security configuration |
| Features | `FEATURE_*` | Feature flags |

## Testing

```bash
# All tests (root)
npm run test

# Unit tests (service/package level)
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests (requires infrastructure)
npm run test:e2e

# Security tests
npm run test:security

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Test Structure

```
tests/
├── e2e/                 # End-to-end workflow execution, MCP federation, device lifecycle
├── integration/         # Billing, API gateway, auth integration tests
└── security/            # Authentication and authorization security tests
```

## Infrastructure

### Docker Compose (Development)

```bash
cd smart-device-cloud/infrastructure
docker-compose -f docker-compose.dev.yml up -d
```

**Services:**

| Container | Image | Ports | Purpose |
|-----------|-------|-------|---------|
| postgres | postgres:15-alpine | 5432 | Primary database |
| timescaledb | timescale/timescaledb | 5433 | Telemetry time-series |
| redis | redis:7-alpine | 6379 | Cache, queues, pub/sub |
| elasticsearch | elasticsearch:8.9.0 | 9200 | Audit log search |
| minio | minio/minio | 9000/9001 | Object storage |
| jaeger | jaegertracing/all-in-one | 16686 | Distributed tracing UI |
| prometheus | prom/prometheus | 9090 | Metrics collection |
| grafana | grafana/grafana | 3000 | Dashboards |
| otel-collector | otel/opentelemetry-collector | 4317/4318/8889 | Trace collection |
| nginx | nginx:alpine | 80/443 | Reverse proxy |

### Kubernetes (Production)

```bash
cd smart-device-cloud/infrastructure/helm
helm install smart-device-cloud ./smart-device-cloud \
  --namespace smart-device-cloud \
  --create-namespace \
  -f values-production.yaml
```

### Terraform

```bash
cd smart-device-cloud/infrastructure/terraform
terraform init
terraform plan
terraform apply
```

## Observability

- **Metrics**: Prometheus + Grafana (pre-built dashboards)
- **Tracing**: OpenTelemetry + Jaeger
- **Logging**: Pino (JSON structured logs in production, pretty in dev)
- **Alerting**: Prometheus Alertmanager (configured in infrastructure)
- **Dashboard**: Grafana (admin/admin credentials in dev)

## Performance Tuning

Key configuration knobs:

| Setting | Default | Description |
|---------|---------|-------------|
| `API_RATE_LIMIT` | 1000 | Requests per minute per tenant |
| `JOB_QUEUE_CONCURRENCY` | 10 | Workload manager parallelism |
| `TELEMETRY_BUFFER_SIZE` | 1000 | Telemetry samples per device |
| `ANALYTICS_BATCH_SIZE` | 100 | Analytics batch size |
| `DEVICE_HEARTBEAT_INTERVAL` | 30000ms | Device heartbeat frequency |
| `WORKLOAD_RETRY_ATTEMPTS` | 3 | Job retry attempts |

## Troubleshooting

### Common Issues

1. **Port conflicts**: Multiple services may conflict if defaults are unchanged. Check `.env` for port assignments.
2. **Database migrations**: Run `npx prisma migrate deploy` in the database package.
3. **Redis connection**: Verify `REDIS_URL` if workload manager fails to start.
4. **TypeScript errors**: Run `npm run type-check` to identify cross-package type issues.

### Debug Mode

```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

See [CONTRIBUTING](docs/CONTRIBUTING.md) for guidelines.

## Security

See [SECURITY](SECURITY.md) for security policies.

---

*Last updated: 2026-09-20*