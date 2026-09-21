import type { TestSuite } from '../types';

export class TestSuiteManager {
  private readonly suites = new Map<string, TestSuite>();

  register(suite: TestSuite): void {
    if (!suite.id.trim() || suite.cases.length === 0)
      throw new Error('Test suite ID and cases are required');
    this.suites.set(suite.id, { ...suite, cases: [...suite.cases] });
  }

  get(id: string): TestSuite | undefined {
    const suite = this.suites.get(id);
    return suite ? { ...suite, cases: [...suite.cases] } : undefined;
  }

  list(): TestSuite[] {
    return Array.from(this.suites.values()).map(suite => ({ ...suite, cases: [...suite.cases] }));
  }

  remove(id: string): boolean {
    return this.suites.delete(id);
  }
}
