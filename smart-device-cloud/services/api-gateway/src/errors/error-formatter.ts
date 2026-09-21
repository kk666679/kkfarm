import type { AppError } from './error-types.js';
import type { ProblemDetails } from './problem-details.js';

export function errorToProblemDetails(
  error: AppError,
  requestId: string,
  instance?: string
): ProblemDetails {
  return {
    type: `https://api.sdc.dev/errors/${error.code}`,
    title: error.title,
    status: error.status,
    detail: error.message,
    ...(instance && { instance }),
    requestId,
    ...(error.metadata ?? {}),
  };
}
