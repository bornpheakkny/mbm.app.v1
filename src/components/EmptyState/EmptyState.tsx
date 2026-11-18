import type { ReactNode } from 'react';
import { Inbox, type LucideIcon } from 'lucide-react';
import './EmptyState.css';

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
    <div className="empty">
      <span className="empty__icon">
        <Icon size={22} />
      </span>
      <p className="empty__title">{title}</p>
      {children && <p className="empty__text">{children}</p>}
      {action && <div className="empty__action">{action}</div>}
    </div>
  );
}
