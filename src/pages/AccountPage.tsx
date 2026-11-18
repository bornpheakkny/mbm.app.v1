import { useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { TwoStepSettings } from '@/components/security/TwoStepSettings';
import { authService, errorMessage } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { Alert } from '@/components/ui';
import { CURRENCIES } from '@/constants';
import { formatDateTime } from '@/utils/format';

export function AccountPage() {
  const { user } = useAuth();
  const location = useLocation();
  const recoveryCodesLeft = (location.state as { recoveryCodesLeft?: number } | null)?.recoveryCodesLeft;
  if (!user) return null;

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1>My account</h1>
          <p className="muted">
            {user.email} · {user.role === 'ADMIN' ? 'Administrator' : 'Member'} since{' '}
            {formatDateTime(user.createdAt).split(',')[0]}
          </p>
        </div>
      </div>
      <div className="grid-2">
        <ProfileCard />
        <PasswordCard />
      </div>
      <TwoStepSettings recoveryCodesLeft={recoveryCodesLeft} />
    </div>
  );
}

function ProfileCard() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [currency, setCurrency] = useState(user?.currency ?? 'USD');
  const [msg, setMsg] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      setUser(await authService.updateMe({ name: name.trim(), currency }));
      setMsg({ tone: 'success', text: 'Profile saved.' });
    } catch (err) {
      setMsg({ tone: 'error', text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card">
      <h2>Profile</h2>
      <form className="form" onSubmit={onSubmit}>
        {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
        <label className="field">
          <span>Name</span>
          <input required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label-row">
            Email
            {user?.emailVerified ? (
              <span className="pill pill--on">Verified</span>
            ) : (
              <span className="pill pill--off">Not verified</span>
            )}
          </span>
          <input value={user?.email ?? ''} disabled />
        </label>
        <label className="field">
          <span>Currency</span>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <button className="btn btn--primary" disabled={busy}>
          {busy ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </section>
  );
}

function PasswordCard() {
  const { setToken } = useAuth();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [msg, setMsg] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.next !== form.confirm) return setMsg({ tone: 'error', text: 'New passwords do not match' });
    setBusy(true);
    setMsg(null);
    try {
      setToken(await authService.changePassword(form.current, form.next));
      setForm({ current: '', next: '', confirm: '' });
      setMsg({ tone: 'success', text: 'Password changed. Other devices have been signed out.' });
    } catch (err) {
      setMsg({ tone: 'error', text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card">
      <h2>Change password</h2>
      <form className="form" onSubmit={onSubmit}>
        {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
        <label className="field">
          <span>Current password</span>
          <input type="password" required autoComplete="current-password" value={form.current} onChange={set('current')} />
        </label>
        <label className="field">
          <span>New password</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.next}
            onChange={set('next')}
          />
        </label>
        <label className="field">
          <span>Confirm new password</span>
          <input type="password" required autoComplete="new-password" value={form.confirm} onChange={set('confirm')} />
        </label>
        <button className="btn btn--primary" disabled={busy}>
          {busy ? 'Saving…' : 'Change password'}
        </button>
      </form>
    </section>
  );
}
