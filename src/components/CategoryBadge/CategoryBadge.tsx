import type { CSSProperties } from 'react';
import { colorOf } from '@/utils/colors';
import { cx } from '@/utils/cx';
import styles from './CategoryBadge.module.css';

/** Colored pill for a category. Colors are CSS variables so the stylesheet can adapt them per theme. */
export function CategoryBadge({ name, color, className }: { name: string; color: string; className?: string }) {
  const c = colorOf(color);
  const style = { '--c-bg': c.bg, '--c-fg': c.fg, '--c-solid': c.solid } as CSSProperties;
  return (
    <span className={cx(styles.badge, className)} style={style}>
      <span className={styles.dot} aria-hidden />
      {name}
    </span>
  );
}
