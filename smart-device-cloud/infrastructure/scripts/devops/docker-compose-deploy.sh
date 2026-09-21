#!/bin/bash
set -euo pipefail

SCRIPT_NAME="$(basename "$0")"
LOG_TAG="docker-compose-deploy"
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
SERVICES=()
while [[ $# -gt 0 ]]; do
    case "$1" in
        -d|--dry-run) DRY_RUN=true; shift ;;
        -s|--services)
            IFS=',' read -ra SERVICES <<< "$2"
            shift 2
            ;;
        --build) BUILD=true; shift ;;
        -h|--help) echo "Usage: $SCRIPT_NAME [-s svc1,svc2] [--build] [--dry-run]"; exit 0 ;;
        *) error_exit "Unknown option: $1" ;;
    esac
done

log "INFO" "Starting Docker Compose deployment"

if [[ "${DRY_RUN}" == "true" ]]; then
    log "INFO" "Dry-run: would run docker-compose up -d${BUILD:+ --build}"
    if [[ ${#SERVICES[@]} -gt 0 ]]; then
        log "INFO" "Target services: ${SERVICES[*]}"
    fi
else
    if [[ ${#SERVICES[@]} -gt 0 ]]; then
        docker-compose up -d "${SERVICES[@]}" || error_exit "Deployment failed"
    else
        docker-compose up -d || error_exit "Deployment failed"
    fi
    if [[ "${BUILD:-false}" == "true" ]]; then
        docker-compose build || error_exit "Build failed"
    fi
    docker-compose ps
    log "INFO" "Docker Compose deployment completed"
fi

log "INFO" "Deploy script finished"
