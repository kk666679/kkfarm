#!/bin/bash
set -euo pipefail

DOMAIN="${NGINX_SERVER_NAME:?Set NGINX_SERVER_NAME}"
EMAIL="${NGINX_EMAIL:?Set NGINX_EMAIL}"

if [ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    docker-compose run --rm --entrypoint "" certbot certbot certonly --webroot \
        -w /var/www/certbot \
        -d "${DOMAIN}" \
        --email "${EMAIL}" \
        --agree-tos \
        --no-eff-email \
        --force-renewal
else
    docker-compose run --rm --entrypoint "" certbot certbot renew
fi
