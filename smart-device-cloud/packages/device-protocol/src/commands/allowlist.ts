export type AllowedDeviceAction =
  | 'start'
  | 'stop'
  | 'restart'
  | 'health_check'
  | 'tap'
  | 'swipe'
  | 'screenshot'
  | 'logcat'
  | 'install_apk'
  | 'uninstall_apk'
  | 'launch_app'
  | 'clear_app_data'
  | 'getprop'
  | 'input_text'
  | 'key_event'
  | 'screen_record'
  | 'pull_file'
  | 'push_file'
  | 'list_packages'
  | 'dump_heap'
  | 'get_serial'
  | 'get_state';

export interface AllowlistedCommand {
  action: AllowedDeviceAction;
  description: string;
  requiredPermissions: string[];
  isDestructive: boolean;
}

export const COMMAND_ALLOWLIST: Record<AllowedDeviceAction, AllowlistedCommand> = {
  start: {
    action: 'start',
    description: 'Start a device',
    requiredPermissions: [],
    isDestructive: false,
  },
  stop: {
    action: 'stop',
    description: 'Stop a device',
    requiredPermissions: [],
    isDestructive: true,
  },
  restart: {
    action: 'restart',
    description: 'Restart a device',
    requiredPermissions: [],
    isDestructive: true,
  },
  health_check: {
    action: 'health_check',
    description: 'Check device health status',
    requiredPermissions: [],
    isDestructive: false,
  },
  tap: {
    action: 'tap',
    description: 'Tap on the device screen at coordinates (x, y)',
    requiredPermissions: ['input'],
    isDestructive: false,
  },
  swipe: {
    action: 'swipe',
    description: 'Swipe on the device screen from (x1,y1) to (x2,y2)',
    requiredPermissions: ['input'],
    isDestructive: false,
  },
  screenshot: {
    action: 'screenshot',
    description: 'Capture a screenshot from the device',
    requiredPermissions: ['screen'],
    isDestructive: false,
  },
  logcat: {
    action: 'logcat',
    description: 'Stream device logs',
    requiredPermissions: ['screen'],
    isDestructive: false,
  },
  install_apk: {
    action: 'install_apk',
    description: 'Install an APK on the device',
    requiredPermissions: ['install'],
    isDestructive: true,
  },
  uninstall_apk: {
    action: 'uninstall_apk',
    description: 'Uninstall a package from the device',
    requiredPermissions: ['install'],
    isDestructive: true,
  },
  launch_app: {
    action: 'launch_app',
    description: 'Launch an application on the device',
    requiredPermissions: [],
    isDestructive: false,
  },
  clear_app_data: {
    action: 'clear_app_data',
    description: 'Clear application data on the device',
    requiredPermissions: ['install'],
    isDestructive: true,
  },
  getprop: {
    action: 'getprop',
    description: 'Read device properties',
    requiredPermissions: [],
    isDestructive: false,
  },
  input_text: {
    action: 'input_text',
    description: 'Send text input to the device',
    requiredPermissions: ['input'],
    isDestructive: false,
  },
  key_event: {
    action: 'key_event',
    description: 'Send a key event to the device',
    requiredPermissions: ['input'],
    isDestructive: false,
  },
  screen_record: {
    action: 'screen_record',
    description: 'Record the device screen',
    requiredPermissions: ['record'],
    isDestructive: false,
  },
  pull_file: {
    action: 'pull_file',
    description: 'Download a file from the device',
    requiredPermissions: ['files'],
    isDestructive: false,
  },
  push_file: {
    action: 'push_file',
    description: 'Upload a file to the device',
    requiredPermissions: ['files'],
    isDestructive: true,
  },
  list_packages: {
    action: 'list_packages',
    description: 'List installed packages on the device',
    requiredPermissions: [],
    isDestructive: false,
  },
  dump_heap: {
    action: 'dump_heap',
    description: 'Dump heap memory from the device',
    requiredPermissions: [],
    isDestructive: false,
  },
  get_serial: {
    action: 'get_serial',
    description: 'Get the device serial number',
    requiredPermissions: [],
    isDestructive: false,
  },
  get_state: {
    action: 'get_state',
    description: 'Get the device state',
    requiredPermissions: [],
    isDestructive: false,
  },
} as const;

export function isAllowedAction(action: string): action is AllowedDeviceAction {
  return action in COMMAND_ALLOWLIST;
}

export function getActionDescription(action: AllowedDeviceAction): string {
  return COMMAND_ALLOWLIST[action].description;
}

export function requiresPermission(action: AllowedDeviceAction, permission: string): boolean {
  return COMMAND_ALLOWLIST[action].requiredPermissions.includes(permission);
}

export function isDestructiveAction(action: AllowedDeviceAction): boolean {
  return COMMAND_ALLOWLIST[action].isDestructive;
}
