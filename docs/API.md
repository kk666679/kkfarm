# API Reference

Smart Device Cloud provides multiple API interfaces for different consumers.

## API Endpoints Overview

| Endpoint | Protocol | Purpose | Authentication |
|----------|----------|---------|----------------|
| `/health` | HTTP GET | Liveness probe | None |
| `/ready` | HTTP GET | Readiness probe | None |
| `/metrics` | HTTP GET | Prometheus metrics | None |
| `/api/v1/*` | REST | External API | OAuth 2.0/JWT |
| `/trpc/*` | tRPC | Internal API | JWT |
| `/mcp` | MCP | AI tool protocol | OAuth 2.0/OIDC |
| `/ws` | WebSocket | Real-time events | JWT |

## Health & Status APIs

### Health Check

```http
GET /health HTTP/1.1
Host: localhost:3000
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-09-20T10:00:00Z",
  "version": "1.0.0"
}
```

### Readiness Check

```http
GET /ready HTTP/1.1
Host: localhost:3000
```

**Response:**

```json
{
  "status": "ready",
  "checks": {
    "database": "connected",
    "redis": "connected"
  }
}
```

## REST API

### Device Management

#### List Devices

```http
GET /api/v1/devices HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 50 | Page size |
| `offset` | number | 0 | Page offset |
| `status` | string | - | Filter by status |
| `region` | string | - | Filter by region |
| `tenant_id` | string | - | Filter by tenant |

**Response:**

```json
{
  "data": [
    {
      "id": "device-001",
      "name": "Device Alpha",
      "status": "online",
      "region": "singapore",
      "tenant_id": "tenant-001",
      "device_type": "phone",
      "os_version": "Android 14",
      "last_heartbeat": "2026-09-20T09:59:30Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

#### Create Device

```http
POST /api/v1/devices HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "New Device",
  "device_type": "phone",
  "region": "singapore",
  "tenant_id": "tenant-001",
  "metadata": {
    "os_version": "Android 14",
    "model": "Pixel 8"
  }
}
```

#### Get Device

```http
GET /api/v1/devices/{deviceId} HTTP/1.1
Authorization: Bearer <token>
```

#### Update Device

```http
PATCH /api/v1/devices/{deviceId} HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json
```

#### Delete Device

```http
DELETE /api/v1/devices/{deviceId} HTTP/1.1
Authorization: Bearer <token>
```

### Workload Management

#### Submit Workload

```http
POST /api/v1/workloads HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Data Processing",
  "category": "data-processing",
  "device_id": "device-001",
  "parameters": {
    "input_source": "s3://bucket/data"
  },
  "priority": "normal"
}
```

**Response:**

```json
{
  "id": "workload-001",
  "status": "queued",
  "created_at": "2026-09-20T10:00:00Z",
  "device_id": "device-001"
}
```

#### Get Workload Status

```http
GET /api/v1/workloads/{workloadId} HTTP/1.1
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": "workload-001",
  "status": "running",
  "progress": 45,
  "started_at": "2026-09-20T10:00:05Z",
  "device_id": "device-001"
}
```

### Tenant Management

#### List Tenants

```http
GET /api/v1/tenants HTTP/1.1
Authorization: Bearer <token>
```

#### Create Tenant

```http
POST /api/v1/tenants HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json
```

### Analytics

#### Get Analytics Summary

```http
GET /api/v1/analytics/summary HTTP/1.1
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `start_date` | string | - | ISO date string |
| `end_date` | string | - | ISO date string |
| `tenant_id` | string | - | Filter by tenant |

#### Get Telemetry Metrics

```http
GET /api/v1/analytics/telemetry HTTP/1.1
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `device_id` | string | - | Specific device |
| `metric` | string | - | Metric name |
| `aggregate` | string | `avg` | `avg`, `min`, `max`, `sum` |
| `interval` | string | `1h` | `1m`, `5m`, `1h`, `1d` |

### Billing

#### Get Usage

```http
GET /api/v1/billing/usage HTTP/1.1
Authorization: Bearer <token>
```

#### Generate Invoice

```http
POST /api/v1/billing/invoice HTTP/1.1
Authorization: Bearer <token>
```

## tRPC API

tRPC provides type-safe internal APIs. TypeScript types are shared between client and server.

### Device Router

```typescript
// Types shared across the stack
import { deviceRouter } from '@smartcloud/api-gateway';

// Usage via tRPC client
const device = await trpc.device.getDevice.query({ id: 'device-001' });
const devices = await trpc.device.listDevices.query({
  limit: 10,
  offset: 0,
  status: 'online',
});
```

### Workflow Router

```typescript
const result = await trpc.workflow.executeWorkflow.mutate({
  workflowId: 'workflow-001',
  input: { deviceId: 'device-001' },
});
```

### Telemetry Router

```typescript
const metrics = await trpc.telemetry.getMetrics.query({
  deviceId: 'device-001',
  metric: 'temperature',
});
```

## MCP (Model Context Protocol)

MCP provides stateless AI tool integration.

### Discover Capabilities

```http
GET /mcp/server/discover HTTP/1.1
Authorization: Bearer <token>
```

**Response:**

```json
{
  "protocol_version": "2026-07-28",
  "tools": [
    {
      "name": "run_workflow",
      "description": "Execute a workflow by ID",
      "inputSchema": {
        "type": "object",
        "properties": {
          "workflowId": { "type": "string" },
          "input": { "type": "object" }
        },
        "required": ["workflowId"]
      }
    }
  ]
}
```

### Execute Tool

```http
POST /mcp/tool HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**

```json
{
  "tool": "run_workflow",
  "arguments": {
    "workflowId": "workflow-001",
    "input": { "deviceId": "device-001" }
  }
}
```

**Error Codes:**

| Code | Meaning |
|------|---------|
| `-32602` | Missing resource / invalid arguments |
| `-32601` | Method not found |
| `-32600` | Invalid request |
| `-32700` | Server error |

## WebSocket Events

Connect to `ws://localhost:5001` for real-time updates.

### Client to Server

```json
{
  "type": "subscribe",
  "channel": "device-events",
  "device_id": "device-001"
}
```

### Server to Client

```json
{
  "type": "device-event",
  "event": "heartbeat",
  "device_id": "device-001",
  "data": {
    "timestamp": "2026-09-20T10:00:00Z",
    "metrics": { "temperature": 35, "battery": 80 }
  }
}
```

### Event Types

| Event | Description |
|-------|-------------|
| `heartbeat` | Device heartbeat received |
| `status_change` | Device status changed |
| `alert` | Alert triggered |
| `workload_update` | Workload progress update |
| `telemetry` | Raw telemetry data |

## Error Format (RFC 7807)

All API errors follow RFC 7807 Problem Details:

```json
{
  "type": "https://api.smartdevicecloud.dev/errors/not-found",
  "title": "Device Not Found",
  "status": 404,
  "detail": "Device with ID 'device-001' was not found",
  "instance": "/api/v1/devices/device-001",
  "trace_id": "abc-123-def"
}
```

### Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `DEVICE_NOT_FOUND` | 404 | Device does not exist |
| `WORKLOAD_NOT_FOUND` | 404 | Workload does not exist |
| `TENANT_FORBIDDEN` | 403 | Access denied for tenant |
| `INVALID_INPUT` | 422 | Validation error |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## Rate Limiting

Rate limits are enforced per tenant at the API Gateway:

| Endpoint | Limit | Window |
|----------|-------|--------|
| General API | 1000 req/min | Per tenant |
| Telemetry ingest | 10000 req/min | Per device |
| WebSocket | N/A | Connection limit |

Rate limit headers in response:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1695204000
```

## Pagination

List endpoints use offset-based pagination:

```
GET /api/v1/devices?limit=50&offset=100
```

Response includes:

```json
{
  "data": [...],
  "total": 500,
  "limit": 50,
  "offset": 100
}
```

## WebSocket URL

```
ws://localhost:5001/ws
```

For production with TLS:

```
wss://api.smartdevicecloud.dev/ws
```

---

*Last updated: 2026-09-20*