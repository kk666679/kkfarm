import { randomUUID } from 'crypto';
import type { AIStreamChunk, AIChatRequest, AIChatResponse } from '../types/ai.ts';
import { globalDeviceManager } from '../index.ts';

type StreamCallback = (chunk: AIStreamChunk) => void;

export class AIService {
  private static streamDelayMs = 30;

  static async *streamChat(request: AIChatRequest): AsyncGenerator<AIStreamChunk> {
    const id = randomUUID();
    const response = await this.generateResponse(request);
    const words = response.message.split(' ');

    for (let i = 0; i < words.length; i++) {
      yield {
        delta: (i === 0 ? '' : ' ') + words[i],
        done: false,
        metadata: { id, index: i + 1, total: words.length },
      };
      await this.sleep(AIService.streamDelayMs);
    }

    yield {
      delta: '',
      done: true,
      metadata: { id, context: response.context },
    };
  }

  static async chat(request: AIChatRequest): Promise<AIChatResponse> {
    return this.generateResponse(request);
  }

  private static async generateResponse(request: AIChatRequest): Promise<AIChatResponse> {
    const message = request.message.toLowerCase();
    const devices = globalDeviceManager.getAll();

    if (
      message.includes('device') &&
      (message.includes('status') || message.includes('how many'))
    ) {
      const online = devices.filter((d: any) => d.status === 'online').length;
      const busy = devices.filter((d: any) => d.status === 'busy').length;
      const error = devices.filter((d: any) => d.status === 'error').length;
      return {
        id: randomUUID(),
        message: `Device Status Summary:\n- Total devices: ${devices.length}\n- Online: ${online}\n- Busy: ${busy}\n- Error: ${error}\n- Offline: ${devices.length - online - busy - error}`,
        context: {
          devices: devices.map((d: any) => ({ id: d.id, name: d.name, status: d.status })),
        },
      };
    }

    if (message.includes('start') && message.includes('device')) {
      const idle = devices.find((d: any) => d.status === 'offline');
      if (idle) {
        return {
          id: randomUUID(),
          message: `I can help you start a device. Device "${idle.name}" (${idle.id}) is currently offline and ready to start. Use the device controls to start it, or tell me the device ID if you want me to trigger it.`,
          context: { suggestedDeviceId: idle.id, suggestedDeviceName: idle.name },
        };
      }
      return {
        id: randomUUID(),
        message:
          'All devices are currently in use or starting. Please wait for a device to become available.',
      };
    }

    if (message.includes('stop') && message.includes('device')) {
      const busyDevices = devices.filter((d: any) => d.status === 'busy');
      if (busyDevices.length > 0) {
        return {
          id: randomUUID(),
          message: `I found ${busyDevices.length} running device(s). The most recently used is "${busyDevices[0] ? busyDevices[0].name : 'Unknown'}". Stopping a busy device will interrupt any running tasks. Do you want to proceed?`,
          context: { busyDevices: busyDevices.map((d: any) => ({ id: d.id, name: d.name })) },
        };
      }
      return { id: randomUUID(), message: 'There are no running devices to stop.' };
    }

    if (
      message.includes('task') &&
      (message.includes('status') || message.includes('how many') || message.includes('queue'))
    ) {
      return {
        id: randomUUID(),
        message:
          'Task queue status requires access to the task database. Currently I can see device status. For detailed task metrics, check the Tasks page or Metrics dashboard.',
        context: { hint: 'task_status' },
      };
    }

    if (message.includes('help') || message.includes('what can you do')) {
      return {
        id: randomUUID(),
        message:
          'I can help you manage your device farm. Try asking:\n- "What is the device status?"\n- "Start a device"\n- "Stop a device"\n- "Show me device health"\n- "Help"',
        context: { capabilities: ['device_status', 'start_device', 'stop_device', 'health_check'] },
      };
    }

    return {
      id: randomUUID(),
      message: `I understand you're asking about "${request.message}". I'm currently connected to ${devices.length} device(s). For detailed task logs, metrics, or automation controls, use the dedicated pages in the dashboard.`,
      context: { devices: devices.length, fallback: true },
    };
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
