import { NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { BOTTOM_NAV } from '@util/util-constant/UtilConstant';
import { cx } from '@util/util-consumption/class-name/ts/ClassName';
import styles from '../../../outlet/app-outlet/css/AppOutlet.module.css';

/** Phone-only tab bar for the main pages; "More" opens the drawer */
export function BottomNav({ onMore }: { onMore: () => void }) {
  return (
    <nav className={styles.pheakkornyMbmAppOutletBottomNav} aria-label="Quick navigation">
      {BOTTOM_NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => cx(styles.pheakkornyMbmAppOutletBottomItem, isActive && styles.pheakkornyMbmAppOutletBottomActive)}>
          <Icon size={21} />
          <span>{label}</span>
        </NavLink>
      ))}
      <button className={styles.pheakkornyMbmAppOutletBottomItem} onClick={onMore}>
        <Menu size={21} />
        <span>More</span>
      </button>
    </nav>
  );
}
