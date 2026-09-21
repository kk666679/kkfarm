import * as Keychain from 'react-native-keychain';
import type { IAuthService } from '@/types/services';
import type { User } from '@/types';

const AUTH_SERVICE = 'com.phonefarm.auth';
const INACTIVITY_TIMEOUT = 30 * 24 * 60 * 60 * 1000;

class SecureStorage implements IAuthService {
  private async updateLastActivity(): Promise<void> {
    try {
      await Keychain.setInternetCredentials(AUTH_SERVICE, 'activity', Date.now().toString(), {
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } catch (error) {
      console.error('[SecureStorage] Update activity error:', error);
    }
  }

  private async getLastActivity(): Promise<number | null> {
    try {
      const credentials = await Keychain.getInternetCredentials(AUTH_SERVICE);
      if (credentials && credentials.password) {
        return parseInt(credentials.password, 10);
      }
      return null;
    } catch {
      return null;
    }
  }

  async saveToken(token: string): Promise<void> {
    try {
      await Keychain.setGenericPassword('auth_token', token, {
        service: AUTH_SERVICE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      await this.updateLastActivity();
    } catch (error) {
      console.error('[SecureStorage] Save token error:', error);
      throw error;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      const lastActivity = await this.getLastActivity();
      if (lastActivity && Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
        await this.clearToken();
        return null;
      }

      const credentials = await Keychain.getGenericPassword({
        service: AUTH_SERVICE,
      });

      if (credentials) {
        await this.updateLastActivity();
        return credentials.password;
      }

      return null;
    } catch (error) {
      console.error('[SecureStorage] Get token error:', error);
      return null;
    }
  }

  async clearToken(): Promise<void> {
    try {
      await Keychain.resetGenericPassword({ service: AUTH_SERVICE });
    } catch (error) {
      console.error('[SecureStorage] Clear token error:', error);
    }
  }

  async login(username: string, password: string): Promise<User> {
    throw new Error('SecureStorage does not handle login. Use AuthService instead.');
  }

  async logout(): Promise<void> {
    await this.clearToken();
  }

  async refreshToken(): Promise<void> {
    throw new Error('SecureStorage does not handle token refresh. Use AuthService instead.');
  }

  async getUser(): Promise<User | null> {
    return null;
  }

  async saveUser(user: User): Promise<void> {
    // User data should be stored in SQLite via StorageService, not Keychain
  }
}

export const secureStorage = new SecureStorage();
export default secureStorage;
