import { useState, type FormEvent } from 'react';
import { Mail, MessageSquare } from 'lucide-react';
import { Alert } from '@/components/Alert';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout, AuthLinks } from '@/layouts/AuthLayout';
import { authService, errorMessage } from '@/services';
import type { MfaChallenge, VerificationChallenge } from '@/types';
import styles from './VerifyContactStep.module.css';

/**
 * "Enter the 6-digit code we sent to …" — used after sign-up and when an
 * unverified account logs in. Signs the user in once the code is right.
 */
export function VerifyContactStep({
  challenge,
  title = 'Confirm it’s you',
  onBack,
  onDone,
  onMfa,
}: {
  challenge: VerificationChallenge;
  title?: string;
  onBack: () => void;
  onDone: () => void;
  /** Accounts with two-step verification continue to that step */
  onMfa: (mfa: MfaChallenge) => void;
}) {
  const { completeVerification } = useAuth();
  const [current, setCurrent] = useState(challenge);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSms = current.channel === 'sms';
  const Icon = isSms ? MessageSquare : Mail;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const mfa = await completeVerification(current.verifyToken, code);
      if (mfa) onMfa(mfa);
      else onDone();
    } catch (err) {
      setError(errorMessage(err));
      setCode('');
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setError(null);
    setInfo(null);
    try {
      const next = await authService.resendVerifyCode(current.verifyToken);
      setCurrent({ ...current, ...next });
      setInfo(`A new code is on its way to ${next.hint}.`);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const expired = Boolean(error && /expired|start again|sign up again/i.test(error));

  return (
    <AuthLayout
      title={title}
      subtitle={
        <>
          We {isSms ? 'texted' : 'emailed'} a 6-digit code to <strong>{current.hint}</strong>. Enter it to finish.
        </>
      }
    >
      <form className="form" onSubmit={onSubmit}>
        <div className={styles.sent}>
          <span className={styles.icon}>
            <Icon size={18} />
          </span>
          <span>
            Check your {isSms ? 'messages' : 'inbox (and spam folder)'}. The code expires in 30 minutes.
          </span>
        </div>
        {error && <Alert>{error}</Alert>}
        {info && <Alert tone="success">{info}</Alert>}
        {expired ? (
          <button type="button" className="btn btn--primary btn--lg btn--block" onClick={onBack}>
            Start again
          </button>
        ) : (
          <>
            <label className="field">
              <span>6-digit code</span>
              <input
                className="code-input"
                required
                autoFocus
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              />
            </label>
            <button className="btn btn--primary btn--lg btn--block" disabled={busy || code.length !== 6}>
              {busy ? 'Checking…' : 'Verify and continue'}
            </button>
          </>
        )}
      </form>
      <AuthLinks>
        {!expired && (
          <button type="button" className="link" onClick={resend}>
            Resend code
          </button>
        )}
        <button type="button" className="link link--muted" onClick={onBack}>
          Back
        </button>
      </AuthLinks>
    </AuthLayout>
  );
}
