import { DomainError } from './error-types';
export function formatError(error, traceId) {
  if (error instanceof Error) {
    if ('toJSON' in error && typeof error.toJSON === 'function') {
      const json = error.toJSON();
      return {
        type: json.type,
        title: json.title,
        status: json.status,
        detail: json.detail,
        instance: json.instance,
        timestamp: new Date().toISOString(),
        traceId,
        errors: json.errors,
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
export function toProblemDetails(error) {
  if ('status' in error && 'type' in error) {
    return error;
  }
  return null;
}
//# sourceMappingURL=formatter.js.map
