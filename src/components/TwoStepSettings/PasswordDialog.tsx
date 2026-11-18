import { useState, type FormEvent } from 'react';
import { KeyRound, ShieldOff } from 'lucide-react';
import { Alert } from '@/components/Alert';
import { Modal, ModalFooter } from '@/components/Modal';
import { errorMessage } from '@/services';

/** Asks for the current password before a sensitive two-step change */
export function PasswordDialog({
  title,
  description,
  action,
  danger,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  action: string;
  danger?: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onConfirm(password);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Modal
      title={title}
      description={description}
      icon={danger ? ShieldOff : KeyRound}
      tone={danger ? 'danger' : 'default'}
      size="sm"
      onClose={onClose}
    >
      <form className="form" onSubmit={onSubmit}>
        {error && <Alert>{error}</Alert>}
        <label className="field">
          <span>Confirm with your password</span>
          <input type="password" required autoFocus autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <ModalFooter>
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`} disabled={busy}>
            {busy ? 'Please wait…' : action}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
