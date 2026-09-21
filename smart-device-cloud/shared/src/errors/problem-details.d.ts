export declare class ProblemDetails extends Error {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly detail?: string;
  readonly instance?: string;
  readonly errors?: Record<string, string[]>;
  constructor(opts: {
    type: string;
    title: string;
    status: number;
    detail?: string;
    instance?: string;
    errors?: Record<string, string[]>;
  });
  toJSON(): Record<string, unknown>;
}
export declare const PROBLEM_TYPES: {
  readonly INVALID_INPUT: 'https://smartcloud.dev/problems/invalid-input';
  readonly UNAUTHORIZED: 'https://smartcloud.dev/problems/unauthorized';
  readonly FORBIDDEN: 'https://smartcloud.dev/problems/forbidden';
  readonly NOT_FOUND: 'https://smartcloud.dev/problems/not-found';
  readonly CONFLICT: 'https://smartcloud.dev/problems/conflict';
  readonly RATE_LIMITED: 'https://smartcloud.dev/problems/rate-limited';
  readonly INTERNAL_ERROR: 'https://smartcloud.dev/problems/internal-error';
  readonly BAD_GATEWAY: 'https://smartcloud.dev/problems/bad-gateway';
};
export declare function notFound(resource: string, id?: string): ProblemDetails;
export declare function unauthorized(detail?: string): ProblemDetails;
export declare function forbidden(detail?: string): ProblemDetails;
export declare function badRequest(
  detail?: string,
  errors?: Record<string, string[]>
): ProblemDetails;
//# sourceMappingURL=problem-details.d.ts.map
