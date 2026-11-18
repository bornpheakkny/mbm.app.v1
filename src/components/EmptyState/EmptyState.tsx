import type { ReactNode } from 'react';
import { Inbox, type LucideIcon } from 'lucide-react';
import styles from './EmptyState.module.css';

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
    <div className={styles.empty}>
      <span className={styles.icon}>
        <Icon size={22} />
      </span>
      <p className={styles.title}>{title}</p>
      {children && <p className={styles.text}>{children}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
