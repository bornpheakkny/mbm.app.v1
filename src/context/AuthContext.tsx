import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { TOKEN_KEY } from '@/constants';
import { authService } from '@/services';
import type { AuthResponse, MfaChallenge, User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  /** Step 1. Resolves to an MFA challenge when a second step is needed, otherwise null (signed in). */
  login: (email: string, password: string) => Promise<MfaChallenge | null>;
  /** Step 2. Resolves to the number of backup codes left when one was used. */
  completeMfa: (mfaToken: string, code: string) => Promise<number | undefined>;
  register: (name: string, email: string, password: string, currency?: string) => Promise<void>;
  logout: () => void;
  setUser: (u: User) => void;
  /** Store a new session token (after a password change) */
  setToken: (token: string) => void;
  /** Re-fetch the signed-in user (e.g. after verifying email) */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));

  // Restore session from stored JWT
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    authService
      .me()
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const startSession = useCallback((res: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, res.token);
    setUser(res.user);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authService.login(email, password);
      if ('mfaRequired' in res) return res;
      startSession(res);
      return null;
    },
    [startSession],
  );

  const completeMfa = useCallback(
    async (mfaToken: string, code: string) => {
      const res = await authService.loginMfa(mfaToken, code);
      startSession(res);
      return res.recoveryCodesLeft;
    },
    [startSession],
  );

  const register = useCallback(
    async (name: string, email: string, password: string, currency?: string) => {
      startSession(await authService.register({ name, email, password, currency }));
    },
    [startSession],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const setToken = useCallback((token: string) => localStorage.setItem(TOKEN_KEY, token), []);

  const refreshUser = useCallback(async () => {
    if (localStorage.getItem(TOKEN_KEY)) setUser(await authService.me());
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, completeMfa, register, logout, setUser, setToken, refreshUser }),
    [user, loading, login, completeMfa, register, logout, setToken, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
