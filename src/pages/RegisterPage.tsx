import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '@/components/ui';
import { CURRENCIES } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/layouts/AuthLayout';
import { errorMessage } from '@/services';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', currency: 'USD' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setBusy(true);
    setError(null);
    try {
      await register(form.name, form.email, form.password, form.currency);
      navigate('/budget', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Default income and expense categories are set up for you.">
      <form className="form" onSubmit={onSubmit}>
        {error && <Alert>{error}</Alert>}
        <label className="field">
          <span>Name</span>
          <input required autoComplete="name" value={form.name} onChange={set('name')} />
        </label>
        <label className="field">
          <span>Email</span>
          <input type="email" required autoComplete="email" value={form.email} onChange={set('email')} />
        </label>
        <div className="form__row">
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={set('password')}
            />
          </label>
          <label className="field">
            <span>Confirm</span>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={form.confirm}
              onChange={set('confirm')}
            />
          </label>
        </div>
        <label className="field">
          <span>Currency</span>
          <select value={form.currency} onChange={set('currency')}>
            {CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <button className="btn btn--primary btn--block" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="auth__switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
