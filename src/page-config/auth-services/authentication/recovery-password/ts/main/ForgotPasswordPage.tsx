import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import { Alert } from '@component/modals/alert-banner/ts/Alert';
import { useAuth } from '@context/auth-provider/ts/AuthContext';
import { AuthFooter, AuthLayout, AuthLinks } from '@layout/outlet/auth-outlet/ts/AuthLayout';
import { authService, errorMessage } from '@api/ApiService';
import { useServerConfig } from '@util/util-hook/use-server-config/ts/useServerConfig';

/**
 * 1. Username, email or phone → a 6-digit code is sent to the account's email or phone
 * 2. Code + new password → password changed, every device signed out
 */
export function ForgotPasswordPage() {
  const { sms } = useServerConfig();
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
        <form className="pheakkornyMbmForm" onSubmit={reset}>
          {error && <Alert>{error}</Alert>}
          {info && <Alert tone="success">{info}</Alert>}
          <label className="pheakkornyMbmField">
            <span>6-digit code</span>
            <input
              className="pheakkornyMbmCodeInput"
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
          <label className="pheakkornyMbmField">
            <span>New password</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
            <span className="pheakkornyMbmFieldHint">At least 8 characters. You'll be signed out on all devices.</span>
          </label>
          <label className="pheakkornyMbmField">
            <span>Confirm new password</span>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={form.confirm}
              onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
            />
          </label>
          <button className="pheakkornyMbmBtn pheakkornyMbmBtnPrimary pheakkornyMbmBtnLg pheakkornyMbmBtnBlock" disabled={busy || form.code.length !== 6}>
            {busy ? 'Saving…' : 'Set new password'}
          </button>
        </form>
        <AuthLinks>
          <button type="button" className="pheakkornyMbmLink" onClick={() => requestCode()} disabled={busy}>
            Send a new code
          </button>
          <button type="button" className="pheakkornyMbmLink pheakkornyMbmLinkMuted" onClick={() => setStep(null)}>
            Use a different account
          </button>
        </AuthLinks>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot your password?" subtitle={`Enter your username, email or phone. We'll send a 6-digit code to the ${sms ? 'email or phone' : 'email'} on the account.`}>
      <form className="pheakkornyMbmForm" onSubmit={requestCode}>
        {error && <Alert>{error}</Alert>}
        <label className="pheakkornyMbmField">
          <span>Username, email or phone</span>
          <span className="pheakkornyMbmInputIcon">
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
        <button className="pheakkornyMbmBtn pheakkornyMbmBtnPrimary pheakkornyMbmBtnLg pheakkornyMbmBtnBlock" disabled={busy}>
          {busy ? 'Sending…' : 'Send code'}
        </button>
      </form>
      <AuthFooter>
        Remembered it? <Link to="/login">Back to log in</Link> · <Link to="/forgot-username">Forgot username?</Link>
      </AuthFooter>
    </AuthLayout>
  );
}
