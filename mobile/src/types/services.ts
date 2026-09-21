import type {
  Device,
  DeviceDetails,
  DeviceRegistrationData,
  Task,
  TaskCreationData,
  TaskResult,
  SystemMetrics,
  LogEntry,
  CommandResult,
  DateRange,
  UserPreferences,
  User,
} from './models';

export type {
  Device,
  DeviceDetails,
  DeviceRegistrationData,
  Task,
  TaskCreationData,
  TaskResult,
  SystemMetrics,
  LogEntry,
  CommandResult,
  DateRange,
  UserPreferences,
  User,
} from './models';

export interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'ping' | 'pong' | 'update' | 'notification';
  channel?: string;
  payload?: any;
  timestamp?: number;
}

export interface DeviceStatusUpdate extends WebSocketMessage {
  type: 'update';
  channel: 'devices';
  payload: {
    deviceId: string;
    status: string;
    batteryLevel?: number;
    lastSeen: string;
  };
}

export interface TaskStatusUpdate extends WebSocketMessage {
  type: 'update';
  channel: 'tasks';
  payload: {
    taskId: string;
    status: string;
    progress?: number;
    error?: string;
  };
}

export interface SystemNotification extends WebSocketMessage {
  type: 'notification';
  channel: 'system';
  payload: {
    level: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
  };
}

export interface IWebSocketService {
  connect(): Promise<void>;
  disconnect(): void;
  manualReconnect(): void;
  send(message: WebSocketMessage): void;
  subscribe(channel: string, handler: (message: WebSocketMessage) => void): () => void;
  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' | 'unhealthy' | 'error';
}

export interface IAPIService {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data?: any): Promise<T>;
  put<T>(url: string, data?: any): Promise<T>;
  delete<T>(url: string): Promise<T>;

  getDevices(): Promise<Device[]>;
  getDevice(id: string): Promise<Device>;
  createDevice(data: Partial<Device>): Promise<Device>;
  deleteDevice(id: string): Promise<{ success: boolean }>;
  startDevice(id: string): Promise<Device>;
  stopDevice(id: string): Promise<Device>;
  restartDevice(id: string): Promise<Device>;
  executeShell(id: string, command: string): Promise<{ device: Device; result: CommandResult }>;
  screenshot(id: string): Promise<Blob>;
  getLogs(id: string, filter?: string, maxLines?: number): Promise<{ lines: string[] }>;
  launchApp(id: string, packageName: string): Promise<Device>;
  uninstallApp(id: string, packageName: string): Promise<Device>;
  clearAppData(id: string, packageName: string): Promise<Device>;
  installApk(id: string, apkPath: string): Promise<Device>;

  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task>;
  createTask(data: Partial<TaskCreationData>): Promise<Task>;
  cancelTask(id: string): Promise<{ success: boolean }>;
  retryTask(id: string): Promise<Task>;

  getMetrics(): Promise<SystemMetrics>;
  getEvents(since?: string): Promise<{ events: any[] }>;

  sendAIChatMessage(message: string): Promise<string>;
  streamAIChatMessage(message: string, onChunk: (chunk: string) => void): Promise<void>;

  login(username: string, password: string): Promise<{ token: string; user: User }>;
  logout(): Promise<{ success: boolean }>;
  me(): Promise<{ user: User }>;
}

export interface APIError {
  status: number;
  message: string;
  code: string;
  details?: any;
}

export interface IStorageService {
  set(key: string, value: any): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  getCacheSize(): Promise<number>;

  cacheDevices(devices: Device[]): Promise<void>;
  getCachedDevices(): Promise<{ data: Device[]; timestamp: number } | null>;
  cacheTasks(tasks: Task[]): Promise<void>;
  getCachedTasks(): Promise<{ data: Task[]; timestamp: number } | null>;
  cacheMetrics(metrics: SystemMetrics): Promise<void>;
  getCachedMetrics(): Promise<{ data: SystemMetrics; timestamp: number } | null>;

  getOfflineQueue(): Promise<any[]>;
  addToOfflineQueue(request: any): Promise<void>;
  removeFromOfflineQueue(requestId: string): Promise<void>;
  clearOfflineQueue(): Promise<void>;

  savePreferences(preferences: UserPreferences): Promise<void>;
  getPreferences(): Promise<UserPreferences | null>;

  getLastSyncTimestamp(): Promise<number | null>;
  setLastSyncTimestamp(timestamp: number): Promise<void>;
}

export interface IAuthService {
  saveToken(token: string): Promise<void>;
  getToken(): Promise<string | null>;
  clearToken(): Promise<void>;
  login(username: string, password: string): Promise<User>;
  logout(): Promise<void>;
  refreshToken(): Promise<void>;
  getUser(): Promise<User | null>;
}

export interface INetworkMonitor {
  isConnected(): boolean;
  getConnectionType(): string;
  start(): void;
  stop(): void;
}

export interface ApiRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  timestamp: number;
}

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  isOnline: boolean;
  connectionType: string | null;
}

export interface SyncEngineConfig {
  database: any;
  apiEndpoint: string;
  syncInterval: number;
  maxRetries: number;
}

export interface SyncOperation {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'dead_letter';
  lastError: string | null;
  recordId: string;
}

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: SyncError[];
}

export interface SyncError {
  operationId: string;
  error: string;
  timestamp: number;
}

export interface ConflictResolutionStrategy {
  type: 'server-wins' | 'client-wins' | 'merge';
  mergeFn?: (server: any, client: any) => any;
}

export interface DeadLetterEntry {
  id: string;
  operation: SyncOperation;
  error: string;
  attempts: number;
  lastAttempt: number;
}
