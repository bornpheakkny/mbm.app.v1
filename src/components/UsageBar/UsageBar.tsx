import type { CSSProperties } from 'react';
import { usePreferences } from '@/hooks/usePreferences';
import { colorOf } from '@/utils/colors';
import { cx } from '@/utils/cx';
import styles from './UsageBar.module.css';

/**
 * Progress bar: share of a budget used. Over budget is always striped red.
 * Otherwise the fill follows the user's Appearance setting:
 *  - "category": the category `color` (same as its badge)
 *  - "status":   teal, amber at 90–99%
 * Bars without a category color always use status colors.
 */
export function UsageBar({
  used,
  budget,
  color,
  className,
}: {
  used: number;
  budget: number;
  /** Category color (preset name or #hex) */
  color?: string;
  className?: string;
}) {
  const { preferences } = usePreferences();
  const useCategory = Boolean(color) && preferences.barColor === 'category';

  const ratio = budget > 0 ? used / budget : used > 0 ? Infinity : 0;
  const pct = Math.min(ratio, 1) * 100;
  const state = ratio > 1 ? 'over' : !useCategory && ratio >= 0.9 && ratio < 1 ? 'near' : 'ok';
  const label = budget > 0 ? `${Math.round(ratio * 100)}% of budget used` : used > 0 ? 'No budget set' : 'Nothing spent';
  const fill = {
    width: `${pct}%`,
    ...(useCategory && state === 'ok' ? { '--fill': colorOf(color!).solid } : {}),
  } as CSSProperties;

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
