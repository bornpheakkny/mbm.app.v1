import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/layouts/AuthLayout';
import { authService, errorMessage } from '@/services';

/** Opened from the emailed link: /verify-email?token=… (works signed in or out) */
export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const { user, refreshUser } = useAuth();
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(
    token ? null : { ok: false, text: 'This link is missing its token. Open the link from your email again.' },
  );
  const started = useRef(false);

  useEffect(() => {
    // Links are single-use, so make sure StrictMode's double effect doesn't send it twice
    if (!token || started.current) return;
    started.current = true;
    authService
      .verifyEmail(token)
      .then(async (r) => {
        setResult({
          ok: true,
          text: r.changed
            ? `Your account email is now ${r.email}. Use it the next time you log in.`
            : `${r.email} is verified. You can now reset your password by email if you ever forget it.`,
        });
        await refreshUser().catch(() => undefined);
      })
      .catch((err) => setResult({ ok: false, text: errorMessage(err) }));
  }, [token, refreshUser]);

  return (
    <AuthLayout title="Email verification" subtitle={result ? '' : 'Checking your link…'}>
      <div className="form">
        {result && <Alert tone={result.ok ? 'success' : 'error'}>{result.text}</Alert>}
        {result && !result.ok && user && (
          <p className="muted small">You can send a new link from the banner at the top of the app.</p>
        )}
        {result && (
          <Link to={user ? '/' : '/login'} className="btn btn--primary btn--block">
            {user ? 'Go to dashboard' : 'Go to log in'}
          </Link>
        )}
      </div>
    </AuthLayout>
  );
}
