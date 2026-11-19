import { useState, type FormEvent } from 'react';
import { Smartphone } from 'lucide-react';
import { Alert } from '@/components/Alert';
import { Modal, ModalFooter } from '@/components/Modal';
import { useAuth } from '@/context/AuthContext';
import { authService, errorMessage } from '@/services';

/** Add or change the phone number: 1) number + password → SMS code, 2) enter the code */
export function PhoneModal({ onClose, onDone }: { onClose: () => void; onDone: (msg: string) => void }) {
  const { user, setUser } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [hint, setHint] = useState<string | null>(user?.pendingPhone ? user.pendingPhone : null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await authService.addPhone(phone.trim(), password);
      setUser(res.user);
      setHint(res.hint);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const updated = await authService.verifyPhone(code);
      setUser(updated);
      onDone(`Phone number ${updated.phone} added. You can now log in and recover your account with it.`);
    } catch (err) {
      setError(errorMessage(err));
      setCode('');
    } finally {
      setBusy(false);
    }
  }

  async function startOver() {
    setError(null);
    try {
      setUser(await authService.cancelPendingPhone());
    } catch {
      // nothing pending — fine
    }
    setHint(null);
    setCode('');
  }

  return (
    <Modal
      title={user?.phone ? 'Change phone number' : 'Add a phone number'}
      description="We'll text a 6-digit code to confirm it. You can then log in and reset your password with it."
      icon={Smartphone}
      onClose={onClose}
    >
      {hint ? (
        <form className="form" onSubmit={verify}>
          {error && <Alert>{error}</Alert>}
          <Alert tone="info">Code sent to {hint}. It expires in 15 minutes.</Alert>
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
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
          </label>
          <ModalFooter
            start={
              <button type="button" className="link link--muted" onClick={startOver}>
                Use a different number
              </button>
            }
          >
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn--primary" disabled={busy || code.length !== 6}>
              {busy ? 'Checking…' : 'Verify'}
            </button>
          </ModalFooter>
        </form>
      ) : (
        <form className="form" onSubmit={sendCode}>
          {error && <Alert>{error}</Alert>}
          <label className="field">
            <span>Phone number</span>
            <input type="tel" required autoFocus autoComplete="tel" placeholder="012 345 678 or +855 12 345 678" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <span className="field__hint">Cambodian numbers can start with 0; others need the +country code.</span>
          </label>
          <label className="field">
            <span>Your password</span>
            <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <ModalFooter>
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn--primary" disabled={busy}>
              {busy ? 'Sending…' : 'Send code'}
            </button>
          </ModalFooter>
        </form>
      )}
    </Modal>
  );
}
