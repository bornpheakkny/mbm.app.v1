import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { TOKEN_KEY } from '@/constants';
import { authService } from '@/services';
import type { RegisterInput } from '@/services/authService';
import type { AuthResponse, MfaChallenge, User, VerificationChallenge } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  /** Step 1 (username, email or phone). Resolves to a verification or two-step challenge, or null when signed in. */
  login: (identifier: string, password: string) => Promise<MfaChallenge | VerificationChallenge | null>;
  /** Confirms the emailed/texted code. Resolves to a two-step challenge, or null when signed in. */
  completeVerification: (verifyToken: string, code: string) => Promise<MfaChallenge | null>;
  /** Step 2. Resolves to the number of backup codes left when one was used. */
  completeMfa: (mfaToken: string, code: string) => Promise<number | undefined>;
  /** Creates the account; resolves to the code challenge (the account works once the code is entered) */
  register: (body: RegisterInput) => Promise<VerificationChallenge>;
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
    async (identifier: string, password: string) => {
      const res = await authService.login(identifier, password);
      if ('mfaRequired' in res || 'verificationRequired' in res) return res;
      startSession(res);
      return null;
    },
    [startSession],
  );

  const completeVerification = useCallback(
    async (verifyToken: string, code: string) => {
      const res = await authService.verify(verifyToken, code);
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

  const register = useCallback((body: RegisterInput) => authService.register(body), []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const setToken = useCallback((token: string) => localStorage.setItem(TOKEN_KEY, token), []);

  const refreshUser = useCallback(async () => {
    if (localStorage.getItem(TOKEN_KEY)) setUser(await authService.me());
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, completeVerification, completeMfa, register, logout, setUser, setToken, refreshUser }),
    [user, loading, login, completeVerification, completeMfa, register, logout, setToken, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
