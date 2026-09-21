# KK Farm - Smart Device Cloud Platform

A comprehensive monorepo for device farming, IoT device management, and smart device cloud orchestration. Built with modern tooling (Turborepo, TypeScript, React, FastAPI) and designed for enterprise-scale deployments.

## Overview

This monorepo contains three major projects that work together to provide a complete device farming and IoT management platform:

| Project | Technology | Path | Description |
|---------|------------|------|-------------|
| **Phone Farm** | Python/FastAPI | `phonefarm/` | Multi-agent device farm management with agentic stack (harness, skills, memory, eval, MCP, governance) |
| **Mobile** | React Native/Expo | `mobile/` | Cross-platform mobile app for device management, task execution, and farm monitoring |
| **Smart Device Cloud** | TypeScript/Node.js | `smart-device-cloud/` | Enterprise IoT platform for device management, workflow orchestration, and cloud services |

## Quick Start

### Prerequisites

- **Node.js**: 24.21.0
- **npm**: 12.0.2
- **Python**: 3.11+ (for Phone Farm)
- **Docker & Docker Compose**: For infrastructure services
- **Git**: For version control

### Root Workspace (npm/Turborepo)

```bash
# Install all dependencies
npm install

# Development: Start all TypeScript workspaces
npm run dev

# Build all workspaces
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint

# Formatting
npm run format
```

> **Note**: Root npm workspaces include `smart-device-cloud/*` packages but **exclude** `phonefarm/` (Python) and `mobile/` (separate npm project at `mobile/package.json`).

### Phone Farm (Python/FastAPI)

```bash
cd phonefarm
pip install -r requirements/requirements.txt
python -m main                    # Start FastAPI server on :8000
python -m cli --help              # CLI commands
```

### Mobile (React Native/Expo)

```bash
cd mobile
npm install
npm start                         # Metro bundler
npm run android                   # Run on Android
npm run ios                       # Run on iOS
```

### Smart Device Cloud (TypeScript/Node.js)

```bash
cd smart-device-cloud
npm install
npm run dev                       # Turbo dev for all packages/services/apps
npm run build                     # Build all
npm run type-check                # Type check all
npm run test                      # Run tests
npm run lint                      # Lint all
```

## Architecture Overview

### Smart Device Cloud (Primary Focus)

The Smart Device Cloud is a **microservices-based platform** built on:

- **Turborepo** for monorepo management
- **Fastify** for high-performance API gateway
- **tRPC** for type-safe internal APIs
- **MCP (Model Context Protocol)** for AI tool integration
- **WebSocket** for real-time telemetry
- **OpenTelemetry** for distributed tracing
- **PostgreSQL + TimescaleDB** for relational + time-series data
- **Redis** for caching, queues, and pub/sub
- **Elasticsearch** for audit log search
- **React 19** with **Vite** for frontend apps

### Services

| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| **API Gateway** | 3000 | HTTP/tRPC/MCP/WS | Single ingress, auth, rate limiting, routing |
| **Telemetry Service** | 5000/5001 | TCP/WS | Device heartbeats, metrics ingestion |
| **Workload Manager** | 3001 | HTTP | Job queue (Bull/Redis), workflow execution |
| **Analytics Service** | 3002 | HTTP | Aggregation, reporting, dashboards |
| **Billing Service** | 3003 | HTTP | Metering, pricing, invoicing |
| **Device Agent** | 3004 | gRPC/HTTP | On-device agent communication |

### Packages (Shared Libraries)

| Package | Purpose |
|---------|---------|
| `@smart-device-cloud/shared` | Core types, validation, auth, observability, utilities |
| `@smartcloud/sdk` | Partner SDK for external integrations |
| `@smartcloud/workflow-engine` | Graph-based orchestration, Saga pattern |
| `@smartcloud/mcp` | MCP 2026-07-28 stateless integration boundary |
| `@smartcloud/device-ai` | Intelligence layer for device analytics |
| `@smartcloud/integration-hub` | External system integrations |
| `@smartcloud/remote-phone` | Remote device access/control |
| `@smartcloud/android-emulator` | Emulator lifecycle management |
| `@smartcloud/multi-account-browser` | Browser automation |
| `@smartcloud/device-agent` | Device protocol types |
| `@smart-device-cloud/device-protocol` | Device protocol abstraction |
| `@smartcloud/ui-components` | Shared React component library |

### Apps (Frontend)

| App | Purpose |
|-----|---------|
| **admin-dashboard** | Internal admin dashboard for platform operators |
| **partner-portal** | Partner-facing portal for device onboarding |
| **web** | Public web application with AI-assisted workflows |

### Infrastructure

```
┌─────────────────────────────────────────────────────────────┐
│                      Kubernetes / Docker                     │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL  │  TimescaleDB  │  Redis  │  Elasticsearch     │
│  (Primary)   │  (Telemetry)  │ (Cache/Queue) │ (Audit Logs) │
├─────────────────────────────────────────────────────────────┤
│  Prometheus  │  Grafana  │  Jaeger  │  OTel Collector       │
│  (Metrics)   │  (Viz)    │  (Traces)│  (Collection)         │
├─────────────────────────────────────────────────────────────┤
│  Nginx (Ingress)  │  MinIO (Object Storage)                │
└─────────────────────────────────────────────────────────────┘
```

## Infrastructure Setup

### Development (Docker Compose)

```bash
# From smart-device-cloud directory
cd smart-device-cloud/infrastructure
docker-compose -f docker-compose.dev.yml up -d

# Services started:
# - PostgreSQL (5432) - Primary database
# - TimescaleDB (5433) - Telemetry time-series
# - Redis (6379) - Cache, queues, pub/sub
# - Elasticsearch (9200) - Audit log search
# - MinIO (9000/9001) - Object storage
# - Jaeger (16686) - Distributed tracing UI
# - Prometheus (9090) - Metrics collection
# - Grafana (3000) - Dashboards (admin/admin)
# - OTel Collector (4317/4318) - Trace collection
# - Nginx (80/443) - Reverse proxy
```

### Production (Helm/Kubernetes)

```bash
cd smart-device-cloud/infrastructure/helm
helm install smart-device-cloud ./smart-device-cloud \
  --namespace smart-device-cloud \
  --create-namespace \
  -f values-production.yaml
```

## Configuration

### Environment Variables

Copy the example and configure:

```bash
cd smart-device-cloud
cp .env.example .env
# Edit .env with your values
```

Key configuration categories:

- **Database**: `DATABASE_URL`, `POSTGRES_*`
- **Redis**: `REDIS_URL`, `REDIS_*`
- **TimescaleDB**: `TIMESERIES_*`
- **Elasticsearch**: `ELASTICSEARCH_*`
- **Authentication**: `JWT_SECRET`, `OAUTH_*`
- **API Gateway**: `API_GATEWAY_*`, `VITE_API_BASE_URL`
- **Telemetry**: `TELEMETRY_SERVICE_*`
- **Workload**: `WORKLOAD_MANAGER_*`, `JOB_QUEUE_CONCURRENCY`
- **Analytics**: `ANALYTICS_SERVICE_*`
- **Security**: `TLS_*`, `DEVICE_AGENT_CERT_ROTATION_DAYS`
- **Feature Flags**: `FEATURE_FLEET_INTELLIGENCE`, etc.

See [smart-device-cloud/.env.example](smart-device-cloud/.env.example) for all options.

## Development Workflow

### Code Quality

```bash
# Format code
npm run format

# Lint
npm run lint

# Type check
npm run typecheck

# Run tests
npm run test
```

### Git Hooks

Configured via **lefthook**:

- Pre-commit: format, lint, type-check
- Commit-msg: conventional commits validation
- Pre-push: run tests

### Branching Strategy

- `main` - Production ready
- `develop` - Integration branch
- `feature/*` - Feature branches
- `fix/*` - Bug fixes
- `release/*` - Release preparation

## Testing

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E tests (requires infrastructure)
npm run test:e2e

# Integration tests
npm run test:integration
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - System architecture and design decisions
- [Getting Started](docs/GETTING_STARTED.md) - Detailed setup guide
- [API Reference](docs/API.md) - Complete API documentation
- [Contributing](docs/CONTRIBUTING.md) - Contribution guidelines
- [Security](SECURITY.md) - Security policies and procedures
- [Deployment](docs/DEPLOYMENT.md) - Production deployment guide

## Known Issues & Caveats

| Issue | Impact | Workaround |
|-------|--------|------------|
| Root docker-compose.yml paths incorrect | Dev infrastructure | Use `smart-device-cloud/infrastructure/docker-compose.dev.yml` |
| Root workspace globs don't match | Package discovery | Work within `smart-device-cloud/` directly |
| Mixed package managers (npm + pnpm) | Dependency resolution | Use npm at root, pnpm in smart-device-cloud |
| Mobile SQLite dependency mismatch | Build failures | Check `mobile/package.json` |
| Phone Farm missing model imports | Runtime errors | Verify `phonefarm/models/` structure |

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

**Kurnia Kadir** - Platform Engineer

---

*Last updated: 2026-09-20*