import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import logo from '@/assets/logo.svg';
import { Avatar } from '@/components/Avatar';
import { APP_NAME, NAV_SECTIONS } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { cx } from '@/utils/cx';
import styles from './AppLayout.module.css';

/** Navigation sidebar (a drawer on smaller screens) */
export function Sidebar({ onClose }: { onClose: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const sections = NAV_SECTIONS.filter((s) => !s.adminOnly || user?.role === 'ADMIN');

  return (
    <aside className={styles.sidebar} aria-label="Main navigation">
      <div className={styles.brand}>
        <img src={logo} alt="" width={32} height={32} />
        <div className={styles.brandText}>
          <span className={styles.brandName}>{APP_NAME}</span>
          <span className={styles.brandTagline}>Monthly planner</span>
        </div>
        <button className={cx('icon-btn icon-btn--sm', styles.sidebarClose)} aria-label="Close menu" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <nav className={styles.nav}>
        {sections.map((section) => (
          <div key={section.title} className={styles.section}>
            <div className={styles.sectionTitle}>{section.title}</div>
            {section.items.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => cx(styles.navLink, isActive && styles.navActive)}>
                <Icon size={18} className={styles.navIcon} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {user && (
        <div className={styles.footer}>
          <NavLink to="/account" className={styles.user}>
            <Avatar name={user.name} />
            <div className={styles.userText}>
              <span className={styles.userName}>
                <span className={styles.userNameText}>{user.name}</span>
                {user.role === 'ADMIN' && <span className={cx('pill pill--violet', styles.role)}>Admin</span>}
              </span>
              <span className={styles.userEmail}>{user.email}</span>
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
