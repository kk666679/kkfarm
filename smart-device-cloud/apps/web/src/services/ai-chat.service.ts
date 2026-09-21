import { buildApiUrl } from '@/lib/api';

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface AIChatRequest {
  message: string;
  messages?: AIChatMessage[];
}

export interface AIChatResponse {
  id: string;
  message: string;
  context?: Record<string, unknown>;
}

export const aiChatService = {
  async sendMessage(request: AIChatRequest): Promise<AIChatResponse> {
    const res = await fetch(buildApiUrl('/ai/chat/sync'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },

  async *streamMessage(request: AIChatRequest): AsyncGenerator<string, void, unknown> {
    const res = await fetch(buildApiUrl('/ai/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error('Failed to stream message');
    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response body');
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value);
    }
  },
};
