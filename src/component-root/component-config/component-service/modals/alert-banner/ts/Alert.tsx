import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cx, variant } from '@util/util-consumption/class-name/ts/ClassName';
import styles from '../css/Alert.module.css';

type Tone = 'error' | 'info' | 'success' | 'warning';

const ICONS = { error: AlertTriangle, warning: AlertTriangle, success: CheckCircle2, info: Info } as const;

/** Inline message box. Pass onClose to make it dismissible. */
export function Alert({ children, tone = 'error', onClose }: { children: ReactNode; tone?: Tone; onClose?: () => void }) {
  const Icon = ICONS[tone];
  return (
    <div className={cx(styles.pheakkornyMbmAlert, variant(styles, 'pheakkornyMbmAlert', tone))} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon size={18} className={styles.pheakkornyMbmAlertIcon} aria-hidden />
      <div className={styles.pheakkornyMbmAlertBody}>{children}</div>
      {onClose && (
        <button type="button" className={styles.pheakkornyMbmAlertClose} onClick={onClose} aria-label="Dismiss">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
