import { useState, type FormEvent } from 'react';
import { ShieldCheck, UserPlus, UserRound, UserRoundPen } from 'lucide-react';
import { Alert } from '@/components/Alert';
import { Modal, ModalFooter } from '@/components/Modal';
import { CURRENCY_OPTIONS } from '@/constants';
import { adminService, errorMessage } from '@/services';
import type { AdminUser, Role } from '@/types';
import { Select } from '@/components/Select';

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
    username: user?.username ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    currency: user?.currency ?? 'USD',
    role: user?.role ?? ('USER' as Role),
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const roleLocked = Boolean(user?.isRoot || isSelf);
  const emailChanged = Boolean(user && form.email.trim() && form.email.trim().toLowerCase() !== user.email);
  const phoneChanged = Boolean(user && form.phone.trim() && form.phone.trim() !== user.phone);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (!form.email.trim() && !form.phone.trim()) throw new Error('Enter an email or a phone number');
      const body = {
        name: form.name.trim(),
        username: form.username.trim().toLowerCase(),
        ...(form.email.trim() && { email: form.email.trim() }),
        ...(form.phone.trim() && { phone: form.phone.trim() }),
        currency: form.currency,
        role: form.role,
      };
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
      description={
        user ? undefined : 'They get their own private budget. They confirm their email or phone with a code at first login.'
      }
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
          <span>Username</span>
          <input
            required
            minLength={3}
            maxLength={30}
            pattern="[a-z][a-z0-9._]{2,29}"
            title="3–30 characters: letters, numbers, . or _ (starts with a letter)"
            autoCapitalize="none"
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.toLowerCase().replace(/\s/g, '') }))}
          />
        </label>
        <div className="form__row">
          <label className="field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={set('email')} disabled={user?.isRoot} placeholder="Optional if phone is set" />
            {user?.isRoot && <span className="field__hint">Set by ADMIN_EMAIL on the server.</span>}
            {emailChanged && <span className="field__hint">They'll need to verify it.</span>}
          </label>
          <label className="field">
            <span>Phone</span>
            <input type="tel" value={form.phone} onChange={set('phone')} placeholder="012 345 678" />
            {phoneChanged && <span className="field__hint">They'll need to verify it.</span>}
          </label>
        </div>
        {!user && (
          <label className="field">
            <span>Temporary password</span>
            <input type="text" required minLength={8} autoComplete="off" value={form.password} onChange={set('password')} placeholder="At least 8 characters" />
            <span className="field__hint">Share it with them; they can change it in My account.</span>
          </label>
        )}
        <div className="form__row">
          <div className="field">
            <label className="field__label" htmlFor="user-role">
              Role
            </label>
            <Select
              id="user-role"
              value={form.role}
              onChange={(role) => setForm((f) => ({ ...f, role }))}
              disabled={roleLocked}
              options={[
                { value: 'USER', label: 'User', icon: UserRound, description: 'Own budget only' },
                { value: 'ADMIN', label: 'Admin', icon: ShieldCheck, description: 'Can manage accounts' },
              ]}
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="user-currency">
              Currency
            </label>
            <Select
              id="user-currency"
              value={form.currency}
              onChange={(currency) => setForm((f) => ({ ...f, currency }))}
              options={CURRENCY_OPTIONS}
            />
          </div>
        </div>
        {form.role === 'ADMIN' && !roleLocked && (
          <Alert tone="info">Admins can add, edit, disable and delete other accounts.</Alert>
        )}
        <ModalFooter>
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn--primary" disabled={busy}>
            {busy ? 'Saving…' : user ? 'Save changes' : 'Create user'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
