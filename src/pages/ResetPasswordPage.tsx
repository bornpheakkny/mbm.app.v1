import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/layouts/AuthLayout';
import { authService, errorMessage } from '@/services';

/** Opened from the emailed link: /reset-password?token=… */
export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setBusy(true);
    setError(null);
    try {
      await authService.resetPassword(token, form.password);
      logout(); // every session was signed out on the server
      navigate('/login', { replace: true, state: { notice: 'Password changed. Log in with your new password.' } });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout title="Reset link missing" subtitle="Open the link from your email again, or request a new one.">
        <Link to="/forgot-password" className="btn btn--primary btn--block">
          Request a new link
        </Link>
      </AuthLayout>
    );
  }

  const invalid = error?.includes('invalid or has expired');

  return (
    <AuthLayout title="Choose a new password" subtitle="You'll be signed out on all devices. Two-step verification stays on.">
      <form className="form" onSubmit={onSubmit}>
        {error && <Alert>{error}</Alert>}
        {invalid ? (
          <Link to="/forgot-password" className="btn btn--primary btn--block">
            Request a new link
          </Link>
        ) : (
          <>
            <label className="field">
              <span>New password</span>
              <input
                type="password"
                required
                minLength={8}
                autoFocus
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </label>
            <label className="field">
              <span>Confirm new password</span>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={form.confirm}
                onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
              />
            </label>
            <button className="btn btn--primary btn--block" disabled={busy}>
              {busy ? 'Saving…' : 'Set new password'}
            </button>
          </>
        )}
      </form>
      <p className="auth__switch">
        <Link to="/login">Back to log in</Link>
      </p>
    </AuthLayout>
  );
}
