import { useState, type FormEvent } from 'react';
import { adminService, errorMessage } from '@/services';
import type { AdminUser, Role } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { Alert, Empty, Modal, StatCard } from '@/components/ui';
import { CURRENCIES } from '@/constants';
import { formatDateTime } from '@/utils/format';

type Editing = { kind: 'new' } | { kind: 'edit'; user: AdminUser } | { kind: 'password'; user: AdminUser };

export function UsersPage() {
  const { user: me } = useAuth();
  const [q, setQ] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [status, setStatus] = useState<'active' | 'disabled' | ''>('');
  const list = useAsync(
    () => adminService.listUsers({ q: q || undefined, role: role || undefined, status: status || undefined }),
    [q, role, status],
  );
  const [editing, setEditing] = useState<Editing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function run(fn: () => Promise<unknown>, done?: string) {
    setError(null);
    setNotice(null);
    try {
      await fn();
      await list.reload();
      if (done) setNotice(done);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const toggleActive = (u: AdminUser) =>
    run(
      () => adminService.updateUser(u.id, { active: !u.active }),
      `${u.name} ${u.active ? 'disabled — they can no longer log in' : 'enabled'}.`,
    );

  const resetMfa = (u: AdminUser) => {
    const ok = confirm(
      `Turn off two-step verification for ${u.name}?

Use this only if they lost their phone and backup codes and you've confirmed who they are. They can turn it on again in My account.`,
    );
    if (ok) void run(() => adminService.resetMfa(u.id), `Two-step verification for ${u.name} was turned off.`);
  };

  const remove = (u: AdminUser) => {
    const ok = confirm(
      `Delete ${u.name} (${u.email})?\n\nThis permanently removes the account and all of its budgets, categories and ${u.transactionCount} entries.`,
    );
    if (ok) void run(() => adminService.deleteUser(u.id), `${u.name} was deleted.`);
  };

  const stats = list.data?.stats;
  const users = list.data?.users ?? [];

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1>User accounts</h1>
          <p className="muted">
            Each account has its own private budget. Admins manage accounts but can't see other users' entries.
          </p>
        </div>
        <div className="page__actions">
          <button className="btn btn--primary" onClick={() => setEditing({ kind: 'new' })}>
            + Add user
          </button>
        </div>
      </div>

      {stats && (
        <div className="stats">
          <StatCard label="Total accounts" value={stats.total} />
          <StatCard label="Active" value={stats.total - stats.disabled} tone="good" />
          <StatCard label="Disabled" value={stats.disabled} tone={stats.disabled ? 'bad' : 'default'} />
          <StatCard label="Admins" value={stats.admins} />
        </div>
      )}

      <div className="toolbar">
        <input className="search" placeholder="Search name or email…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={role} onChange={(e) => setRole(e.target.value as Role | '')}>
          <option value="">All roles</option>
          <option value="USER">Users</option>
          <option value="ADMIN">Admins</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'disabled' | '')}>
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {(error || list.error) && <Alert>{error ?? list.error}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}

      <section className="card card--flush">
        {list.loading && !list.data ? (
          <Empty>Loading…</Empty>
        ) : users.length === 0 ? (
          <Empty>No accounts match these filters.</Empty>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="num hide-sm">Entries</th>
                  <th className="hide-sm">Last login</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const self = u.id === me?.id;
                  const locked = u.isRoot || self; // can't disable/delete these
                  return (
                    <tr key={u.id} className={u.active ? '' : 'row--muted'}>
                      <td>
                        <div className="user-cell">
                          <div className="avatar avatar--sm">{u.name.charAt(0).toUpperCase()}</div>
                          <div>
                            <div className="user-cell__name">
                              {u.name}
                              {self && <span className="muted small"> (you)</span>}
                            </div>
                            <div className="muted small">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`pill ${u.role === 'ADMIN' ? 'pill--admin' : ''}`}>
                          {u.isRoot ? 'Root admin' : u.role === 'ADMIN' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td>
                        <div className="pill-stack">
                          <span className={`pill ${u.active ? 'pill--on' : 'pill--off'}`}>
                            {u.active ? 'Active' : 'Disabled'}
                          </span>
                          {!u.emailVerified && <span className="pill pill--warn">Email unverified</span>}
                          {u.mfaMethod && (
                            <span className="pill pill--admin" title="Two-step verification">
                              2FA · {u.mfaMethod === 'TOTP' ? 'app' : 'email'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="num hide-sm">{u.transactionCount}</td>
                      <td className="muted small nowrap hide-sm">{formatDateTime(u.lastLoginAt)}</td>
                      <td>
                        <div className="row-actions">
                          <button className="btn btn--ghost btn--sm" onClick={() => setEditing({ kind: 'edit', user: u })}>
                            Edit
                          </button>
                          {(!u.isRoot || self) && (
                            <button
                              className="btn btn--ghost btn--sm"
                              onClick={() => setEditing({ kind: 'password', user: u })}
                            >
                              Password
                            </button>
                          )}
                          {u.mfaMethod && (!u.isRoot || self) && (
                            <button className="btn btn--ghost btn--sm" onClick={() => resetMfa(u)}>
                              Reset 2FA
                            </button>
                          )}
                          {!locked && (
                            <>
                              <button className="btn btn--ghost btn--sm" onClick={() => toggleActive(u)}>
                                {u.active ? 'Disable' : 'Enable'}
                              </button>
                              <button className="icon-btn icon-btn--danger" aria-label="Delete" onClick={() => remove(u)}>
                                🗑
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing?.kind === 'password' && (
        <PasswordModal
          user={editing.user}
          onClose={() => setEditing(null)}
          onDone={() => {
            setEditing(null);
            setNotice(`Password for ${editing.user.name} was reset.`);
          }}
        />
      )}
      {editing && editing.kind !== 'password' && (
        <UserModal
          user={editing.kind === 'edit' ? editing.user : null}
          isSelf={editing.kind === 'edit' && editing.user.id === me?.id}
          onClose={() => setEditing(null)}
          onSaved={async (msg) => {
            setEditing(null);
            await list.reload();
            setError(null);
            setNotice(msg);
          }}
        />
      )}
    </div>
  );
}

function UserModal({
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
    <Modal title={user ? `Edit ${user.name}` : 'Add user'} onClose={onClose}>
      <form className="form" onSubmit={onSubmit}>
        {error && <Alert>{error}</Alert>}
        <label className="field">
          <span>Name</span>
          <input required maxLength={80} value={form.name} onChange={set('name')} autoFocus />
        </label>
        <label className="field">
          <span>Email</span>
          <input type="email" required value={form.email} onChange={set('email')} disabled={user?.isRoot} />
        </label>
        {!user && (
          <label className="field">
            <span>Temporary password</span>
            <input
              type="text"
              required
              minLength={8}
              autoComplete="off"
              value={form.password}
              onChange={set('password')}
              placeholder="At least 8 characters"
            />
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
          <p className="muted small">Admins can add, edit, disable and delete other accounts.</p>
        )}
        <div className="modal__foot">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
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

function PasswordModal({ user, onClose, onDone }: { user: AdminUser; onClose: () => void; onDone: () => void }) {
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
    <Modal title={`Reset password — ${user.name}`} onClose={onClose}>
      <form className="form" onSubmit={onSubmit}>
        {error && <Alert>{error}</Alert>}
        <p className="muted small">
          Set a new password and share it with {user.email}. They'll be signed out everywhere and can change it on their My
          account page. They can also reset it themselves with "Forgot password?" on the login page.
        </p>
        <label className="field">
          <span>New password</span>
          <input
            type="text"
            required
            minLength={8}
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </label>
        <div className="modal__foot">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn--primary" disabled={busy}>
            {busy ? 'Saving…' : 'Reset password'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
