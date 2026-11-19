import { useState, type FormEvent } from 'react';
import { KeyRound, ShieldOff } from 'lucide-react';
import { Alert } from '@component/modals/alert-banner/ts/Alert';
import { Modal, ModalFooter } from '@component/modals/modal/ts/Modal';
import { errorMessage } from '@api/ApiService';

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
      <form className="pheakkornyMbmForm" onSubmit={onSubmit}>
        {error && <Alert>{error}</Alert>}
        <label className="pheakkornyMbmField">
          <span>Confirm with your password</span>
          <input type="password" required autoFocus autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <ModalFooter>
          <button type="button" className="pheakkornyMbmBtn pheakkornyMbmBtnSecondary" onClick={onClose}>
            Cancel
          </button>
          <button className={`pheakkornyMbmBtn ${danger ? 'btn--danger' : 'btn--primary'}`} disabled={busy}>
            {busy ? 'Please wait…' : action}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
