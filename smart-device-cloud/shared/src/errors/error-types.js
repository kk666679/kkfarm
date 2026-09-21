export class DomainError extends Error {
  code;
  cause;
  constructor(message, code, cause) {
    super(message);
    this.code = code;
    this.cause = cause;
    this.name = this.constructor.name;
  }
}
export class NotFoundError extends DomainError {
  constructor(resource, id) {
    super(id ? `${resource} not found: ${id}` : `${resource} not found`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}
export class ValidationError extends DomainError {
  details;
  constructor(message, details) {
    super(message, 'VALIDATION_ERROR');
    this.details = details;
    this.name = 'ValidationError';
  }
}
export class AuthenticationError extends DomainError {
  constructor(message = 'Authentication failed') {
    super(message, 'AUTH_ERROR');
    this.name = 'AuthenticationError';
  }
}
export class AuthorizationError extends DomainError {
  constructor(message = 'Insufficient permissions') {
    super(message, 'AUTHZ_ERROR');
    this.name = 'AuthorizationError';
  }
}
export class ConflictError extends DomainError {
  constructor(message) {
    super(message, 'CONFLICT');
    this.name = 'ConflictError';
  }
}
export class RateLimitError extends DomainError {
  retryAfter;
  constructor(message = 'Rate limit exceeded', retryAfter) {
    super(message, 'RATE_LIMIT');
    this.retryAfter = retryAfter;
    this.name = 'RateLimitError';
  }
}
export class ExternalServiceError extends DomainError {
  statusCode;
  response;
  constructor(service, statusCode, response) {
    super(`External service error: ${service}`, 'EXTERNAL_SERVICE_ERROR');
    this.statusCode = statusCode;
    this.response = response;
    this.name = 'ExternalServiceError';
  }
}
export class ConfigurationError extends DomainError {
  constructor(message) {
    super(message, 'CONFIG_ERROR');
    this.name = 'ConfigurationError';
  }
}
export class CircuitBreakerError extends DomainError {
  breakerState;
  constructor(breakerState) {
    super(`Circuit breaker is ${breakerState}`, 'CIRCUIT_BREAKER');
    this.breakerState = breakerState;
    this.name = 'CircuitBreakerError';
  }
}
//# sourceMappingURL=error-types.js.map
