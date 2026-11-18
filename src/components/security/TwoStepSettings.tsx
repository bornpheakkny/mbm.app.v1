import { useState, type FormEvent } from 'react';
import { Alert, Modal } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { errorMessage, mfaService } from '@/services';
import type { MfaMethod, TotpSetup, User } from '@/types';
import { RecoveryCodes } from './RecoveryCodes';

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
      <div className="card__title-row">
        <h2>Two-step verification</h2>
        <span className={`pill ${method ? 'pill--on' : ''}`}>{method ? 'On' : 'Off'}</span>
      </div>

      {notice && <Alert tone="success">{notice}</Alert>}
      {status.error && <Alert>{status.error}</Alert>}
      {justUsed !== undefined && (
        <Alert tone={justUsed <= 3 ? 'error' : 'info'}>
          You signed in with a backup code. {justUsed} left
          {justUsed <= 3 ? ' — create new backup codes soon.' : '.'}
        </Alert>
      )}

      {method ? (
        <div className="form">
          <p className="muted small">
            When you log in, we ask for your password <strong>and</strong> a code from your{' '}
            {method === 'TOTP' ? 'authenticator app' : `email (${user.email})`}.
          </p>
          <dl className="kv">
            <dt>Method</dt>
            <dd>{METHOD_LABEL[method]}</dd>
            <dt>Backup codes left</dt>
            <dd className={left <= 3 ? 'neg' : ''}>{status.loading ? '…' : left}</dd>
          </dl>
          <div className="row-actions row-actions--start">
            <button className="btn btn--ghost btn--sm" onClick={() => setDialog({ kind: 'setup', method: other })}>
              Switch to {METHOD_LABEL[other].toLowerCase()}
            </button>
            <button className="btn btn--ghost btn--sm" onClick={() => setDialog({ kind: 'regen' })}>
              New backup codes
            </button>
            <button className="btn btn--ghost btn--sm btn--danger-text" onClick={() => setDialog({ kind: 'disable' })}>
              Turn off
            </button>
          </div>
        </div>
      ) : (
        <div className="form">
          <p className="muted small">
            Protect your account with a second step at login. Choose how you want to receive codes:
          </p>
          <div className="choice-grid">
            <button className="choice" onClick={() => setDialog({ kind: 'setup', method: 'TOTP' })}>
              <span className="choice__icon">📱</span>
              <span className="choice__title">Authenticator app</span>
              <span className="choice__desc">Google Authenticator, Microsoft Authenticator, Authy… Works offline.</span>
            </button>
            <button
              className="choice"
              disabled={!user.emailVerified}
              onClick={() => setDialog({ kind: 'setup', method: 'EMAIL' })}
            >
              <span className="choice__icon">✉️</span>
              <span className="choice__title">Email code</span>
              <span className="choice__desc">
                {user.emailVerified ? `We email a code to ${user.email}.` : 'Verify your email first.'}
              </span>
            </button>
          </div>
        </div>
      )}

      {dialog?.kind === 'setup' && dialog.method === 'TOTP' && (
        <TotpSetupDialog onClose={() => setDialog(null)} onEnabled={onEnabled} />
      )}
      {dialog?.kind === 'setup' && dialog.method === 'EMAIL' && (
        <EmailSetupDialog email={user.email} onClose={() => setDialog(null)} onEnabled={onEnabled} />
      )}
      {dialog?.kind === 'codes' && (
        <Modal title="Save your backup codes" onClose={() => setDialog(null)}>
          <RecoveryCodes codes={dialog.codes} email={user.email} />
          <div className="modal__foot">
            <button className="btn btn--primary" onClick={() => setDialog(null)}>
              I've saved them
            </button>
          </div>
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
          description="Logging in will only need your password. Your backup codes will be deleted."
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

function TotpSetupDialog({ onClose, onEnabled }: { onClose: () => void; onEnabled: (u: User, codes: string[]) => void }) {
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
    <Modal title="Set up authenticator app" onClose={onClose}>
      <form className="form" onSubmit={onSubmit}>
        {(error || setup.error) && <Alert>{error ?? setup.error}</Alert>}
        <ol className="steps small">
          <li>Open your authenticator app and add an account.</li>
          <li>Scan this QR code, or type the key below.</li>
        </ol>
        <div className="qr">
          {setup.data ? <img src={setup.data.qrDataUrl} alt="QR code for your authenticator app" width={180} height={180} /> : <span className="muted">Loading…</span>}
        </div>
        {secret && (
          <p className="small center">
            Key: <code className="secret">{secret}</code>
          </p>
        )}
        <ol className="steps small" start={3}>
          <li>Enter the 6-digit code the app shows, and your password.</li>
        </ol>
        <div className="form__row">
          <label className="field">
            <span>Code from app</span>
            <input
              className="code-input"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
          </label>
          <label className="field">
            <span>Your password</span>
            <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
        </div>
        <div className="modal__foot">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn--primary" disabled={busy || code.length !== 6 || !setup.data}>
            {busy ? 'Checking…' : 'Turn on'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EmailSetupDialog({
  email,
  onClose,
  onEnabled,
}: {
  email: string;
  onClose: () => void;
  onEnabled: (u: User, codes: string[]) => void;
}) {
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function send() {
    setBusy(true);
    setError(null);
    try {
      await mfaService.emailSetup();
      setSent(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await mfaService.emailEnable(code, password);
      onEnabled(res.user, res.recoveryCodes);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Set up email codes" onClose={onClose}>
      <form className="form" onSubmit={onSubmit}>
        {error && <Alert>{error}</Alert>}
        <p className="small">
          At each login we'll email a 6-digit code to <strong>{email}</strong>. First, confirm you receive our emails.
        </p>
        {!sent ? (
          <div className="modal__foot">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn--primary" onClick={send} disabled={busy}>
              {busy ? 'Sending…' : 'Send code'}
            </button>
          </div>
        ) : (
          <>
            <Alert tone="info">Code sent. It expires in 10 minutes.</Alert>
            <div className="form__row">
              <label className="field">
                <span>Code from email</span>
                <input
                  className="code-input"
                  required
                  autoFocus
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                />
              </label>
              <label className="field">
                <span>Your password</span>
                <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </label>
            </div>
            <div className="modal__foot">
              <button type="button" className="link" onClick={send} disabled={busy}>
                Resend
              </button>
              <button type="button" className="btn btn--ghost" onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn--primary" disabled={busy || code.length !== 6}>
                {busy ? 'Checking…' : 'Turn on'}
              </button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}

function PasswordDialog({
  title,
  description,
  action,
  danger,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  action: string;
  danger?: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onConfirm(password);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form className="form" onSubmit={onSubmit}>
        {error && <Alert>{error}</Alert>}
        <p className="small">{description}</p>
        <label className="field">
          <span>Confirm with your password</span>
          <input type="password" required autoFocus autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <div className="modal__foot">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`} disabled={busy}>
            {busy ? 'Please wait…' : action}
          </button>
        </div>
      </form>
    </Modal>
  );
}
