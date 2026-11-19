import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, UserRound } from 'lucide-react';
import { Alert } from '@component/modals/alert-banner/ts/Alert';
import { VerifyContactStep } from '@component/card/verify-contact-step/ts/VerifyContactStep';
import { useAuth } from '@context/auth-provider/ts/AuthContext';
import { AuthFooter, AuthLayout } from '@layout/outlet/auth-outlet/ts/AuthLayout';
import { errorMessage } from '@api/ApiService';
import type { MfaChallenge, VerificationChallenge } from '@type/type-model/ts/Model.type';
import { MfaStep } from '@page/auth-services/authentication/login/ts/private/MfaStep';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: string; notice?: string; identifier?: string } | null;
  const [identifier, setIdentifier] = useState(state?.identifier ?? '');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [verify, setVerify] = useState<VerificationChallenge | null>(null);
  const [mfa, setMfa] = useState<MfaChallenge | null>(null);
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
      const next = await login(identifier.trim(), password);
      if (!next) done();
      else if ('verificationRequired' in next) setVerify(next);
      else setMfa(next);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (mfa) {
    return <MfaStep challenge={mfa} onBack={() => setMfa(null)} onDone={done} />;
  }
  if (verify) {
    return (
      <VerifyContactStep
        challenge={verify}
        title="Confirm your account"
        onBack={() => setVerify(null)}
        onDone={() => done()}
        onMfa={(m) => {
          setVerify(null);
          setMfa(m);
        }}
      />
    );
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to manage your monthly budget.">
      <form className="pheakkornyMbmForm" onSubmit={onSubmit}>
        {state?.notice && !error && <Alert tone="success">{state.notice}</Alert>}
        {error && <Alert>{error}</Alert>}
        <div className="pheakkornyMbmField">
          <span className="pheakkornyMbmFieldLabelRow">
            <label htmlFor="login-identifier" className="pheakkornyMbmFieldLabel">
              Username, email or phone
            </label>
            <Link to="/forgot-username" className="pheakkornyMbmSmall">
              Forgot username?
            </Link>
          </span>
          <span className="pheakkornyMbmInputIcon">
            <UserRound size={16} />
            <input
              id="login-identifier"
              autoComplete="username"
              required
              autoFocus
              autoCapitalize="none"
              spellCheck={false}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </span>
        </div>
        <div className="pheakkornyMbmField">
          <span className="pheakkornyMbmFieldLabelRow">
            <label htmlFor="login-password" className="pheakkornyMbmFieldLabel">
              Password
            </label>
            <Link to="/forgot-password" className="pheakkornyMbmSmall">
              Forgot password?
            </Link>
          </span>
          <span className="pheakkornyMbmInputIcon">
            <Lock size={16} />
            <input
              id="login-password"
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="pheakkornyMbmIconBtn pheakkornyMbmIconBtnSm pheakkornyMbmInputIconEnd"
              aria-label={show ? 'Hide password' : 'Show password'}
              onClick={() => setShow((s) => !s)}
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </span>
        </div>
        <button className="pheakkornyMbmBtn pheakkornyMbmBtnPrimary pheakkornyMbmBtnLg pheakkornyMbmBtnBlock" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <AuthFooter>
        New here? <Link to="/register">Create an account</Link>
      </AuthFooter>
    </AuthLayout>
  );
}
