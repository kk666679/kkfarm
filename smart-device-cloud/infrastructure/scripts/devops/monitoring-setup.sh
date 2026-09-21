#!/bin/bash
set -euo pipefail

SCRIPT_NAME="$(basename "$0")"
LOG_TAG="monitoring-setup"
LOG_FILE="/var/log/phone-farm/${LOG_TAG}.log"

log() {
    local level="$1"
    local message="$2"
    local timestamp
    timestamp="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    echo "[${timestamp}] [${level}] [${LOG_TAG}] ${message}" | tee -a "${LOG_FILE}"
}

error_exit() {
    log "ERROR" "$1"
    exit 1
}

DRY_RUN=false
while [[ $# -gt 0 ]]; do
    case "$1" in
        -d|--dry-run) DRY_RUN=true; shift ;;
        -h|--help) echo "Usage: $SCRIPT_NAME [--dry-run]"; exit 0 ;;
        *) error_exit "Unknown option: $1" ;;
    esac
done

log "INFO" "Starting monitoring setup"

if [[ "${DRY_RUN}" == "true" ]]; then
    log "INFO" "Dry-run: would configure Prometheus scrape targets and Grafana datasources"
else
    if ! docker-compose ps | grep -q prometheus; then
        log "INFO" "Starting Prometheus via docker-compose"
        docker-compose up -d prometheus || error_exit "Failed to start Prometheus"
    fi
    if ! docker-compose ps | grep -q grafana; then
        log "INFO" "Starting Grafana via docker-compose"
        docker-compose up -d grafana || error_exit "Failed to start Grafana"
    fi
    if ! docker-compose ps | grep -q node-exporter; then
        log "INFO" "Starting Node Exporter via docker-compose"
        docker-compose up -d node-exporter || error_exit "Failed to start Node Exporter"
    fi
    log "INFO" "Verifying Prometheus targets"
    curl -sf "http://localhost:9090/api/v1/targets" | jq '.data.activeTargets[] | {job: .labels.job, health: .health}' || log "WARN" "Could not verify Prometheus targets"
    log "INFO" "Monitoring setup completed"
fi

log "INFO" "Monitoring setup script finished"
