import { create } from 'zustand';
import { apiService } from '@/services/APIService';
import { storageService } from '@/services/StorageService';
import { wsService } from '@/services/WebSocketService';
import { useGlobalLoading } from './useGlobalLoading';
import type { Task, TaskStatus, TaskType } from '@/types';

interface TaskState {
  tasks: Task[];
  filteredTasks: Task[];
  filters: {
    status: TaskStatus[];
    type: TaskType[];
    deviceId?: string;
  };
  lastUpdate: number | null;
  error: string | null;
  isLoading: boolean;
}

interface TaskActions {
  fetchTasks: () => Promise<void>;
  createTask: (taskData: Partial<Task>) => Promise<Task>;
  cancelTask: (taskId: string) => Promise<void>;
  retryTask: (taskId: string) => Promise<void>;
  updateTask: (task: Task) => void;
  setFilters: (filters: Partial<TaskState['filters']>) => void;
  applyFilters: () => void;
  clearFilters: () => void;
}

type TaskStore = TaskState & TaskActions;

export const useTaskStore = create<TaskStore>()((set, get) => ({
  tasks: [],
  filteredTasks: [],
  filters: {
    status: [],
    type: [],
  },
  lastUpdate: null,
  error: null,
  isLoading: false,

  fetchTasks: async () => {
    const { startLoading, stopLoading } = useGlobalLoading.getState();
    startLoading('tasks-fetch');
    try {
      const tasks = await apiService.getTasks();
      await storageService.cacheTasks(tasks);
      set({ tasks, filteredTasks: tasks, lastUpdate: Date.now(), error: null });
    } catch (error: any) {
      const cached = await storageService.getCachedTasks();
      if (cached) {
        set({ tasks: cached.data, filteredTasks: cached.data, error: 'Using cached data' });
      } else {
        set({ error: error.message || 'Failed to fetch tasks' });
      }
    } finally {
      stopLoading('tasks-fetch');
    }
  },

  createTask: async (taskData: Partial<Task>) => {
    const { startLoading, stopLoading } = useGlobalLoading.getState();
    startLoading('task-create');
    try {
      const task = await apiService.createTask(taskData);
      set(state => ({
        tasks: [task, ...state.tasks],
        filteredTasks: [task, ...state.filteredTasks],
      }));
      return task;
    } finally {
      stopLoading('task-create');
    }
  },

  cancelTask: async (taskId: string) => {
    await apiService.cancelTask(taskId);
    set(state => ({
      tasks: state.tasks.map(t =>
        t.id === taskId ? { ...t, status: 'cancelled' as TaskStatus } : t
      ),
      filteredTasks: state.filteredTasks.map(t =>
        t.id === taskId ? { ...t, status: 'cancelled' as TaskStatus } : t
      ),
    }));
  },

  retryTask: async (taskId: string) => {
    const task = await apiService.retryTask(taskId);
    set(state => ({
      tasks: state.tasks.map(t => (t.id === taskId ? task : t)),
      filteredTasks: state.filteredTasks.map(t => (t.id === taskId ? task : t)),
    }));
  },

  updateTask: (task: Task) => {
    set(state => ({
      tasks: state.tasks.map(t => (t.id === task.id ? task : t)),
      filteredTasks: state.filteredTasks.map(t => (t.id === task.id ? task : t)),
    }));
  },

  setFilters: (filters: Partial<TaskState['filters']>) => {
    set(state => ({
      filters: { ...state.filters, ...filters },
    }));
    get().applyFilters();
  },

  clearFilters: () => {
    set({
      filters: {
        status: [],
        type: [],
      },
    });
    get().applyFilters();
  },

  applyFilters: () => {
    const { tasks, filters } = get();
    let filtered = tasks;

    if (filters.status.length > 0) {
      filtered = filtered.filter(t => filters.status.includes(t.status));
    }
    if (filters.type.length > 0) {
      filtered = filtered.filter(t => filters.type.includes(t.type));
    }
    if (filters.deviceId) {
      filtered = filtered.filter(t => t.deviceId === filters.deviceId);
    }

    set({ filteredTasks: filtered });
  },
}));

wsService.subscribe('tasks', (message: any) => {
  if (message.type === 'update' && message.channel === 'tasks') {
    const payload = message.payload as {
      taskId: string;
      status?: string;
      progress?: number;
      error?: string;
    };
    if (payload.taskId && payload.status) {
      useTaskStore.getState().updateTask({
        id: payload.taskId,
        type: 'shell',
        status: payload.status as TaskStatus,
        priority: 0,
        payload: {},
        progress: payload.progress ?? 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(payload.error !== undefined ? { error: payload.error } : {}),
      } as Task);
    }
  }
});
