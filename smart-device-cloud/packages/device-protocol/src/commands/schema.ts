import { z } from 'zod';
import type { AllowedDeviceAction } from './allowlist';

export const TapCommandSchema = z.object({
  action: z.literal('tap'),
  deviceId: z.string(),
  params: z.object({
    x: z.number().int().min(0),
    y: z.number().int().min(0),
  }),
});

export const SwipeCommandSchema = z.object({
  action: z.literal('swipe'),
  deviceId: z.string(),
  params: z.object({
    x1: z.number().int().min(0),
    y1: z.number().int().min(0),
    x2: z.number().int().min(0),
    y2: z.number().int().min(0),
    durationMs: z.number().int().min(0).optional(),
  }),
});

export const ScreenshotCommandSchema = z.object({
  action: z.literal('screenshot'),
  deviceId: z.string(),
  params: z.object({}),
});

export const LogcatCommandSchema = z.object({
  action: z.literal('logcat'),
  deviceId: z.string(),
  params: z.object({
    filter: z.string().optional(),
    maxLines: z.number().int().positive().optional(),
    clear: z.boolean().optional(),
  }),
});

export const InstallApkCommandSchema = z.object({
  action: z.literal('install_apk'),
  deviceId: z.string(),
  params: z.object({
    apkPath: z.string().min(1),
    replace: z.boolean().optional(),
  }),
});

export const UninstallApkCommandSchema = z.object({
  action: z.literal('uninstall_apk'),
  deviceId: z.string(),
  params: z.object({
    packageName: z.string().min(1),
  }),
});

export const LaunchAppCommandSchema = z.object({
  action: z.literal('launch_app'),
  deviceId: z.string(),
  params: z.object({
    packageName: z.string().min(1),
    activity: z.string().optional(),
  }),
});

export const ClearAppDataCommandSchema = z.object({
  action: z.literal('clear_app_data'),
  deviceId: z.string(),
  params: z.object({
    packageName: z.string().min(1),
  }),
});

export const GetpropCommandSchema = z.object({
  action: z.literal('getprop'),
  deviceId: z.string(),
  params: z.object({
    key: z.string().optional(),
  }),
});

export const InputTextCommandSchema = z.object({
  action: z.literal('input_text'),
  deviceId: z.string(),
  params: z.object({
    text: z.string().min(1),
  }),
});

export const KeyEventCommandSchema = z.object({
  action: z.literal('key_event'),
  deviceId: z.string(),
  params: z.object({
    keyCode: z.number().int().positive(),
  }),
});

export const ScreenRecordCommandSchema = z.object({
  action: z.literal('screen_record'),
  deviceId: z.string(),
  params: z.object({
    durationMs: z.number().int().positive().optional(),
    outputFile: z.string().optional(),
  }),
});

export const PullFileCommandSchema = z.object({
  action: z.literal('pull_file'),
  deviceId: z.string(),
  params: z.object({
    remotePath: z.string().min(1),
    localPath: z.string().min(1),
  }),
});

export const PushFileCommandSchema = z.object({
  action: z.literal('push_file'),
  deviceId: z.string(),
  params: z.object({
    localPath: z.string().min(1),
    remotePath: z.string().min(1),
  }),
});

export const ListPackagesCommandSchema = z.object({
  action: z.literal('list_packages'),
  deviceId: z.string(),
  params: z.object({}),
});

export const StartCommandSchema = z.object({
  action: z.literal('start'),
  deviceId: z.string(),
  params: z.object({}),
});

export const StopCommandSchema = z.object({
  action: z.literal('stop'),
  deviceId: z.string(),
  params: z.object({}),
});

export const RestartCommandSchema = z.object({
  action: z.literal('restart'),
  deviceId: z.string(),
  params: z.object({}),
});

export const HealthCheckCommandSchema = z.object({
  action: z.literal('health_check'),
  deviceId: z.string(),
  params: z.object({}),
});

export const GetSerialCommandSchema = z.object({
  action: z.literal('get_serial'),
  deviceId: z.string(),
  params: z.object({}),
});

export const GetStateCommandSchema = z.object({
  action: z.literal('get_state'),
  deviceId: z.string(),
  params: z.object({}),
});

export const DumpHeapCommandSchema = z.object({
  action: z.literal('dump_heap'),
  deviceId: z.string(),
  params: z.object({
    packageName: z.string().optional(),
    outputFile: z.string().optional(),
  }),
});

export const CommandSchemaMap: Record<AllowedDeviceAction, z.ZodType> = {
  start: StartCommandSchema,
  stop: StopCommandSchema,
  restart: RestartCommandSchema,
  health_check: HealthCheckCommandSchema,
  tap: TapCommandSchema,
  swipe: SwipeCommandSchema,
  screenshot: ScreenshotCommandSchema,
  logcat: LogcatCommandSchema,
  install_apk: InstallApkCommandSchema,
  uninstall_apk: UninstallApkCommandSchema,
  launch_app: LaunchAppCommandSchema,
  clear_app_data: ClearAppDataCommandSchema,
  getprop: GetpropCommandSchema,
  input_text: InputTextCommandSchema,
  key_event: KeyEventCommandSchema,
  screen_record: ScreenRecordCommandSchema,
  pull_file: PullFileCommandSchema,
  push_file: PushFileCommandSchema,
  list_packages: ListPackagesCommandSchema,
  dump_heap: DumpHeapCommandSchema,
  get_serial: GetSerialCommandSchema,
  get_state: GetStateCommandSchema,
};

export type DeviceCommandInput = z.output<(typeof CommandSchemaMap)[keyof typeof CommandSchemaMap]>;
