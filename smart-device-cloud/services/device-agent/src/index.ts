/**
 * Device Agent Protocol Types
 *
 * Protocol-specific message types for device-to-cloud communication.
 * Domain types (Device, Workflow, Workload, Alert, etc.) are re-exported
 * from '@smart-device-cloud/shared' as the authoritative source.
 */
export * from './types';
export type {
  Device,
  Workflow,
  WorkflowStep,
  WorkflowTrigger,
  WorkflowExecution,
  Alert,
  AuditLogEntry,
  FleetMetrics,
  HealthMetrics,
  User,
} from '@smart-device-cloud/shared';
