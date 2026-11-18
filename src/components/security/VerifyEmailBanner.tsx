import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService, errorMessage } from '@/services';

/** Shown at the top of the app until the user verifies their email */
export function VerifyEmailBanner() {
  const { user } = useAuth();
  const [state, setState] = useState<{ tone: 'info' | 'success' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  if (!user || user.emailVerified) return null;

  async function resend() {
    setBusy(true);
    try {
      await authService.resendVerification();
      setState({ tone: 'success', text: `Sent! Check ${user!.email} (and your spam folder).` });
    } catch (err) {
      setState({ tone: 'error', text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`banner banner--${state?.tone ?? 'info'}`} role="status">
      <span>
        {state?.text ?? (
          <>
            <strong>Verify your email</strong> so you can reset your password if you forget it. We sent a link to{' '}
            {user.email}.
          </>
        )}
      </span>
      {state?.tone !== 'success' && (
        <button className="btn btn--ghost btn--sm" onClick={resend} disabled={busy}>
          {busy ? 'Sending…' : 'Resend link'}
        </button>
      )}
    </div>
  );
}
