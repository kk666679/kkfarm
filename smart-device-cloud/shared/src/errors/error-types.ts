export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, id?: string) {
    super(id ? `${resource} not found: ${id}` : `${resource} not found`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR');
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
  constructor(message: string) {
    super(message, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends DomainError {
  constructor(
    message = 'Rate limit exceeded',
    public readonly retryAfter?: number
  ) {
    super(message, 'RATE_LIMIT');
    this.name = 'RateLimitError';
  }
}

export class ExternalServiceError extends DomainError {
  constructor(
    service: string,
    public readonly statusCode?: number,
    public readonly response?: unknown
  ) {
    super(`External service error: ${service}`, 'EXTERNAL_SERVICE_ERROR');
    this.name = 'ExternalServiceError';
  }
}

export class ConfigurationError extends DomainError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR');
    this.name = 'ConfigurationError';
  }
}

export class CircuitBreakerError extends DomainError {
  constructor(public readonly breakerState: string) {
    super(`Circuit breaker is ${breakerState}`, 'CIRCUIT_BREAKER');
    this.name = 'CircuitBreakerError';
  }
}

export type ErrorCode =
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'AUTH_ERROR'
  | 'AUTHZ_ERROR'
  | 'CONFLICT'
  | 'RATE_LIMIT'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'CONFIG_ERROR'
  | 'CIRCUIT_BREAKER'
  | 'INTERNAL_ERROR';
