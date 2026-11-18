import type { ReactNode } from 'react';
import { CalendarCheck, PieChart, ShieldCheck } from 'lucide-react';
import logo from '@/assets/logo.svg';
import { ThemeToggle } from '@/components/ThemeToggle';
import { APP_NAME } from '@/constants';
import './AuthLayout.css';

const POINTS = [
  { icon: PieChart, text: 'See budgeted vs actual for every category at a glance' },
  { icon: CalendarCheck, text: 'Plan each month and copy last month in one click' },
  { icon: ShieldCheck, text: 'Private to you, with optional two-step verification' },
];

/** Login / register / recovery pages: brand panel on wide screens, centered card everywhere */
export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children: ReactNode }) {
  return (
    <div className="auth">
      <aside className="auth__brand">
        <div className="auth__brand-top">
          <img src={logo} alt="" width={36} height={36} />
          <span>{APP_NAME}</span>
        </div>
        <div className="auth__pitch">
          <h2>Take control of your monthly money.</h2>
          <ul>
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text}>
                <span>
                  <Icon size={18} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="auth__foot">© {new Date().getFullYear()} {APP_NAME}</p>
      </aside>

      <main className="auth__main">
        <ThemeToggle className="auth__theme" />
        <div className="auth__card">
          <div className="auth__logo">
            <img src={logo} alt="" width={40} height={40} />
          </div>
          <h1>{title}</h1>
          {subtitle && <p className="auth__subtitle">{subtitle}</p>}
          <div className="auth__content">{children}</div>
        </div>
      </main>
    </div>
  );
}
