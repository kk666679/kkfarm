import type { BrowserAction, BrowserSession } from '../types';

export interface AutomationContext {
  sessionId: string;
  profileId: string;
  signal?: AbortSignal;
}

export interface AutomationResult {
  sessionId: string;
  completed: number;
  failed: number;
  error?: string;
}

export class BrowserAutomationRunner {
  constructor(
    private readonly execute: (
      action: BrowserAction,
      context: AutomationContext
    ) => Promise<unknown>
  ) {}

  async run(session: BrowserSession, actions: readonly BrowserAction[]): Promise<AutomationResult> {
    let completed = 0;
    let failed = 0;
    for (const action of actions) {
      try {
        await this.execute(action, { sessionId: session.id, profileId: session.profileId });
        completed += 1;
      } catch {
        failed += 1;
        break;
      }
    }
    return { sessionId: session.id, completed, failed };
  }
}

export const browserActionLibrary = {
  navigate: (url: string): BrowserAction => ({
    id: `action-${Date.now()}`,
    type: 'navigate',
    value: url,
  }),
  click: (target: string): BrowserAction => ({ id: `action-${Date.now()}`, type: 'click', target }),
  type: (target: string, value: string): BrowserAction => ({
    id: `action-${Date.now()}`,
    type: 'type',
    target,
    value,
  }),
  screenshot: (): BrowserAction => ({ id: `action-${Date.now()}`, type: 'screenshot' }),
};
