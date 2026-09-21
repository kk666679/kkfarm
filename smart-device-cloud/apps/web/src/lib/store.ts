import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Device, Task, ScheduledJob, DeviceStatus } from '@smart-device-cloud/shared';

export type DeviceFilter = 'all' | DeviceStatus;

export interface DeviceStore {
  filter: DeviceFilter;
  devices: Device[];
  setFilter: (filter: DeviceFilter) => void;
  setDevices: (devices: Device[]) => void;
  upsertDevice: (device: Device) => void;
  removeDevice: (id: string) => void;
}

export const useDeviceStore = create<DeviceStore>()(
  devtools(
    persist(
      set => ({
        filter: 'all',
        devices: [] as Device[],
        setFilter: filter => set({ filter }),
        setDevices: devices => set({ devices }),
        upsertDevice: device =>
          set(state => ({
            devices: state.devices.some(d => d.id === device.id)
              ? state.devices.map(d => (d.id === device.id ? device : d))
              : [...state.devices, device],
          })),
        removeDevice: id => set(state => ({ devices: state.devices.filter(d => d.id !== id) })),
      }),
      { name: 'device-store' }
    )
  )
);

export interface TaskStore {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  upsertTask: (task: Task) => void;
}

export const useTaskStore = create<TaskStore>()(
  devtools(
    persist(
      set => ({
        tasks: [] as Task[],
        setTasks: tasks => set({ tasks }),
        upsertTask: task =>
          set(state => ({
            tasks: state.tasks.some(t => t.id === task.id)
              ? state.tasks.map(t => (t.id === task.id ? task : t))
              : [...state.tasks, task],
          })),
      }),
      { name: 'task-store' }
    )
  )
);

export interface JobStore {
  jobs: ScheduledJob[];
  setJobs: (jobs: ScheduledJob[]) => void;
  upsertJob: (job: ScheduledJob) => void;
  removeJob: (id: string) => void;
}

export const useJobStore = create<JobStore>()(
  devtools(
    persist(
      set => ({
        jobs: [] as ScheduledJob[],
        setJobs: jobs => set({ jobs }),
        upsertJob: job =>
          set(state => ({
            jobs: state.jobs.some(j => j.id === job.id)
              ? state.jobs.map(j => (j.id === job.id ? job : j))
              : [...state.jobs, job],
          })),
        removeJob: id => set(state => ({ jobs: state.jobs.filter(j => j.id !== id) })),
      }),
      { name: 'job-store' }
    )
  )
);
