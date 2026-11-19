import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AtSign } from 'lucide-react';
import { Alert } from '@component/modals/alert-banner/ts/Alert';
import { AuthFooter, AuthLayout } from '@layout/outlet/auth-outlet/ts/AuthLayout';
import { authService, errorMessage } from '@api/ApiService';

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
        <div className="pheakkornyMbmForm">
          <Alert tone="success">{sent}</Alert>
          <Link to="/login" className="pheakkornyMbmBtn pheakkornyMbmBtnPrimary pheakkornyMbmBtnLg pheakkornyMbmBtnBlock">
            Back to log in
          </Link>
          <button type="button" className="pheakkornyMbmBtn pheakkornyMbmBtnSecondary pheakkornyMbmBtnBlock" onClick={() => setSent(null)}>
            Try a different email or phone
          </button>
        </div>
      ) : (
        <form className="pheakkornyMbmForm" onSubmit={onSubmit}>
          {error && <Alert>{error}</Alert>}
          <label className="pheakkornyMbmField">
            <span>Email or phone number</span>
            <span className="pheakkornyMbmInputIcon">
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
          <button className="pheakkornyMbmBtn pheakkornyMbmBtnPrimary pheakkornyMbmBtnLg pheakkornyMbmBtnBlock" disabled={busy}>
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
