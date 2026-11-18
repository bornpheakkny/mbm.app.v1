import {
  ArrowDownLeft,
  ArrowUpRight,
  LayoutDashboard,
  Tags,
  Target,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
  adminOnly?: boolean;
}

export const NAV_DASHBOARD: NavItem = { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true };
export const NAV_INCOME: NavItem = { to: '/income', label: 'Income', icon: ArrowDownLeft };
export const NAV_EXPENSES: NavItem = { to: '/expenses', label: 'Expenses', icon: ArrowUpRight };
export const NAV_BUDGET: NavItem = { to: '/budget', label: 'Budget plan', icon: Target };
export const NAV_CATEGORIES: NavItem = { to: '/categories', label: 'Categories', icon: Tags };
export const NAV_ACCOUNT: NavItem = { to: '/account', label: 'My account', icon: UserCog };
export const NAV_USERS: NavItem = { to: '/admin/users', label: 'User accounts', icon: Users };

/** Sidebar / drawer */
export const NAV_SECTIONS: NavSection[] = [
  { title: 'Overview', items: [NAV_DASHBOARD, NAV_INCOME, NAV_EXPENSES, NAV_BUDGET] },
  { title: 'Settings', items: [NAV_CATEGORIES, NAV_ACCOUNT] },
  { title: 'Administration', items: [NAV_USERS], adminOnly: true },
];

/** Phone bottom bar (a "More" button opens the drawer for the rest) */
export const BOTTOM_NAV: NavItem[] = [
  { ...NAV_DASHBOARD, label: 'Home' },
  NAV_INCOME,
  NAV_EXPENSES,
  { ...NAV_BUDGET, label: 'Budget' },
];

/** Title shown in the top bar for each route */
export const ROUTE_TITLES: Record<string, string> = Object.fromEntries(
  NAV_SECTIONS.flatMap((s) => s.items).map((i) => [i.to, i.label]),
);
