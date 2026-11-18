import { useState, type FormEvent } from 'react';
import { Smartphone } from 'lucide-react';
import { Alert } from '@/components/Alert';
import { Modal } from '@/components/Modal';
import { useAsync } from '@/hooks/useAsync';
import { errorMessage, mfaService } from '@/services';
import type { TotpSetup, User } from '@/types';

/** Scan QR → enter first code + password → authenticator method turned on */
export function TotpSetupDialog({ onClose, onEnabled }: { onClose: () => void; onEnabled: (u: User, codes: string[]) => void }) {
  const setup = useAsync<TotpSetup>(() => mfaService.totpSetup(), []);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await mfaService.totpEnable(code, password);
      onEnabled(res.user, res.recoveryCodes);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const secret = setup.data?.secret.match(/.{1,4}/g)?.join(' ');

  return (
    <Modal title="Set up authenticator app" description="Takes about a minute." icon={Smartphone} onClose={onClose}>
      <form className="form" onSubmit={onSubmit}>
        {(error || setup.error) && <Alert>{error ?? setup.error}</Alert>}
        <ol className="steps">
          <li>
            <span className="steps__num">1</span>
            <div>Open your authenticator app and add a new account.</div>
          </li>
          <li>
            <span className="steps__num">2</span>
            <div>
              Scan this QR code, or type the key.
              <div className="qr">
                {setup.data ? (
                  <img src={setup.data.qrDataUrl} alt="QR code for your authenticator app" width={176} height={176} />
                ) : (
                  <span className="muted small">Loading…</span>
                )}
              </div>
              {secret && <code className="secret">{secret}</code>}
            </div>
          </li>
          <li>
            <span className="steps__num">3</span>
            <div>Enter the 6-digit code the app shows, and your password.</div>
          </li>
        </ol>
        <div className="form__row">
          <label className="field">
            <span>Code from app</span>
            <input
              className="code-input"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
          </label>
          <label className="field">
            <span>Your password</span>
            <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
        </div>
        <div className="modal__foot">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn--primary" disabled={busy || code.length !== 6 || !setup.data}>
            {busy ? 'Checking…' : 'Turn on'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
