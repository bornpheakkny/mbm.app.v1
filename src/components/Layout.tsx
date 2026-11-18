import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { MonthPicker } from './MonthPicker';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '◧', end: true },
  { to: '/income', label: 'Income', icon: '↓' },
  { to: '/expenses', label: 'Expenses', icon: '↑' },
  { to: '/budget', label: 'Budget plan', icon: '◎' },
  { to: '/categories', label: 'Categories', icon: '▤' },
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className={`shell ${open ? 'shell--nav-open' : ''}`}>
      <aside className="sidebar">
        <div className="brand">
          <img src="/favicon.svg" alt="" width={28} height={28} />
          <span>Budget Manager</span>
        </div>
        <nav className="nav" onClick={() => setOpen(false)}>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className="nav__link">
              <span className="nav__icon" aria-hidden>
                {n.icon}
              </span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__footer">
          <div className="user-chip">
            <div className="avatar">{user?.name.charAt(0).toUpperCase()}</div>
            <div>
              <div className="user-chip__name">{user?.name}</div>
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
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
