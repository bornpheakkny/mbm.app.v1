import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cx, variant } from '@util/util-consumption/class-name/ts/ClassName';
import styles from '../css/StatCard.module.css';

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
    <div className={cx(styles.pheakkornyMbmStatCardStat, tone !== 'default' && variant(styles, 'pheakkornyMbmStatCard', tone))}>
      <div className={styles.pheakkornyMbmStatCardTop}>
        <span className={styles.pheakkornyMbmStatCardLabel}>{label}</span>
        {Icon && (
          <span className={cx(styles.pheakkornyMbmStatCardIcon, variant(styles, 'pheakkornyMbmStatCard', accent))}>
            <Icon size={18} />
          </span>
        )}
      </div>
      <div className={styles.pheakkornyMbmStatCardValue}>{value}</div>
      {hint && <div className={styles.pheakkornyMbmStatCardHint}>{hint}</div>}
    </div>
  );
}
