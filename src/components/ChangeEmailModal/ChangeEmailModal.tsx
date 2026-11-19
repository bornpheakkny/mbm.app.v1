import { useState, type FormEvent } from 'react';
import { Mail } from 'lucide-react';
import { Alert } from '@/components/Alert';
import { Modal, ModalFooter } from '@/components/Modal';
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
    <Modal
      title={!user?.email ? 'Add an email' : user.emailVerified ? 'Change email' : 'Fix your email address'}
      description={
        <>
          {user?.email ? (
            <>
              Currently <strong>{user.email}</strong>. Your email only changes after you click the link we send to the new
              address.
            </>
          ) : (
            'We will send a confirmation link to the address.'
          )}
        </>
      }
      icon={Mail}
      onClose={onClose}
    >
      <form className="form" onSubmit={onSubmit}>
        {error && <Alert>{error}</Alert>}
        <label className="field">
          <span>New email</span>
          <input type="email" required autoFocus autoComplete="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
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
            {busy ? 'Sending…' : 'Send confirmation link'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
