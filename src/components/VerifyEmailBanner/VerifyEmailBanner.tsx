import { useState } from 'react';
import { CheckCircle2, MailWarning, X } from 'lucide-react';
import { ChangeEmailModal } from '@/components/ChangeEmailModal';
import { useAuth } from '@/context/AuthContext';
import { authService, errorMessage } from '@/services';
import './VerifyEmailBanner.css';

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
  const [hidden, setHidden] = useState(false);
  if (!user || hidden || (user.emailVerified && !user.pendingEmail)) return null;

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

  const cancel = () => run(async () => setUser(await authService.cancelEmailChange()), 'Email change cancelled.');

  const tone = msg?.tone ?? 'warning';
  const Icon = msg?.tone === 'success' ? CheckCircle2 : MailWarning;

  return (
    <>
      <div className={`banner banner--${tone}`} role="status">
        <div className="banner__inner">
          <Icon size={18} className="banner__icon" aria-hidden />
          <p className="banner__text">
            {msg?.text ??
              (pending ? (
                <>
                  <strong>Confirm your new email.</strong> We sent a link to {pending}. Until then your account keeps{' '}
                  {user.email}.
                </>
              ) : (
                <>
                  <strong>Verify your email</strong> so you can reset your password if you forget it. Link sent to{' '}
                  {user.email}.
                </>
              ))}
          </p>
          <div className="banner__actions">
            <button className="btn btn--sm banner__btn" onClick={resend} disabled={busy}>
              {busy ? 'Please wait…' : 'Resend link'}
            </button>
            {pending ? (
              <button className="btn btn--sm banner__btn banner__btn--plain" onClick={cancel} disabled={busy}>
                Cancel change
              </button>
            ) : (
              <button className="btn btn--sm banner__btn banner__btn--plain" onClick={() => setChanging(true)} disabled={busy}>
                Wrong email?
              </button>
            )}
            <button className="icon-btn icon-btn--sm banner__close" aria-label="Hide for now" onClick={() => setHidden(true)}>
              <X size={16} />
            </button>
          </div>
        </div>
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
