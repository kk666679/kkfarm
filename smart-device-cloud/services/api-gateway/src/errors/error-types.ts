export interface AppErrorOptions {
  code: string;
  title: string;
  status: number;
  message: string;
  metadata?: Record<string, unknown>;
}

export class AppError extends Error {
  readonly code: string;
  readonly title: string;
  readonly status: number;
  readonly metadata?: Record<string, unknown>;

  constructor(opts: AppErrorOptions) {
    super(opts.message);
    this.name = 'AppError';
    this.code = opts.code;
    this.title = opts.title;
    this.status = opts.status;
    if (opts.metadata !== undefined) this.metadata = opts.metadata;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super({ code: 'unauthorized', title: 'Unauthorized', status: 401, message });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super({ code: 'forbidden', title: 'Forbidden', status: 403, message });
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super({ code: 'not_found', title: 'Not Found', status: 404, message });
  }
}

export class UpstreamError extends AppError {
  constructor(service: string, message: string, status = 502) {
    super({ code: 'upstream_error', title: `Upstream error: ${service}`, status, message });
  }
}
