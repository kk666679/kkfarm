export type AgentSurfaceType =
  | { type: 'device-list'; devices: DeviceSummary[] }
  | { type: 'device-detail'; deviceId: string }
  | { type: 'task-plan'; taskId: string }
  | { type: 'approval'; action: string; targets: string[] }
  | { type: 'execution'; runId: string };

export interface AIElementProps {
  [key: string]: any;
}

export interface AIElementMapping {
  surfaceType: string;
  elementName: string;
  props: AIElementProps;
}

import type { DeviceSummary } from './domain';
