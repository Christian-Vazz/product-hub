import api from './axios';

export interface AuthUser {
  id: string;
  email: string;
  display_name?: string;
  role?: string; // 'admin' | 'user'
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const authService = {
  getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setSession(session: AuthSession) {
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  async signUp(email: string, password: string, displayName: string): Promise<{ error: any }> {
    try {
      const { data } = await api.post('/auth/register', {
        email,
        password,
        display_name: displayName,
      });
      if (data.access_token) {
        const user: AuthUser = {
          id: data.user?.id || '',
          email: data.user?.email || email,
          display_name: data.user?.display_name || displayName,
          role: data.user?.role || 'user',
        };
        this.setSession({ token: data.access_token, user });
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.response?.data?.detail || err.message };
    }
  },

  async signIn(email: string, password: string): Promise<{ error: any; session?: AuthSession }> {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const user: AuthUser = {
        id: data.user?.id || '',
        email: data.user?.email || email,
        display_name: data.user?.display_name || '',
        role: data.user?.role || 'user',
      };
      const session: AuthSession = {
        token: data.access_token || data.token,
        user,
      };
      this.setSession(session);
      return { error: null, session };
    } catch (err: any) {
      return { error: err.response?.data?.detail || err.message };
    }
  },

  async signOut(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    }
    this.clearSession();
  },

  async getProfile(userId: string): Promise<{ display_name: string; avatar_url: string | null; role?: string } | null> {
    try {
      const { data } = await api.get(`/users/${userId}/profile`);
      return {
        display_name: data.display_name || data.email || '',
        avatar_url: data.avatar_url || null,
        role: data.role || 'user',
      };
    } catch {
      return null;
    }
  },

  async checkAdmin(userId: string): Promise<boolean> {
    try {
      const { data } = await api.get(`/users/${userId}/roles`);
      if (Array.isArray(data)) {
        return data.some((r: any) => r.role === 'admin');
      }
      return data?.is_admin === true;
    } catch {
      return false;
    }
  },
};
