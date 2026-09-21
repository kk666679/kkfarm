# Nginx Configuration

Reverse proxy configuration for the Device Farm system with SSL termination and load balancing.

## Structure

- `nginx.conf` — Main configuration (workers, events, includes).
- `default.conf` — Primary server block with HTTP→HTTPS redirect, upstreams, security headers, rate limiting.
- `ssl.conf` — Shared SSL/TLS settings (TLS 1.2/1.3, modern cipher suite, HSTS).
- `upstreams.conf` — Upstream backend definitions for Docker Compose service names.
- `.env.example` — Required environment variables for domain and email.
- `letsencrypt-setup.sh` — Initial certificate generation via certbot.
- `renew-hook.sh` — Post-renewal hook to reload nginx.

## Docker Compose Integration

The upstreams reference Docker Compose service names (`api`, `web`, `prometheus`, `grafana`). Ensure the nginx service
is on the same Docker network as these services.

Example service additions:

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./infrastructure/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./infrastructure/nginx/default.conf:/etc/nginx/conf.d/default.conf
      - ./infrastructure/nginx/ssl.conf:/etc/nginx/conf.d/ssl.conf
      - ./infrastructure/nginx/upstreams.conf:/etc/nginx/upstreams/upstreams.conf
      - ./infrastructure/nginx/.env:/etc/nginx/.env
      - certbot-www:/var/www/certbot
      - certbot-conf:/etc/letsencrypt
    env_file:
      - infrastructure/nginx/.env
    depends_on:
      - api
      - web
    restart: unless-stopped

  certbot:
    image: certbot/certbot
    volumes:
      - certbot-www:/var/www/certbot
      - certbot-conf:/etc/letsencrypt

volumes:
  certbot-www:
  certbot-conf:
```

## Setup

1. Copy `.env.example` to `.env` and set `NGINX_SERVER_NAME` and `NGINX_EMAIL`.
2. Run `bash letsencrypt-setup.sh` to obtain certificates.
3. Configure `renew-hook.sh` in `/etc/letsencrypt/renewal-hooks/deploy/`.
4. Start nginx: `nginx -c /etc/nginx/nginx.conf`.

## Security Notes

- Server tokens are disabled (`server_tokens off`).
- Directory listing is disabled by default.
- Rate limiting zones are defined for `/api/` (10r/s) and login endpoints (5r/s).
- All credentials are read from environment variables; no hardcoded secrets.
