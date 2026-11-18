import type { CSSProperties } from 'react';
import { colorOf } from '@/utils/colors';
import './CategoryBadge.css';

/** Colored pill for a category. Colors are CSS variables so the stylesheet can adapt them per theme. */
export function CategoryBadge({ name, color }: { name: string; color: string }) {
  const c = colorOf(color);
  const style = { '--c-bg': c.bg, '--c-fg': c.fg, '--c-solid': c.solid } as CSSProperties;
  return (
    <span className="cat-badge" style={style}>
      <span className="cat-badge__dot" aria-hidden />
      {name}
    </span>
  );
}
