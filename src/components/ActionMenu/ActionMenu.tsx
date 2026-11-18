import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, type LucideIcon } from 'lucide-react';
import { cx } from '@/utils/cx';
import styles from './ActionMenu.module.css';

export interface ActionItem {
  label: string;
  icon?: LucideIcon;
  onSelect: () => void;
  danger?: boolean;
  hidden?: boolean;
}

/**
 * "⋯" button with a dropdown of actions. Rendered in a portal so it isn't clipped by
 * scrolling tables; closes on outside click, Escape, scroll or resize.
 */
export function ActionMenu({ items, label = 'More actions' }: { items: ActionItem[]; label?: string }) {
  const visible = items.filter((i) => !i.hidden);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !btn.current) return;
    const r = btn.current.getBoundingClientRect();
    const width = 220;
    const height = menu.current?.offsetHeight ?? visible.length * 40 + 12;
    const below = r.bottom + 6 + height < window.innerHeight;
    setPos({
      top: below ? r.bottom + 6 : r.top - 6 - height,
      left: Math.max(8, Math.min(r.right - width, window.innerWidth - width - 8)),
    });
  }, [open, visible.length]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menu.current?.contains(t) && !btn.current?.contains(t)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  if (visible.length === 0) return null;

  return (
    <>
      <button
        ref={btn}
        type="button"
        className={cx('icon-btn icon-btn--sm', open && styles.triggerOpen)}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <MoreHorizontal size={18} />
      </button>
      {open &&
        createPortal(
          <div
            ref={menu}
            className={styles.menu}
            role="menu"
            style={pos ? { top: pos.top, left: pos.left } : { visibility: 'hidden' }}
          >
            {visible.map(({ label: text, icon: Icon, onSelect, danger }) => (
              <button
                key={text}
                role="menuitem"
                className={cx(styles.item, danger && styles.danger)}
                onClick={() => {
                  setOpen(false);
                  onSelect();
                }}
              >
                {Icon && <Icon size={16} />}
                {text}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
