import type { AdbCommand, AdbResult } from '../types';
import type { AdbAllowlist } from './allowlist';

export interface AdbBridge {
  execute(command: AdbCommand): Promise<AdbResult>;
}

export class InMemoryAdbBridge implements AdbBridge {
  constructor(private readonly allowlist: AdbAllowlist) {}

  async execute(command: AdbCommand): Promise<AdbResult> {
    const started = Date.now();
    if (!this.allowlist.allows(command))
      throw new Error(`ADB command is not allowed: ${command.action}`);
    await Promise.resolve();
    return { exitCode: 0, stdout: '', stderr: '', durationMs: Date.now() - started };
  }
}

export class HttpAdbBridge implements AdbBridge {
  constructor(
    private readonly endpoint: string,
    private readonly allowlist: AdbAllowlist,
    private readonly token?: string
  ) {}

  async execute(command: AdbCommand): Promise<AdbResult> {
    if (!this.allowlist.allows(command))
      throw new Error(`ADB command is not allowed: ${command.action}`);
    const response = await fetch(`${this.endpoint}/adb`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
      body: JSON.stringify(command),
    });
    if (!response.ok) throw new Error(`ADB bridge failed: ${response.status}`);
    return response.json() as Promise<AdbResult>;
  }
}
