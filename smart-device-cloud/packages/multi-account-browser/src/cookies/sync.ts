import type { EncryptedCookie } from '../types';
import type { CookieCipher } from './encrypted-store';

export class CookieSync {
  constructor(private readonly cipher: CookieCipher) {}

  async put(
    profileId: string,
    cookie: Omit<EncryptedCookie, 'id' | 'encryptedValue'>,
    value: string
  ): Promise<EncryptedCookie> {
    const encryptedValue = await this.cipher.encrypt(profileId, value);
    return {
      ...cookie,
      id: `cookie-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      profileId,
      encryptedValue,
    };
  }

  async read(cookie: EncryptedCookie, profileId: string): Promise<string> {
    if (cookie.profileId !== profileId) throw new Error('Cookie profile mismatch');
    if (cookie.expiresAt && new Date(cookie.expiresAt).getTime() <= Date.now())
      throw new Error('Cookie has expired');
    return this.cipher.decrypt(profileId, cookie.encryptedValue);
  }
}
