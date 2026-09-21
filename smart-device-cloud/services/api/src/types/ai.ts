export interface AIStreamChunk {
  delta: string;
  done: boolean;
  metadata?: Record<string, unknown>;
}

export interface AIChatRequest {
  message: string;
  context?: {
    devices?: unknown[];
    tasks?: unknown[];
    metrics?: unknown;
  };
}

export interface AIChatResponse {
  id: string;
  message: string;
  context?: Record<string, unknown>;
}
