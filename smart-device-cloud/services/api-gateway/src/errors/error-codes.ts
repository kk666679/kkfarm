export const ERROR_CODES = {
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not_found',
  VALIDATION: 'validation',
  RATE_LIMIT: 'rate-limit',
  UPSTREAM: 'upstream_error',
  INTERNAL: 'internal',
  INVALID_TOKEN: 'invalid-token',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
