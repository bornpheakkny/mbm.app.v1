import { Link } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';

/** Old emailed reset links land here; resets now use a 6-digit code */
export function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Password resets now use a 6-digit code sent to your email or phone. This older link no longer works."
    >
      <Link to="/forgot-password" className="btn btn--primary btn--lg btn--block">
        Get a reset code
      </Link>
    </AuthLayout>
  );
}
