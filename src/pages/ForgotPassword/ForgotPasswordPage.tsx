import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import { Alert } from '@/components/Alert';
import { useAuth } from '@/context/AuthContext';
import { AuthFooter, AuthLayout, AuthLinks } from '@/layouts/AuthLayout';
import { authService, errorMessage } from '@/services';

/**
 * 1. Username, email or phone → a 6-digit code is sent to the account's email or phone
 * 2. Code + new password → password changed, every device signed out
 */
export function ForgotPasswordPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [step, setStep] = useState<{ resetToken: string; message: string } | null>(null);
  const [form, setForm] = useState({ code: '', password: '', confirm: '' });
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function requestCode(e?: FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await authService.forgotPassword(identifier.trim());
      setStep(res);
      if (e === undefined) setInfo('If the account exists, a new code is on its way.');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function reset(e: FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const { username } = await authService.resetPassword(step!.resetToken, form.code, form.password);
      logout(); // every session was signed out on the server
      navigate('/login', {
        replace: true,
        state: { notice: `Password changed for @${username}. Log in with your new password.`, identifier: username },
      });
    } catch (err) {
      setError(errorMessage(err));
      setForm((f) => ({ ...f, code: '' }));
    } finally {
      setBusy(false);
    }
  }

  if (step) {
    return (
      <AuthLayout title="Choose a new password" subtitle={step.message}>
        <form className="form" onSubmit={reset}>
          {error && <Alert>{error}</Alert>}
          {info && <Alert tone="success">{info}</Alert>}
          <label className="field">
            <span>6-digit code</span>
            <input
              className="code-input"
              required
              autoFocus
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.replace(/\D/g, '') }))}
            />
          </label>
          <label className="field">
            <span>New password</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
            <span className="field__hint">At least 8 characters. You'll be signed out on all devices.</span>
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
          <button className="btn btn--primary btn--lg btn--block" disabled={busy || form.code.length !== 6}>
            {busy ? 'Saving…' : 'Set new password'}
          </button>
        </form>
        <AuthLinks>
          <button type="button" className="link" onClick={() => requestCode()} disabled={busy}>
            Send a new code
          </button>
          <button type="button" className="link link--muted" onClick={() => setStep(null)}>
            Use a different account
          </button>
        </AuthLinks>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot your password?" subtitle="Enter your username, email or phone. We'll send a 6-digit code to the email or phone on the account.">
      <form className="form" onSubmit={requestCode}>
        {error && <Alert>{error}</Alert>}
        <label className="field">
          <span>Username, email or phone</span>
          <span className="input-icon">
            <UserRound size={16} />
            <input
              required
              autoFocus
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </span>
        </label>
        <button className="btn btn--primary btn--lg btn--block" disabled={busy}>
          {busy ? 'Sending…' : 'Send code'}
        </button>
      </form>
      <AuthFooter>
        Remembered it? <Link to="/login">Back to log in</Link> · <Link to="/forgot-username">Forgot username?</Link>
      </AuthFooter>
    </AuthLayout>
  );
}
