import type { AutomationSchedule, BrowserAction } from '../types';

export class BrowserActionLibrary {
  private readonly actions = new Map<string, BrowserAction>();

  register(action: BrowserAction): void {
    this.actions.set(action.id, {
      ...action,
      ...(action.options ? { options: { ...action.options } } : {}),
    });
  }

  get(id: string): BrowserAction | undefined {
    const action = this.actions.get(id);
    return action
      ? { ...action, ...(action.options ? { options: { ...action.options } } : {}) }
      : undefined;
  }
}

export class AutomationScheduler {
  private readonly schedules = new Map<string, AutomationSchedule>();

  register(schedule: AutomationSchedule): void {
    this.schedules.set(schedule.id, {
      ...schedule,
      actions: schedule.actions.map(action => ({
        ...action,
        ...(action.options ? { options: { ...action.options } } : {}),
      })),
    });
  }

  due(now = new Date().toISOString()): AutomationSchedule[] {
    return Array.from(this.schedules.values())
      .filter(schedule => schedule.enabled && (!schedule.nextRunAt || schedule.nextRunAt <= now))
      .map(schedule => ({ ...schedule, actions: schedule.actions.map(action => ({ ...action })) }));
  }

  disable(id: string): boolean {
    const schedule = this.schedules.get(id);
    if (!schedule) return false;
    this.schedules.set(id, { ...schedule, enabled: false });
    return true;
  }
}
