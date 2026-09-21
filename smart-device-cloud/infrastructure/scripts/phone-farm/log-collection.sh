#!/bin/bash
set -euo pipefail

SCRIPT_NAME="$(basename "$0")"
LOG_TAG="log-collection"
API_BASE="${API_BASE_URL:-http://localhost:3000}"
OUTPUT_DIR="${OUTPUT_DIR:-/tmp/phone-farm-logs}"
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
DEVICE_IDS=()
mkdir -p "${OUTPUT_DIR}"

while [[ $# -gt 0 ]]; do
    case "$1" in
        -d|--dry-run) DRY_RUN=true; shift ;;
        -o|--output) OUTPUT_DIR="$2"; shift 2 ;;
        -i|--device-id)
            DEVICE_IDS+=("$2")
            shift 2
            ;;
        -h|--help) echo "Usage: $SCRIPT_NAME [-i <device-id>] [-o <dir>] [--dry-run]"; exit 0 ;;
        *) error_exit "Unknown option: $1" ;;
    esac
done

log "INFO" "Starting log collection to ${OUTPUT_DIR}"

timestamp="$(date +%Y%m%d-%H%M%S)"
archive="logs-${timestamp}.tar.gz"

if [[ "${DRY_RUN}" == "true" ]]; then
    log "INFO" "Dry-run: would collect logs to ${OUTPUT_DIR}/${archive}"
else
    if [[ ${#DEVICE_IDS[@]} -gt 0 ]]; then
        for device_id in "${DEVICE_IDS[@]}"; do
            response=$(curl -sf "${API_BASE}/api/devices/${device_id}/logs" || error_exit "Failed to fetch logs for ${device_id}")
            echo "${response}" > "${OUTPUT_DIR}/${device_id}.log"
            log "INFO" "Collected logs for ${device_id}"
        done
    else
        response=$(curl -sf "${API_BASE}/api/devices/logs" || error_exit "Failed to fetch all device logs")
        echo "${response}" > "${OUTPUT_DIR}/all-devices.log"
        log "INFO" "Collected logs for all devices"
    fi
    tar -czf "${OUTPUT_DIR}/${archive}" -C "${OUTPUT_DIR}" *.log
    log "INFO" "Archive created: ${OUTPUT_DIR}/${archive}"
fi

log "INFO" "Log collection completed"
