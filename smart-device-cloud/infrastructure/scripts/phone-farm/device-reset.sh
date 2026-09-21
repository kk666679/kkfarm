#!/bin/bash
set -euo pipefail

SCRIPT_NAME="$(basename "$0")"
LOG_TAG="device-reset"
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
DEVICE_IDS=()
while [[ $# -gt 0 ]]; do
    case "$1" in
        -d|--dry-run) DRY_RUN=true; shift ;;
        -i|--device-id)
            DEVICE_IDS+=("$2")
            shift 2
            ;;
        -h|--help) echo "Usage: $SCRIPT_NAME -i <device-id> [-i <device-id>...] [--dry-run]"; exit 0 ;;
        *) error_exit "Unknown option: $1" ;;
    esac
done

if [[ ${#DEVICE_IDS[@]} -eq 0 ]]; then
    error_exit "No device IDs provided. Use -i <device-id>"
fi

log "INFO" "Starting device reset for ${#DEVICE_IDS[@]} device(s)"

for device_id in "${DEVICE_IDS[@]}"; do
    log "INFO" "Resetting device: ${device_id}"
    if [[ "${DRY_RUN}" == "true" ]]; then
        log "INFO" "Dry-run: would reset device ${device_id}"
    else
        response=$(curl -sf -X POST "${API_BASE}/api/devices/${device_id}/reset" || error_exit "Failed to reset device ${device_id}")
        log "INFO" "Reset response for ${device_id}: ${response}"
    fi
done

log "INFO" "Device reset completed"
