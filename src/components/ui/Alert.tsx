import type { ReactNode } from 'react';

export function Alert({ children, tone = 'error' }: { children: ReactNode; tone?: 'error' | 'info' | 'success' }) {
  return <div className={`alert alert--${tone}`}>{children}</div>;
}
