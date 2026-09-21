declare module 'sql.js' {
  export interface SqlJsStatic {
    Database: new (data?: ArrayLike<number>) => Database;
  }
  export interface Database {
    run(sql: string, params?: any[]): Statement;
    exec(sql: string): void;
    prepare(sql: string): Statement;
    export(): Uint8Array;
    close(): void;
  }
  export interface Statement {
    run(params?: any[]): { changes: number; lastInsertRowid: number };
    get(params?: any[]): any[];
    getAsObject(params?: any[]): Record<string, any>;
    bind(params?: any[]): Statement;
    free(): void;
    step(): boolean;
  }
  export interface QueryExecResult {
    columns: string[];
    values: any[][];
  }
  export default function initSqlJs(config?: any): Promise<SqlJsStatic>;
}

declare module 'pg' {
  export interface QueryResult<T = any> {
    rows: T[];
    rowCount: number | null;
  }
  export class Pool {
    on(event: string, listener: (err: Error) => void): this;
    connect(): Promise<PoolClient>;
    query<T = any>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
    end(): Promise<void>;
  }
  export interface PoolClient {
    query<T = any>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
    release(): void;
  }
  export function connect(config: any): Promise<PoolClient>;
}
