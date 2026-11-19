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
import { ActionMenu } from '@component/modals/action-menu/ts/ActionMenu';
import { Alert } from '@component/modals/alert-banner/ts/Alert';
import { Avatar } from '@component/info/avatar/ts/Avatar';
import { EmptyState } from '@component/fallback/empty-state/ts/EmptyState';
import { PageHeader } from '@component/header/page-header/ts/PageHeader';
import { StatCard } from '@component/card/stat-card/ts/StatCard';
import { useAuth } from '@context/auth-provider/ts/AuthContext';
import { useConfirm } from '@context/confirm-provider/ts/ConfirmContext';
import { useAsync } from '@util/util-hook/use-async/ts/useAsync';
import { useDebouncedValue } from '@util/util-hook/use-debounced-value/ts/useDebouncedValue';
import { adminService, errorMessage } from '@api/ApiService';
import type { AdminUser, Role } from '@type/type-model/ts/Model.type';
import { formatDateTime } from '@util/util-consumption/format/ts/Format';
import { ResetPasswordModal } from '@page/root-services/user/user-directory/ts/private/ResetPasswordModal';
import { UserModal } from '@page/root-services/user/user-directory/ts/private/UserModal';
import { cx } from '@util/util-consumption/class-name/ts/ClassName';
import styles from '../../css/main/UsersPage.module.css';
import { Select } from '@component/input/select-field/ts/Select';

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
    <div className="pheakkornyMbmPage">
      <PageHeader
        eyebrow="Administration"
        title="User accounts"
        description="Each account has its own private budget. Admins manage accounts but can't see anyone's entries."
        actions={
          <button className="pheakkornyMbmBtn pheakkornyMbmBtnPrimary" onClick={() => setEditing({ kind: 'new' })}>
            <UserPlus size={16} /> Add user
          </button>
        }
      />

      <section className="pheakkornyMbmStats">
        <StatCard icon={UsersRound} accent="teal" label="Total accounts" value={stats?.total ?? '—'} />
        <StatCard icon={UserCheck} accent="green" label="Active" value={stats ? stats.total - stats.disabled : '—'} />
        <StatCard icon={UserX} accent="red" label="Disabled" value={stats?.disabled ?? '—'} />
        <StatCard icon={ShieldCheck} accent="violet" label="Admins" value={stats?.admins ?? '—'} />
      </section>

      <div className="pheakkornyMbmToolbar">
        <div className="pheakkornyMbmInputIcon pheakkornyMbmToolbarSearch">
          <Search size={16} />
          <input placeholder="Search name or email…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search users" />
        </div>
        <Select
          className="pheakkornyMbmToolbarFilter"
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
          className="pheakkornyMbmToolbarFilter"
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

      <section className="pheakkornyMbmCard pheakkornyMbmCardFlush">
        {list.loading && !list.data ? (
          <EmptyState icon={Users} title="Loading…" />
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title={filtered ? 'No accounts match' : 'No accounts yet'}>
            {filtered && 'Try a different search or filter.'}
          </EmptyState>
        ) : (
          <div className="pheakkornyMbmTableWrap">
            <table className={cx('pheakkornyMbmTable pheakkornyMbmTableStack', styles.pheakkornyMbmUsersPageUsersTable)} style={{ '--stack-cols': 2 } as CSSProperties}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="pheakkornyMbmNum">Entries</th>
                  <th>Last login</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const self = u.id === me?.id;
                  const locked = u.isRoot || self; // can't disable or delete these
                  return (
                    <tr key={u.id} className={u.active ? '' : 'pheakkornyMbmRowMuted'}>
                      <td className="pheakkornyMbmCellTitle">
                        <div className={styles.pheakkornyMbmUsersPageUserCell}>
                          <Avatar name={u.name} />
                          <div className={styles.pheakkornyMbmUsersPageUserCellText}>
                            <div className={styles.pheakkornyMbmUsersPageUserCellName}>
                              {u.name}
                              {self && <span className="pheakkornyMbmPill pheakkornyMbmPillPrimary">You</span>}
                            </div>
                            <div className={styles.pheakkornyMbmUsersPageUserCellEmail}>
                              @{u.username}
                              {u.email ? ` · ${u.email}` : u.phone ? ` · ${u.phone}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td data-label="Role">
                        <span className={`pheakkornyMbmPill ${u.role === 'ADMIN' ? 'pill--violet' : ''}`}>
                          {u.isRoot ? 'Root admin' : u.role === 'ADMIN' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td data-label="Status">
                        <div className="pheakkornyMbmPillStack">
                          <span className={`pheakkornyMbmPill ${u.active ? 'pill--success' : 'pill--danger'}`}>{u.active ? 'Active' : 'Disabled'}</span>
                          {!u.emailVerified && <span className="pheakkornyMbmPill pheakkornyMbmPillWarning">Unverified</span>}
                          {u.mfaMethod && (
                            <span className="pheakkornyMbmPill pheakkornyMbmPillPrimary" title="Two-step verification">
                              <ShieldCheck /> 2FA
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="pheakkornyMbmNum" data-label="Entries">
                        {u.transactionCount}
                      </td>
                      <td className="pheakkornyMbmMuted pheakkornyMbmNowrap" data-label="Last login">
                        {formatDateTime(u.lastLoginAt)}
                      </td>
                      <td className={cx('pheakkornyMbmCellActions', styles.pheakkornyMbmUsersPageUsersTableActions)}>
                        <div className="pheakkornyMbmRowActions">
                          <button className="pheakkornyMbmIconBtn pheakkornyMbmIconBtnSm" aria-label={`Edit ${u.name}`} title="Edit" onClick={() => setEditing({ kind: 'edit', user: u })}>
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
