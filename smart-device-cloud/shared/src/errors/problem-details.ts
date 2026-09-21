export class ProblemDetails extends Error {
  public readonly type: string;
  public readonly title: string;
  public readonly status: number;
  public readonly detail?: string;
  public readonly instance?: string;
  public readonly errors?: Record<string, string[]>;

  constructor(opts: {
    type: string;
    title: string;
    status: number;
    detail?: string;
    instance?: string;
    errors?: Record<string, string[]>;
  }) {
    super(opts.title);
    this.name = 'ProblemDetails';
    this.type = opts.type;
    this.title = opts.title;
    this.status = opts.status;
    this.detail = opts.detail;
    this.instance = opts.instance;
    this.errors = opts.errors;
  }

  toJSON(): Record<string, unknown> {
    return {
      type: this.type,
      title: this.title,
      status: this.status,
      detail: this.detail,
      instance: this.instance,
      errors: this.errors,
    };
  }
}

export const PROBLEM_TYPES = {
  INVALID_INPUT: 'https://smartcloud.dev/problems/invalid-input',
  UNAUTHORIZED: 'https://smartcloud.dev/problems/unauthorized',
  FORBIDDEN: 'https://smartcloud.dev/problems/forbidden',
  NOT_FOUND: 'https://smartcloud.dev/problems/not-found',
  CONFLICT: 'https://smartcloud.dev/problems/conflict',
  RATE_LIMITED: 'https://smartcloud.dev/problems/rate-limited',
  INTERNAL_ERROR: 'https://smartcloud.dev/problems/internal-error',
  BAD_GATEWAY: 'https://smartcloud.dev/problems/bad-gateway',
} as const;

export function notFound(resource: string, id?: string): ProblemDetails {
  return new ProblemDetails({
    type: PROBLEM_TYPES.NOT_FOUND,
    title: 'Resource not found',
    status: 404,
    detail: id ? `${resource} with id "${id}" not found` : `${resource} not found`,
  });
}

export function unauthorized(detail?: string): ProblemDetails {
  return new ProblemDetails({
    type: PROBLEM_TYPES.UNAUTHORIZED,
    title: 'Unauthorized',
    status: 401,
    detail,
  });
}

export function forbidden(detail?: string): ProblemDetails {
  return new ProblemDetails({
    type: PROBLEM_TYPES.FORBIDDEN,
    title: 'Forbidden',
    status: 403,
    detail,
  });
}

export function badRequest(detail?: string, errors?: Record<string, string[]>): ProblemDetails {
  return new ProblemDetails({
    type: PROBLEM_TYPES.INVALID_INPUT,
    title: 'Invalid request',
    status: 400,
    detail,
    errors,
  });
}
