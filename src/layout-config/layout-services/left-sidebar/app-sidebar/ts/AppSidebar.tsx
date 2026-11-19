import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import logo from '@asset/image/logo.svg';
import { Avatar } from '@component/info/avatar/ts/Avatar';
import { APP_NAME, NAV_SECTIONS } from '@util/util-constant/UtilConstant';
import { useAuth } from '@context/auth-provider/ts/AuthContext';
import { cx } from '@util/util-consumption/class-name/ts/ClassName';
import styles from '../../../outlet/app-outlet/css/AppOutlet.module.css';

/** Navigation sidebar (a drawer on smaller screens) */
export function Sidebar({ onClose }: { onClose: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const sections = NAV_SECTIONS.filter((s) => !s.adminOnly || user?.role === 'ADMIN');

  return (
    <aside className={styles.pheakkornyMbmAppOutletSidebar} aria-label="Main navigation">
      <div className={styles.pheakkornyMbmAppOutletBrand}>
        <img src={logo} alt="" width={32} height={32} />
        <div className={styles.pheakkornyMbmAppOutletBrandText}>
          <span className={styles.pheakkornyMbmAppOutletBrandName}>{APP_NAME}</span>
          <span className={styles.pheakkornyMbmAppOutletBrandTagline}>Monthly planner</span>
        </div>
        <button className={cx('pheakkornyMbmIconBtn pheakkornyMbmIconBtnSm', styles.pheakkornyMbmAppOutletSidebarClose)} aria-label="Close menu" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <nav className={styles.pheakkornyMbmAppOutletNav}>
        {sections.map((section) => (
          <div key={section.title} className={styles.pheakkornyMbmAppOutletSection}>
            <div className={styles.pheakkornyMbmAppOutletSectionTitle}>{section.title}</div>
            {section.items.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => cx(styles.pheakkornyMbmAppOutletNavLink, isActive && styles.pheakkornyMbmAppOutletNavActive)}>
                <Icon size={18} className={styles.pheakkornyMbmAppOutletNavIcon} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {user && (
        <div className={styles.pheakkornyMbmAppOutletFooter}>
          <NavLink to="/account" className={styles.pheakkornyMbmAppOutletUser}>
            <Avatar name={user.name} />
            <div className={styles.pheakkornyMbmAppOutletUserText}>
              <span className={styles.pheakkornyMbmAppOutletUserName}>
                <span className={styles.pheakkornyMbmAppOutletUserNameText}>{user.name}</span>
                {user.role === 'ADMIN' && <span className={cx('pheakkornyMbmPill pheakkornyMbmPillViolet', styles.pheakkornyMbmAppOutletRole)}>Admin</span>}
              </span>
              <span className={styles.pheakkornyMbmAppOutletUserEmail}>@{user.username}</span>
            </div>
          </NavLink>
          <button
            className="pheakkornyMbmIconBtn"
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
