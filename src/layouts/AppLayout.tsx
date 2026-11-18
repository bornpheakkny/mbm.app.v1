import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.svg';
import { MonthPicker } from '@/components/MonthPicker';
import { ThemeToggle } from '@/components/ThemeToggle';
import { VerifyEmailBanner } from '@/components/security/VerifyEmailBanner';
import { ADMIN_NAV, APP_NAME, MAIN_NAV, type NavItem } from '@/constants';
import { useAuth } from '@/context/AuthContext';

function NavLinks({ items }: { items: NavItem[] }) {
  return items.map((n) => (
    <NavLink key={n.to} to={n.to} end={n.end} className="nav__link">
      <span className="nav__icon" aria-hidden>
        {n.icon}
      </span>
      {n.label}
    </NavLink>
  ));
}

/** Signed-in shell: sidebar navigation, top bar with month picker, page content */
export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className={`shell ${open ? 'shell--nav-open' : ''}`}>
      <aside className="sidebar">
        <div className="brand">
          <img src={logo} alt="" width={28} height={28} />
          <span>{APP_NAME}</span>
        </div>
        <nav className="nav" onClick={() => setOpen(false)}>
          <NavLinks items={MAIN_NAV} />
          {user?.role === 'ADMIN' && (
            <>
              <div className="nav__section">Administration</div>
              <NavLinks items={ADMIN_NAV} />
            </>
          )}
        </nav>
        <div className="sidebar__footer">
          <div className="user-chip">
            <div className="avatar">{user?.name.charAt(0).toUpperCase()}</div>
            <div>
              <div className="user-chip__name">
                {user?.name} {user?.role === 'ADMIN' && <span className="role-tag">Admin</span>}
              </div>
              <div className="user-chip__email">{user?.email}</div>
            </div>
          </div>
          <button
            className="btn btn--ghost btn--sm btn--block"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Log out
          </button>
        </div>
      </aside>
      <div className="backdrop" onClick={() => setOpen(false)} />

      <div className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" aria-label="Open menu" onClick={() => setOpen(true)}>
            ☰
          </button>
          <MonthPicker />
          <ThemeToggle />
        </header>
        <VerifyEmailBanner />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
