import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '@/components/Alert';
import { AuthFooter, AuthLayout } from '@/layouts/AuthLayout';
import { authService, errorMessage } from '@/services';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      setSent(await authService.forgotPassword(email));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Forgot your password?" subtitle="Enter your account email and we'll send you a link to choose a new one.">
      {sent ? (
        <div className="form">
          <Alert tone="success">{sent}</Alert>
          <p className="muted small">
            Check your inbox (and spam folder) for an email from Budget Manager. The link works for 1 hour.
          </p>
          <button type="button" className="btn btn--secondary btn--block" onClick={() => setSent(null)}>
            Use a different email
          </button>
        </div>
      ) : (
        <form className="form" onSubmit={onSubmit}>
          {error && <Alert>{error}</Alert>}
          <label className="field">
            <span>Email</span>
            <input type="email" autoComplete="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <button className="btn btn--primary btn--lg btn--block" disabled={busy}>
            {busy ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
      <AuthFooter>
        Remembered it? <Link to="/login">Back to log in</Link>
      </AuthFooter>
    </AuthLayout>
  );
}
