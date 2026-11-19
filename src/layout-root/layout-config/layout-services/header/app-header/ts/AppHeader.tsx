import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, Moon, Sun, UserCog } from 'lucide-react';
import { Avatar } from '@component/info/avatar/ts/Avatar';
import { MonthPicker } from '@component/input/month-picker/ts/MonthPicker';
import { ThemeToggle } from '@component/button/theme-toggle/ts/ThemeToggle';
import { ROUTE_TITLES } from '@util/util-constant/UtilConstant';
import { useAuth } from '@context/auth-provider/ts/AuthContext';
import { useTheme } from '@context/theme-provider/ts/ThemeContext';
import { cx } from '@util/util-consumption/class-name/ts/ClassName';
import styles from '../../../outlet/app-outlet/css/AppOutlet.module.css';

/** Pages where the month doesn't matter hide the month picker */
const NO_MONTH = ['/categories', '/account', '/admin/users'];

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { pathname } = useLocation();
  const showMonth = !NO_MONTH.includes(pathname);

  return (
    <header className={styles.pheakkornyMbmAppOutletTopbar}>
      <button className={cx('pheakkornyMbmIconBtn', styles.pheakkornyMbmAppOutletMenuBtn)} aria-label="Open menu" onClick={onMenu}>
        <Menu size={20} />
      </button>
      <div className={styles.pheakkornyMbmAppOutletPageTitle}>{ROUTE_TITLES[pathname] ?? ''}</div>
      {showMonth && <MonthPicker />}
      <div className={styles.pheakkornyMbmAppOutletRight}>
        <ThemeToggle className={styles.pheakkornyMbmAppOutletTopbarTheme} />
        <UserMenu />
      </div>
    </header>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;

  return (
    <div className={styles.pheakkornyMbmAppOutletUserMenu} ref={ref}>
      <button className={styles.pheakkornyMbmAppOutletMenuTrigger} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Avatar name={user.name} size="sm" />
        <span className={styles.pheakkornyMbmAppOutletMenuName}>{user.name.split(' ')[0]}</span>
        <ChevronDown size={16} className={styles.pheakkornyMbmAppOutletMenuChevron} />
      </button>
      {open && (
        <div className={styles.pheakkornyMbmAppOutletMenuPanel} role="menu">
          <div className={styles.pheakkornyMbmAppOutletMenuHead}>
            <Avatar name={user.name} />
            <div className={styles.pheakkornyMbmAppOutletMenuWho}>
              <strong>{user.name}</strong>
              <span>@{user.username}</span>
            </div>
          </div>
          <Link to="/account" role="menuitem" className={styles.pheakkornyMbmAppOutletMenuItem} onClick={() => setOpen(false)}>
            <UserCog size={16} /> My account
          </Link>
          <button role="menuitem" className={styles.pheakkornyMbmAppOutletMenuItem} onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <button
            role="menuitem"
            className={cx(styles.pheakkornyMbmAppOutletMenuItem, styles.pheakkornyMbmAppOutletMenuItemDanger)}
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      )}
    </div>
  );
}
