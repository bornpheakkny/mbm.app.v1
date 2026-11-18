import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, Moon, Sun, UserCog } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { MonthPicker } from '@/components/MonthPicker';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ROUTE_TITLES } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { cx } from '@/utils/cx';
import styles from './AppLayout.module.css';

/** Pages where the month doesn't matter hide the month picker */
const NO_MONTH = ['/categories', '/account', '/admin/users'];

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { pathname } = useLocation();
  const showMonth = !NO_MONTH.includes(pathname);

  return (
    <header className={styles.topbar}>
      <button className={cx('icon-btn', styles.menuBtn)} aria-label="Open menu" onClick={onMenu}>
        <Menu size={20} />
      </button>
      <div className={styles.pageTitle}>{ROUTE_TITLES[pathname] ?? ''}</div>
      {showMonth && <MonthPicker />}
      <div className={styles.right}>
        <ThemeToggle className={styles.topbarTheme} />
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
    <div className={styles.userMenu} ref={ref}>
      <button className={styles.menuTrigger} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Avatar name={user.name} size="sm" />
        <span className={styles.menuName}>{user.name.split(' ')[0]}</span>
        <ChevronDown size={16} className={styles.menuChevron} />
      </button>
      {open && (
        <div className={styles.menuPanel} role="menu">
          <div className={styles.menuHead}>
            <Avatar name={user.name} />
            <div className={styles.menuWho}>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
          <Link to="/account" role="menuitem" className={styles.menuItem} onClick={() => setOpen(false)}>
            <UserCog size={16} /> My account
          </Link>
          <button role="menuitem" className={styles.menuItem} onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <button
            role="menuitem"
            className={cx(styles.menuItem, styles.menuItemDanger)}
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
