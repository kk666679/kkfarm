import { ProblemDetails } from './problem-details';
import { DomainError } from './error-types';

export interface FormattedError {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  timestamp: string;
  traceId?: string;
  errors?: Record<string, string[]>;
}

export function formatError(error: unknown, traceId?: string): FormattedError {
  if (error instanceof Error) {
    if ('toJSON' in error && typeof error.toJSON === 'function') {
      const json = (error as ProblemDetails).toJSON();
      return {
        type: json.type as string,
        title: json.title as string,
        status: json.status as number,
        detail: json.detail as string | undefined,
        instance: json.instance as string | undefined,
        timestamp: new Date().toISOString(),
        traceId,
        errors: json.errors as Record<string, string[]> | undefined,
      };
    }

    if (error instanceof DomainError) {
      return {
        type: 'https://smartcloud.dev/problems/' + (error.code || 'internal').toLowerCase(),
        title: error.name,
        status: 500,
        detail: error.message,
        timestamp: new Date().toISOString(),
        traceId,
      };
    }

    return {
      type: 'https://smartcloud.dev/problems/internal-error',
      title: error.name || 'Internal Error',
      status: 500,
      detail: error.message,
      timestamp: new Date().toISOString(),
      traceId,
    };
  }

  return {
    type: 'https://smartcloud.dev/problems/internal-error',
    title: 'Internal Error',
    status: 500,
    detail: typeof error === 'string' ? error : undefined,
    timestamp: new Date().toISOString(),
    traceId,
  };
}

export function toProblemDetails(error: Error): ProblemDetails | null {
  if ('status' in error && 'type' in error) {
    return error as ProblemDetails;
  }
  return null;
}
