import type { ReactNode } from 'react';
import { Inbox, type LucideIcon } from 'lucide-react';
import styles from '../css/EmptyState.module.css';

/** Friendly placeholder for empty lists and loading states */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  children,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={styles.pheakkornyMbmEmptyStateEmpty}>
      <span className={styles.pheakkornyMbmEmptyStateIcon}>
        <Icon size={22} />
      </span>
      <p className={styles.pheakkornyMbmEmptyStateTitle}>{title}</p>
      {children && <p className={styles.pheakkornyMbmEmptyStateText}>{children}</p>}
      {action && <div className={styles.pheakkornyMbmEmptyStateAction}>{action}</div>}
    </div>
  );
}
