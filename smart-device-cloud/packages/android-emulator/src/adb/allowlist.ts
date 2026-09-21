import type { AllowedAdbAction, AdbCommand } from '../types';

export const DEFAULT_ADB_ALLOWLIST: readonly AllowedAdbAction[] = [
  'shell:getprop',
  'shell:input tap',
  'shell:input swipe',
  'shell:am start',
  'shell:am force-stop',
  'shell:pm install',
  'shell:pm uninstall',
  'shell:logcat',
  'shell:wm size',
  'shell:settings get',
];

export class AdbAllowlist {
  private readonly actions: Set<AllowedAdbAction>;

  constructor(actions: readonly AllowedAdbAction[] = DEFAULT_ADB_ALLOWLIST) {
    this.actions = new Set(actions);
  }

  allows(command: AdbCommand): boolean {
    return this.actions.has(command.action) && command.serial.trim().length > 0;
  }

  add(action: AllowedAdbAction): void {
    this.actions.add(action);
  }

  remove(action: AllowedAdbAction): void {
    this.actions.delete(action);
  }

  list(): AllowedAdbAction[] {
    return Array.from(this.actions);
  }
}
