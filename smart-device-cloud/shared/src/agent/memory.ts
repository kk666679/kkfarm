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
  store(entry: AgentMemoryEntry & { tags?: string[] }): Promise<void>;
  retrieve(query: MemoryQuery): Promise<AgentMemoryEntry[]>;
  summarize(entries: AgentMemoryEntry[], maxTokens?: number): Promise<string>;
  forget(id: string): Promise<boolean>;
  clear(level: MemoryLevel): Promise<void>;
}

export class InMemoryMemoryStore implements MemoryStore {
  private readonly stm = new Map<string, AgentMemoryEntry & { tags: string[] }>();
  private readonly ltm = new Map<string, AgentMemoryEntry & { tags: string[] }>();

  private getStore(level: MemoryLevel) {
    return level === 'short-term' ? this.stm : this.ltm;
  }

  async store(entry: AgentMemoryEntry & { tags?: string[] }): Promise<void> {
    const store = this.getStore(entry.level);
    store.set(entry.id, { ...entry, tags: entry.tags ?? [] });
  }

  async retrieve(query: MemoryQuery): Promise<AgentMemoryEntry[]> {
    const store = this.getStore(query.level ?? 'short-term');
    const now = Date.now();
    const results: AgentMemoryEntry[] = [];

    for (const entry of store.values()) {
      if (query.salience && entry.salience !== query.salience) continue;
      if (query.traceId && entry.traceId !== query.traceId) continue;
      if (
        query.maxAgeMs &&
        entry.createdAt &&
        now - new Date(entry.createdAt).getTime() > query.maxAgeMs
      )
        continue;

      results.push(entry);
    }

    return results.slice(0, query.limit ?? results.length);
  }

  async summarize(entries: AgentMemoryEntry[], _maxTokens?: number): Promise<string> {
    return entries.map(e => e.summary || JSON.stringify(e.content)).join('\n');
  }

  async forget(id: string): Promise<boolean> {
    return this.stm.delete(id) || this.ltm.delete(id);
  }

  async clear(level: MemoryLevel): Promise<void> {
    this.getStore(level).clear();
  }
}
