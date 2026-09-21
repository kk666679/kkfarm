#!/bin/bash
set -euo pipefail

SCRIPT_NAME="$(basename "$0")"
LOG_TAG="backup"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/phone-farm}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
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
        -o|--output) BACKUP_DIR="$2"; shift 2 ;;
        -r|--retention) RETENTION_DAYS="$2"; shift 2 ;;
        -h|--help) echo "Usage: $SCRIPT_NAME [--dry-run] [-o <dir>] [-r <days>]"; exit 0 ;;
        *) error_exit "Unknown option: $1" ;;
    esac
done

mkdir -p "${BACKUP_DIR}"
timestamp="$(date +%Y%m%d-%H%M%S)"
backup_file="${BACKUP_DIR}/phone-farm-backup-${timestamp}.tar.gz"

log "INFO" "Starting backup to ${backup_file}"

if [[ "${DRY_RUN}" == "true" ]]; then
    log "INFO" "Dry-run: would backup database and grafana data"
else
    docker-compose exec -T api sqlite3 /app/apps/api/data/device-farm.db ".backup '/tmp/device-farm.db'" || error_exit "Database backup failed"
    docker cp "$(docker-compose ps -q api)":/tmp/device-farm.db "${BACKUP_DIR}/device-farm-${timestamp}.db" || error_exit "Failed to copy database backup"
    tar -czf "${backup_file}" \
        -C "$(dirname "${BACKUP_DIR}")" \
        "$(basename "${BACKUP_DIR}")/device-farm-${timestamp}.db" \
        -C "$(pwd)" \
        grafana/provisioning \
        nginx \
        .env.example \
        docker-compose.yml
    rm -f "${BACKUP_DIR}/device-farm-${timestamp}.db"
    find "${BACKUP_DIR}" -type f -name "phone-farm-backup-*.tar.gz" -mtime +${RETENTION_DAYS} -delete
    log "INFO" "Backup completed: ${backup_file}"
fi

log "INFO" "Backup process finished"
