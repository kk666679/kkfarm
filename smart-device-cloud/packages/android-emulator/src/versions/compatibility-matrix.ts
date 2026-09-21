import type { EmulatorImage } from '../types';

export interface CompatibilityRule {
  minimumApiLevel: number;
  architectures: Array<'x86_64' | 'arm64'>;
  minimumRamMb: number;
}

export class CompatibilityMatrix {
  private readonly rules = new Map<string, CompatibilityRule>();

  addRule(apiLevel: number, rule: CompatibilityRule): void {
    this.rules.set(String(apiLevel), rule);
  }

  isCompatible(image: EmulatorImage, ramMb: number): boolean {
    const rule = this.rules.get(String(image.apiLevel)) ?? {
      minimumApiLevel: 29,
      architectures: ['x86_64', 'arm64'],
      minimumRamMb: 2048,
    };
    return (
      image.apiLevel >= rule.minimumApiLevel &&
      rule.architectures.includes(image.architecture) &&
      ramMb >= rule.minimumRamMb
    );
  }
}
