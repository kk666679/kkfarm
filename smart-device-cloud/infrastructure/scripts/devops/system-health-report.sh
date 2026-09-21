#!/bin/bash
set -euo pipefail

SCRIPT_NAME="$(basename "$0")"
LOG_TAG="system-health-report"
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

log "INFO" "Starting system health report"

report=""

report+="=== System Health Report ===\n"
report+="Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")\n\n"

report+="--- Docker Compose Services ---\n"
if command -v docker-compose &> /dev/null; then
    services_status=$(docker-compose ps --format "table {{.Name}}\t{{.Status}}" 2>/dev/null || echo "docker-compose not available")
    report+="${services_status}\n\n"
else
    report+="docker-compose not found\n\n"
fi

if [[ "${DRY_RUN}" == "true" ]]; then
    log "INFO" "Dry-run: would query API health endpoint"
else
    report+="--- API Health ---\n"
    api_health=$(curl -sf "${API_BASE}/api/health" 2>/dev/null || echo "unreachable")
    report+="${api_health}\n\n"

    report+="--- Device Summary ---\n"
    devices=$(curl -sf "${API_BASE}/api/devices" 2>/dev/null || echo "[]")
    if command -v jq &> /dev/null; then
        total=$(echo "${devices}" | jq 'length')
        online=$(echo "${devices}" | jq '[.[] | select(.status=="online")] | length')
        report+="Total devices: ${total}\n"
        report+="Online devices: ${online}\n"
    else
        report+="${devices}\n"
    fi
    report+="\n"
fi

printf "${report}" | tee -a "${LOG_FILE}"
log "INFO" "System health report completed"
