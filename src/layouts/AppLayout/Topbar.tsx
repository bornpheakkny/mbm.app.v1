import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, Moon, Sun, UserCog } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { MonthPicker } from '@/components/MonthPicker';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ROUTE_TITLES } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

/** Pages where the month doesn't matter hide the month picker */
const NO_MONTH = ['/categories', '/account', '/admin/users'];

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { pathname } = useLocation();
  const showMonth = !NO_MONTH.includes(pathname);

  return (
    <header className="topbar">
      <button className="icon-btn topbar__menu" aria-label="Open menu" onClick={onMenu}>
        <Menu size={20} />
      </button>
      <div className="topbar__title">{ROUTE_TITLES[pathname] ?? ''}</div>
      {showMonth && <MonthPicker />}
      <div className="topbar__right">
        <ThemeToggle />
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
    <div className="user-menu" ref={ref}>
      <button className="user-menu__trigger" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Avatar name={user.name} size="sm" />
        <span className="user-menu__name">{user.name.split(' ')[0]}</span>
        <ChevronDown size={16} className="user-menu__chevron" />
      </button>
      {open && (
        <div className="user-menu__panel" role="menu">
          <div className="user-menu__head">
            <Avatar name={user.name} />
            <div className="user-menu__who">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
          <Link to="/account" role="menuitem" className="user-menu__item" onClick={() => setOpen(false)}>
            <UserCog size={16} /> My account
          </Link>
          <button role="menuitem" className="user-menu__item" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <button
            role="menuitem"
            className="user-menu__item user-menu__item--danger"
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
