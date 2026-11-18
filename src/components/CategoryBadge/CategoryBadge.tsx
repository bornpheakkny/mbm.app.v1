import type { CSSProperties } from 'react';
import { usePreferences } from '@/hooks/usePreferences';
import type { Preferences } from '@/types';
import { colorOf } from '@/utils/colors';
import { cx } from '@/utils/cx';
import styles from './CategoryBadge.module.css';

/**
 * Colored pill for a category. Works with preset names and custom #hex colors.
 * The look (soft / solid / outline) follows the user's Appearance setting unless `variant` is given.
 */
export function CategoryBadge({
  name,
  color,
  className,
  variant,
}: {
  name: string;
  color: string;
  className?: string;
  variant?: Preferences['badgeStyle'];
}) {
  const { preferences } = usePreferences();
  const c = colorOf(color);
  const style = { '--c-bg': c.bg, '--c-fg': c.fg, '--c-solid': c.solid, '--c-on': c.on } as CSSProperties;
  return (
    <span className={cx(styles.badge, styles[variant ?? preferences.badgeStyle], className)} style={style}>
      <span className={styles.dot} aria-hidden />
      {name}
    </span>
  );
}
