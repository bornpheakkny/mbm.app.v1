import type { ReactNode } from 'react';
import { CalendarCheck, PieChart, ShieldCheck } from 'lucide-react';
import logo from '../../../../../../asset-root/asset-config/asset-services/asset-inventory/image/logo.svg';
import { ThemeToggle } from '@component/button/theme-toggle/ts/ThemeToggle';
import { APP_NAME } from '@util/util-constant/UtilConstant';
import styles from '../css/AuthLayout.module.css';

const POINTS = [
  { icon: PieChart, text: 'See budgeted vs actual for every category at a glance' },
  { icon: CalendarCheck, text: 'Plan each month and copy last month in one click' },
  { icon: ShieldCheck, text: 'Private to you, with optional two-step verification' },
];

/** Login / register / recovery pages: brand panel on wide screens, centered card everywhere */
export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children: ReactNode }) {
  return (
    <div className={styles.pheakkornyMbmAuthLayoutAuth}>
      <aside className={styles.pheakkornyMbmAuthLayoutBrand}>
        <div className={styles.pheakkornyMbmAuthLayoutBrandTop}>
          <img src={logo} alt="" width={36} height={36} />
          <span>{APP_NAME}</span>
        </div>
        <div className={styles.pheakkornyMbmAuthLayoutPitch}>
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
        <p className={styles.pheakkornyMbmAuthLayoutCopyright}>© {new Date().getFullYear()} {APP_NAME}</p>
      </aside>

      <main className={styles.pheakkornyMbmAuthLayoutMain}>
        <ThemeToggle className={styles.pheakkornyMbmAuthLayoutTheme} />
        <div className={styles.pheakkornyMbmAuthLayoutCard}>
          <div className={styles.pheakkornyMbmAuthLayoutLogo}>
            <img src={logo} alt="" width={40} height={40} />
          </div>
          <h1>{title}</h1>
          {subtitle && <p className={styles.pheakkornyMbmAuthLayoutSubtitle}>{subtitle}</p>}
          <div className={styles.pheakkornyMbmAuthLayoutContent}>{children}</div>
        </div>
      </main>
    </div>
  );
}

/** "Already have an account? Log in" line under an auth form */
export function AuthFooter({ children }: { children: ReactNode }) {
  return <p className={styles.pheakkornyMbmAuthLayoutSwitchLine}>{children}</p>;
}

/** Row of small links under an auth form (e.g. Resend code · Use a backup code · Cancel) */
export function AuthLinks({ children }: { children: ReactNode }) {
  return <div className={styles.pheakkornyMbmAuthLayoutLinks}>{children}</div>;
}
