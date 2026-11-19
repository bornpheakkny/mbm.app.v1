import { cx, variant } from '@util/util-consumption/class-name/ts/ClassName';
import styles from '../css/Avatar.module.css';

const PALETTE = ['teal', 'blue', 'violet', 'orange', 'pink', 'green'] as const;

/** Initial in a colored circle; the color is stable per name */
export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const hash = [...name].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 0);
  const tone = PALETTE[hash % PALETTE.length];
  return (
    <span className={cx(styles.pheakkornyMbmAvatar, variant(styles, 'pheakkornyMbmAvatar', size), variant(styles, 'pheakkornyMbmAvatar', tone))} aria-hidden>
      {name.trim().charAt(0).toUpperCase() || '?'}
    </span>
  );
}
