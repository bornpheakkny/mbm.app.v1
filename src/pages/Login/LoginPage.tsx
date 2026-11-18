import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Alert } from '@/components/Alert';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/layouts/AuthLayout';
import { errorMessage } from '@/services';
import type { MfaChallenge } from '@/types';
import { MfaStep } from './MfaStep';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: string; notice?: string } | null;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
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
          <span className="input-icon">
            <Mail size={16} />
            <input type="email" autoComplete="email" required autoFocus placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </span>
        </label>
        <div className="field">
          <span className="field__label-row">
            <label htmlFor="login-password" className="field__label">
              Password
            </label>
            <Link to="/forgot-password" className="small">
              Forgot password?
            </Link>
          </span>
          <span className="input-icon">
            <Lock size={16} />
            <input
              id="login-password"
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className="icon-btn icon-btn--sm input-icon__end" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((s) => !s)}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </span>
        </div>
        <button className="btn btn--primary btn--lg btn--block" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="auth__switch">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
