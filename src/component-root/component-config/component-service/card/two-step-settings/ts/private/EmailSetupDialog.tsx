import { useState, type FormEvent } from 'react';
import { Mail } from 'lucide-react';
import { Alert } from '@component/modals/alert-banner/ts/Alert';
import { Modal, ModalFooter } from '@component/modals/modal/ts/Modal';
import { errorMessage, mfaService } from '@api/ApiService';
import type { User } from '@type/type-model/ts/Model.type';

/** Send a test code → enter it + password → email method turned on */
export function EmailSetupDialog({
  email,
  onClose,
  onEnabled,
}: {
  email: string;
  onClose: () => void;
  onEnabled: (u: User, codes: string[]) => void;
}) {
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function send() {
    setBusy(true);
    setError(null);
    try {
      await mfaService.emailSetup();
      setSent(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await mfaService.emailEnable(code, password);
      onEnabled(res.user, res.recoveryCodes);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title="Set up email codes"
      description={
        <>
          At each login we'll email a 6-digit code to <strong>{email}</strong>.
        </>
      }
      icon={Mail}
      onClose={onClose}
    >
      <form className="pheakkornyMbmForm" onSubmit={onSubmit}>
        {error && <Alert>{error}</Alert>}
        {!sent ? (
          <>
            <p className="pheakkornyMbmSmall pheakkornyMbmMuted">First, let's check you receive our emails.</p>
            <ModalFooter>
              <button type="button" className="pheakkornyMbmBtn pheakkornyMbmBtnSecondary" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="pheakkornyMbmBtn pheakkornyMbmBtnPrimary" onClick={send} disabled={busy}>
                {busy ? 'Sending…' : 'Send code'}
              </button>
            </ModalFooter>
          </>
        ) : (
          <>
            <Alert tone="info">Code sent — it expires in 10 minutes.</Alert>
            <div className="pheakkornyMbmFormRow">
              <label className="pheakkornyMbmField">
                <span>Code from email</span>
                <input
                  className="pheakkornyMbmCodeInput"
                  required
                  autoFocus
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                />
              </label>
              <label className="pheakkornyMbmField">
                <span>Your password</span>
                <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </label>
            </div>
            <ModalFooter>
              <button type="button" className="pheakkornyMbmLink pheakkornyMbmLinkMuted" onClick={send} disabled={busy}>
                Resend code
              </button>
              <button type="button" className="pheakkornyMbmBtn pheakkornyMbmBtnSecondary" onClick={onClose}>
                Cancel
              </button>
              <button className="pheakkornyMbmBtn pheakkornyMbmBtnPrimary" disabled={busy || code.length !== 6}>
                {busy ? 'Checking…' : 'Turn on'}
              </button>
            </ModalFooter>
          </>
        )}
      </form>
    </Modal>
  );
}
