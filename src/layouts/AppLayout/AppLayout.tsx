import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { VerifyEmailBanner } from '@/components/VerifyEmailBanner';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import './AppLayout.css';

/**
 * Signed-in shell.
 *  ≥1024px: fixed sidebar + top bar
 *  <1024px: sidebar becomes a slide-in drawer
 *  <640px:  bottom navigation bar for the main pages
 */
export function AppLayout() {
  const { pathname } = useLocation();
  // The drawer remembers the page it was opened on, so navigating anywhere closes it
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const drawerOpen = openedOn === pathname;
  const setDrawerOpen = (open: boolean) => setOpenedOn(open ? pathname : null);

  // Start each page at the top
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenedOn(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  return (
    <div className={`shell ${drawerOpen ? 'shell--drawer-open' : ''}`}>
      <Sidebar onClose={() => setDrawerOpen(false)} />
      <div className="shell__backdrop" onClick={() => setDrawerOpen(false)} aria-hidden />

      <div className="shell__main">
        <Topbar onMenu={() => setDrawerOpen(true)} />
        <VerifyEmailBanner />
        <main className="shell__content">
          <Outlet />
        </main>
      </div>

      <BottomNav onMore={() => setDrawerOpen(true)} />
    </div>
  );
}
