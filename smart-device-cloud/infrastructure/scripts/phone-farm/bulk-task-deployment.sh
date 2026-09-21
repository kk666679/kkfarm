#!/bin/bash
set -euo pipefail

SCRIPT_NAME="$(basename "$0")"
LOG_TAG="bulk-task-deployment"
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
TASK_FILE=""
while [[ $# -gt 0 ]]; do
    case "$1" in
        -f|--file) TASK_FILE="$2"; shift 2 ;;
        -d|--dry-run) DRY_RUN=true; shift ;;
        -h|--help) echo "Usage: $SCRIPT_NAME -f <task-file> [--dry-run]"; exit 0 ;;
        *) error_exit "Unknown option: $1" ;;
    esac
done

if [[ -z "${TASK_FILE}" ]]; then
    error_exit "Task file is required. Use -f <path>"
fi

if [[ ! -f "${TASK_FILE}" ]]; then
    error_exit "Task file not found: ${TASK_FILE}"
fi

log "INFO" "Starting bulk task deployment from ${TASK_FILE}"

if ! jq empty "${TASK_FILE}" 2>/dev/null; then
    error_exit "Invalid JSON in task file: ${TASK_FILE}"
fi

if [[ "${DRY_RUN}" == "true" ]]; then
    log "INFO" "Dry-run: would deploy tasks from ${TASK_FILE}"
    jq '.tasks[] | {id, type, deviceId}' "${TASK_FILE}" | while IFS= read -r line; do
        log "INFO" "Task: ${line}"
    done
else
    response=$(curl -sf -X POST "${API_BASE}/api/tasks/bulk" \
        -H "Content-Type: application/json" \
        -d "@${TASK_FILE}" || error_exit "Failed to deploy tasks")
    log "INFO" "Deployment response: ${response}"
fi

log "INFO" "Bulk task deployment completed"
