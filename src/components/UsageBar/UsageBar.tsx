import type { CSSProperties } from 'react';
import { colorOf } from '@/utils/colors';
import { cx } from '@/utils/cx';
import styles from './UsageBar.module.css';

/**
 * Progress bar: share of a budget used.
 * Fill uses the category `color` when given (teal otherwise); amber at 90–99% without a color; red once over budget.
 */
export function UsageBar({
  used,
  budget,
  color,
  className,
}: {
  used: number;
  budget: number;
  /** Category color name (matches its badge) */
  color?: string;
  className?: string;
}) {
  const ratio = budget > 0 ? used / budget : used > 0 ? Infinity : 0;
  const pct = Math.min(ratio, 1) * 100;
  const state = ratio > 1 ? 'over' : !color && ratio >= 0.9 && ratio < 1 ? 'near' : 'ok';
  const label = budget > 0 ? `${Math.round(ratio * 100)}% of budget used` : used > 0 ? 'No budget set' : 'Nothing spent';
  const fill = { width: `${pct}%`, ...(color && state === 'ok' ? { '--fill': colorOf(color).solid } : {}) } as CSSProperties;

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
      <div className={cx(styles.fill, styles[state])} style={fill} />
    </div>
  );
}
