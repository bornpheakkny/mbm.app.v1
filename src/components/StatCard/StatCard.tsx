import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cx } from '@/utils/cx';
import styles from './StatCard.module.css';

type Tone = 'default' | 'good' | 'bad';
type Accent = 'teal' | 'green' | 'orange' | 'blue' | 'violet' | 'red';

/** KPI tile: icon, label, big value and an optional hint line */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'teal',
  tone = 'default',
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  accent?: Accent;
  tone?: Tone;
}) {
  return (
    <div className={cx(styles.stat, tone !== 'default' && styles[tone])}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        {Icon && (
          <span className={cx(styles.icon, styles[accent])}>
            <Icon size={18} />
          </span>
        )}
      </div>
      <div className={styles.value}>{value}</div>
      {hint && <div className={styles.hint}>{hint}</div>}
    </div>
  );
}
