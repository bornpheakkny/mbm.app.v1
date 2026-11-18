import { useEffect, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X, type LucideIcon } from 'lucide-react';
import './Modal.css';

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
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal modal--${size}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="modal__handle" aria-hidden />
        <div className="modal__head">
          {Icon && (
            <span className={`modal__icon modal__icon--${tone}`}>
              <Icon size={20} />
            </span>
          )}
          <div className="modal__heading">
            <h2 id={titleId}>{title}</h2>
            {description && <p className="modal__desc">{description}</p>}
          </div>
          <button type="button" className="icon-btn icon-btn--sm modal__close" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
