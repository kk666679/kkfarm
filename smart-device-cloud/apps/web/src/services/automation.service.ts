import { buildApiUrl } from '@/lib/api';
import { trpcClient } from '@/trpc/links';

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  enabled: boolean;
}

export interface CreateAutomationRuleInput {
  name: string;
  trigger: string;
  condition: string;
  action: string;
  enabled?: boolean;
}

export const automationService = {
  async list(): Promise<AutomationRule[]> {
    const res = await fetch(buildApiUrl('/workflows'));
    if (!res.ok) throw new Error('Failed to fetch automation rules');
    return res.json();
  },

  async create(input: CreateAutomationRuleInput): Promise<AutomationRule> {
    const res = await fetch(buildApiUrl('/workflows'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Failed to create automation rule');
    return res.json();
  },

  async update(id: string, input: Partial<CreateAutomationRuleInput>): Promise<AutomationRule> {
    await trpcClient.workflow.save.mutate({
      id,
      name: input.name ?? 'Unnamed workflow',
      nodes: [],
      edges: [],
    });
    return trpcClient.workflow.byId.query({ workflowId: id }) as unknown as Promise<AutomationRule>;
  },

  async delete(id: string): Promise<void> {
    const result = await trpcClient.workflow.delete.mutate({ workflowId: id });
    if (!result.success) throw new Error('Failed to delete automation rule');
  },
};
