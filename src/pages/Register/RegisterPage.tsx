import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AtSign, Mail, Phone } from 'lucide-react';
import { Alert } from '@/components/Alert';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Select } from '@/components/Select';
import { VerifyContactStep } from '@/components/VerifyContactStep';
import { CURRENCY_OPTIONS } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { AuthFooter, AuthLayout } from '@/layouts/AuthLayout';
import { errorMessage } from '@/services';
import type { Channel, VerificationChallenge } from '@/types';

const USERNAME_HINT = '3–30 characters: letters, numbers, . or _ (starts with a letter)';

/**
 * Sign up: name, username, email OR phone, password.
 * The account only works after the 6-digit code sent to that email/phone is entered.
 */
export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [via, setVia] = useState<Channel>('email');
  const [form, setForm] = useState({ name: '', username: '', email: '', phone: '', password: '', confirm: '', currency: 'USD' });
  const [challenge, setChallenge] = useState<VerificationChallenge | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: k === 'username' ? e.target.value.toLowerCase().replace(/\s/g, '') : e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setBusy(true);
    setError(null);
    try {
      setChallenge(
        await register({
          name: form.name.trim(),
          username: form.username.trim(),
          ...(via === 'email' ? { email: form.email.trim() } : { phone: form.phone.trim() }),
          password: form.password,
          currency: form.currency,
        }),
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (challenge) {
    return (
      <VerifyContactStep
        challenge={challenge}
        title="Confirm your account"
        onBack={() => setChallenge(null)}
        onDone={() => navigate('/budget', { replace: true })}
        onMfa={() => navigate('/login', { replace: true })}
      />
    );
  }

  return (
    <AuthLayout title="Create your account" subtitle="We'll send a code to your email or phone to confirm it's you.">
      <form className="form" onSubmit={onSubmit}>
        {error && <Alert>{error}</Alert>}
        <label className="field">
          <span>Full name</span>
          <input required autoComplete="name" maxLength={80} value={form.name} onChange={set('name')} />
        </label>
        <label className="field">
          <span>Username</span>
          <span className="input-icon">
            <AtSign size={16} />
            <input
              required
              autoComplete="username"
              minLength={3}
              maxLength={30}
              pattern="[a-z][a-z0-9._]{2,29}"
              title={USERNAME_HINT}
              value={form.username}
              onChange={set('username')}
            />
          </span>
          <span className="field__hint">{USERNAME_HINT}. You'll use it to log in.</span>
        </label>

        <div className="field">
          <span className="field__label">Verify with</span>
          <SegmentedControl
            aria-label="Verify with"
            block
            value={via}
            onChange={setVia}
            options={[
              { value: 'email', label: 'Email', icon: Mail },
              { value: 'sms', label: 'Phone (SMS)', icon: Phone },
            ]}
          />
        </div>
        {via === 'email' ? (
          <label className="field">
            <span>Email</span>
            <span className="input-icon">
              <Mail size={16} />
              <input type="email" required autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
            </span>
          </label>
        ) : (
          <label className="field">
            <span>Phone number</span>
            <span className="input-icon">
              <Phone size={16} />
              <input type="tel" required autoComplete="tel" placeholder="012 345 678 or +855 12 345 678" value={form.phone} onChange={set('phone')} />
            </span>
            <span className="field__hint">Cambodian numbers can start with 0; others need the +country code.</span>
          </label>
        )}

        <div className="form__row">
          <label className="field">
            <span>Password</span>
            <input type="password" required minLength={8} autoComplete="new-password" value={form.password} onChange={set('password')} />
          </label>
          <label className="field">
            <span>Confirm</span>
            <input type="password" required autoComplete="new-password" value={form.confirm} onChange={set('confirm')} />
          </label>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="register-currency">
            Currency
          </label>
          <Select
            id="register-currency"
            value={form.currency}
            onChange={(currency) => setForm((f) => ({ ...f, currency }))}
            options={CURRENCY_OPTIONS}
          />
        </div>
        <button className="btn btn--primary btn--lg btn--block" disabled={busy}>
          {busy ? 'Sending code…' : 'Create account'}
        </button>
      </form>
      <AuthFooter>
        Already have an account? <Link to="/login">Log in</Link>
      </AuthFooter>
    </AuthLayout>
  );
}
