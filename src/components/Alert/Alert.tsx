import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import './Alert.css';

type Tone = 'error' | 'info' | 'success' | 'warning';

const ICONS = { error: AlertTriangle, warning: AlertTriangle, success: CheckCircle2, info: Info } as const;

/** Inline message box. Pass onClose to make it dismissible. */
export function Alert({ children, tone = 'error', onClose }: { children: ReactNode; tone?: Tone; onClose?: () => void }) {
  const Icon = ICONS[tone];
  return (
    <div className={`alert alert--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon size={18} className="alert__icon" aria-hidden />
      <div className="alert__body">{children}</div>
      {onClose && (
        <button type="button" className="alert__close" onClick={onClose} aria-label="Dismiss">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
