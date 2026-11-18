import { useState, type FormEvent } from 'react';
import { UserPlus, UserRoundPen } from 'lucide-react';
import { Alert } from '@/components/Alert';
import { Modal } from '@/components/Modal';
import { CURRENCIES } from '@/constants';
import { adminService, errorMessage } from '@/services';
import type { AdminUser, Role } from '@/types';

/** Admin: create an account or edit its details and role */
export function UserModal({
  user,
  isSelf,
  onClose,
  onSaved,
}: {
  user: AdminUser | null;
  isSelf: boolean;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    currency: user?.currency ?? 'USD',
    role: user?.role ?? ('USER' as Role),
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const roleLocked = Boolean(user?.isRoot || isSelf);
  const emailChanged = Boolean(user && form.email.trim().toLowerCase() !== user.email);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = { name: form.name.trim(), email: form.email.trim(), currency: form.currency, role: form.role };
      if (user) {
        await adminService.updateUser(user.id, body);
        onSaved(`${body.name} was updated.`);
      } else {
        await adminService.createUser({ ...body, password: form.password });
        onSaved(`${body.name} was created with their own budget.`);
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title={user ? `Edit ${user.name}` : 'Add user'}
      description={user ? undefined : 'They get their own private budget with the default categories.'}
      icon={user ? UserRoundPen : UserPlus}
      onClose={onClose}
    >
      <form className="form" onSubmit={onSubmit}>
        {error && <Alert>{error}</Alert>}
        <label className="field">
          <span>Full name</span>
          <input required maxLength={80} value={form.name} onChange={set('name')} autoFocus />
        </label>
        <label className="field">
          <span>Email</span>
          <input type="email" required value={form.email} onChange={set('email')} disabled={user?.isRoot} />
          {user?.isRoot && <span className="field__hint">The root admin email is set by ADMIN_EMAIL on the server.</span>}
          {emailChanged && <span className="field__hint">They'll need to verify the new address.</span>}
        </label>
        {!user && (
          <label className="field">
            <span>Temporary password</span>
            <input type="text" required minLength={8} autoComplete="off" value={form.password} onChange={set('password')} placeholder="At least 8 characters" />
            <span className="field__hint">Share it with them; they can change it in My account.</span>
          </label>
        )}
        <div className="form__row">
          <label className="field">
            <span>Role</span>
            <select value={form.role} onChange={set('role')} disabled={roleLocked}>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          <label className="field">
            <span>Currency</span>
            <select value={form.currency} onChange={set('currency')}>
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        {form.role === 'ADMIN' && !roleLocked && (
          <Alert tone="info">Admins can add, edit, disable and delete other accounts.</Alert>
        )}
        <div className="modal__foot">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn--primary" disabled={busy}>
            {busy ? 'Saving…' : user ? 'Save changes' : 'Create user'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
