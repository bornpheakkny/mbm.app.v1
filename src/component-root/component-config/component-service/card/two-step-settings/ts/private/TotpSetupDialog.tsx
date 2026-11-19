import { useState, type FormEvent } from 'react';
import { Smartphone } from 'lucide-react';
import { Alert } from '@component/modals/alert-banner/ts/Alert';
import { Modal, ModalFooter } from '@component/modals/modal/ts/Modal';
import { useAsync } from '@util/util-hook/use-async/ts/useAsync';
import { errorMessage, mfaService } from '@api/ApiService';
import type { TotpSetup, User } from '@type/type-model/ts/Model.type';
import styles from '../../css/main/TwoStepSettings.module.css';

/** Scan QR → enter first code + password → authenticator method turned on */
export function TotpSetupDialog({ onClose, onEnabled }: { onClose: () => void; onEnabled: (u: User, codes: string[]) => void }) {
  const setup = useAsync<TotpSetup>(() => mfaService.totpSetup(), []);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await mfaService.totpEnable(code, password);
      onEnabled(res.user, res.recoveryCodes);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const secret = setup.data?.secret.match(/.{1,4}/g)?.join(' ');

  return (
    <Modal title="Set up authenticator app" description="Takes about a minute." icon={Smartphone} onClose={onClose}>
      <form className="pheakkornyMbmForm" onSubmit={onSubmit}>
        {(error || setup.error) && <Alert>{error ?? setup.error}</Alert>}
        <ol className={styles.pheakkornyMbmTwoStepSettingsSteps}>
          <li>
            <span className={styles.pheakkornyMbmTwoStepSettingsStepNum}>1</span>
            <div>Open your authenticator app and add a new account.</div>
          </li>
          <li>
            <span className={styles.pheakkornyMbmTwoStepSettingsStepNum}>2</span>
            <div>
              Scan this QR code, or type the key.
              <div className={styles.pheakkornyMbmTwoStepSettingsQr}>
                {setup.data ? (
                  <img src={setup.data.qrDataUrl} alt="QR code for your authenticator app" width={176} height={176} />
                ) : (
                  <span className="pheakkornyMbmMuted pheakkornyMbmSmall">Loading…</span>
                )}
              </div>
              {secret && <code className={styles.pheakkornyMbmTwoStepSettingsSecret}>{secret}</code>}
            </div>
          </li>
          <li>
            <span className={styles.pheakkornyMbmTwoStepSettingsStepNum}>3</span>
            <div>Enter the 6-digit code the app shows, and your password.</div>
          </li>
        </ol>
        <div className="pheakkornyMbmFormRow">
          <label className="pheakkornyMbmField">
            <span>Code from app</span>
            <input
              className="pheakkornyMbmCodeInput"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
          </label>
          <label className="pheakkornyMbmField">
            <span>Your password</span>
            <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
        </div>
        <ModalFooter>
          <button type="button" className="pheakkornyMbmBtn pheakkornyMbmBtnSecondary" onClick={onClose}>
            Cancel
          </button>
          <button className="pheakkornyMbmBtn pheakkornyMbmBtnPrimary" disabled={busy || code.length !== 6 || !setup.data}>
            {busy ? 'Checking…' : 'Turn on'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
