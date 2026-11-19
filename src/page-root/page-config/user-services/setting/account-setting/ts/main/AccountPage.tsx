import { useLocation } from 'react-router-dom';
import { BadgeCheck, CalendarDays, MailWarning, Shield } from 'lucide-react';
import { Avatar } from '@component/info/avatar/ts/Avatar';
import { PageHeader } from '@component/header/page-header/ts/PageHeader';
import { TwoStepSettings } from '@component/card/two-step-settings/ts/main/TwoStepSettings';
import { useAuth } from '@context/auth-provider/ts/AuthContext';
import { formatDateTime } from '@util/util-consumption/format/ts/Format';
import { AppearanceCard } from '@page/user-services/setting/account-setting/ts/private/AppearanceCard';
import { PasswordCard } from '@page/user-services/setting/account-setting/ts/private/PasswordCard';
import { ProfileCard } from '@page/user-services/setting/account-setting/ts/private/ProfileCard';
import { cx } from '@util/util-consumption/class-name/ts/ClassName';
import styles from '../../css/main/AccountPage.module.css';

/** Profile, password, email and two-step verification settings */
export function AccountPage() {
  const { user } = useAuth();
  const location = useLocation();
  const recoveryCodesLeft = (location.state as { recoveryCodesLeft?: number } | null)?.recoveryCodesLeft;
  if (!user) return null;

  return (
    <div className="pheakkornyMbmPage">
      <PageHeader title="My account" description="Manage your profile, sign-in and security." />

      <section className={cx('pheakkornyMbmCard', styles.pheakkornyMbmAccountPageAccountHero)}>
        <Avatar name={user.name} size="lg" />
        <div className={styles.pheakkornyMbmAccountPageAccountHeroText}>
          <h2>{user.name}</h2>
          <span className="pheakkornyMbmMuted">
            @{user.username}
            {user.email ? ` · ${user.email}` : user.phone ? ` · ${user.phone}` : ''}
          </span>
        </div>
        <div className={styles.pheakkornyMbmAccountPageAccountHeroTags}>
          {user.email &&
            (user.emailVerified ? (
              <span className="pheakkornyMbmPill pheakkornyMbmPillSuccess">
                <BadgeCheck /> Email verified
              </span>
            ) : (
              <span className="pheakkornyMbmPill pheakkornyMbmPillWarning">
                <MailWarning /> Email not verified
              </span>
            ))}
          {user.phone && user.phoneVerified && (
            <span className="pheakkornyMbmPill pheakkornyMbmPillSuccess">
              <BadgeCheck /> Phone verified
            </span>
          )}
          {user.role === 'ADMIN' && (
            <span className="pheakkornyMbmPill pheakkornyMbmPillViolet">
              <Shield /> Administrator
            </span>
          )}
          <span className="pheakkornyMbmPill">
            <CalendarDays /> Joined {formatDateTime(user.createdAt).split(',')[0]}
          </span>
        </div>
      </section>

      <div className="pheakkornyMbmGrid2">
        <ProfileCard />
        <PasswordCard />
      </div>
      <AppearanceCard />
      <TwoStepSettings recoveryCodesLeft={recoveryCodesLeft} />
    </div>
  );
}
