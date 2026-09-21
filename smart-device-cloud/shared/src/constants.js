/**
 * Shared constants across all services
 */
export const CLOUD_REGIONS = ['singapore', 'tokyo', 'london', 'frankfurt', 'virginia'];
export const DEFAULT_REGION = 'singapore';
export const DEVICE_STATES = [
  'Provisioning',
  'Ready',
  'Online',
  'Degraded',
  'Offline',
  'Maintenance',
  'Quarantined',
  'Retiring',
];
export const WORKLOAD_CATEGORIES = [
  'QA Testing',
  'App Monitoring',
  'Automation',
  'Data Collection',
  'Regression Testing',
  'Maintenance',
  'Scheduled Jobs',
];
export const WORKLOAD_STATUSES = ['Running', 'Completed', 'Failed', 'Paused'];
export const WORKFLOW_STEP_TYPES = [
  'Trigger',
  'Provision/Select Devices',
  'Install Application',
  'Launch Application',
  'Execute Test Suite',
  'Collect Results',
  'Generate Report',
  'Release Devices',
];
export const ALERT_SEVERITIES = ['Critical', 'Warning', 'Info'];
export const OPERATOR_ROLES = ['Owner', 'Administrator', 'Operator', 'Developer', 'Viewer'];
export const HEARTBEAT_INTERVAL_MS = 30000;
export const HEARTBEAT_TIMEOUT_DEGRADED_MS = 60000;
export const HEARTBEAT_TIMEOUT_OFFLINE_MS = 300000;
export const MAINTENANCE_TIMEOUT_MS = 14400000; // 4 hours
export const ALERT_TEMPERATURE_CRITICAL = 45;
export const ALERT_BATTERY_CRITICAL = 10;
export const ALERT_BATTERY_WARNING = 20;
export const ALERT_HEARTBEAT_WARNING_DELAY_MS = 120000;
export const TELEMETRY_BUFFER_SIZE = 1000;
export const TELEMETRY_RETENTION_RAW_DAYS = 30;
export const TELEMETRY_RETENTION_AGGREGATED_DAYS = 365;
export const AUDIT_LOG_RETENTION_DAYS = 90;
export const ANDROID_MIN_VERSION = 10;
export const ANDROID_MIN_API_LEVEL = 29;
export const SECURITY_PATCH_MAX_AGE_DAYS = 90;
export const DEVICE_AGENT_CERT_ROTATION_DAYS = 90;
//# sourceMappingURL=constants.js.map
