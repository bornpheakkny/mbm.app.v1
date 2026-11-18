import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services';
import type { Preferences } from '@/types';

export const DEFAULT_PREFERENCES: Preferences = { barColor: 'category', badgeStyle: 'soft' };

/**
 * The signed-in user's display preferences, plus an updater that applies the change
 * immediately and saves it to the account (rolled back if saving fails).
 */
export function usePreferences() {
  const { user, setUser } = useAuth();
  const preferences = { ...DEFAULT_PREFERENCES, ...user?.preferences };

  const update = useCallback(
    async (patch: Partial<Preferences>) => {
      if (!user) return;
      const before = user;
      setUser({ ...user, preferences: { ...DEFAULT_PREFERENCES, ...user.preferences, ...patch } });
      try {
        setUser(await authService.updateMe({ preferences: patch }));
      } catch (err) {
        setUser(before);
        throw err;
      }
    },
    [user, setUser],
  );

  return { preferences, update };
}
