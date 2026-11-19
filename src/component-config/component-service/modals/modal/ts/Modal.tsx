import { useEffect, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X, type LucideIcon } from 'lucide-react';
import { cx, variant } from '@util/util-consumption/class-name/ts/ClassName';
import styles from '../css/Modal.module.css';

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
    <div className={styles.pheakkornyMbmModalBackdrop} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={cx(styles.pheakkornyMbmModal, variant(styles, 'pheakkornyMbmModal', size))} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className={styles.pheakkornyMbmModalHandle} aria-hidden />
        <div className={styles.pheakkornyMbmModalHead}>
          {Icon && (
            <span className={cx(styles.pheakkornyMbmModalIcon, tone === 'danger' && styles.pheakkornyMbmModalIconDanger)}>
              <Icon size={20} />
            </span>
          )}
          <div className={styles.pheakkornyMbmModalHeading}>
            <h2 id={titleId} className={styles.pheakkornyMbmModalTitle}>
              {title}
            </h2>
            {description && <p className={styles.pheakkornyMbmModalDesc}>{description}</p>}
          </div>
          <button type="button" className={cx('pheakkornyMbmIconBtn pheakkornyMbmIconBtnSm', styles.pheakkornyMbmModalClose)} aria-label="Close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className={styles.pheakkornyMbmModalBody}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}

/** Button row at the bottom of a dialog. `start` sits on the left (e.g. a checkbox or link). */
export function ModalFooter({ children, start }: { children: ReactNode; start?: ReactNode }) {
  return (
    <div className={styles.pheakkornyMbmModalFoot}>
      {start && <div className={styles.pheakkornyMbmModalFootStart}>{start}</div>}
      {children}
    </div>
  );
}
