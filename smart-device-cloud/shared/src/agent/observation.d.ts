export type { AgentObservation } from './task';
export interface ObservationBuilder {
  text(content: string, traceId?: string): Observation;
  toolResult(toolName: string, content: unknown, traceId?: string): Observation;
  toolError(toolName: string, error: string, traceId?: string): Observation;
}
export interface Observation {
  type: 'text' | 'tool_result' | 'tool_error';
  content: unknown;
  timestamp: string;
  traceId?: string;
}
export declare function createObservation(
  type: Observation['type'],
  content: unknown,
  traceId?: string
): Observation;
export declare function createTextObservation(text: string, traceId?: string): Observation;
export declare function createToolResultObservation(
  toolName: string,
  result: unknown,
  traceId?: string
): Observation;
export declare function createToolErrorObservation(
  toolName: string,
  error: string,
  traceId?: string
): Observation;
//# sourceMappingURL=observation.d.ts.map
