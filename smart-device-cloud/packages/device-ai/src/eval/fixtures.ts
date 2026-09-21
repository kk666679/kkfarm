export interface DeviceAiFixture {
  samples: Array<{
    deviceId: string;
    cpuPercent: number;
    memoryPercent: number;
    temperatureC: number;
    timestamp: string;
  }>;
  workloads: Array<{
    workloadId: string;
    status: 'running' | 'failed';
    progressPercent: number;
    resourceUsage: { cpuPercent: number; memoryPercent: number; storagePercent: number };
  }>;
}

export const deviceAiFixtures: Record<'healthy' | 'saturated', DeviceAiFixture> = {
  healthy: {
    samples: [
      {
        deviceId: 'device-1',
        cpuPercent: 30,
        memoryPercent: 40,
        temperatureC: 42,
        timestamp: '2026-01-01T00:00:00.000Z',
      },
    ],
    workloads: [
      {
        workloadId: 'wf-1',
        status: 'running',
        progressPercent: 50,
        resourceUsage: { cpuPercent: 30, memoryPercent: 40, storagePercent: 20 },
      },
    ],
  },
  saturated: {
    samples: [
      {
        deviceId: 'device-1',
        cpuPercent: 96,
        memoryPercent: 92,
        temperatureC: 78,
        timestamp: '2026-01-01T00:00:00.000Z',
      },
    ],
    workloads: [
      {
        workloadId: 'wf-1',
        status: 'running',
        progressPercent: 80,
        resourceUsage: { cpuPercent: 96, memoryPercent: 92, storagePercent: 70 },
      },
    ],
  },
};
