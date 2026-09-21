# Getting Started

This guide provides a detailed walkthrough for setting up and running the Smart Device Cloud platform locally.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Configuration](#environment-configuration)
4. [Infrastructure Setup](#infrastructure-setup)
5. [Building & Running](#building--running)
6. [Verification](#verification)
7. [Common Tasks](#common-tasks)

## Prerequisites

### Required Software

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | >= 24.21.0 | Runtime |
| **npm** | >= 12.0.2 | Package manager |
| **Docker** | Latest | Container runtime |
| **Docker Compose** | >= 2.x | Container orchestration |
| **Git** | Latest | Version control |

### Verify Your Environment

```bash
node --version    # v24.21.0+
npm --version     # 12.0.2+
docker --version  # Docker 24+
docker compose version  # Docker Compose v2+
git --version
```

### Optional Tools

- **jq**: JSON processing (used in scripts)
- **curl**: HTTP requests and health checks
- **kubectl**: Kubernetes interaction (for production)
- **helm**: Kubernetes package management (for production)

## Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd turbo
```

### Step 2: Install Root Dependencies

```bash
npm install
```

### Step 3: Install Smart Device Cloud Dependencies

```bash
cd smart-device-cloud
npm install
```

This installs dependencies for all workspace packages, services, and apps.

## Environment Configuration

### Copy Environment Template

```bash
cd smart-device-cloud
cp .env.example .env
```

### Edit Configuration

Open `.env` and modify values for your local setup:

```bash
# Edit with your preferred editor
# On Windows: notepad .env
# On macOS/Linux: $EDITOR .env
```

### Key Environment Variables

#### Database

```bash
DATABASE_URL=postgresql://smartcloud:smartcloud_password@localhost:5432/smart_device_cloud
POSTGRES_USER=smartcloud
POSTGRES_PASSWORD=smartcloud_password
POSTGRES_DB=smart_device_cloud
```

#### Redis

```bash
REDIS_URL=redis://localhost:6379/0
```

#### TimescaleDB

```bash
TIMESERIES_HOST=localhost
TIMESERIES_PORT=5432
TIMESERIES_DB=smart_device_telemetry
```

#### Elasticsearch

```bash
ELASTICSEARCH_HOST=localhost
ELASTICSEARCH_PORT=9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme
```

#### Authentication (CHANGE IN PRODUCTION)

```bash
JWT_SECRET=your-secret-key-change-me-in-production
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=7d
```

#### API Gateway

```bash
API_GATEWAY_HOST=0.0.0.0
API_GATEWAY_PORT=3000
API_GATEWAY_CORS_ORIGIN=http://localhost:5173
```

## Infrastructure Setup

### Option A: Docker Compose (Development)

Start the full infrastructure stack:

```bash
cd smart-device-cloud/infrastructure
docker-compose -f docker-compose.dev.yml up -d
```

**Services started:**

| Service | Port | Credentials |
|---------|------|-------------|
| PostgreSQL | 5432 | smartcloud/smartcloud_password |
| TimescaleDB | 5433 | smartcloud/smartcloud_password |
| Redis | 6379 | (no auth) |
| Elasticsearch | 9200 | elastic/changeme |
| MinIO | 9000 | minioadmin/minioadmin |
| Jaeger | 16686 | (no auth) |
| Prometheus | 9090 | (no auth) |
| Grafana | 3000 | admin/admin |
| OTel Collector | 4317/4318 | (no auth) |
| Nginx | 80 | (no auth) |

### Option B: Individual Services

Start only specific services:

```bash
docker-compose -f docker-compose.dev.yml up -d postgres redis
```

### Verify Infrastructure

```bash
# Check all services are running
docker-compose -f docker-compose.dev.yml ps

# Test PostgreSQL
docker exec -it smartcloud-postgres-dev psql -U smartcloud -d smart_device_cloud -c "SELECT 1;"

# Test Redis
docker exec -it smartcloud-redis-dev redis-cli ping

# Test Elasticsearch
curl -u elastic:changeme http://localhost:9200/_cluster/health

# Test MinIO
curl http://localhost:9000/minio/health/live
```

## Building & Running

### Full Build

```bash
cd smart-device-cloud
npm run build
```

This builds all packages, services, and apps in dependency order.

### Development Mode (All Services)

```bash
npm run dev
```

This starts all packages and services in watch/dev mode using Turborepo.

### Individual Service Development

Start a specific service:

```bash
# API Gateway
cd services/api-gateway
npm install
npm run dev

# Telemetry Service
cd services/telemetry-service
npm install
npm run dev

# Workload Manager
cd services/workload-manager
npm install
npm start

# Analytics Service
cd services/analytics-service
npm install
npm start
```

### Individual App Development

Start a frontend app:

```bash
# Admin Dashboard
cd apps/admin-dashboard
npm install
npm run dev    # http://localhost:5173 (check terminal for actual port)

# Partner Portal
cd apps/partner-portal
npm install
npm run dev

# Web App
cd apps/web
npm install
npm run dev
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Verification

After starting all services, verify everything is working:

### Check API Gateway

```bash
# Health check
curl http://localhost:3000/health

# Readiness check
curl http://localhost:3000/ready

# Metrics endpoint
curl http://localhost:3000/metrics
```

### Check Infrastructure Services

```bash
# PostgreSQL
curl -s http://localhost:5432 > /dev/null && echo "PostgreSQL running"

# Redis
redis-cli -h localhost ping

# Elasticsearch
curl -u elastic:changeme http://localhost:9200/_cluster/health?pretty
```

### Check Frontend

Open browser and navigate to:
- Admin Dashboard: http://localhost:<admin-port>
- Partner Portal: http://localhost:<partner-port>
- Web App: http://localhost:<web-port>

### Check Observability

- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Jaeger**: http://localhost:16686

### Run Tests

```bash
# All tests
npm run test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests (requires infrastructure)
npm run test:e2e

# Security tests
npm run test:security
```

## Common Tasks

### Reset Local Environment

```bash
# Stop all services
cd smart-device-cloud/infrastructure
docker-compose -f docker-compose.dev.yml down -v

# Remove node_modules
cd ../..
rm -rf node_modules
rm -rf smart-device-cloud/node_modules
find smart-device-cloud -name node_modules -exec rm -rf {} + 2>/dev/null

# Reinstall
npm install
cd smart-device-cloud && npm install

# Rebuild
cd .. && npm run build
```

### Update Dependencies

```bash
npm install          # Update root deps
cd smart-device-cloud
npm install          # Update all workspace deps
npm run build        # Verify build
```

### Debugging

```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev

# Connect to running service via port
node --inspect=0.0.0.0:9229 services/api-gateway/dist/index.js
```

### Database Migrations

```bash
# Run from database package directory
cd packages/database
npx prisma migrate deploy
npx prisma generate
```

### Clearing Caches

```bash
# Redis flush
docker exec -it smartcloud-redis-dev redis-cli FLUSHALL

# Remove build artifacts
find smart-device-cloud -name dist -exec rm -rf {} + 2>/dev/null
find smart-device-cloud -name .next -exec rm -rf {} + 2>/dev/null
```

## Useful URLs (Local Development)

| Service | URL | Default Port |
|---------|-----|--------------|
| API Gateway | http://localhost:3000 | 3000 |
| Web App | http://localhost:5173 | 5173 |
| PostgreSQL | postgres://localhost:5432 | 5432 |
| Redis | redis://localhost:6379 | 6379 |
| Elasticsearch | http://localhost:9200 | 9200 |
| Grafana | http://localhost:3000 | 3000 |
| Prometheus | http://localhost:9090 | 9090 |
| Jaeger | http://localhost:16686 | 16686 |
| MinIO Console | http://localhost:9001 | 9001 |
| MinIO API | http://localhost:9000 | 9000 |

---

*Last updated: 2026-09-20*