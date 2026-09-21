export const NODE_COLORS: Record<string, string> = {
  custom: '#94a3b8',
  device: '#10b981',
  integration: '#3b82f6',
  ai: '#8b5cf6',
  skill: '#f59e0b',
  gate: '#ef4444',
  human: '#ec4899',
  group: '#6b7280',
  note: '#eab308',
  'content-post': '#d946ef',
  'content-video': '#d946ef',
  'content-image': '#d946ef',
  'content-schedule': '#d946ef',
  'content-trend': '#d946ef',
  'content-publish': '#d946ef',
  account: '#d946ef',
};

export const SNAP_GRID: [number, number] = [20, 20];

export const NODE_WIDTHS = {
  default: 240,
  content: 280,
  wide: 320,
};

export const ANIMATION_TIMINGS = {
  edgeDashMs: 1000,
  edgePulseMs: 1500,
  fitViewMs: 300,
  transitionMs: 150,
};

export const STORAGE_KEY = 'workflow-builder:draft';
export const TEST_DRAFT_KEY = 'workflow-builder:test-draft';
