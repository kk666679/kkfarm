export interface LogRecord {
  timestamp: string;
  level: 'verbose' | 'debug' | 'info' | 'warning' | 'error';
  tag: string;
  message: string;
}

export class AdbLogStreamer {
  private readonly buffer: LogRecord[] = [];
  private readonly listeners = new Set<(record: LogRecord) => void>();

  push(record: Omit<LogRecord, 'timestamp'>): LogRecord {
    const entry: LogRecord = { ...record, timestamp: new Date().toISOString() };
    this.buffer.push(entry);
    if (this.buffer.length > 1000) this.buffer.splice(0, this.buffer.length - 1000);
    this.listeners.forEach(listener => listener(entry));
    return entry;
  }

  subscribe(listener: (record: LogRecord) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  read(since?: string): LogRecord[] {
    return this.buffer
      .filter(record => !since || record.timestamp >= since)
      .map(record => ({ ...record }));
  }
}
