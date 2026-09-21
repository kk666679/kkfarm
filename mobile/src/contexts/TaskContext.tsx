import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Task, TaskStatus, TaskCreationData } from '@/types';
import { apiService, wsService } from '@/services';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  lastUpdate: Date | null;
  error: string | null;
}

type TaskAction =
  | { type: 'FETCH_REQUEST' }
  | { type: 'FETCH_SUCCESS'; payload: Task[] }
  | { type: 'FETCH_FAILURE'; payload: string }
  | { type: 'CREATE_SUCCESS'; payload: Task }
  | { type: 'UPDATE_STATUS'; payload: { taskId: string; status: TaskStatus; progress?: number } };

interface TaskContextValue {
  state: TaskState;
  fetchTasks: () => Promise<void>;
  createTask: (data: TaskCreationData) => Promise<Task>;
  assignTask: (taskId: string, deviceIds: string[]) => Promise<void>;
  cancelTask: (taskId: string) => Promise<void>;
}

const initialState: TaskState = {
  tasks: [],
  isLoading: false,
  lastUpdate: null,
  error: null,
};

const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, tasks: action.payload, isLoading: false, lastUpdate: new Date() };
    case 'FETCH_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'CREATE_SUCCESS':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_STATUS':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.taskId
            ? {
                ...t,
                status: action.payload.status,
                progress: action.payload.progress || t.progress,
              }
            : t
        ),
      };
    default:
      return state;
  }
};

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  useEffect(() => {
    fetchTasks();
    const unsubscribe = wsService.subscribe('tasks', message => {
      if (message.type === 'update' && message.payload) {
        dispatch({
          type: 'UPDATE_STATUS',
          payload: {
            taskId: message.payload.taskId,
            status: message.payload.status,
            progress: message.payload.progress,
          },
        });
      }
    });
    return unsubscribe;
  }, []);

  const fetchTasks = async () => {
    dispatch({ type: 'FETCH_REQUEST' });
    try {
      const tasks = await apiService.getTasks();
      dispatch({ type: 'FETCH_SUCCESS', payload: tasks });
    } catch (error: any) {
      dispatch({ type: 'FETCH_FAILURE', payload: error.message });
    }
  };

  const createTask = async (data: TaskCreationData): Promise<Task> => {
    const task = await apiService.createTask(data);
    dispatch({ type: 'CREATE_SUCCESS', payload: task });
    return task;
  };

  const assignTask = async (taskId: string, deviceIds: string[]) => {
    await apiService.assignTask(taskId, deviceIds);
    await fetchTasks();
  };

  const cancelTask = async (taskId: string) => {
    await apiService.cancelTask(taskId);
    await fetchTasks();
  };

  return (
    <TaskContext.Provider value={{ state, fetchTasks, createTask, assignTask, cancelTask }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = (): TaskContextValue => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within TaskProvider');
  return context;
};

export default TaskContext;
