import type { IAuthService } from '@/types/services';
import type { User } from '@/types';
import { secureStorage } from './SecureStorage';
import { storageService } from './StorageService';
import { apiService } from './APIService';

const USER_KEY = 'auth_user';

class AuthService implements IAuthService {
  async saveToken(token: string): Promise<void> {
    await secureStorage.saveToken(token);
  }

  async getToken(): Promise<string | null> {
    return secureStorage.getToken();
  }

  async clearToken(): Promise<void> {
    await secureStorage.clearToken();
  }

  async login(username: string, password: string): Promise<User> {
    try {
      const response = await apiService.post<{ token: string; user: User }>('/auth/login', {
        username,
        password,
      });
      await this.saveToken(response.token);
      await this.saveUser(response.user);
      return response.user;
    } catch (error) {
      console.error('[Auth] Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await apiService.post<{ success: boolean }>('/auth/logout', {});
    } catch {
      // ignore logout errors
    } finally {
      await this.clearToken();
      await storageService.remove(USER_KEY);
    }
  }

  async refreshToken(): Promise<void> {
    try {
      const response = await apiService.post<{ token: string }>('/auth/refresh', {});
      if (response?.token) {
        await this.saveToken(response.token);
      }
    } catch (error) {
      console.error('[Auth] Refresh token error:', error);
      await this.clearToken();
      throw error;
    }
  }

  async getUser(): Promise<User | null> {
    return storageService.get<User>(USER_KEY);
  }

  async saveUser(user: User): Promise<void> {
    await storageService.set(USER_KEY, user);
  }
}

export const authService = new AuthService();
export default authService;
