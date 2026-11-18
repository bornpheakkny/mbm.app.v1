import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/layouts/AuthLayout';
import { authService, errorMessage } from '@/services';
import type { MfaChallenge } from '@/types';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: string; notice?: string } | null;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [challenge, setChallenge] = useState<MfaChallenge | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const done = (recoveryCodesLeft?: number) => {
    // Signed in with a backup code → send them to settings to see how many are left
    if (recoveryCodesLeft !== undefined) navigate('/account', { replace: true, state: { recoveryCodesLeft } });
    else navigate(state?.from ?? '/', { replace: true });
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const next = await login(email, password);
      if (next) setChallenge(next);
      else done();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (challenge) {
    return <MfaStep challenge={challenge} onBack={() => setChallenge(null)} onDone={done} />;
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to manage your monthly budget.">
      <form className="form" onSubmit={onSubmit}>
        {state?.notice && !error && <Alert tone="success">{state.notice}</Alert>}
        {error && <Alert>{error}</Alert>}
        <label className="field">
          <span>Email</span>
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label-row">
            Password
            <Link to="/forgot-password" className="small">
              Forgot password?
            </Link>
          </span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button className="btn btn--primary btn--block" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="auth__switch">
        No account yet? <Link to="/register">Create one</Link>
      </p>
    </AuthLayout>
  );
}

/** Second step: authenticator / emailed code, or a backup code */
function MfaStep({
  challenge,
  onBack,
  onDone,
}: {
  challenge: MfaChallenge;
  onBack: () => void;
  onDone: (recoveryCodesLeft?: number) => void;
}) {
  const { completeMfa } = useAuth();
  const [mfaToken, setMfaToken] = useState(challenge.mfaToken);
  const [useBackup, setUseBackup] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isEmail = challenge.method === 'EMAIL';
  const subtitle = useBackup
    ? 'Enter one of the backup codes you saved when you turned on two-step verification.'
    : isEmail
      ? `We emailed a 6-digit code to ${challenge.emailHint}.`
      : 'Open your authenticator app and enter the 6-digit code for Budget Manager.';

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      onDone(await completeMfa(mfaToken, code));
    } catch (err) {
      setError(errorMessage(err));
      setCode('');
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setError(null);
    setInfo(null);
    try {
      setMfaToken(await authService.resendLoginCode(mfaToken));
      setInfo(`A new code is on its way to ${challenge.emailHint}.`);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const expired = error?.includes('expired') || error?.includes('start again');

  return (
    <AuthLayout title="Two-step verification" subtitle={subtitle}>
      <form className="form" onSubmit={onSubmit}>
        {error && <Alert>{error}</Alert>}
        {info && <Alert tone="success">{info}</Alert>}
        {expired ? (
          <button type="button" className="btn btn--primary btn--block" onClick={onBack}>
            Back to log in
          </button>
        ) : (
          <>
            <label className="field">
              <span>{useBackup ? 'Backup code' : '6-digit code'}</span>
              <input
                className={useBackup ? 'code-input code-input--backup' : 'code-input'}
                required
                autoFocus
                autoComplete="one-time-code"
                inputMode={useBackup ? 'text' : 'numeric'}
                maxLength={useBackup ? 12 : 6}
                placeholder={useBackup ? 'XXXX-XXXX' : '123456'}
                value={code}
                onChange={(e) => setCode(useBackup ? e.target.value.toUpperCase() : e.target.value.replace(/\D/g, ''))}
              />
            </label>
            <button className="btn btn--primary btn--block" disabled={busy || code.length < 6}>
              {busy ? 'Checking…' : 'Verify'}
            </button>
          </>
        )}
      </form>
      <div className="auth__links">
        {isEmail && !useBackup && !expired && (
          <button type="button" className="link" onClick={resend}>
            Resend code
          </button>
        )}
        {!expired && (
          <button
            type="button"
            className="link"
            onClick={() => {
              setUseBackup((b) => !b);
              setCode('');
              setError(null);
            }}
          >
            {useBackup ? 'Use your verification code' : 'Use a backup code'}
          </button>
        )}
        <button type="button" className="link link--muted" onClick={onBack}>
          Cancel
        </button>
      </div>
    </AuthLayout>
  );
}
