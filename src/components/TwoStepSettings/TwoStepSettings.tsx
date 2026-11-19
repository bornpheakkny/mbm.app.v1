import { useState } from 'react';
import { KeyRound, Mail, RefreshCw, ShieldCheck, ShieldOff, Smartphone } from 'lucide-react';
import { Alert } from '@/components/Alert';
import { Modal, ModalFooter } from '@/components/Modal';
import { RecoveryCodes } from '@/components/RecoveryCodes';
import { useAuth } from '@/context/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { mfaService } from '@/services';
import type { MfaMethod, User } from '@/types';
import { EmailSetupDialog } from './EmailSetupDialog';
import { PasswordDialog } from './PasswordDialog';
import { TotpSetupDialog } from './TotpSetupDialog';
import { cx } from '@/utils/cx';
import styles from './TwoStepSettings.module.css';

type Dialog = { kind: 'setup'; method: MfaMethod } | { kind: 'codes'; codes: string[] } | { kind: 'regen' } | { kind: 'disable' };

const METHOD_LABEL: Record<MfaMethod, string> = { TOTP: 'Authenticator app', EMAIL: 'Email code' };

/** "Two-step verification" card on the My account page */
export function TwoStepSettings({ recoveryCodesLeft: justUsed }: { recoveryCodesLeft?: number }) {
  const { user, setUser } = useAuth();
  const status = useAsync(() => mfaService.status(), [user?.mfaMethod]);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  if (!user) return null;

  const method = user.mfaMethod;
  const left = status.data?.recoveryCodesLeft ?? 0;
  const other: MfaMethod = method === 'TOTP' ? 'EMAIL' : 'TOTP';

  const onEnabled = (u: User, codes: string[]) => {
    setUser(u);
    setNotice(`Two-step verification is on (${METHOD_LABEL[u.mfaMethod!].toLowerCase()}).`);
    setDialog({ kind: 'codes', codes });
  };

  return (
    <section className="card">
      <div className="card__title">
        <h2>
          <span className="card__icon">
            <ShieldCheck size={17} />
          </span>
          Two-step verification
        </h2>
        <span className={`pill ${method ? 'pill--success' : ''}`}>{method ? 'On' : 'Off'}</span>
      </div>

      <div className="form">
        {notice && (
          <Alert tone="success" onClose={() => setNotice(null)}>
            {notice}
          </Alert>
        )}
        {status.error && <Alert>{status.error}</Alert>}
        {justUsed !== undefined && (
          <Alert tone={justUsed <= 3 ? 'warning' : 'info'}>
            You signed in with a backup code. {justUsed} left
            {justUsed <= 3 ? ' — create new backup codes soon.' : '.'}
          </Alert>
        )}

        {method ? (
          <>
            <p className="muted small">
              When you log in we ask for your password <strong>and</strong> a code from your{' '}
              {method === 'TOTP' ? 'authenticator app' : `email (${user.email})`}.
            </p>
            <div className={styles.status}>
              <div className={styles.item}>
                {method === 'TOTP' ? <Smartphone size={18} /> : <Mail size={18} />}
                <div>
                  <div className="xsmall muted">Method</div>
                  <div className="strong">{METHOD_LABEL[method]}</div>
                </div>
              </div>
              <div className={styles.item}>
                <KeyRound size={18} />
                <div>
                  <div className="xsmall muted">Backup codes left</div>
                  <div className={`strong ${left <= 3 ? 'neg' : ''}`}>{status.loading ? '…' : left} of 10</div>
                </div>
              </div>
            </div>
            <div className="row-actions row-actions--start">
              <button className="btn btn--secondary btn--sm" onClick={() => setDialog({ kind: 'setup', method: other })}>
                {other === 'TOTP' ? <Smartphone size={15} /> : <Mail size={15} />}
                Switch to {METHOD_LABEL[other].toLowerCase()}
              </button>
              <button className="btn btn--secondary btn--sm" onClick={() => setDialog({ kind: 'regen' })}>
                <RefreshCw size={15} />
                New backup codes
              </button>
              <button className="btn btn--danger-soft btn--sm" onClick={() => setDialog({ kind: 'disable' })}>
                <ShieldOff size={15} />
                Turn off
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="muted small">Add a second step at login so a stolen password isn't enough. Choose how to get codes:</p>
            <div className={styles.choiceGrid}>
              <button className={styles.choice} onClick={() => setDialog({ kind: 'setup', method: 'TOTP' })}>
                <span className={styles.choiceIcon}>
                  <Smartphone size={20} />
                </span>
                <span className={styles.choiceTitle}>Authenticator app</span>
                <span className={styles.choiceDesc}>Google Authenticator, Microsoft Authenticator, Authy… Works offline.</span>
                <span className={cx('pill pill--primary', styles.choiceTag)}>Recommended</span>
              </button>
              <button className={styles.choice} disabled={!user.email || !user.emailVerified} onClick={() => setDialog({ kind: 'setup', method: 'EMAIL' })}>
                <span className={styles.choiceIcon}>
                  <Mail size={20} />
                </span>
                <span className={styles.choiceTitle}>Email code</span>
                <span className={styles.choiceDesc}>
                  {user.email && user.emailVerified
                    ? `We email a 6-digit code to ${user.email}.`
                    : 'Add and verify an email in your profile to use this.'}
                </span>
              </button>
            </div>
          </>
        )}
      </div>

      {dialog?.kind === 'setup' && dialog.method === 'TOTP' && (
        <TotpSetupDialog onClose={() => setDialog(null)} onEnabled={onEnabled} />
      )}
      {dialog?.kind === 'setup' && dialog.method === 'EMAIL' && (
        <EmailSetupDialog email={user.email ?? ''} onClose={() => setDialog(null)} onEnabled={onEnabled} />
      )}
      {dialog?.kind === 'codes' && (
        <Modal title="Save your backup codes" icon={KeyRound} onClose={() => setDialog(null)}>
          <RecoveryCodes codes={dialog.codes} email={user.email ?? `@${user.username}`} />
          <ModalFooter>
            <button className="btn btn--primary" onClick={() => setDialog(null)}>
              I've saved them
            </button>
          </ModalFooter>
        </Modal>
      )}
      {dialog?.kind === 'regen' && (
        <PasswordDialog
          title="New backup codes"
          description="Your old backup codes will stop working."
          action="Create new codes"
          onClose={() => setDialog(null)}
          onConfirm={async (password) => {
            const codes = await mfaService.regenerateCodes(password);
            await status.reload();
            setDialog({ kind: 'codes', codes });
          }}
        />
      )}
      {dialog?.kind === 'disable' && (
        <PasswordDialog
          title="Turn off two-step verification"
          description="Logging in will only need your password, and your backup codes will be deleted."
          action="Turn off"
          danger
          onClose={() => setDialog(null)}
          onConfirm={async (password) => {
            setUser(await mfaService.disable(password));
            setNotice('Two-step verification is off.');
            setDialog(null);
          }}
        />
      )}
    </section>
  );
}
