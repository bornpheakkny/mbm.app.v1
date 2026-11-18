import { useLocation } from 'react-router-dom';
import { BadgeCheck, CalendarDays, MailWarning, Shield } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { PageHeader } from '@/components/PageHeader';
import { TwoStepSettings } from '@/components/TwoStepSettings';
import { useAuth } from '@/context/AuthContext';
import { formatDateTime } from '@/utils/format';
import { PasswordCard } from './PasswordCard';
import { ProfileCard } from './ProfileCard';
import './AccountPage.css';

/** Profile, password, email and two-step verification settings */
export function AccountPage() {
  const { user } = useAuth();
  const location = useLocation();
  const recoveryCodesLeft = (location.state as { recoveryCodesLeft?: number } | null)?.recoveryCodesLeft;
  if (!user) return null;

  return (
    <div className="page account-page">
      <PageHeader title="My account" description="Manage your profile, sign-in and security." />

      <section className="card account-hero">
        <Avatar name={user.name} size="lg" />
        <div className="account-hero__text">
          <h2>{user.name}</h2>
          <span className="muted">{user.email}</span>
        </div>
        <div className="account-hero__tags">
          {user.emailVerified ? (
            <span className="pill pill--success">
              <BadgeCheck /> Email verified
            </span>
          ) : (
            <span className="pill pill--warning">
              <MailWarning /> Email not verified
            </span>
          )}
          {user.role === 'ADMIN' && (
            <span className="pill pill--violet">
              <Shield /> Administrator
            </span>
          )}
          <span className="pill">
            <CalendarDays /> Joined {formatDateTime(user.createdAt).split(',')[0]}
          </span>
        </div>
      </section>

      <div className="grid-2">
        <ProfileCard />
        <PasswordCard />
      </div>
      <TwoStepSettings recoveryCodesLeft={recoveryCodesLeft} />
    </div>
  );
}
