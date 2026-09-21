export interface ScheduledJob {
  id: string;
  name: string;
  cronExpression: string;
  enabled: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  createdAt: string;
  updatedAt: string;
}
