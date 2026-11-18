export interface NavItem {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
}

/** Sidebar links for every signed-in user */
export const MAIN_NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: '◧', end: true },
  { to: '/income', label: 'Income', icon: '↓' },
  { to: '/expenses', label: 'Expenses', icon: '↑' },
  { to: '/budget', label: 'Budget plan', icon: '◎' },
  { to: '/categories', label: 'Categories', icon: '▤' },
  { to: '/account', label: 'My account', icon: '⚙' },
];

/** Extra links shown to ADMIN users */
export const ADMIN_NAV: NavItem[] = [{ to: '/admin/users', label: 'User accounts', icon: '👥' }];
