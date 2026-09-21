import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { Platform } from 'react-native';
import type { IAPIService, APIError } from '@/types/services';
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
  User,
} from '@/types';
import { authService } from './AuthService';
import { storageService } from './StorageService';

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retryCount?: number;
    _abortSignal?: AbortSignal;
  }
}

const isProduction = __DEV__ === false;
const API_BASE_URL = Platform.select({
  ios: 'http://localhost:3000/api/v1',
  android: 'http://10.0.2.2:3000/api/v1',
  default: 'http://localhost:3000/api/v1',
});

type Envelope<T> = T | { data: T } | { device: T } | { devices: T } | { tasks: T };

function unwrap<T>(value: Envelope<T>): T {
  if (value && typeof value === 'object') {
    if ('data' in value) return value.data as T;
    if ('device' in value) return value.device as T;
    if ('devices' in value) return value.devices as T;
    if ('tasks' in value) return value.tasks as T;
  }
  return value as T;
}

class APIService implements IAPIService {
  private client: AxiosInstance;
  private maxConcurrentRequests: number = 5;
  private activeRequests: number = 0;
  private requestQueue: Array<{
    config: AxiosRequestConfig;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }> = [];
  private isProcessingQueue: boolean = false;

  constructor(baseURL: string = API_BASE_URL) {
    this.validateBaseUrl(baseURL);
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.setupInterceptors();
  }

  private validateBaseUrl(url: string): void {
    if (isProduction && url.startsWith('http://')) {
      throw new Error('HTTPS is required in production');
    }
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      async config => {
        if (this.activeRequests >= this.maxConcurrentRequests) {
          await this.enqueueRequest(config);
          return Promise.reject(new Error('Request queued'));
        }

        this.activeRequests++;
        const token = await authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      error => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      response => {
        this.activeRequests = Math.max(0, this.activeRequests - 1);
        this.processQueue();

        if (response.config.method === 'get') {
          this.cacheResponse(response.config.url!, response.data);
        }

        return response;
      },
      async error => {
        this.activeRequests = Math.max(0, this.activeRequests - 1);
        this.processQueue();

        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            await authService.refreshToken();
            const newToken = await authService.getToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            await authService.logout();
            return Promise.reject(refreshError);
          }
        }

        if (this.shouldRetry(error) && !originalRequest._retryCount) {
          return this.retryRequest(originalRequest);
        }

        return Promise.reject(error);
      }
    );
  }

  private shouldRetry(error: AxiosError): boolean {
    if (!error.response) return true;
    const status = error.response.status;
    return status === 408 || status === 429 || status >= 500;
  }

  private async retryRequest(config: AxiosRequestConfig, maxRetries: number = 3): Promise<any> {
    config._retryCount = config._retryCount || 0;

    if (config._retryCount >= maxRetries) {
      throw new Error('Max retry attempts reached');
    }

    config._retryCount++;
    const delay = Math.min(1000 * Math.pow(2, config._retryCount - 1), 30000);
    await new Promise(resolve => setTimeout(() => resolve(undefined), delay));

    return this.client(config);
  }

  private async enqueueRequest(config: AxiosRequestConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ config, resolve, reject });
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.activeRequests >= this.maxConcurrentRequests) {
      return;
    }

    this.isProcessingQueue = true;
    while (this.requestQueue.length > 0 && this.activeRequests < this.maxConcurrentRequests) {
      const item = this.requestQueue.shift()!;
      this.activeRequests++;
      this.client.request(item.config).then(item.resolve).catch(item.reject);
    }
    this.isProcessingQueue = false;
  }

  private async cacheResponse(url: string, data: any): Promise<void> {
    await storageService.set(`api_cache_${url}`, { data, timestamp: Date.now() });
  }

  private async getCachedResponse<T>(url: string): Promise<T | null> {
    const cached = await storageService.get<{ data: T; timestamp: number }>(`api_cache_${url}`);
    if (!cached) return null;
    const age = Date.now() - cached.timestamp;
    if (age > 300000) {
      await storageService.remove(`api_cache_${url}`);
      return null;
    }
    return cached.data;
  }

  async get<T>(url: string, useCache: boolean = true): Promise<T> {
    if (useCache) {
      const cached = await this.getCachedResponse<T>(url);
      if (cached) return cached;
    }
    const response = await this.client.get<T>(url);
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  getDevices(): Promise<Device[]> {
    return this.get<Envelope<Device[]>>('/devices').then(unwrap);
  }

  getDevice(id: string): Promise<Device> {
    return this.get<Envelope<Device>>(`/devices/${id}`).then(unwrap);
  }

  createDevice(data: Partial<Device>): Promise<Device> {
    return this.post<Envelope<Device>>('/devices', data).then(unwrap);
  }

  deleteDevice(id: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`/devices/${id}`);
  }

  startDevice(id: string): Promise<Device> {
    return this.post<Envelope<Device>>(`/devices/${id}/start`, {}).then(unwrap);
  }

  stopDevice(id: string): Promise<Device> {
    return this.post<Envelope<Device>>(`/devices/${id}/stop`, {}).then(unwrap);
  }

  restartDevice(id: string): Promise<Device> {
    return this.post<Envelope<Device>>(`/devices/${id}/restart`, {}).then(unwrap);
  }

  async executeShell(
    id: string,
    command: string
  ): Promise<{ device: Device; result: CommandResult }> {
    return this.post<{ device: Device; result: CommandResult }>(`/devices/${id}/shell`, {
      command,
    });
  }

  screenshot(id: string): Promise<Blob> {
    const token = authService.getToken().then(t => t || '');
    return token.then(authToken => {
      return fetch(`${this.client.defaults.baseURL}/devices/${id}/screenshot`, {
        headers: {
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      }).then(res => {
        if (!res.ok) throw new Error('Failed to load screenshot');
        return res.blob();
      });
    });
  }

  getLogs(id: string, filter?: string, maxLines = 200): Promise<{ lines: string[] }> {
    const query = filter
      ? `?filter=${encodeURIComponent(filter)}&maxLines=${maxLines}`
      : `?maxLines=${maxLines}`;
    return this.get<{ lines: string[] }>(`/devices/${id}/logs${query}`);
  }

  launchApp(id: string, packageName: string): Promise<Device> {
    return this.post<Device>(`/devices/${id}/apps/launch`, { packageName });
  }

  uninstallApp(id: string, packageName: string): Promise<Device> {
    return this.post<Device>(`/devices/${id}/apps/uninstall`, { packageName });
  }

  clearAppData(id: string, packageName: string): Promise<Device> {
    return this.post<Device>(`/devices/${id}/apps/clear`, { packageName });
  }

  installApk(id: string, apkPath: string): Promise<Device> {
    return this.post<Device>(`/devices/${id}/apps/install`, { apkPath });
  }

  getTasks(): Promise<Task[]> {
    return this.get<Envelope<Task[]>>('/tasks').then(unwrap);
  }

  getTask(id: string): Promise<Task> {
    return this.get<Envelope<Task>>(`/tasks/${id}`).then(unwrap);
  }

  createTask(data: Partial<TaskCreationData>): Promise<Task> {
    return this.post<Task>('/tasks', data);
  }

  cancelTask(id: string): Promise<{ success: boolean }> {
    return this.post<{ success: boolean }>(`/tasks/${id}/cancel`, {});
  }

  retryTask(id: string): Promise<Task> {
    return this.post<Task>(`/tasks/${id}/retry`, {});
  }

  getMetrics(): Promise<SystemMetrics> {
    return this.get<SystemMetrics>('/metrics');
  }

  getEvents(since?: string): Promise<{ events: any[] }> {
    const query = since ? `?since=${encodeURIComponent(since)}` : '';
    return this.get<{ events: any[] }>(`/events${query}`);
  }

  async sendAIChatMessage(message: string): Promise<string> {
    const response = await this.post<{ id: string; message: string }>('/ai/chat/sync', { message });
    return response.message;
  }

  async streamAIChatMessage(message: string, onChunk: (chunk: string) => void): Promise<void> {
    const token = await authService.getToken();
    const baseURL = this.client.defaults.baseURL || API_BASE_URL;
    const url = `${baseURL}/ai/chat`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message }),
    });

    if (!(response as any).body) {
      throw new Error('Response body is empty');
    }

    const reader = (response as any).body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('[EVENT:')) {
          continue;
        }
        if (line.trim()) {
          onChunk(line);
        }
      }
    }
  }

  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const response = await this.post<{ token: string; user: User }>('/auth/login', {
      username,
      password,
    });
    return response;
  }

  async logout(): Promise<{ success: boolean }> {
    return this.post<{ success: boolean }>('/auth/logout', {});
  }

  async me(): Promise<{ user: User }> {
    return this.get<{ user: User }>('/auth/me');
  }
}

export const apiService = new APIService();
export default apiService;
