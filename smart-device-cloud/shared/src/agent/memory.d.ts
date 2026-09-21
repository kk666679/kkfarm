import type { AgentMemoryEntry } from './task';
export type { AgentMemoryEntry } from './task';
export type MemoryLevel = 'short-term' | 'long-term';
export type MemorySalience = 'low' | 'medium' | 'high' | 'critical';
export interface MemoryQuery {
  level?: MemoryLevel;
  salience?: MemorySalience;
  tags?: string[];
  traceId?: string;
  maxAgeMs?: number;
  limit?: number;
}
export interface MemoryStore {
  store(
    entry: AgentMemoryEntry & {
      tags?: string[];
    }
  ): Promise<void>;
  retrieve(query: MemoryQuery): Promise<AgentMemoryEntry[]>;
  summarize(entries: AgentMemoryEntry[], maxTokens?: number): Promise<string>;
  forget(id: string): Promise<boolean>;
  clear(level: MemoryLevel): Promise<void>;
}
export declare class InMemoryMemoryStore implements MemoryStore {
  private readonly stm;
  private readonly ltm;
  private getStore;
  store(
    entry: AgentMemoryEntry & {
      tags?: string[];
    }
  ): Promise<void>;
  retrieve(query: MemoryQuery): Promise<AgentMemoryEntry[]>;
  summarize(entries: AgentMemoryEntry[], _maxTokens?: number): Promise<string>;
  forget(id: string): Promise<boolean>;
  clear(level: MemoryLevel): Promise<void>;
}
//# sourceMappingURL=memory.d.ts.map
