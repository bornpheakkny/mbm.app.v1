import type { ReactNode } from 'react';
import { CalendarCheck, PieChart, ShieldCheck } from 'lucide-react';
import logo from '@/assets/logo.svg';
import { ThemeToggle } from '@/components/ThemeToggle';
import { APP_NAME } from '@/constants';
import styles from './AuthLayout.module.css';

const POINTS = [
  { icon: PieChart, text: 'See budgeted vs actual for every category at a glance' },
  { icon: CalendarCheck, text: 'Plan each month and copy last month in one click' },
  { icon: ShieldCheck, text: 'Private to you, with optional two-step verification' },
];

/** Login / register / recovery pages: brand panel on wide screens, centered card everywhere */
export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children: ReactNode }) {
  return (
    <div className={styles.auth}>
      <aside className={styles.brand}>
        <div className={styles.brandTop}>
          <img src={logo} alt="" width={36} height={36} />
          <span>{APP_NAME}</span>
        </div>
        <div className={styles.pitch}>
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
        <p className={styles.copyright}>© {new Date().getFullYear()} {APP_NAME}</p>
      </aside>

      <main className={styles.main}>
        <ThemeToggle className={styles.theme} />
        <div className={styles.card}>
          <div className={styles.logo}>
            <img src={logo} alt="" width={40} height={40} />
          </div>
          <h1>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          <div className={styles.content}>{children}</div>
        </div>
      </main>
    </div>
  );
}

/** "Already have an account? Log in" line under an auth form */
export function AuthFooter({ children }: { children: ReactNode }) {
  return <p className={styles.switchLine}>{children}</p>;
}

/** Row of small links under an auth form (e.g. Resend code · Use a backup code · Cancel) */
export function AuthLinks({ children }: { children: ReactNode }) {
  return <div className={styles.links}>{children}</div>;
}
