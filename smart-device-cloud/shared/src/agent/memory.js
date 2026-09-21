export class InMemoryMemoryStore {
  stm = new Map();
  ltm = new Map();
  getStore(level) {
    return level === 'short-term' ? this.stm : this.ltm;
  }
  async store(entry) {
    const store = this.getStore(entry.level);
    store.set(entry.id, { ...entry, tags: entry.tags ?? [] });
  }
  async retrieve(query) {
    const store = this.getStore(query.level ?? 'short-term');
    const now = Date.now();
    const results = [];
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
  async summarize(entries, _maxTokens) {
    return entries.map(e => e.summary || JSON.stringify(e.content)).join('\n');
  }
  async forget(id) {
    return this.stm.delete(id) || this.ltm.delete(id);
  }
  async clear(level) {
    this.getStore(level).clear();
  }
}
//# sourceMappingURL=memory.js.map
