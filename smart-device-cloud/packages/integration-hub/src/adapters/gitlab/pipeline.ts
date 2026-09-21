import type { IntegrationConfig } from '../../types';
import { GitLabClient } from './client';

export class GitLabPipelineClient extends GitLabClient {
  async trigger(
    config: IntegrationConfig,
    ref: string
  ): Promise<{ ref: string; accepted: boolean }> {
    return { ref, accepted: ref.trim().length > 0 && (await this.test(config)) };
  }
}
