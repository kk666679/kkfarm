export declare class DomainError extends Error {
  readonly code?: string | undefined;
  readonly cause?: unknown | undefined;
  constructor(message: string, code?: string | undefined, cause?: unknown | undefined);
}
export declare class NotFoundError extends DomainError {
  constructor(resource: string, id?: string);
}
export declare class ValidationError extends DomainError {
  readonly details?: Record<string, unknown> | undefined;
  constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class AuthenticationError extends DomainError {
  constructor(message?: string);
}
export declare class AuthorizationError extends DomainError {
  constructor(message?: string);
}
export declare class ConflictError extends DomainError {
  constructor(message: string);
}
export declare class RateLimitError extends DomainError {
  readonly retryAfter?: number | undefined;
  constructor(message?: string, retryAfter?: number | undefined);
}
export declare class ExternalServiceError extends DomainError {
  readonly statusCode?: number | undefined;
  readonly response?: unknown | undefined;
  constructor(service: string, statusCode?: number | undefined, response?: unknown | undefined);
}
export declare class ConfigurationError extends DomainError {
  constructor(message: string);
}
export declare class CircuitBreakerError extends DomainError {
  readonly breakerState: string;
  constructor(breakerState: string);
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
//# sourceMappingURL=error-types.d.ts.map
