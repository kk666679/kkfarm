# Infrastructure Scripts

Automation utilities for DevOps tasks. Phone farm scripts have been consolidated into `scripts/phone-farm/`.

## Structure

- `devops/` — General DevOps utilities (backup, monitoring, log rotation, etc.)
- `templates/` — Reusable script templates with standard error handling and logging.

## Requirements

- Bash 4+ (macOS/Linux) or Git Bash (Windows).
- `jq` for JSON processing.
- `curl` for HTTP requests.
- Docker and Docker Compose for container operations.
- `bc` for arithmetic in health reports.

## Usage

```bash
chmod +x scripts/**/*.sh
./scripts/phone-farm/device-health-check.sh
./infrastructure/scripts/devops/backup.sh
```

## Docker Compose Integration

Many scripts interact with Docker Compose. Example service names used:

- `api` — Main API service on port 3000.
- `web` — Frontend web service on port 5173.
- `prometheus` — Metrics collection on port 9090.
- `grafana` — Dashboard service on port 3001.

Common commands:

```bash
# Start all services
docker-compose up -d

# Restart a specific service
docker-compose restart api

# View logs
docker-compose logs -f api

# Scale a service
docker-compose up -d --scale api=3
```

## Dry-Run Mode

Scripts that support destructive operations accept a `DRY_RUN` environment variable:

```bash
DRY_RUN=true ./infrastructure/scripts/devops/backup.sh
```

When `DRY_RUN=true`, scripts log intended actions without executing them.
