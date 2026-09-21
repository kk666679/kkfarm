export type EmulatorState = 'stopped' | 'starting' | 'running' | 'stopping' | 'error';
export type EmulatorProfileCategory =
  'phone' | 'tablet' | 'foldable' | 'tv' | 'wearable' | 'custom';
export type EmulatorImageStatus = 'available' | 'downloading' | 'installing' | 'error';

export interface EmulatorProfile {
  id: string;
  name: string;
  androidVersion: string;
  apiLevel: number;
  ramMb: number;
  storageMb: number;
  cpuCores?: number;
  category?: EmulatorProfileCategory;
  tags?: string[];
  createdAt: string;
}

export interface EmulatorInstance {
  id: string;
  profileId: string;
  state: EmulatorState;
  adbSerial?: string;
  hostPort?: number;
  startedAt?: string;
  stoppedAt?: string;
  allocation?: ResourceAllocation;
}

export interface EmulatorImage {
  id: string;
  androidVersion: string;
  apiLevel: number;
  architecture: 'x86_64' | 'arm64';
  status: EmulatorImageStatus;
  checksum?: string;
  sizeMb: number;
}

export interface EmulatorSnapshot {
  id: string;
  instanceId: string;
  name: string;
  createdAt: string;
  sizeMb: number;
  state: EmulatorState;
}

export interface ApkMetadata {
  packageName: string;
  versionName: string;
  versionCode: number;
  minSdk?: number;
  targetSdk?: number;
  permissions: string[];
  sizeBytes: number;
  signature?: string;
}

export type AllowedAdbAction =
  | 'shell:getprop'
  | 'shell:input tap'
  | 'shell:input swipe'
  | 'shell:am start'
  | 'shell:am force-stop'
  | 'shell:pm install'
  | 'shell:pm uninstall'
  | 'shell:logcat'
  | 'shell:wm size'
  | 'shell:settings get';

export interface AdbCommand {
  serial: string;
  action: AllowedAdbAction;
  args?: string[];
}

export interface AdbResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
}

export interface ResourceAllocation {
  cpuCores: number;
  ramMb: number;
  storageMb: number;
}

export interface ResourceCapacity {
  cpuCores: number;
  ramMb: number;
  storageMb: number;
}

export interface PerformanceSample {
  timestamp: string;
  cpuPercent: number;
  memoryPercent: number;
  storagePercent: number;
  temperatureC?: number;
  frameRate?: number;
}

export interface EmulatorAlert {
  id: string;
  instanceId: string;
  severity: 'warning' | 'critical';
  type: 'cpu' | 'memory' | 'storage' | 'temperature';
  message: string;
  createdAt: string;
}

export interface TestSuite {
  id: string;
  name: string;
  cases: string[];
  timeoutMs?: number;
}

export interface TestCaseResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  durationMs: number;
  error?: string;
}

export interface TestReport {
  suiteId: string;
  instanceId: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
  results: TestCaseResult[];
  createdAt: string;
}

export interface EmulatorManager {
  createProfile(profile: Omit<EmulatorProfile, 'id' | 'createdAt'>): EmulatorProfile;
  getProfile(id: string): EmulatorProfile | undefined;
  listProfiles(): EmulatorProfile[];
  removeProfile(id: string): boolean;
  start(profileId: string): Promise<EmulatorInstance>;
  stop(instanceId: string): Promise<void>;
  executeAdb(command: AdbCommand): Promise<AdbResult>;
}
