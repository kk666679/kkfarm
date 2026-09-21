#!/bin/bash
set -euo pipefail

SCRIPT_NAME="$(basename "$0")"
LOG_TAG="device-health-check"
API_BASE="${API_BASE_URL:-http://localhost:3000}"
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

if [[ "${DRY_RUN}" == "true" ]]; then
    log "INFO" "Dry-run mode enabled"
fi

log "INFO" "Starting device health check"

response=$(curl -sf "${API_BASE}/api/devices/health" || error_exit "Failed to reach API")

if [[ "${DRY_RUN}" == "true" ]]; then
    log "INFO" "Would process health check response: ${response}"
else
    log "INFO" "Health check response: ${response}"
fi

log "INFO" "Device health check completed"
