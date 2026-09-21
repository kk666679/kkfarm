#!/bin/bash
set -euo pipefail

SCRIPT_NAME="$(basename "$0")"
LOG_TAG="${SCRIPT_NAME%.sh}"
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

info() { log "INFO" "$1"; }
warn() { log "WARN" "$1"; }

usage() {
    cat <<EOF
Usage: ${SCRIPT_NAME} [options]

Options:
  -h, --help          Show this help message
  -d, --dry-run       Preview changes without executing
  -v, --verbose       Enable verbose output

Example:
  ${SCRIPT_NAME} --dry-run
EOF
    exit 0
}

DRY_RUN=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        -h|--help)
            usage
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        *)
            error_exit "Unknown option: $1"
            ;;
    esac
done

if [[ "${DRY_RUN}" == "true" ]]; then
    info "Dry-run mode enabled. No changes will be made."
fi

info "Script started"

# Add your logic here

info "Script completed successfully"
