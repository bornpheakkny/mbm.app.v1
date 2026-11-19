import { useState } from 'react';
import { CheckCircle2, MailWarning, X } from 'lucide-react';
import { ChangeEmailModal } from '@component/modals/change-email-modal/ts/ChangeEmailModal';
import { useAuth } from '@context/auth-provider/ts/AuthContext';
import { authService, errorMessage } from '@api/ApiService';
import { cx, variant } from '@util/util-consumption/class-name/ts/ClassName';
import styles from '../css/VerifyEmailBanner.module.css';

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
  if (!user || hidden || (!user.pendingEmail && (!user.email || user.emailVerified))) return null;

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
      : run(() => authService.resendVerification(), `Verification link sent to ${user.email}. Check your inbox and spam folder.`);

  const cancel = () => run(async () => setUser(await authService.cancelEmailChange()), 'Email change cancelled.');

  const tone = msg?.tone ?? 'warning';
  const Icon = msg?.tone === 'success' ? CheckCircle2 : MailWarning;

  return (
    <>
      <div className={cx(styles.pheakkornyMbmVerifyEmailBanner, variant(styles, 'pheakkornyMbmVerifyEmailBanner', tone))} role="status">
        <div className={styles.pheakkornyMbmVerifyEmailBannerInner}>
          <Icon size={18} className={styles.pheakkornyMbmVerifyEmailBannerIcon} aria-hidden />
          <p className={styles.pheakkornyMbmVerifyEmailBannerText}>
            {msg?.text ??
              (pending ? (
                <>
                  <strong>Confirm your new email.</strong> We sent a link to {pending}. Until then your account keeps{' '}
                  {user.email}.
                </>
              ) : (
                <>
                  <strong>Verify your email</strong> ({user.email}) so you can reset your password if you forget it.
                </>
              ))}
          </p>
          <div className={styles.pheakkornyMbmVerifyEmailBannerActions}>
            <button className={cx('pheakkornyMbmBtn pheakkornyMbmBtnSm', styles.pheakkornyMbmVerifyEmailBannerBtn)} onClick={resend} disabled={busy}>
              {busy ? 'Sending…' : pending ? 'Resend link' : 'Send link'}
            </button>
            {pending ? (
              <button className={cx('pheakkornyMbmBtn pheakkornyMbmBtnSm', styles.pheakkornyMbmVerifyEmailBannerBtn, styles.pheakkornyMbmVerifyEmailBannerPlain)} onClick={cancel} disabled={busy}>
                Cancel change
              </button>
            ) : (
              <button className={cx('pheakkornyMbmBtn pheakkornyMbmBtnSm', styles.pheakkornyMbmVerifyEmailBannerBtn, styles.pheakkornyMbmVerifyEmailBannerPlain)} onClick={() => setChanging(true)} disabled={busy}>
                Wrong email?
              </button>
            )}
            <button className={cx('pheakkornyMbmIconBtn pheakkornyMbmIconBtnSm', styles.pheakkornyMbmVerifyEmailBannerClose)} aria-label="Hide for now" onClick={() => setHidden(true)}>
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
