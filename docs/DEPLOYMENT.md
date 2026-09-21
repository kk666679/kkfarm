# Deployment Guide

This guide covers deploying Smart Device Cloud to production environments.

## Deployment Options

| Method | Target | Complexity |
|--------|--------|------------|
| **Docker Compose** | Single server | Low |
| **Helm Charts** | Kubernetes | Medium |
| **Terraform** | Cloud infrastructure | High |

## Prerequisites

- Docker & Docker Compose (for all methods)
- Kubernetes cluster (for Helm)
- Cloud account (for Terraform)
- Domain name (for production)
- TLS certificate (for production)

## Environment Configuration

### Production Environment Variables

Create a `.env.production` file with production values:

```bash
# Copy and customize
cp .env.example .env.production

# Edit with production values
# - Change all secrets
# - Set production database URLs
# - Configure TLS paths
# - Set production regions
```

Critical changes from development:

| Variable | Development | Production |
|----------|-------------|------------|
| `JWT_SECRET` | `your-secret-key-change-me` | Strong random string |
| `TLS_ENABLED` | `true` | `true` |
| `TLS_CERT_PATH` | Self-signed | CA-signed certificate |
| `LOG_LEVEL` | `debug` or `info` | `info` or `warn` |
| `DB_HOST` | `localhost` | Production DB host |
| `REDIS_HOST` | `localhost` | Production Redis host |

## Method 1: Docker Compose (Single Server)

### Setup

```bash
cd smart-device-cloud/infrastructure

# Copy production compose file (if available) or customize
cp docker-compose.yml docker-compose.prod.yml

# Edit production settings
# - Change container names (prefix with prod-)
# - Remove health check intervals
# - Configure production volumes
# - Add TLS volumes
```

### Deploy

```bash
# Pull latest images
docker-compose -f docker-compose.yml pull

# Start services
docker-compose -f docker-compose.yml up -d

# Verify services
docker-compose -f docker-compose.yml ps

# Check logs
docker-compose -f docker-compose.yml logs -f
```

### Configuration

```bash
# Set environment variables on each service
docker-compose -f docker-compose.yml exec api-gateway env > .env.gateway
docker-compose -f docker-compose.yml exec telemetry-service env > .env.telemetry
# ... repeat for each service
```

### SSL/TLS with Nginx

```bash
# Place certificates
cp your-cert.crt infrastructure/nginx/server.crt
cp your-key.key infrastructure/nginx/server.key

# Update nginx config
# Edit infrastructure/nginx/nginx.prod.conf

# Restart nginx
docker-compose -f docker-compose.yml restart nginx
```

## Method 2: Kubernetes (Helm)

### Prerequisites

```bash
# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Configure kubectl
kubectl config use-context your-cluster-context
```

### Install Chart

```bash
cd smart-device-cloud/infrastructure/helm

# Create namespace
kubectl create namespace smart-device-cloud

# Install with production values
helm install smart-device-cloud ./smart-device-cloud \
  --namespace smart-device-cloud \
  --create-namespace \
  --set global.environment=production \
  --set global.domain=api.yourdomain.com \
  -f values-production.yaml
```

### Configuration

Key Helm values to customize in `values-production.yaml`:

```yaml
global:
  environment: production
  domain: api.yourdomain.com
  region: singapore

postgres:
  enabled: true
  primary:
    persistence:
      size: 100Gi
  replicaCount: 2

redis:
  cluster:
    enabled: true
    nodes: 3

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: api.yourdomain.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - hosts:
        - api.yourdomain.com
      secretName: smartcloud-tls

telemetry:
  replicaCount: 3
  resources:
    requests:
      memory: "512Mi"
      cpu: "500m"

workloadManager:
  replicaCount: 3
  resources:
    requests:
      memory: "1Gi"
      cpu: "1000m"
```

### Upgrade

```bash
helm upgrade smart-device-cloud ./smart-device-cloud \
  --namespace smart-device-cloud \
  -f values-production.yaml
```

### Rollback

```bash
helm rollback smart-device-cloud 1
```

## Method 3: Terraform

### Setup

```bash
cd smart-device-cloud/infrastructure/terraform

# Initialize providers
terraform init

# Review planned changes
terraform plan -var-file=production.tfvars

# Apply infrastructure
terraform apply -var-file=production.tfvars
```

### State Management

```bash
# Remote state (recommended)
terraform state push terraform.tfstate
terraform state pull > backup.tfstate
```

## Post-Deployment Checklist

### Verification

- [ ] All services healthy (`kubectl get pods` or `docker ps`)
- [ ] API Gateway responds (`curl /health`)
- [ ] Database connections working
- [ ] Redis connectivity confirmed
- [ ] TLS certificate valid
- [ ] Monitoring dashboards populated
- [ ] Alerts configured
- [ ] Log aggregation working
- [ ] Authentication working
- [ ] WebSocket connections working

### Security

- [ ] All secrets rotated from defaults
- [ ] TLS certificates valid and not expired
- [ ] Firewall rules configured
- [ ] No public database access
- [ ] RBAC properly configured
- [ ] Audit logging enabled
- [ ] Rate limiting active

### Performance

- [ ] Database connection pool sized correctly
- [ ] Redis memory limits set
- [ ] Auto-scaling configured
- [ ] Caching properly configured
- [ ] CDN configured for static assets

## Scaling

### Horizontal Scaling

```bash
# Kubernetes
kubectl scale deployment/api-gateway --replicas=5
kubectl scale deployment/telemetry-service --replicas=5
kubectl scale deployment/workload-manager --replicas=5

# Docker Compose (limited)
docker-compose up -d --scale api-gateway=3
```

### Database Scaling

```bash
# PostgreSQL read replica
kubectl scale deployment/postgres --replicas=3

# TimescaleDB chunks
psql -c "SELECT add_chunks('telemetry_metrics', INTERVAL '1 day');"
```

## Monitoring

### Key Metrics to Monitor

| Metric | Alert Threshold | Source |
|--------|----------------|--------|
| API response time | > 500ms | Prometheus |
| Error rate | > 1% | Prometheus |
| Queue depth | > 1000 | Bull dashboard |
| Database connections | > 80% of pool | DB metrics |
| Memory usage | > 85% | Node metrics |
| CPU usage | > 90% | Node metrics |
| Device heartbeat failures | > 5% | Telemetry service |

### Grafana Dashboards

Pre-built dashboards available at http://localhost:3000:

- Service overview
- API Gateway metrics
- Telemetry pipeline
- Workload queue
- Database performance
- Error tracking

### Alerting

Alerts configured in `infrastructure/prometheus/alerts.yml`:

```yaml
groups:
  - name: api-gateway
    rules:
      - alert: HighErrorRate
        expr: rate(api_gateway_errors_total[5m]) > 0.01
        for: 5m
```

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs <service-name>
kubectl logs deployment/<service-name>

# Check health
docker-compose ps
kubectl get pods

# Restart service
docker-compose restart <service-name>
kubectl rollout restart deployment/<service-name>
```

### Database Connection Issues

```bash
# Check database connectivity
docker exec -it smartcloud-postgres-dev psql -U smartcloud -d smart_device_cloud -c "SELECT 1;"

# Check connection pool
docker exec -it smartcloud-api-gateway node -e "console.log(global.db?.pool?.getConnection?.())"
```

### High Memory Usage

```bash
# Check container memory
docker stats

# Scale up
kubectl scale deployment/<service> --replicas=5
```

### Rolling Deployments

```bash
# Kubernetes (zero-downtime)
kubectl set image deployment/api-gateway api-gateway=new-image:tag

# Watch rollout status
kubectl rollout status deployment/api-gateway
```

## Backup & Recovery

### Database Backup

```bash
# PostgreSQL
docker exec smartcloud-postgres-dev pg_dump -U smartcloud smart_device_cloud > backup.sql

# TimescaleDB
docker exec smartcloud-timescaledb pg_dump -U smartcloud smart_device_telemetry > telemetry-backup.sql
```

### Restore

```bash
# PostgreSQL
docker exec -i smartcloud-postgres-dev psql -U smartcloud smart_device_cloud < backup.sql
```

### Configuration Backup

```bash
# Backup all configs
tar -czf config-backup.tar.gz \
  smart-device-cloud/.env \
  smart-device-cloud/infrastructure/docker-compose.yml \
  smart-device-cloud/infrastructure/nginx/ \
  smart-device-cloud/infrastructure/helm/ \
  smart-device-cloud/infrastructure/prometheus/
```

---

*Last updated: 2026-09-20*