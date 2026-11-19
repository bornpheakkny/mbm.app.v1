import { useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { Alert } from '@component/modals/alert-banner/ts/Alert';
import { useAuth } from '@context/auth-provider/ts/AuthContext';
import { AuthLayout, AuthLinks } from '@layout/outlet/auth-outlet/ts/AuthLayout';
import { authService, errorMessage } from '@api/ApiService';
import type { MfaChallenge } from '@type/type-model/ts/Model.type';

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
  const [error, setError] = useState<string | null>(
    challenge.emailFailed
      ? `We couldn't email your sign-in code to ${challenge.emailHint}. Try "Resend code" in a minute, or use a backup code.`
      : null,
  );
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
      // Even when sending fails the server starts a new sign-in attempt; keep using it
      const next = isAxiosError(err) ? (err.response?.data as { mfaToken?: string } | undefined)?.mfaToken : undefined;
      if (next) setMfaToken(next);
      setError(errorMessage(err));
    }
  }

  const expired = error?.includes('expired') || error?.includes('start again');

  return (
    <AuthLayout title="Two-step verification" subtitle={subtitle}>
      <form className="pheakkornyMbmForm" onSubmit={onSubmit}>
        {error && <Alert>{error}</Alert>}
        {info && <Alert tone="success">{info}</Alert>}
        {expired ? (
          <button type="button" className="pheakkornyMbmBtn pheakkornyMbmBtnPrimary pheakkornyMbmBtnLg pheakkornyMbmBtnBlock" onClick={onBack}>
            Back to log in
          </button>
        ) : (
          <>
            <label className="pheakkornyMbmField">
              <span>{useBackup ? 'Backup code' : '6-digit code'}</span>
              <input
                className={useBackup ? 'pheakkornyMbmCodeInput pheakkornyMbmCodeInputBackup' : 'pheakkornyMbmCodeInput'}
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
            <button className="pheakkornyMbmBtn pheakkornyMbmBtnPrimary pheakkornyMbmBtnLg pheakkornyMbmBtnBlock" disabled={busy || code.length < 6}>
              {busy ? 'Checking…' : 'Verify'}
            </button>
          </>
        )}
      </form>
      <AuthLinks>
        {isEmail && !useBackup && !expired && (
          <button type="button" className="pheakkornyMbmLink" onClick={resend}>
            Resend code
          </button>
        )}
        {!expired && (
          <button
            type="button"
            className="pheakkornyMbmLink"
            onClick={() => {
              setUseBackup((b) => !b);
              setCode('');
              setError(null);
            }}
          >
            {useBackup ? 'Use your verification code' : 'Use a backup code'}
          </button>
        )}
        <button type="button" className="pheakkornyMbmLink pheakkornyMbmLinkMuted" onClick={onBack}>
          Cancel
        </button>
      </AuthLinks>
    </AuthLayout>
  );
}
