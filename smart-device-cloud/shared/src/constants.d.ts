/**
 * Shared constants across all services
 */
export declare const CLOUD_REGIONS: readonly [
  'singapore',
  'tokyo',
  'london',
  'frankfurt',
  'virginia',
];
export declare const DEFAULT_REGION = 'singapore';
export declare const DEVICE_STATES: readonly [
  'Provisioning',
  'Ready',
  'Online',
  'Degraded',
  'Offline',
  'Maintenance',
  'Quarantined',
  'Retiring',
];
export declare const WORKLOAD_CATEGORIES: readonly [
  'QA Testing',
  'App Monitoring',
  'Automation',
  'Data Collection',
  'Regression Testing',
  'Maintenance',
  'Scheduled Jobs',
];
export declare const WORKLOAD_STATUSES: readonly ['Running', 'Completed', 'Failed', 'Paused'];
export declare const WORKFLOW_STEP_TYPES: readonly [
  'Trigger',
  'Provision/Select Devices',
  'Install Application',
  'Launch Application',
  'Execute Test Suite',
  'Collect Results',
  'Generate Report',
  'Release Devices',
];
export declare const ALERT_SEVERITIES: readonly ['Critical', 'Warning', 'Info'];
export declare const OPERATOR_ROLES: readonly [
  'Owner',
  'Administrator',
  'Operator',
  'Developer',
  'Viewer',
];
export declare const HEARTBEAT_INTERVAL_MS = 30000;
export declare const HEARTBEAT_TIMEOUT_DEGRADED_MS = 60000;
export declare const HEARTBEAT_TIMEOUT_OFFLINE_MS = 300000;
export declare const MAINTENANCE_TIMEOUT_MS = 14400000;
export declare const ALERT_TEMPERATURE_CRITICAL = 45;
export declare const ALERT_BATTERY_CRITICAL = 10;
export declare const ALERT_BATTERY_WARNING = 20;
export declare const ALERT_HEARTBEAT_WARNING_DELAY_MS = 120000;
export declare const TELEMETRY_BUFFER_SIZE = 1000;
export declare const TELEMETRY_RETENTION_RAW_DAYS = 30;
export declare const TELEMETRY_RETENTION_AGGREGATED_DAYS = 365;
export declare const AUDIT_LOG_RETENTION_DAYS = 90;
export declare const ANDROID_MIN_VERSION = 10;
export declare const ANDROID_MIN_API_LEVEL = 29;
export declare const SECURITY_PATCH_MAX_AGE_DAYS = 90;
export declare const DEVICE_AGENT_CERT_ROTATION_DAYS = 90;
//# sourceMappingURL=constants.d.ts.map
