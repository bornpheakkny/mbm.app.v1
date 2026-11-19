import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AtSign } from 'lucide-react';
import { Alert } from '@/components/Alert';
import { AuthFooter, AuthLayout } from '@/layouts/AuthLayout';
import { authService, errorMessage } from '@/services';

/** Sends the username to the email or phone on the account */
export function ForgotUsernamePage() {
  const [contact, setContact] = useState('');
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      setSent(await authService.forgotUsername(contact.trim()));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Forgot your username?" subtitle="Enter the email or phone number on your account and we'll send your username there.">
      {sent ? (
        <div className="form">
          <Alert tone="success">{sent}</Alert>
          <Link to="/login" className="btn btn--primary btn--lg btn--block">
            Back to log in
          </Link>
          <button type="button" className="btn btn--secondary btn--block" onClick={() => setSent(null)}>
            Try a different email or phone
          </button>
        </div>
      ) : (
        <form className="form" onSubmit={onSubmit}>
          {error && <Alert>{error}</Alert>}
          <label className="field">
            <span>Email or phone number</span>
            <span className="input-icon">
              <AtSign size={16} />
              <input
                required
                autoFocus
                autoComplete="email"
                autoCapitalize="none"
                placeholder="you@example.com or 012 345 678"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </span>
          </label>
          <button className="btn btn--primary btn--lg btn--block" disabled={busy}>
            {busy ? 'Sending…' : 'Send my username'}
          </button>
        </form>
      )}
      <AuthFooter>
        Remembered it? <Link to="/login">Log in</Link>
      </AuthFooter>
    </AuthLayout>
  );
}
