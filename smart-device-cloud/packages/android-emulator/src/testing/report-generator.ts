import type { TestCaseResult, TestReport } from '../types';

export class TestReportGenerator {
  generate(suiteId: string, instanceId: string, results: readonly TestCaseResult[]): TestReport {
    const durationMs = results.reduce((total, result) => total + result.durationMs, 0);
    return {
      suiteId,
      instanceId,
      total: results.length,
      passed: results.filter(result => result.status === 'passed').length,
      failed: results.filter(result => result.status === 'failed').length,
      skipped: results.filter(result => result.status === 'skipped').length,
      durationMs,
      results: results.map(result => ({ ...result })),
      createdAt: new Date().toISOString(),
    };
  }
}
