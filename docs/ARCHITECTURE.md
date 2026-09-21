# Architecture

Smart Device Cloud is a microservices platform for IoT device management, workflow orchestration, and cloud services. This document describes the system architecture, design patterns, and key design decisions.

## System Architecture

### High-Level View

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Client Layer                                   │
│  ┌─────────────┐  ┌─────────────────┐  ┌───────────────────┐        │
│  │  Admin       │  │  Partner        │  │  Web App          │        │
│  │  Dashboard   │  │  Portal         │  │  (Public)         │        │
│  └──────┬───────┘  └───────┬─────────┘  └────────┬──────────┘        │
└─────────┼───────────────────┼──────────────────────┼──────────────────┘
          │                   │                      │
          ▼                   ▼                      ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      API Gateway (Fastify)                            │
│  Auth (OAuth/OIDC) │ RBAC │ Rate Limit │ tRPC │ MCP │ WS │ REST   │
└────────────────────────┬─────────────────────────────────────────────┘
                         │
        ┌────────────────┼─────────────────┬──────────────────┐
        ▼                ▼                 ▼                  ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Telemetry   │ │  Workload    │ │  Analytics   │ │  Billing     │
│  Service     │ │  Manager     │ │  Service     │ │  Service     │
│  (TCP/WS)    │ │  (Bull/Redis)│ │  (Postgres)  │ │  (Stripe)    │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │               │                 │
       ▼                ▼               ▼                 ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ PostgreSQL   │ │  Redis       │ │TimescaleDB   │ │Elasticsearch │
│ (Primary)    │ │ (Cache/Queue)│ │ (Telemetry)  │ │ (Audit Logs) │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                      Observability Stack                              │
│  Prometheus │ Grafana │ Jaeger │ OpenTelemetry Collector │ OTel SDK │
└──────────────────────────────────────────────────────────────────────┘
```

### Service Boundaries

Each service has a clear domain responsibility:

| Service | Domain | Data Ownership |
|---------|--------|---------------|
| **API Gateway** | Traffic management | None (stateless) |
| **Telemetry Service** | Device metrics ingestion | Telemetry buffer (in-memory) |
| **Workload Manager** | Job execution | Workload/workflow queue state (Redis) |
| **Analytics Service** | Aggregation & reporting | Analytics database (Postgres/TimescaleDB) |
| **Billing Service** | Metering & invoicing | Billing records (Postgres) |
| **Device Agent** | Device-side operations | Device state (Postgres) |
| **Core API** | Domain logic & CRUD | Primary PostgreSQL database |

### Package Dependency Graph

```
@smart-device-cloud/shared (root, no dependencies)
    │
    ├── @smartcloud/sdk
    │
    ├── @smartcloud/workflow-engine
    │   ├── @smart-device-cloud/shared
    │   ├── @smartcloud/integration-hub
    │   ├── @smartcloud/multi-account-browser
    │   ├── @smartcloud/android-emulator
    │   ├── @smartcloud/remote-phone
    │   ├── @smartcloud/device-ai
    │   ├── @smartcloud/device-agent
    │   ├── @smart-device-cloud/device-protocol
    │   ├── @smartcloud/telemetry-service
    │   └── @smartcloud/workload-manager
    │
    ├── @smartcloud/mcp
    │   ├── @smart-device-cloud/shared
    │   ├── @smartcloud/workflow-engine
    │   ├── @smartcloud/integration-hub
    │   ├── @smartcloud/device-ai
    │   ├── @smartcloud/remote-phone
    │   ├── @smartcloud/android-emulator
    │   ├── @smartcloud/multi-account-browser
    │   └── @smartcloud/device-agent
    │
    ├── @smartcloud/device-ai
    │   └── @smart-device-cloud/shared
    │
    ├── @smartcloud/device-agent
    │   └── @smart-device-cloud/shared
    │
    ├── @smartcloud/ui-components
    │   └── @smart-device-cloud/shared
    │
    └── @smartcloud/integration-hub
        └── @smart-device-cloud/shared

Apps depend on packages:
├── admin-dashboard → @smart-device-cloud/sdk, @smart-device-cloud/shared
├── web → @smart-device-cloud/shared
└── partner-portal → @smart-device-cloud/shared, @smartcloud/sdk
```

## Key Design Patterns

### 1. Model + Harness Pattern

Applied to workflow engine and MCP integration:

- **Model**: Domain state, definitions, rules (pure data + validation)
- **Harness**: Execution orchestration, checkpointing, fallback, retries

```typescript
// Example: Workflow definition (Model) vs Execution (Harness)
interface WorkflowDefinition { // Model
  id: string;
  graph: DAG<Node>;
  steps: StepDefinition[];
  compensations: CompensationMap;
}

class WorkflowEngine { // Harness
  execute(definition: WorkflowDefinition): Promise<ExecutionResult>;
  checkpoint(jobId: string): Promise<void>;
  compensate(jobId: string): Promise<void>;
}
```

### 2. Saga Pattern

Used for long-running workflows with compensation:

```
Step 1 ──Success──▶ Step 2 ──Success──▶ Step 3
  │                    │                    │
  └──Failure           └──Failure           └──Failure
       │                    │                    │
       ▼                    ▼                    ▼
  Compensate C         Compensate B         Compensate A
```

### 3. In-Memory Buffer with Drain

Telemetry service buffers device data before flushing:

```typescript
const telemetryBuffer = new Map<string, any[]>();
const MAX_BUFFER_SIZE = 1000;

// Buffer incoming data
buffer.set(deviceId, [...existing, newSample].slice(-MAX_BUFFER_SIZE));
```

### 4. Degraded Mode Pattern

Services gracefully degrade when infrastructure is unavailable:

```typescript
async function initRedisUrl(): Promise<string | undefined> {
  if (config.redis.url) return config.redis.url;
  const secretUrl = await workloadSecrets.getRedisUrl();
  if (secretUrl) return secretUrl;
  if (env.NODE_ENV === 'production') {
    throw new Error('REDIS_URL is required in production');
  }
  logger.warn('REDIS_URL not set; running in degraded mode');
  return undefined;
}
```

### 5. tRPC for Internal APIs

Type-safe RPC between services eliminates serialization boilerplate:

```typescript
// Shared types between client and server
export const deviceRouter = router({
  getDevice: publicProcedure.input(DeviceIdSchema).query(async ({ input }) => {
    return db.device.findUnique({ where: { id: input } });
  }),
});
```

### 6. MCP (Model Context Protocol) Integration

Stateless tool protocol for AI agent integration:

- No session IDs, no handshake, no sticky sessions
- OAuth 2.0/OIDC auth for all mutations
- Capability discovery via `server/discover`
- Horizontally scalable via round-robin load balancing

## Data Flow

### Device Telemetry Flow

```
Device ──TCP──▶ Telemetry Service ──Buffer──▶ Flush ──▶ TimescaleDB
                  │                              │
                  └──WebSocket──▶ Dashboard ◀────┘
```

### API Request Flow

```
Client ──▶ API Gateway ──▶ [Auth/Rate Limit] ──▶ tRPC/REST Router
                                                      │
                                              ┌───────┴───────┐
                                              ▼               ▼
                                          Core API       Service Calls
                                        (Postgres)      (Redis/DB)
```

### Workflow Execution Flow

```
MCP Tool Call ──▶ Workflow Engine ──▶ Graph Traversal
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
                Step A             Step B             Step C
                    │                   │                   │
                    ▼                   ▼                   ▼
                Checkpoint          Checkpoint          Checkpoint
                    │                   │                   │
                If failure ◀─────── Compensation chain (C → B → A)
```

## Environment Configuration

### Development

- Single Docker Compose stack (`docker-compose.dev.yml`)
- In-memory fallbacks for degraded mode
- Hot reload via Turbo dev
- Debug logging enabled

### Staging/Production

- Kubernetes (Helm charts)
- TLS termination via Nginx
- Multi-region deployment supported
- Production-grade OpenTelemetry configuration
- Prometheus + Grafana monitoring
- AlertManager for incident alerts

## Multi-Tenancy

Tenant isolation is enforced through:

- **Database**: Schema-level or row-level security (tenant_id on all tables)
- **API Gateway**: Per-tenant rate limiting
- **Auth**: Tenant-scoped OAuth tokens
- **Context**: `TenantContext` propagated through all service calls

## Constants & Configuration

Key configuration values (from `shared/src/constants.ts`):

| Constant | Value | Description |
|----------|-------|-------------|
| `HEARTBEAT_INTERVAL_MS` | 30000 | Device heartbeat interval |
| `HEARTBEAT_TIMEOUT_DEGRADED_MS` | 60000 | Degraded state threshold |
| `HEARTBEAT_TIMEOUT_OFFLINE_MS` | 300000 | Offline state threshold |
| `MAINTENANCE_TIMEOUT_MS` | 14400000 | Maintenance mode timeout |
| `TELEMETRY_BUFFER_SIZE` | 1000 | Max samples per device |
| `ALERT_TEMPERATURE_CRITICAL` | 45 | Temperature alert threshold (°C) |
| `ALERT_BATTERY_CRITICAL` | 10 | Battery critical threshold (%) |
| `ALERT_BATTERY_WARNING` | 20 | Battery warning threshold (%) |
| `ANDROID_MIN_VERSION` | 10 | Minimum Android version |
| `ANDROID_MIN_API_LEVEL` | 29 | Minimum Android API level |

## Resilience

- **Circuit Breaker**: Prevents cascading failures between services
- **Retry with Backoff**: Configurable per operation (`WORKLOAD_RETRY_ATTEMPTS=3`)
- **Timeouts**: All inter-service calls have configurable timeouts
- **Graceful Degradation**: Services continue with reduced functionality
- **Health Checks**: Liveness and readiness probes on all services
- **Queue Persistence**: Bull/Redis persistence for workload recovery

## Security Architecture

- OAuth 2.0/OIDC with JWKS rotation
- JWT tokens with configurable expiry (8h access, 7d refresh)
- RBAC via API Gateway authorization layer
- TLS everywhere (service mesh)
- Device certificate rotation (90-day cycle)
- Security patch compliance (90-day max age)
- Audit logging with Elasticsearch retention (90 days)

## Scalability

- **Horizontal**: All services stateless except data stores
- **Database**: PostgreSQL read replicas, TimescaleDB hypertables
- **Cache**: Redis Cluster for horizontal cache scaling
- **Queue**: BullMQ with Redis for distributed task processing
- **Search**: Elasticsearch sharding for audit log queries

## Future Roadmap

- [ ] Agent Skills nodes in workflow engine
- [ ] Governed MCP extensions (Apps, Tasks)
- [ ] Horizontal round-robin load balancing for MCP
- [ ] Multi-region active-active deployment
- [ ] Real-time dashboard analytics
- [ ] AI-powered anomaly detection in telemetry

---

*Last updated: 2026-09-20*