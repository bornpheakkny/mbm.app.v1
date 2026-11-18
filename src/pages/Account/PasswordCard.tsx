import { useState, type FormEvent } from 'react';
import { LockKeyhole } from 'lucide-react';
import { Alert } from '@/components/Alert';
import { useAuth } from '@/context/AuthContext';
import { authService, errorMessage } from '@/services';

export function PasswordCard() {
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
      <div className="card__title">
        <h2>
          <span className="card__icon">
            <LockKeyhole size={17} />
          </span>
          Change password
        </h2>
      </div>
      <form className="form" onSubmit={onSubmit}>
        {msg && (
          <Alert tone={msg.tone} onClose={() => setMsg(null)}>
            {msg.text}
          </Alert>
        )}
        <label className="field">
          <span>Current password</span>
          <input type="password" required autoComplete="current-password" value={form.current} onChange={set('current')} />
        </label>
        <label className="field">
          <span>New password</span>
          <input type="password" required minLength={8} autoComplete="new-password" value={form.next} onChange={set('next')} />
          <span className="field__hint">At least 8 characters.</span>
        </label>
        <label className="field">
          <span>Confirm new password</span>
          <input type="password" required autoComplete="new-password" value={form.confirm} onChange={set('confirm')} />
        </label>
        <div>
          <button className="btn btn--primary" disabled={busy}>
            {busy ? 'Saving…' : 'Change password'}
          </button>
        </div>
      </form>
    </section>
  );
}
