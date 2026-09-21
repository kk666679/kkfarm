export type MemoryLevel = 'short-term' | 'long-term';
export type MemorySalience = 'low' | 'medium' | 'high' | 'critical';
export interface MemoryEntry {
  id: string;
  level: MemoryLevel;
  salience: MemorySalience;
  content: Record<string, unknown>;
  summary?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  source: 'stm' | 'ltm';
  traceId?: string;
}
export interface HybridMemory {
  stm: Map<string, MemoryEntry>;
  ltm: Map<string, MemoryEntry>;
}
//# sourceMappingURL=memory.d.ts.map
