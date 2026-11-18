import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService, errorMessage } from '@/services';
import { ChangeEmailModal } from './ChangeEmailModal';

type Msg = { tone: 'success' | 'error'; text: string };

/**
 * Shown at the top of the app while the email is unverified, or while a new address
 * is waiting for confirmation. Lets the user resend, fix a typo, or cancel a change.
 */
export function VerifyEmailBanner() {
  const { user, setUser } = useAuth();
  const [msg, setMsg] = useState<Msg | null>(null);
  const [busy, setBusy] = useState(false);
  const [changing, setChanging] = useState(false);
  if (!user || (user.emailVerified && !user.pendingEmail)) return null;

  const pending = user.pendingEmail;

  async function run(fn: () => Promise<unknown>, success: string) {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      setMsg({ tone: 'success', text: success });
    } catch (err) {
      setMsg({ tone: 'error', text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  const resend = () =>
    pending
      ? run(() => authService.resendEmailChange(), `Sent again to ${pending}. Check your inbox and spam folder.`)
      : run(() => authService.resendVerification(), `Sent again to ${user.email}. Check your inbox and spam folder.`);

  const cancel = () =>
    run(async () => setUser(await authService.cancelEmailChange()), 'Email change cancelled.');

  return (
    <>
      <div className={`banner banner--${msg?.tone ?? 'info'}`} role="status">
        <span>
          {msg?.text ??
            (pending ? (
              <>
                <strong>Confirm your new email.</strong> We sent a link to {pending}. Until you click it, your account keeps{' '}
                {user.email}.
              </>
            ) : (
              <>
                <strong>Verify your email</strong> so you can reset your password if you forget it. We sent a link to{' '}
                <strong>{user.email}</strong>.
              </>
            ))}
        </span>
        <span className="banner__actions">
          <button className="btn btn--ghost btn--sm" onClick={resend} disabled={busy}>
            {busy ? 'Please wait…' : 'Resend link'}
          </button>
          {pending ? (
            <button className="btn btn--ghost btn--sm" onClick={cancel} disabled={busy}>
              Cancel change
            </button>
          ) : (
            <button className="btn btn--ghost btn--sm" onClick={() => setChanging(true)} disabled={busy}>
              Wrong email? Change it
            </button>
          )}
        </span>
      </div>
      {changing && (
        <ChangeEmailModal
          onClose={() => setChanging(false)}
          onSent={(email) => setMsg({ tone: 'success', text: `Link sent to ${email}. Click it to switch your account to that address.` })}
        />
      )}
    </>
  );
}
