import type { AssistantMessage, AssistantTurn, AiModelTier } from '../types';

export class AssistantChat {
  constructor(private readonly defaultTier: AiModelTier = 'medium') {}

  turn(messages: readonly AssistantMessage[]): AssistantTurn {
    const userMessage = [...messages].reverse().find(message => message.role === 'user');
    const content = userMessage?.content.trim() ?? '';
    if (!content) throw new Error('Assistant input is required');
    return {
      messages: messages.map(message => ({ ...message })),
      modelTier: this.defaultTier,
      response: `Acknowledged: ${content.slice(0, 240)}`,
      confidence: 0.72,
    };
  }
}
