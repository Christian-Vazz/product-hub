import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, AuthUser } from '@/api/auth.service';

interface AuthContextType {
  user: AuthUser | null;
  profile: { display_name: string; avatar_url: string | null } | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<{ display_name: string; avatar_url: string | null } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUserData = async (authUser: AuthUser) => {
    const [profileData, adminStatus] = await Promise.all([
      authService.getProfile(authUser.id),
      authService.checkAdmin(authUser.id),
    ]);
    setProfile(profileData);
    // Admin status from API OR from the stored user role
    setIsAdmin(adminStatus || authUser.role === 'admin');
  };

  useEffect(() => {
    // Restore session from localStorage
    const storedUser = authService.getStoredUser();
    const storedToken = authService.getStoredToken();

    if (storedUser && storedToken) {
      setUser(storedUser);
      // Quick check from stored role
      if (storedUser.role === 'admin') {
        setIsAdmin(true);
      }
      loadUserData(storedUser).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const { error } = await authService.signUp(email, password, displayName);
    if (!error) {
      const storedUser = authService.getStoredUser();
      if (storedUser) {
        setUser(storedUser);
        setIsAdmin(storedUser.role === 'admin');
        await loadUserData(storedUser);
      }
    }
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error, session } = await authService.signIn(email, password);
    if (!error && session) {
      setUser(session.user);
      setIsAdmin(session.user.role === 'admin');
      await loadUserData(session.user);
    }
    return { error };
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
