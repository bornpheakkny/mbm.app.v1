import { useState, type FormEvent } from 'react';
import { Alert, Modal } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { authService, errorMessage } from '@/services';

/** Change (or correct a mistyped) email. The new address must be confirmed from its inbox. */
export function ChangeEmailModal({ onClose, onSent }: { onClose: () => void; onSent?: (email: string) => void }) {
  const { user, setUser } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const updated = await authService.changeEmail(newEmail.trim(), password);
      setUser(updated);
      onSent?.(updated.pendingEmail ?? newEmail);
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={user?.emailVerified ? 'Change email' : 'Fix your email address'} onClose={onClose}>
      <form className="form" onSubmit={onSubmit}>
        {error && <Alert>{error}</Alert>}
        <p className="small muted">
          Current email: <strong>{user?.email}</strong>. We'll send a link to the new address. Your email only changes after
          you click it.
        </p>
        <label className="field">
          <span>New email</span>
          <input type="email" required autoFocus autoComplete="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
        </label>
        <label className="field">
          <span>Your password</span>
          <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <div className="modal__foot">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn--primary" disabled={busy}>
            {busy ? 'Sending…' : 'Send confirmation link'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
