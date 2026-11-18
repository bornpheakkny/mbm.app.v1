import { useState, type FormEvent } from 'react';
import { UserRound } from 'lucide-react';
import { Alert } from '@/components/Alert';
import { ChangeEmailModal } from '@/components/ChangeEmailModal';
import { CURRENCIES } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { authService, errorMessage } from '@/services';

export function ProfileCard() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [currency, setCurrency] = useState(user?.currency ?? 'USD');
  const [msg, setMsg] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const dirty = name.trim() !== user?.name || currency !== user?.currency;

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
      <div className="card__title">
        <h2>
          <span className="card__icon">
            <UserRound size={17} />
          </span>
          Profile
        </h2>
      </div>
      <form className="form" onSubmit={onSubmit}>
        {msg && (
          <Alert tone={msg.tone} onClose={() => setMsg(null)}>
            {msg.text}
          </Alert>
        )}
        <label className="field">
          <span>Name</span>
          <input required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <div className="field">
          <span className="field__label">Email</span>
          <div className="input-with-action">
            <input value={user?.email ?? ''} disabled aria-label="Email" />
            <button type="button" className="btn btn--secondary" onClick={() => setChangingEmail(true)}>
              Change
            </button>
          </div>
          {user?.pendingEmail && (
            <span className="field__hint">
              Waiting for you to confirm <strong>{user.pendingEmail}</strong> — check that inbox.
            </span>
          )}
        </div>
        <label className="field">
          <span>Currency</span>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <span className="field__hint">Used to show amounts across the app.</span>
        </label>
        <div>
          <button className="btn btn--primary" disabled={busy || !dirty}>
            {busy ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </form>
      {changingEmail && (
        <ChangeEmailModal
          onClose={() => setChangingEmail(false)}
          onSent={(email) => setMsg({ tone: 'success', text: `Confirmation link sent to ${email}.` })}
        />
      )}
    </section>
  );
}
