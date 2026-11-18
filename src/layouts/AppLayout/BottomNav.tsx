import { NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { BOTTOM_NAV } from '@/constants';
import { cx } from '@/utils/cx';
import styles from './AppLayout.module.css';

/** Phone-only tab bar for the main pages; "More" opens the drawer */
export function BottomNav({ onMore }: { onMore: () => void }) {
  return (
    <nav className={styles.bottomNav} aria-label="Quick navigation">
      {BOTTOM_NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => cx(styles.bottomItem, isActive && styles.bottomActive)}>
          <Icon size={21} />
          <span>{label}</span>
        </NavLink>
      ))}
      <button className={styles.bottomItem} onClick={onMore}>
        <Menu size={21} />
        <span>More</span>
      </button>
    </nav>
  );
}
