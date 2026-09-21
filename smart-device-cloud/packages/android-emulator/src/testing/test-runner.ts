import type { TestCaseResult, TestSuite } from '../types';

export interface TestRunOptions {
  timeoutMs?: number;
  runCase?: (caseId: string, timeoutMs?: number) => Promise<unknown>;
}

export class EmulatorTestRunner {
  async run(suite: TestSuite, options: TestRunOptions = {}): Promise<TestCaseResult[]> {
    const timeoutMs = options.timeoutMs ?? 30000;
    const started = Date.now();
    const results: TestCaseResult[] = [];
    for (const caseId of suite.cases) {
      const caseStarted = Date.now();
      try {
        if (Date.now() - started > timeoutMs) throw new Error('Test suite timeout exceeded');
        if (options.runCase) await options.runCase(caseId, timeoutMs);
        results.push({
          id: caseId,
          name: caseId,
          status: 'passed',
          durationMs: Date.now() - caseStarted,
        });
      } catch (error) {
        results.push({
          id: caseId,
          name: caseId,
          status: 'failed',
          durationMs: Date.now() - caseStarted,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
    return results;
  }
}
