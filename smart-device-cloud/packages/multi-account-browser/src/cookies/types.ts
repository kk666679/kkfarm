export type CookieRecord = {
  id: string;
  profileId: string;
  domain: string;
  name: string;
  encryptedValue: string;
  expiresAt?: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'strict' | 'lax' | 'none';
};

export type { CookieRecord as EncryptedCookie };
