import { useState, type CSSProperties } from 'react';
import {
  CircleDashed,
  KeyRound,
  Pencil,
  Search,
  ShieldCheck,
  ShieldOff,
  Trash2,
  UserCheck,
  UserPlus,
  UserRound,
  UserX,
  Users,
  UsersRound,
} from 'lucide-react';
import { ActionMenu } from '@/components/ActionMenu';
import { Alert } from '@/components/Alert';
import { Avatar } from '@/components/Avatar';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { useAuth } from '@/context/AuthContext';
import { useConfirm } from '@/context/ConfirmContext';
import { useAsync } from '@/hooks/useAsync';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { adminService, errorMessage } from '@/services';
import type { AdminUser, Role } from '@/types';
import { formatDateTime } from '@/utils/format';
import { ResetPasswordModal } from './ResetPasswordModal';
import { UserModal } from './UserModal';
import { cx } from '@/utils/cx';
import styles from './UsersPage.module.css';
import { Select } from '@/components/Select';

type Editing = { kind: 'new' } | { kind: 'edit'; user: AdminUser } | { kind: 'password'; user: AdminUser };

/** Admin: manage every account (each has its own private budget) */
export function UsersPage() {
  const { user: me } = useAuth();
  const confirm = useConfirm();
  const [q, setQ] = useState('');
  const search = useDebouncedValue(q.trim());
  const [role, setRole] = useState<Role | ''>('');
  const [status, setStatus] = useState<'active' | 'disabled' | ''>('');
  const list = useAsync(
    () => adminService.listUsers({ q: search || undefined, role: role || undefined, status: status || undefined }),
    [search, role, status],
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

  async function toggleActive(u: AdminUser) {
    if (u.active) {
      const ok = await confirm({
        title: `Disable ${u.name}?`,
        message: "They'll be signed out and can't log in until you enable the account again. Their data is kept.",
        confirmLabel: 'Disable account',
        danger: true,
      });
      if (!ok) return;
    }
    await run(() => adminService.updateUser(u.id, { active: !u.active }), `${u.name} was ${u.active ? 'disabled' : 'enabled'}.`);
  }

  async function resetMfa(u: AdminUser) {
    const ok = await confirm({
      title: `Turn off two-step verification for ${u.name}?`,
      message: "Only do this if they lost their phone and backup codes and you've confirmed who they are. They can turn it on again in My account.",
      confirmLabel: 'Turn off 2FA',
      danger: true,
    });
    if (ok) await run(() => adminService.resetMfa(u.id), `Two-step verification for ${u.name} was turned off.`);
  }

  async function remove(u: AdminUser) {
    const ok = await confirm({
      title: `Delete ${u.name}?`,
      message: (
        <>
          This permanently deletes <strong>@{u.username}</strong> and all of its budgets, categories and{' '}
          {u.transactionCount} {u.transactionCount === 1 ? 'entry' : 'entries'}. This can't be undone.
        </>
      ),
      confirmLabel: 'Delete account',
      danger: true,
    });
    if (ok) await run(() => adminService.deleteUser(u.id), `${u.name} was deleted.`);
  }

  const stats = list.data?.stats;
  const users = list.data?.users ?? [];
  const filtered = Boolean(search || role || status);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Administration"
        title="User accounts"
        description="Each account has its own private budget. Admins manage accounts but can't see anyone's entries."
        actions={
          <button className="btn btn--primary" onClick={() => setEditing({ kind: 'new' })}>
            <UserPlus size={16} /> Add user
          </button>
        }
      />

      <section className="stats">
        <StatCard icon={UsersRound} accent="teal" label="Total accounts" value={stats?.total ?? '—'} />
        <StatCard icon={UserCheck} accent="green" label="Active" value={stats ? stats.total - stats.disabled : '—'} />
        <StatCard icon={UserX} accent="red" label="Disabled" value={stats?.disabled ?? '—'} />
        <StatCard icon={ShieldCheck} accent="violet" label="Admins" value={stats?.admins ?? '—'} />
      </section>

      <div className="toolbar">
        <div className="input-icon toolbar__search">
          <Search size={16} />
          <input placeholder="Search name or email…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search users" />
        </div>
        <Select
          className="toolbar__filter"
          aria-label="Role"
          value={role}
          onChange={setRole}
          options={[
            { value: '', label: 'All roles', icon: Users },
            { value: 'USER', label: 'Users', icon: UserRound },
            { value: 'ADMIN', label: 'Admins', icon: ShieldCheck },
          ]}
        />
        <Select
          className="toolbar__filter"
          aria-label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: '', label: 'Any status', icon: CircleDashed },
            { value: 'active', label: 'Active', icon: UserCheck },
            { value: 'disabled', label: 'Disabled', icon: UserX },
          ]}
        />
      </div>

      {(error || list.error) && <Alert onClose={error ? () => setError(null) : undefined}>{error ?? list.error}</Alert>}
      {notice && (
        <Alert tone="success" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      <section className="card card--flush">
        {list.loading && !list.data ? (
          <EmptyState icon={Users} title="Loading…" />
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title={filtered ? 'No accounts match' : 'No accounts yet'}>
            {filtered && 'Try a different search or filter.'}
          </EmptyState>
        ) : (
          <div className="table-wrap">
            <table className={cx('table table--stack', styles.usersTable)} style={{ '--stack-cols': 2 } as CSSProperties}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="num">Entries</th>
                  <th>Last login</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const self = u.id === me?.id;
                  const locked = u.isRoot || self; // can't disable or delete these
                  return (
                    <tr key={u.id} className={u.active ? '' : 'row--muted'}>
                      <td className="cell--title">
                        <div className={styles.userCell}>
                          <Avatar name={u.name} />
                          <div className={styles.userCellText}>
                            <div className={styles.userCellName}>
                              {u.name}
                              {self && <span className="pill pill--primary">You</span>}
                            </div>
                            <div className={styles.userCellEmail}>
                              @{u.username}
                              {u.email ? ` · ${u.email}` : u.phone ? ` · ${u.phone}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td data-label="Role">
                        <span className={`pill ${u.role === 'ADMIN' ? 'pill--violet' : ''}`}>
                          {u.isRoot ? 'Root admin' : u.role === 'ADMIN' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td data-label="Status">
                        <div className="pill-stack">
                          <span className={`pill ${u.active ? 'pill--success' : 'pill--danger'}`}>{u.active ? 'Active' : 'Disabled'}</span>
                          {!u.emailVerified && <span className="pill pill--warning">Unverified</span>}
                          {u.mfaMethod && (
                            <span className="pill pill--primary" title="Two-step verification">
                              <ShieldCheck /> 2FA
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="num" data-label="Entries">
                        {u.transactionCount}
                      </td>
                      <td className="muted nowrap" data-label="Last login">
                        {formatDateTime(u.lastLoginAt)}
                      </td>
                      <td className={cx('cell--actions', styles.usersTableActions)}>
                        <div className="row-actions">
                          <button className="icon-btn icon-btn--sm" aria-label={`Edit ${u.name}`} title="Edit" onClick={() => setEditing({ kind: 'edit', user: u })}>
                            <Pencil size={16} />
                          </button>
                          <ActionMenu
                            label={`More actions for ${u.name}`}
                            items={[
                              { label: 'Reset password', icon: KeyRound, onSelect: () => setEditing({ kind: 'password', user: u }), hidden: u.isRoot && !self },
                              { label: 'Reset 2FA', icon: ShieldOff, onSelect: () => resetMfa(u), hidden: !u.mfaMethod || (u.isRoot && !self) },
                              { label: u.active ? 'Disable account' : 'Enable account', icon: u.active ? UserX : UserCheck, onSelect: () => toggleActive(u), hidden: locked },
                              { label: 'Delete account', icon: Trash2, onSelect: () => remove(u), danger: true, hidden: locked },
                            ]}
                          />
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
        <ResetPasswordModal
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
