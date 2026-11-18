import { useState, type ReactNode } from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import { Modal } from '@/components/Modal';
import './ConfirmDialog.css';

export interface ConfirmOptions {
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red button + warning icon for destructive actions */
  danger?: boolean;
}

/** Yes/no dialog used by useConfirm() instead of the browser's confirm() */
export function ConfirmDialog({
  options,
  onResult,
}: {
  options: ConfirmOptions;
  onResult: (ok: boolean) => void;
}) {
  const [closing, setClosing] = useState(false);
  const done = (ok: boolean) => {
    if (closing) return;
    setClosing(true);
    onResult(ok);
  };

  return (
    <Modal
      title={options.title}
      icon={options.danger ? AlertTriangle : HelpCircle}
      tone={options.danger ? 'danger' : 'default'}
      size="sm"
      onClose={() => done(false)}
    >
      {options.message && <div className="confirm__message">{options.message}</div>}
      <div className="modal__foot">
        <button type="button" className="btn btn--secondary" onClick={() => done(false)}>
          {options.cancelLabel ?? 'Cancel'}
        </button>
        <button
          type="button"
          autoFocus
          className={`btn ${options.danger ? 'btn--danger' : 'btn--primary'}`}
          onClick={() => done(true)}
        >
          {options.confirmLabel ?? 'Confirm'}
        </button>
      </div>
    </Modal>
  );
}
