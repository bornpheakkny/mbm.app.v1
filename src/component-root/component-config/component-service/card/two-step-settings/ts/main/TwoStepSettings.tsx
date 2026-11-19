import { useState } from 'react';
import { KeyRound, Mail, RefreshCw, ShieldCheck, ShieldOff, Smartphone } from 'lucide-react';
import { Alert } from '@component/modals/alert-banner/ts/Alert';
import { Modal, ModalFooter } from '@component/modals/modal/ts/Modal';
import { RecoveryCodes } from '@component/card/recovery-codes/ts/RecoveryCodes';
import { useAuth } from '@context/auth-provider/ts/AuthContext';
import { useAsync } from '@util/util-hook/use-async/ts/useAsync';
import { mfaService } from '@api/ApiService';
import type { MfaMethod, User } from '@type/type-model/ts/Model.type';
import { EmailSetupDialog } from '@component/card/two-step-settings/ts/private/EmailSetupDialog';
import { PasswordDialog } from '@component/card/two-step-settings/ts/private/PasswordDialog';
import { TotpSetupDialog } from '@component/card/two-step-settings/ts/private/TotpSetupDialog';
import { cx } from '@util/util-consumption/class-name/ts/ClassName';
import styles from '../../css/main/TwoStepSettings.module.css';

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
    <section className="pheakkornyMbmCard">
      <div className="pheakkornyMbmCardTitle">
        <h2>
          <span className="pheakkornyMbmCardIcon">
            <ShieldCheck size={17} />
          </span>
          Two-step verification
        </h2>
        <span className={`pheakkornyMbmPill ${method ? 'pill--success' : ''}`}>{method ? 'On' : 'Off'}</span>
      </div>

      <div className="pheakkornyMbmForm">
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
            <p className="pheakkornyMbmMuted pheakkornyMbmSmall">
              When you log in we ask for your password <strong>and</strong> a code from your{' '}
              {method === 'TOTP' ? 'authenticator app' : `email (${user.email})`}.
            </p>
            <div className={styles.pheakkornyMbmTwoStepSettingsStatus}>
              <div className={styles.pheakkornyMbmTwoStepSettingsItem}>
                {method === 'TOTP' ? <Smartphone size={18} /> : <Mail size={18} />}
                <div>
                  <div className="pheakkornyMbmXsmall pheakkornyMbmMuted">Method</div>
                  <div className="pheakkornyMbmStrong">{METHOD_LABEL[method]}</div>
                </div>
              </div>
              <div className={styles.pheakkornyMbmTwoStepSettingsItem}>
                <KeyRound size={18} />
                <div>
                  <div className="pheakkornyMbmXsmall pheakkornyMbmMuted">Backup codes left</div>
                  <div className={`pheakkornyMbmStrong ${left <= 3 ? 'neg' : ''}`}>{status.loading ? '…' : left} of 10</div>
                </div>
              </div>
            </div>
            <div className="pheakkornyMbmRowActions pheakkornyMbmRowActionsStart">
              <button className="pheakkornyMbmBtn pheakkornyMbmBtnSecondary pheakkornyMbmBtnSm" onClick={() => setDialog({ kind: 'setup', method: other })}>
                {other === 'TOTP' ? <Smartphone size={15} /> : <Mail size={15} />}
                Switch to {METHOD_LABEL[other].toLowerCase()}
              </button>
              <button className="pheakkornyMbmBtn pheakkornyMbmBtnSecondary pheakkornyMbmBtnSm" onClick={() => setDialog({ kind: 'regen' })}>
                <RefreshCw size={15} />
                New backup codes
              </button>
              <button className="pheakkornyMbmBtn pheakkornyMbmBtnDangerSoft pheakkornyMbmBtnSm" onClick={() => setDialog({ kind: 'disable' })}>
                <ShieldOff size={15} />
                Turn off
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="pheakkornyMbmMuted pheakkornyMbmSmall">Add a second step at login so a stolen password isn't enough. Choose how to get codes:</p>
            <div className={styles.pheakkornyMbmTwoStepSettingsChoiceGrid}>
              <button className={styles.pheakkornyMbmTwoStepSettingsChoice} onClick={() => setDialog({ kind: 'setup', method: 'TOTP' })}>
                <span className={styles.pheakkornyMbmTwoStepSettingsChoiceIcon}>
                  <Smartphone size={20} />
                </span>
                <span className={styles.pheakkornyMbmTwoStepSettingsChoiceTitle}>Authenticator app</span>
                <span className={styles.pheakkornyMbmTwoStepSettingsChoiceDesc}>Google Authenticator, Microsoft Authenticator, Authy… Works offline.</span>
                <span className={cx('pheakkornyMbmPill pheakkornyMbmPillPrimary', styles.pheakkornyMbmTwoStepSettingsChoiceTag)}>Recommended</span>
              </button>
              <button className={styles.pheakkornyMbmTwoStepSettingsChoice} disabled={!user.email || !user.emailVerified} onClick={() => setDialog({ kind: 'setup', method: 'EMAIL' })}>
                <span className={styles.pheakkornyMbmTwoStepSettingsChoiceIcon}>
                  <Mail size={20} />
                </span>
                <span className={styles.pheakkornyMbmTwoStepSettingsChoiceTitle}>Email code</span>
                <span className={styles.pheakkornyMbmTwoStepSettingsChoiceDesc}>
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
            <button className="pheakkornyMbmBtn pheakkornyMbmBtnPrimary" onClick={() => setDialog(null)}>
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
