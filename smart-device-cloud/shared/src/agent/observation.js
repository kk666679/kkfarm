export function createObservation(type, content, traceId) {
  return {
    type,
    content,
    timestamp: new Date().toISOString(),
    traceId,
  };
}
export function createTextObservation(text, traceId) {
  return createObservation('text', text, traceId);
}
export function createToolResultObservation(toolName, result, traceId) {
  return createObservation('tool_result', { toolName, result }, traceId);
}
export function createToolErrorObservation(toolName, error, traceId) {
  return createObservation('tool_error', { toolName, error }, traceId);
}
//# sourceMappingURL=observation.js.map
