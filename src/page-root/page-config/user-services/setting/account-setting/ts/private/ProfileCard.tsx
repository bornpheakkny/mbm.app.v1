import { useState, type FormEvent } from 'react';
import { AtSign, UserRound } from 'lucide-react';
import { Alert } from '@component/modals/alert-banner/ts/Alert';
import { ChangeEmailModal } from '@component/modals/change-email-modal/ts/ChangeEmailModal';
import { CURRENCY_OPTIONS } from '@util/util-constant/UtilConstant';
import { useAuth } from '@context/auth-provider/ts/AuthContext';
import { authService, errorMessage } from '@api/ApiService';
import { Select } from '@component/input/select-field/ts/Select';
import { useConfirm } from '@context/confirm-provider/ts/ConfirmContext';
import { PhoneModal } from '@page/user-services/setting/account-setting/ts/private/PhoneModal';

export function ProfileCard() {
  const { user, setUser } = useAuth();
  const confirm = useConfirm();
  const [name, setName] = useState(user?.name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [editingPhone, setEditingPhone] = useState(false);
  const [currency, setCurrency] = useState(user?.currency ?? 'USD');
  const [msg, setMsg] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const dirty = name.trim() !== user?.name || currency !== user?.currency || username.trim() !== user?.username;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      setUser(await authService.updateMe({ name: name.trim(), currency, username: username.trim().toLowerCase() }));
      setMsg({ tone: 'success', text: 'Profile saved.' });
    } catch (err) {
      setMsg({ tone: 'error', text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  async function removePhone() {
    const ok = await confirm({
      title: 'Remove your phone number?',
      message: "You won't be able to log in or reset your password with it any more. Your verified email stays.",
      confirmLabel: 'Remove',
      danger: true,
    });
    if (!ok) return;
    setMsg(null);
    try {
      setUser(await authService.removePhone());
      setMsg({ tone: 'success', text: 'Phone number removed.' });
    } catch (err) {
      setMsg({ tone: 'error', text: errorMessage(err) });
    }
  }

  const canRemovePhone = Boolean(user?.phone && user.email && user.emailVerified);

  return (
    <section className="pheakkornyMbmCard">
      <div className="pheakkornyMbmCardTitle">
        <h2>
          <span className="pheakkornyMbmCardIcon">
            <UserRound size={17} />
          </span>
          Profile
        </h2>
      </div>
      <form className="pheakkornyMbmForm" onSubmit={onSubmit}>
        {msg && (
          <Alert tone={msg.tone} onClose={() => setMsg(null)}>
            {msg.text}
          </Alert>
        )}
        <label className="pheakkornyMbmField">
          <span>Name</span>
          <input required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="pheakkornyMbmField">
          <span>Username</span>
          <span className="pheakkornyMbmInputIcon">
            <AtSign size={16} />
            <input
              required
              minLength={3}
              maxLength={30}
              pattern="[a-z][a-z0-9._]{2,29}"
              title="3–30 characters: letters, numbers, . or _ (starts with a letter)"
              autoCapitalize="none"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
            />
          </span>
          <span className="pheakkornyMbmFieldHint">You can log in with your username, email or phone.</span>
        </label>
        <div className="pheakkornyMbmField">
          <span className="pheakkornyMbmFieldLabelRow">
            <span className="pheakkornyMbmFieldLabel">Email</span>
            {user?.email && (
              <span className={`pheakkornyMbmPill ${user.emailVerified ? 'pill--success' : 'pill--warning'}`}>{user.emailVerified ? 'Verified' : 'Not verified'}</span>
            )}
          </span>
          <div className="pheakkornyMbmInputWithAction">
            <input value={user?.email ?? ''} placeholder="No email yet" disabled aria-label="Email" />
            <button type="button" className="pheakkornyMbmBtn pheakkornyMbmBtnSecondary" onClick={() => setChangingEmail(true)}>
              {user?.email ? 'Change' : 'Add'}
            </button>
          </div>
          {user?.pendingEmail && (
            <span className="pheakkornyMbmFieldHint">
              Waiting for you to confirm <strong>{user.pendingEmail}</strong> — check that inbox.
            </span>
          )}
        </div>
        <div className="pheakkornyMbmField">
          <span className="pheakkornyMbmFieldLabelRow">
            <span className="pheakkornyMbmFieldLabel">Phone</span>
            {user?.phone && <span className="pheakkornyMbmPill pheakkornyMbmPillSuccess">Verified</span>}
          </span>
          <div className="pheakkornyMbmInputWithAction">
            <input value={user?.phone ?? ''} placeholder="No phone yet" disabled aria-label="Phone" />
            <button type="button" className="pheakkornyMbmBtn pheakkornyMbmBtnSecondary" onClick={() => setEditingPhone(true)}>
              {user?.phone ? 'Change' : 'Add'}
            </button>
            {canRemovePhone && (
              <button type="button" className="pheakkornyMbmBtn pheakkornyMbmBtnGhost" onClick={removePhone}>
                Remove
              </button>
            )}
          </div>
          {user?.pendingPhone && (
            <span className="pheakkornyMbmFieldHint">
              Waiting for the code sent to <strong>{user.pendingPhone}</strong>.{' '}
              <button type="button" className="pheakkornyMbmLink" onClick={() => setEditingPhone(true)}>
                Enter code
              </button>
            </span>
          )}
        </div>
        <div className="pheakkornyMbmField">
          <label className="pheakkornyMbmFieldLabel" htmlFor="profile-currency">
            Currency
          </label>
          <Select id="profile-currency" value={currency} onChange={setCurrency} options={CURRENCY_OPTIONS} />
          <span className="pheakkornyMbmFieldHint">Used to show amounts across the app.</span>
        </div>
        <div>
          <button className="pheakkornyMbmBtn pheakkornyMbmBtnPrimary" disabled={busy || !dirty}>
            {busy ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </form>
      {editingPhone && (
        <PhoneModal
          onClose={() => setEditingPhone(false)}
          onDone={(text) => {
            setEditingPhone(false);
            setMsg({ tone: 'success', text });
          }}
        />
      )}
      {changingEmail && (
        <ChangeEmailModal
          onClose={() => setChangingEmail(false)}
          onSent={(email) => setMsg({ tone: 'success', text: `Confirmation link sent to ${email}.` })}
        />
      )}
    </section>
  );
}
