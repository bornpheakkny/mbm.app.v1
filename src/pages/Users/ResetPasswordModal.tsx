import { useState, type FormEvent } from 'react';
import { KeyRound } from 'lucide-react';
import { Alert } from '@/components/Alert';
import { Modal, ModalFooter } from '@/components/Modal';
import { adminService, errorMessage } from '@/services';
import type { AdminUser } from '@/types';

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
      <form className="form" onSubmit={onSubmit}>
        {error && <Alert>{error}</Alert>}
        <label className="field">
          <span>New password</span>
          <input type="text" required minLength={8} autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus placeholder="At least 8 characters" />
          <span className="field__hint">Share it with {user.email}.</span>
        </label>
        <ModalFooter>
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn--primary" disabled={busy}>
            {busy ? 'Saving…' : 'Reset password'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
