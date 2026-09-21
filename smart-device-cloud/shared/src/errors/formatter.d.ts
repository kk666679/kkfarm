import { ProblemDetails } from './problem-details';
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
export declare function formatError(error: unknown, traceId?: string): FormattedError;
export declare function toProblemDetails(error: Error): ProblemDetails | null;
//# sourceMappingURL=formatter.d.ts.map
