import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cx } from '@/utils/cx';
import styles from './Alert.module.css';

type Tone = 'error' | 'info' | 'success' | 'warning';

const ICONS = { error: AlertTriangle, warning: AlertTriangle, success: CheckCircle2, info: Info } as const;

/** Inline message box. Pass onClose to make it dismissible. */
export function Alert({ children, tone = 'error', onClose }: { children: ReactNode; tone?: Tone; onClose?: () => void }) {
  const Icon = ICONS[tone];
  return (
    <div className={cx(styles.alert, styles[tone])} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon size={18} className={styles.icon} aria-hidden />
      <div className={styles.body}>{children}</div>
      {onClose && (
        <button type="button" className={styles.close} onClick={onClose} aria-label="Dismiss">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
