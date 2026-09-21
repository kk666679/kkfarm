import type { BrowserFingerprint, BrowserProfile } from '../types';

function hash(value: string): string {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0).toString(36);
}

export class BrowserFingerprintGenerator {
  generate(profile: BrowserProfile, seed = profile.id): BrowserFingerprint {
    const digest = hash(
      `${seed}:${profile.userAgent ?? ''}:${profile.locale ?? ''}:${profile.timezone ?? ''}`
    );
    return {
      userAgent: profile.userAgent ?? 'Mozilla/5.0',
      platform: 'Linux x86_64',
      screen: { width: 1920, height: 1080 },
      timezone: profile.timezone ?? 'UTC',
      locale: profile.locale ?? 'en-US',
      language: (profile.locale ?? 'en-US').split('-')[0] ?? 'en',
      hardwareConcurrency: 8,
      deviceMemory: 8,
    };
  }
}

export function fingerprintKey(fingerprint: BrowserFingerprint): string {
  return hash(JSON.stringify(fingerprint));
}
