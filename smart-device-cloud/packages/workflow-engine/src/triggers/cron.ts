export interface CronTrigger {
  expression: string;
  timezone?: string;
}

export class CronTriggerParser {
  parse(expression: string): CronTrigger {
    const parts = expression.trim().split(/\s+/);
    if (parts.length < 5 || parts.length > 6)
      throw new Error('Cron expression must have 5 or 6 fields');
    const timezone = parts[5];
    return timezone
      ? { expression: expression.trim(), timezone }
      : { expression: expression.trim() };
  }
}
