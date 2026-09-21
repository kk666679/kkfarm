# Grafana Configuration

Monitoring and analytics dashboards for the Phone Farm system, provisioned automatically via Grafana's provisioning API.

## Structure

- `provisioning/datasources/prometheus.yml` — Prometheus datasource configuration.
- `provisioning/dashboards/default.yml` — Dashboard provider pointing to this directory.
- `dashboards/operational/` — Real-time system health dashboards.
- `dashboards/business/` — Business analytics dashboards.

## Docker Compose Integration

Grafana runs on port 3001 and mounts `./grafana/provisioning` to `/etc/grafana/provisioning`.

```yaml
grafana:
  image: grafana/grafana:latest
  ports:
    - '3001:3000'
  volumes:
    - ./grafana/provisioning:/etc/grafana/provisioning
    - grafana-data:/var/lib/grafana
  environment:
    - GF_SECURITY_ADMIN_USER=${GF_ADMIN_USER:-admin}
    - GF_SECURITY_ADMIN_PASSWORD=${GF_ADMIN_PASSWORD:-admin}
    - GF_USERS_ALLOW_SIGN_UP=false
    - GF_SERVER_ROOT_URL=http://localhost:3001
    - GF_INSTALL_PLUGINS=
  depends_on:
    - prometheus
  restart: unless-stopped
```

## Dashboards

### Operational

- **API Response Times** — P95/P99 latency by endpoint.
- **Container Resources** — CPU and memory utilization per container.
- **Error Rates & Status Codes** — 4xx/5xx rates and distribution.
- **DB Pool Metrics** — Connection pool utilization and wait times.

### Business

- **Device Status & Utilization** — Online/offline ratios, per-provider breakdown.
- **Task Completion & Execution Times** — Success rates, p95 duration by task type.
- **Proxy Usage & Rotation** — Throughput, rotation patterns, failure rates.
- **App Install Success Rates** — Installation outcome by app and device.

## Authentication

Production deployments should:

1. Change default admin credentials via environment variables.
2. Disable sign-up (`GF_USERS_ALLOW_SIGN_UP=false`).
3. Configure an auth proxy or LDAP integration.
4. Restrict access using firewall rules or VPN.

## Refresh Intervals

- Real-time operational dashboards: `5s`
- Business analytics dashboards: `1m`
- Long-term trends: `5m`
