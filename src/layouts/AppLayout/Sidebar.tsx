import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import logo from '@/assets/logo.svg';
import { Avatar } from '@/components/Avatar';
import { APP_NAME, NAV_SECTIONS } from '@/constants';
import { useAuth } from '@/context/AuthContext';

/** Navigation sidebar (a drawer on smaller screens) */
export function Sidebar({ onClose }: { onClose: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const sections = NAV_SECTIONS.filter((s) => !s.adminOnly || user?.role === 'ADMIN');

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <div className="sidebar__brand">
        <img src={logo} alt="" width={32} height={32} />
        <div className="sidebar__brand-text">
          <span className="sidebar__name">{APP_NAME}</span>
          <span className="sidebar__tagline">Monthly planner</span>
        </div>
        <button className="icon-btn icon-btn--sm sidebar__close" aria-label="Close menu" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <nav className="sidebar__nav">
        {sections.map((section) => (
          <div key={section.title} className="nav-section">
            <div className="nav-section__title">{section.title}</div>
            {section.items.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className="nav-link">
                <Icon size={18} className="nav-link__icon" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {user && (
        <div className="sidebar__footer">
          <NavLink to="/account" className="sidebar__user">
            <Avatar name={user.name} />
            <div className="sidebar__user-text">
              <span className="sidebar__user-name">
                <span className="sidebar__user-name-text">{user.name}</span>
                {user.role === 'ADMIN' && <span className="pill pill--violet sidebar__role">Admin</span>}
              </span>
              <span className="sidebar__user-email">{user.email}</span>
            </div>
          </NavLink>
          <button
            className="icon-btn"
            aria-label="Log out"
            title="Log out"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      )}
    </aside>
  );
}
