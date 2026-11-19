import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { currentMonth } from '@util/util-consumption/format/ts/Format';

const KEY = 'mbm_month';

const MonthContext = createContext<{ month: string; setMonth: (m: string) => void } | null>(null);

/** The month being viewed, shared by every page and remembered for the browser session. */
export function MonthProvider({ children }: { children: ReactNode }) {
  const [month, setMonth] = useState(() => sessionStorage.getItem(KEY) ?? currentMonth());
  useEffect(() => sessionStorage.setItem(KEY, month), [month]);
  return <MonthContext.Provider value={{ month, setMonth }}>{children}</MonthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMonth() {
  const ctx = useContext(MonthContext);
  if (!ctx) throw new Error('useMonth must be used inside <MonthProvider>');
  return ctx;
}
