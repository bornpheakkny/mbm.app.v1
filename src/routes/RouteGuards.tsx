import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="page-loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/** Nested inside ProtectedRoute: only ADMIN users get through */
export function AdminRoute() {
  const { user } = useAuth();
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <Outlet />;
}

/** Signed-out pages (login, register, recovery) */
export function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading…</div>;
  return <GuestGate signedInOnArrival={Boolean(user)} />;
}

/**
 * Sends people who were already signed in when they opened the page to the dashboard.
 * Someone who signs in ON the page is left alone, so the page can choose where they go next
 * (e.g. a new account goes to Budget plan).
 */
function GuestGate({ signedInOnArrival }: { signedInOnArrival: boolean }) {
  const [redirect] = useState(signedInOnArrival);
  if (redirect) return <Navigate to="/" replace />;
  return <Outlet />;
}
