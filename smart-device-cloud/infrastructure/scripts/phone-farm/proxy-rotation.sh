#!/bin/bash
set -euo pipefail

SCRIPT_NAME="$(basename "$0")"
LOG_TAG="proxy-rotation"
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
ROTATE_ALL=false
while [[ $# -gt 0 ]]; do
    case "$1" in
        -a|--all) ROTATE_ALL=true; shift ;;
        -d|--dry-run) DRY_RUN=true; shift ;;
        -h|--help) echo "Usage: $SCRIPT_NAME [--all] [--dry-run]"; exit 0 ;;
        *) error_exit "Unknown option: $1" ;;
    esac
done

log "INFO" "Starting proxy rotation"

if [[ "${DRY_RUN}" == "true" ]]; then
    log "INFO" "Dry-run: would rotate proxies"
    if [[ "${ROTATE_ALL}" == "true" ]]; then
        log "INFO" "Target: all proxies"
    else
        log "INFO" "Target: current proxy pool"
    fi
else
    if [[ "${ROTATE_ALL}" == "true" ]]; then
        response=$(curl -sf -X POST "${API_BASE}/api/proxies/rotate-all" || error_exit "Failed to rotate all proxies")
    else
        response=$(curl -sf -X POST "${API_BASE}/api/proxies/rotate" || error_exit "Failed to rotate proxy pool")
    fi
    log "INFO" "Rotation response: ${response}"
fi

log "INFO" "Proxy rotation completed"
