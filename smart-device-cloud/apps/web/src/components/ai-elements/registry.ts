import type { ComponentType } from 'react';

export interface AIElementRegistry {
  name: string;
  category: string;
  component: ComponentType<any>;
  description: string;
  usage: string;
}

const registry: AIElementRegistry[] = [
  { name: 'Message', category: 'Communication', component: null as any, description: 'AI/user message bubble', usage: 'Agent communication' },
  { name: 'Plan', category: 'Execution', component: null as any, description: 'Structured plan display', usage: 'Workflow plans, approvals' },
  { name: 'Task', category: 'Execution', component: null as any, description: 'Task card with state', usage: 'Job/task lifecycle' },
  { name: 'Tool', category: 'Execution', component: null as any, description: 'Tool call with status', usage: 'Device/agent actions' },
  { name: 'Queue', category: 'Execution', component: null as any, description: 'Queue display', usage: 'Fleet queue, pipeline' },
  { name: 'Reasoning', category: 'AI', component: null as any, description: 'AI reasoning/thinking', usage: 'Agent reasoning, root cause' },
  { name: 'PromptInput', category: 'Communication', component: null as any, description: 'User input with attachments', usage: 'Command input, assistant prompt' },
  { name: 'Suggestion', category: 'AI', component: null as any, description: 'Action suggestions', usage: 'Contextual actions' },
  { name: 'Terminal', category: 'Observability', component: null as any, description: 'Terminal output', usage: 'Device logs, shell' },
  { name: 'TestResults', category: 'Evidence', component: null as any, description: 'Test output', usage: 'QA verification' },
  { name: 'Sources', category: 'Evidence', component: null as any, description: 'Source references', usage: 'Evidence, logs' },
  { name: 'SchemaDisplay', category: 'Data', component: null as any, description: 'Structured data', usage: 'Tool outputs, schemas' },
  { name: 'WebPreview', category: 'Evidence', component: null as any, description: 'Browser preview', usage: 'Web automation' },
  { name: 'Agent', category: 'AI', component: null as any, description: 'Agent status', usage: 'Agent monitoring' },
];

export function getAIElementRegistry(): AIElementRegistry[] {
  return registry;
}

export function getAIElementByName(name: string): AIElementRegistry | undefined {
  return registry.find(r => r.name === name);
}

export function getAIElementsByCategory(category: string): AIElementRegistry[] {
  return registry.filter(r => r.category === category);
}
