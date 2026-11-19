import type { CSSProperties } from 'react';
import { usePreferences } from '@util/util-hook/use-preferences/ts/usePreferences';
import type { Preferences } from '@type/type-model/ts/Model.type';
import { colorOf } from '@util/util-consumption/category-color/ts/CategoryColor';
import { cx, variant as pick } from '@util/util-consumption/class-name/ts/ClassName';
import styles from '../css/CategoryBadge.module.css';

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
    <span className={cx(styles.pheakkornyMbmCategoryBadge, pick(styles, 'pheakkornyMbmCategoryBadge', variant ?? preferences.badgeStyle), className)} style={style}>
      <span className={styles.pheakkornyMbmCategoryBadgeDot} aria-hidden />
      {name}
    </span>
  );
}
