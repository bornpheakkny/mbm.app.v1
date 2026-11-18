import type { ReactNode } from 'react';
import logo from '@/assets/logo.svg';
import { ThemeToggle } from '@/components/ThemeToggle';
import { APP_NAME } from '@/constants';

/** Centered card used by the login and register pages */
export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="auth">
      <ThemeToggle />
      <div className="auth__card">
        <div className="brand brand--center">
          <img src={logo} alt="" width={36} height={36} />
          <span>{APP_NAME}</span>
        </div>
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
