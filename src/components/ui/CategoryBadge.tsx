import type { CSSProperties } from 'react';
import { colorOf } from '@/utils/colors';

/** Colored pill for a category. Colors are passed as CSS variables so the stylesheet can adapt them per theme. */
export function CategoryBadge({ name, color }: { name: string; color: string }) {
  const c = colorOf(color);
  const style = { '--c-bg': c.bg, '--c-fg': c.fg, '--c-solid': c.solid } as CSSProperties;
  return (
    <span className="badge" style={style}>
      {name}
    </span>
  );
}
