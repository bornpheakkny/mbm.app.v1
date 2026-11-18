import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { VerifyEmailBanner } from '@/components/VerifyEmailBanner';
import { cx } from '@/utils/cx';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import styles from './AppLayout.module.css';

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
  const openDrawer = () => setOpenedOn(pathname);
  const closeDrawer = () => setOpenedOn(null);

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
    <div className={cx(styles.shell, drawerOpen && styles.drawerOpen)}>
      <Sidebar onClose={closeDrawer} />
      <div className={styles.backdrop} onClick={closeDrawer} aria-hidden />

      <div className={styles.main}>
        <Topbar onMenu={openDrawer} />
        <VerifyEmailBanner />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>

      <BottomNav onMore={openDrawer} />
    </div>
  );
}
