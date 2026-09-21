import type { TaskConfiguration } from '@/types';

export class TaskConfigPrinter {
  static print(config: TaskConfiguration): string {
    const sorted = this.sortKeys(config);
    return JSON.stringify(sorted, null, 2);
  }

  static sortKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.sortKeys(item));
    }
    const sorted: any = {};
    Object.keys(obj)
      .sort()
      .forEach(key => {
        sorted[key] = this.sortKeys(obj[key]);
      });
    return sorted;
  }

  static escapeString(str: string): string {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }
}

export default TaskConfigPrinter;
