import { useEffect, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X, type LucideIcon } from 'lucide-react';
import { cx } from '@/utils/cx';
import styles from './Modal.module.css';

interface ModalProps {
  title: string;
  description?: ReactNode;
  icon?: LucideIcon;
  tone?: 'default' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClose: () => void;
  children: ReactNode;
}

/**
 * Dialog window. Centered on larger screens, slides up as a bottom sheet on phones.
 * Closes on Escape, on the ✕ button and on a click outside.
 */
export function Modal({ title, description, icon: Icon, tone = 'default', size = 'md', onClose, children }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !e.defaultPrevented && onClose();
    window.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return createPortal(
    <div className={styles.backdrop} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={cx(styles.modal, styles[size])} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className={styles.handle} aria-hidden />
        <div className={styles.head}>
          {Icon && (
            <span className={cx(styles.icon, tone === 'danger' && styles.iconDanger)}>
              <Icon size={20} />
            </span>
          )}
          <div className={styles.heading}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {description && <p className={styles.desc}>{description}</p>}
          </div>
          <button type="button" className={cx('icon-btn icon-btn--sm', styles.close)} aria-label="Close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}

/** Button row at the bottom of a dialog. `start` sits on the left (e.g. a checkbox or link). */
export function ModalFooter({ children, start }: { children: ReactNode; start?: ReactNode }) {
  return (
    <div className={styles.foot}>
      {start && <div className={styles.footStart}>{start}</div>}
      {children}
    </div>
  );
}
