import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { THEME_KEY, type Theme } from '@util/util-constant/UtilConstant';

export type ThemePreference = Theme | 'system';

interface ThemeState {
  /** The theme actually shown */
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  /** What the user picked: light, dark, or follow the system */
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeState | null>(null);
const media = () => window.matchMedia('(prefers-color-scheme: dark)');

function readSaved(): Theme | null {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // A saved choice wins; otherwise follow the operating system setting.
  const [saved, setSaved] = useState<Theme | null>(readSaved);
  const [system, setSystem] = useState<Theme>(() => (media().matches ? 'dark' : 'light'));
  const theme = saved ?? system;

  useEffect(() => {
    const mq = media();
    const onChange = (e: MediaQueryListEvent) => setSystem(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setSaved(t);
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {
      // storage unavailable (private mode) — theme still applies for this session
    }
  }, []);

  const toggleTheme = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [theme, setTheme]);

  /** 'system' forgets the saved choice and follows the operating system again */
  const setPreference = useCallback(
    (p: ThemePreference) => {
      if (p !== 'system') return setTheme(p);
      setSaved(null);
      try {
        localStorage.removeItem(THEME_KEY);
      } catch {
        // storage unavailable — nothing to clear
      }
    },
    [setTheme],
  );

  const preference: ThemePreference = saved ?? 'system';
  const value = useMemo(
    () => ({ theme, toggleTheme, setTheme, preference, setPreference }),
    [theme, toggleTheme, setTheme, preference, setPreference],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
