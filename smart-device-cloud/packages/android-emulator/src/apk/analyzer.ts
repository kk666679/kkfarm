import type { ApkMetadata } from '../types';

export interface ApkAnalyzeInput {
  packageName?: string;
  versionName?: string;
  versionCode?: number;
  minSdk?: number;
  targetSdk?: number;
  permissions?: string[];
  sizeBytes?: number;
  signature?: string;
}

export class ApkAnalyzer {
  analyze(input: ApkAnalyzeInput): ApkMetadata {
    if (!input.packageName?.trim()) throw new Error('APK package name is required');
    const versionCode = input.versionCode ?? 1;
    if (versionCode < 1 || (input.sizeBytes ?? 0) <= 0) throw new Error('Invalid APK metadata');
    return {
      packageName: input.packageName,
      versionName: input.versionName ?? '1.0',
      versionCode,
      ...(input.minSdk !== undefined ? { minSdk: input.minSdk } : {}),
      ...(input.targetSdk !== undefined ? { targetSdk: input.targetSdk } : {}),
      permissions: [...new Set(input.permissions ?? [])],
      sizeBytes: input.sizeBytes ?? 0,
      ...(input.signature !== undefined ? { signature: input.signature } : {}),
    };
  }

  isCompatible(metadata: ApkMetadata, apiLevel: number): boolean {
    return !metadata.minSdk || metadata.minSdk <= apiLevel;
  }
}
