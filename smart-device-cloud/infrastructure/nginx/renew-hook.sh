#!/bin/bash
set -euo pipefail

DOMAIN="${NGINX_SERVER_NAME:?Set NGINX_SERVER_NAME}"

nginx -s reload
