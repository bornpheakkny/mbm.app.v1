import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/Alert';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/layouts/AuthLayout';
import { authService, errorMessage } from '@/services';
import type { MfaChallenge } from '@/types';

/** Second step: authenticator / emailed code, or a backup code */
export function MfaStep({
  challenge,
  onBack,
  onDone,
}: {
  challenge: MfaChallenge;
  onBack: () => void;
  onDone: (recoveryCodesLeft?: number) => void;
}) {
  const { completeMfa } = useAuth();
  const [mfaToken, setMfaToken] = useState(challenge.mfaToken);
  const [useBackup, setUseBackup] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isEmail = challenge.method === 'EMAIL';
  const subtitle = useBackup
    ? 'Enter one of the backup codes you saved when you turned on two-step verification.'
    : isEmail
      ? `We emailed a 6-digit code to ${challenge.emailHint}.`
      : 'Open your authenticator app and enter the 6-digit code for Budget Manager.';

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      onDone(await completeMfa(mfaToken, code));
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
      setMfaToken(await authService.resendLoginCode(mfaToken));
      setInfo(`A new code is on its way to ${challenge.emailHint}.`);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const expired = error?.includes('expired') || error?.includes('start again');

  return (
    <AuthLayout title="Two-step verification" subtitle={subtitle}>
      <form className="form" onSubmit={onSubmit}>
        {error && <Alert>{error}</Alert>}
        {info && <Alert tone="success">{info}</Alert>}
        {expired ? (
          <button type="button" className="btn btn--primary btn--lg btn--block" onClick={onBack}>
            Back to log in
          </button>
        ) : (
          <>
            <label className="field">
              <span>{useBackup ? 'Backup code' : '6-digit code'}</span>
              <input
                className={useBackup ? 'code-input code-input--backup' : 'code-input'}
                required
                autoFocus
                autoComplete="one-time-code"
                inputMode={useBackup ? 'text' : 'numeric'}
                maxLength={useBackup ? 12 : 6}
                placeholder={useBackup ? 'XXXX-XXXX' : '123456'}
                value={code}
                onChange={(e) => setCode(useBackup ? e.target.value.toUpperCase() : e.target.value.replace(/\D/g, ''))}
              />
            </label>
            <button className="btn btn--primary btn--lg btn--block" disabled={busy || code.length < 6}>
              {busy ? 'Checking…' : 'Verify'}
            </button>
          </>
        )}
      </form>
      <div className="auth__links">
        {isEmail && !useBackup && !expired && (
          <button type="button" className="link" onClick={resend}>
            Resend code
          </button>
        )}
        {!expired && (
          <button
            type="button"
            className="link"
            onClick={() => {
              setUseBackup((b) => !b);
              setCode('');
              setError(null);
            }}
          >
            {useBackup ? 'Use your verification code' : 'Use a backup code'}
          </button>
        )}
        <button type="button" className="link link--muted" onClick={onBack}>
          Cancel
        </button>
      </div>
    </AuthLayout>
  );
}
