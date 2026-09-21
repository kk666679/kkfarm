import type { AllowedAdbAction, AdbCommand } from '../types';

export interface AdbCommandSchema {
  serial: string;
  action: AllowedAdbAction;
  args?: string[];
}

export function parseAdbCommand(input: string): AdbCommand {
  const parts = input.trim().split(/\s+/);
  const serial = parts.shift();
  const action = parts.shift();
  if (!serial || !action || !serial.startsWith('emulator-')) throw new Error('Invalid ADB command');
  const allowed = new Set<AllowedAdbAction>([
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
  ]);
  if (!allowed.has(action as AllowedAdbAction))
    throw new Error(`ADB action is not allowlisted: ${action}`);
  return { serial, action: action as AllowedAdbAction, args: parts };
}

export function validateAdbCommand(command: AdbCommandSchema): AdbCommandSchema {
  if (!command.serial.trim() || !command.action.trim())
    throw new Error('ADB serial and action are required');
  return { ...command, ...(command.args ? { args: [...command.args] } : {}) };
}
