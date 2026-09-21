import type { AdbCommand, AdbResult } from '../types';
import type { AdbBridge } from './bridge';

export class AdbController {
  constructor(private readonly bridge: AdbBridge) {}

  execute(command: AdbCommand): Promise<AdbResult> {
    return this.bridge.execute(command);
  }

  async tap(serial: string, x: number, y: number): Promise<AdbResult> {
    return this.execute({ serial, action: 'shell:input tap', args: [String(x), String(y)] });
  }

  async startActivity(serial: string, component: string): Promise<AdbResult> {
    return this.execute({ serial, action: 'shell:am start', args: ['-n', component] });
  }
}
