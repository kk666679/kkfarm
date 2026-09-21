import type { EncryptedCookie } from '../types';

export interface CookieCipher {
  encrypt(profileId: string, value: string): Promise<string>;
  decrypt(profileId: string, value: string): Promise<string>;
}

export class SubtleCookieCipher implements CookieCipher {
  constructor(private readonly key: CryptoKey) {}

  async encrypt(profileId: string, value: string): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = new TextEncoder().encode(`${profileId}:${value}`);
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, this.key, data);
    return `${Buffer.from(iv).toString('base64')}:${Buffer.from(encrypted).toString('base64')}`;
  }

  async decrypt(profileId: string, value: string): Promise<string> {
    const [ivText, dataText] = value.split(':');
    if (!ivText || !dataText) throw new Error('Invalid encrypted cookie');
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: Buffer.from(ivText, 'base64') },
      this.key,
      Buffer.from(dataText, 'base64')
    );
    const plain = new TextDecoder().decode(decrypted);
    const prefix = `${profileId}:`;
    if (!plain.startsWith(prefix)) throw new Error('Cookie profile mismatch');
    return plain.slice(prefix.length);
  }
}

export class InMemoryCookieCipher implements CookieCipher {
  async encrypt(profileId: string, value: string): Promise<string> {
    return Buffer.from(`${profileId}:${value}`).toString('base64');
  }

  async decrypt(profileId: string, value: string): Promise<string> {
    const plain = Buffer.from(value, 'base64').toString('utf8');
    const prefix = `${profileId}:`;
    if (!plain.startsWith(prefix)) throw new Error('Cookie profile mismatch');
    return plain.slice(prefix.length);
  }
}
