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

export function createObservation(
  type: Observation['type'],
  content: unknown,
  traceId?: string
): Observation {
  return {
    type,
    content,
    timestamp: new Date().toISOString(),
    traceId,
  };
}

export function createTextObservation(text: string, traceId?: string): Observation {
  return createObservation('text', text, traceId);
}

export function createToolResultObservation(
  toolName: string,
  result: unknown,
  traceId?: string
): Observation {
  return createObservation('tool_result', { toolName, result }, traceId);
}

export function createToolErrorObservation(
  toolName: string,
  error: string,
  traceId?: string
): Observation {
  return createObservation('tool_error', { toolName, error }, traceId);
}
