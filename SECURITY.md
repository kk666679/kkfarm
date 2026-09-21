# Security

This document outlines the security policies, practices, and procedures for the Smart Device Cloud platform.

## Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Data Protection](#data-protection)
4. [Device Security](#device-security)
5. [Network Security](#network-security)
6. [Vulnerability Reporting](#vulnerability-reporting)
7. [Security Testing](#security-testing)
8. [Compliance](#compliance)
9. [Incident Response](#incident-response)

## Security Overview

Smart Device Cloud handles sensitive device data, telemetry, and customer information. Security is prioritized at every layer of the stack.

### Security Principles

- **Defense in Depth**: Multiple layers of security controls
- **Least Privilege**: Minimum necessary access for all components
- **Zero Trust**: Verify explicitly, never trust implicitly
- **Automation**: Security checks built into CI/CD pipeline

## Authentication & Authorization

### OAuth 2.0 / OIDC

- All authentication uses OAuth 2.0 / OpenID Connect
- JWKS endpoint for key rotation
- Tokens issued with appropriate scopes

### Token Configuration

| Token Type | Expiry | Purpose |
|------------|--------|---------|
| Access Token | 8 hours | API authentication |
| Refresh Token | 7 days | Session persistence |

### RBAC (Role-Based Access Control)

Roles are enforced at the API Gateway:

| Role | Scope |
|------|-------|
| **Admin** | Full platform access |
| **Operator** | Device management, monitoring |
| **Tenant Admin** | Tenant-scoped administration |
| **Developer** | Read access, limited write |
| **Partner** | Partner portal access |

### JWT Validation

JWT tokens are validated at the API Gateway before reaching any service:

```typescript
// Token validation flow
1. Extract token from Authorization header
2. Verify signature via JWKS endpoint
3. Check token expiry
4. Validate audience (aud) and issuer (iss)
5. Extract and validate scopes
6. Attach tenant context to request
```

## Data Protection

### Encryption at Rest

| Data | Encryption Method |
|------|-------------------|
| PostgreSQL | AES-256 (TDE) |
| TimescaleDB | AES-256 (TDE) |
| Elasticsearch | AES-256 (node encryption) |
| Disk volumes | Cloud provider encryption |
| Backups | Encrypted before storage |

### Encryption in Transit

- All service communication uses TLS 1.3
- Internal service mesh with mTLS
- PostgreSQL connections use SSL
- Redis connections use TLS (production)
- Elasticsearch uses HTTPS

### Data Classification

| Classification | Examples | Handling |
|----------------|----------|----------|
| **Public** | Documentation, open source code | No restrictions |
| **Internal** | Architecture diagrams, non-sensitive configs | Internal use only |
| **Confidential** | Customer data, device telemetry | Encryption required |
| **Restricted** | Keys, credentials, PII | Maximum protection |

### Data Retention

| Data Type | Retention | Deletion Policy |
|-----------|-----------|-----------------|
| Audit logs | 90 days | Automated deletion |
| Raw telemetry | 30 days | Automated aggregation + deletion |
| Aggregated analytics | 365 days | Manual review required |
| Device data | Per tenant agreement | Tenant-initiated deletion |
| Logs | 30 days | Automated rotation |

## Device Security

### Device Registration

- Devices authenticate with unique certificates
- Certificate rotation every 90 days
- Device identity verified before data ingestion

### Device Health Monitoring

- Heartbeat monitoring (30s interval)
- Degraded state detection (60s timeout)
- Offline detection (300s timeout)
- Automated alerts for anomalies

### Security Policies

| Policy | Threshold | Action |
|--------|-----------|--------|
| Temperature critical | 45°C | Immediate alert |
| Battery critical | 10% | Immediate alert |
| Battery warning | 20% | Warning alert |
| Heartbeat warning | 120s delay | Warning alert |
| Security patch max age | 90 days | Compliance action |

### Compliance Actions

| Failure Type | Action |
|--------------|--------|
| Outdated OS version | Quarantine device |
| Expired certificate | Block communication |
| Security patch overdue | Restrict features |
| Anomalous behavior | Flag for review |

## Network Security

### Network Architecture

```
Internet → Nginx (TLS termination) → API Gateway → Services
                                          ↓
                                    RBAC + Rate Limit
                                          ↓
                                    Internal Services
                                          ↓
                                    Database Cluster
```

### Network Controls

- VPC/VNet isolation
- Security groups / firewall rules
- No public access to databases
- No public access to Redis
- Elasticsearch restricted to internal network
- Service mesh for inter-service communication

### API Protection

| Protection | Implementation |
|------------|----------------|
| Rate limiting | Per-tenant at gateway |
| CORS | Configured origins only |
| Input validation | Zod schemas |
| SQL injection | Parameterized queries (Prisma) |
| XSS | Content security policy |
| CSRF | Token-based protection |

### Secret Management

- No secrets in source code
- Environment variables for local development
- Cloud provider secrets manager for production
- JWT secrets rotated regularly
- Database credentials rotated regularly

## Vulnerability Reporting

### Reporting Process

If you discover a security vulnerability:

1. **Email** the security team (do NOT create a public issue)
2. Include details about:
   - Vulnerability type
   - Affected component
   - Steps to reproduce
   - Potential impact
3. We will acknowledge receipt within 48 hours
4. We will provide a timeline for resolution
5. Coordinated disclosure will be used

### Response Timeline

| Severity | Response Time | Resolution Target |
|----------|---------------|-------------------|
| Critical | 4 hours | 24 hours |
| High | 24 hours | 72 hours |
| Medium | 72 hours | 7 days |
| Low | 7 days | 14 days |

## Security Testing

### Automated Security Tests

Security tests are part of the CI pipeline:

```bash
# Run security tests
npm run test:security
```

### Security Test Coverage

| Test Type | Location | Frequency |
|-----------|----------|-----------|
| Auth tests | `tests/security/auth.test.ts` | Every commit |
| Input validation | All services | Every commit |
| Dependency scan | CI pipeline | Daily |
| Container scan | CI pipeline | Every build |

### Security Testing Guidelines

- Test authentication bypass attempts
- Test input validation edge cases
- Test authorization (horizontal and vertical)
- Test rate limiting enforcement
- Verify error messages don't leak sensitive info
- Test for SQL injection patterns
- Verify TLS configuration

## Compliance

### Supported Regions

Smart Device Cloud supports deployment in multiple regions:

| Region | Code | Status |
|--------|------|--------|
| Singapore | `singapore` | Active |
| Tokyo | `tokyo` | Active |
| London | `london` | Active |
| Frankfurt | `frankfurt` | Active |
| Virginia | `virginia` | Active |

### Data Sovereignty

- Tenant data is stored in the tenant's designated region
- Cross-region replication is opt-in
- Audit logs capture region of processing

### Audit Logging

All sensitive operations are logged:

- Authentication events (login, logout, token refresh)
- Authorization decisions (access granted/denied)
- Data access (read, write, delete operations)
- Configuration changes
- Admin operations

Logs are stored in Elasticsearch with 90-day retention.

### Compliance Checks

Automated compliance checks run periodically:

- Device OS version compliance
- Security patch currency
- Certificate expiration monitoring
- Data retention policy enforcement

## Incident Response

### Incident Classification

| Level | Description | Response |
|-------|-------------|----------|
| **P1 Critical** | System down, data breach | Immediate, all hands |
| **P2 High** | Major feature broken, security issue | Urgent, within hours |
| **P3 Medium** | Minor issue, workaround available | Within a day |
| **P4 Low** | Enhancement request | Next sprint |

### Incident Process

1. **Detection**: Monitoring alerts trigger
2. **Triage**: Classify severity, assign owner
3. **Containment**: Stop the bleeding
4. **Investigation**: Root cause analysis
5. **Remediation**: Fix the issue
6. **Recovery**: Restore service
7. **Postmortem**: Document and improve

### Monitoring Stack

| Tool | Purpose | URL |
|------|---------|-----|
| Prometheus | Metrics collection | :9090 |
| Grafana | Visualization | :3000 |
| Jaeger | Distributed tracing | :16686 |
| Elasticsearch | Log aggregation | :9200 |

### Runbooks

Common incident runbooks are maintained in `infrastructure/scripts/devops/`:

- Service restart procedures
- Database failover
- Certificate rotation
- Traffic rerouting
- Rollback procedures

## Security Best Practices for Contributors

- Never commit secrets or credentials
- Use `.env` for local configuration (git-ignored)
- Validate all inputs using Zod schemas
- Use parameterized queries (never string concatenation)
- Implement proper error handling (no stack traces to clients)
- Use principle of least privilege for service accounts
- Rotate dependencies regularly (`npm audit`)
- Review dependency vulnerabilities before PRs
- Enable 2FA on all accounts

## Useful Security Commands

```bash
# Audit dependencies
npm audit

# Check for vulnerable packages
npm audit fix

# Verify environment configuration
diff .env.example .env

# Run security tests
npm run test:security

# Check for secrets in code
git diff --cached | grep -E '(password|secret|token|key)' || echo "No secrets found"
```

## Security Contacts

| Role | Description |
|------|-------------|
| Security Team | Primary security contact for vulnerability reports |
| Platform Team | Infrastructure and deployment security |
| Dev Team | Application-level security concerns |

---

*Last updated: 2026-09-20*