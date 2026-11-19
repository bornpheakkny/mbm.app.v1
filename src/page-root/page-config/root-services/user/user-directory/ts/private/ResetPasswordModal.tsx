import { useState, type FormEvent } from 'react';
import { KeyRound } from 'lucide-react';
import { Alert } from '@component/modals/alert-banner/ts/Alert';
import { Modal, ModalFooter } from '@component/modals/modal/ts/Modal';
import { adminService, errorMessage } from '@api/ApiService';
import type { AdminUser } from '@type/type-model/ts/Model.type';

/** Admin: set a new password for a user (signs them out everywhere) */
export function ResetPasswordModal({ user, onClose, onDone }: { user: AdminUser; onClose: () => void; onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await adminService.resetPassword(user.id, password);
      onDone();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title={`Reset password for ${user.name}`}
      description={`They'll be signed out on every device. They can also reset it themselves with "Forgot password?".`}
      icon={KeyRound}
      size="sm"
      onClose={onClose}
    >
      <form className="pheakkornyMbmForm" onSubmit={onSubmit}>
        {error && <Alert>{error}</Alert>}
        <label className="pheakkornyMbmField">
          <span>New password</span>
          <input type="text" required minLength={8} autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus placeholder="At least 8 characters" />
          <span className="pheakkornyMbmFieldHint">Share it with @{user.username}.</span>
        </label>
        <ModalFooter>
          <button type="button" className="pheakkornyMbmBtn pheakkornyMbmBtnSecondary" onClick={onClose}>
            Cancel
          </button>
          <button className="pheakkornyMbmBtn pheakkornyMbmBtnPrimary" disabled={busy}>
            {busy ? 'Saving…' : 'Reset password'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
