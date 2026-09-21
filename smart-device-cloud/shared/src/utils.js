/**
 * Shared utility functions
 */
/**
 * Generate a unique identifier (simple UUID v4)
 */
export function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
/**
 * Validate device state transition
 */
export function isValidStateTransition(currentState, nextState) {
  const validTransitions = {
    Provisioning: ['Ready', 'Offline'],
    Ready: ['Online', 'Offline'],
    Online: ['Degraded', 'Offline', 'Maintenance', 'Quarantined'],
    Degraded: ['Online', 'Offline', 'Maintenance', 'Quarantined'],
    Offline: ['Online', 'Degraded', 'Maintenance', 'Retiring'],
    Maintenance: ['Online', 'Offline', 'Quarantined'],
    Quarantined: ['Maintenance', 'Offline', 'Retiring'],
    Retiring: ['Offline'],
  };
  return (validTransitions[currentState] || []).includes(nextState);
}
/**
 * Calculate device availability percentage
 */
export function calculateDeviceAvailability(onlineCount, degradedCount, totalCount) {
  if (totalCount === 0) return 0;
  return ((onlineCount + degradedCount) / totalCount) * 100;
}
/**
 * Calculate health percentage
 */
export function calculateHealthPercentage(healthyCount, totalCount, _threshold) {
  if (totalCount === 0) return 0;
  return (healthyCount / totalCount) * 100;
}
/**
 * Parse cron expression (basic validation)
 */
export function isValidCronExpression(expression) {
  const parts = expression.trim().split(/\s+/);
  return parts.length === 5;
}
/**
 * Format timestamp to ISO string
 */
export function formatTimestamp(timestamp) {
  return new Date(timestamp).toISOString();
}
/**
 * Calculate time difference in milliseconds
 */
export function getTimeDifference(timestamp1, timestamp2) {
  return Math.abs(timestamp2 - timestamp1);
}
/**
 * Check if telemetry is stale (older than 60 seconds)
 */
export function isTelemetryStale(lastHeartbeat, threshold = 60000) {
  return Date.now() - lastHeartbeat > threshold;
}
/**
 * Validate email address
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
/**
 * Validate UUID format
 */
export function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
/**
 * Round to specified decimal places
 */
export function roundTo(value, decimals) {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
/**
 * Calculate percentile from array of numbers
 */
export function calculatePercentile(values, percentile) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}
/**
 * Deep clone object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
/**
 * Sleep for specified milliseconds
 */
export async function sleep(ms) {
  return new Promise(resolve => {
    globalThis.setTimeout(resolve, ms);
  });
}
//# sourceMappingURL=utils.js.map
