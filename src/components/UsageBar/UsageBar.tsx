import { cx } from '@/utils/cx';
import styles from './UsageBar.module.css';

/** Progress bar: share of a budget used. Amber at 90–99%, red when over. */
export function UsageBar({ used, budget, className }: { used: number; budget: number; className?: string }) {
  const ratio = budget > 0 ? used / budget : used > 0 ? Infinity : 0;
  const pct = Math.min(ratio, 1) * 100;
  // Amber when close to the limit (90–99%), red once over; exactly on budget stays normal
  const state = ratio > 1 ? 'over' : ratio >= 0.9 && ratio < 1 ? 'near' : 'ok';
  const label = budget > 0 ? `${Math.round(ratio * 100)}% of budget used` : used > 0 ? 'No budget set' : 'Nothing spent';

  return (
    <div
      className={cx(styles.usage, className)}
      title={label}
      role="meter"
      aria-label={label}
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={cx(styles.fill, styles[state])} style={{ width: `${pct}%` }} />
    </div>
  );
}
