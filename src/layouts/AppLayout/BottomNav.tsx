import { NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { BOTTOM_NAV } from '@/constants';

/** Phone-only tab bar for the main pages; "More" opens the drawer */
export function BottomNav({ onMore }: { onMore: () => void }) {
  return (
    <nav className="bottom-nav" aria-label="Quick navigation">
      {BOTTOM_NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className="bottom-nav__item">
          <Icon size={21} />
          <span>{label}</span>
        </NavLink>
      ))}
      <button className="bottom-nav__item" onClick={onMore}>
        <Menu size={21} />
        <span>More</span>
      </button>
    </nav>
  );
}
