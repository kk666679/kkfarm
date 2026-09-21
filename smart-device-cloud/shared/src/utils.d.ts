/**
 * Shared utility functions
 */
/**
 * Generate a unique identifier (simple UUID v4)
 */
export declare function generateId(): string;
/**
 * Validate device state transition
 */
export declare function isValidStateTransition(currentState: string, nextState: string): boolean;
/**
 * Calculate device availability percentage
 */
export declare function calculateDeviceAvailability(
  onlineCount: number,
  degradedCount: number,
  totalCount: number
): number;
/**
 * Calculate health percentage
 */
export declare function calculateHealthPercentage(
  healthyCount: number,
  totalCount: number,
  _threshold?: number
): number;
/**
 * Parse cron expression (basic validation)
 */
export declare function isValidCronExpression(expression: string): boolean;
/**
 * Format timestamp to ISO string
 */
export declare function formatTimestamp(timestamp: number): string;
/**
 * Calculate time difference in milliseconds
 */
export declare function getTimeDifference(timestamp1: number, timestamp2: number): number;
/**
 * Check if telemetry is stale (older than 60 seconds)
 */
export declare function isTelemetryStale(lastHeartbeat: number, threshold?: number): boolean;
/**
 * Validate email address
 */
export declare function isValidEmail(email: string): boolean;
/**
 * Validate UUID format
 */
export declare function isValidUUID(uuid: string): boolean;
/**
 * Round to specified decimal places
 */
export declare function roundTo(value: number, decimals: number): number;
/**
 * Calculate percentile from array of numbers
 */
export declare function calculatePercentile(values: number[], percentile: number): number;
/**
 * Deep clone object
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Sleep for specified milliseconds
 */
export declare function sleep(ms: number): Promise<void>;
//# sourceMappingURL=utils.d.ts.map
