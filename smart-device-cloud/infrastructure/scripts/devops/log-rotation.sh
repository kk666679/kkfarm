#!/bin/bash
set -euo pipefail

SCRIPT_NAME="$(basename "$0")"
LOG_TAG="log-rotation"
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
RETENTION_DAYS="${RETENTION_DAYS:-7}"
while [[ $# -gt 0 ]]; do
    case "$1" in
        -d|--dry-run) DRY_RUN=true; shift ;;
        -r|--retention) RETENTION_DAYS="$2"; shift 2 ;;
        -h|--help) echo "Usage: $SCRIPT_NAME [--dry-run] [-r <days>]"; exit 0 ;;
        *) error_exit "Unknown option: $1" ;;
    esac
done

log "INFO" "Starting log rotation"

if [[ "${DRY_RUN}" == "true" ]]; then
    log "INFO" "Dry-run: would rotate logs older than ${RETENTION_DAYS} days"
else
    find /var/log/phone-farm -type f -name "*.log" -mtime +${RETENTION_DAYS} -exec gzip {} \;
    log "INFO" "Log rotation completed"
fi

log "INFO" "Log rotation script finished"
