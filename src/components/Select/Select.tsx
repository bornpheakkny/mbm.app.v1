import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, type LucideIcon } from 'lucide-react';
import { colorOf } from '@/utils/colors';
import { cx } from '@/utils/cx';
import styles from './Select.module.css';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  /** Category color name — shows a colored dot */
  color?: string;
  icon?: LucideIcon;
}

interface SelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  /** Accessible name when there is no visible <label htmlFor={id}> */
  'aria-label'?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}

const PHONE = '(max-width: 640px)';

/**
 * Styled replacement for <select>: the open list matches the app (native option lists can't be styled).
 * Keyboard: ↑ ↓ Home End to move, Enter/Space to pick, Esc to close, letters to jump.
 * On phones the list opens as a bottom sheet.
 */
export function Select<T extends string>({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  'aria-label': ariaLabel,
  id,
  disabled,
  className,
}: SelectProps<T>) {
  const autoId = useId();
  const triggerId = id ?? `select-${autoId}`;
  const listId = `${triggerId}-list`;
  const optionId = (i: number) => `${triggerId}-opt-${i}`;

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);
  const [sheet, setSheet] = useState(false);
  const [sheetTitle, setSheetTitle] = useState('');
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: '', at: 0 });

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = options[selectedIndex];

  const openList = useCallback(() => {
    if (disabled) return;
    setActive(Math.max(0, selectedIndex));
    setSheet(window.matchMedia(PHONE).matches);
    // Sheet heading: aria-label, else the visible <label for=…>, else the placeholder
    const labelEl = document.querySelector(`label[for="${CSS.escape(triggerId)}"]`);
    setSheetTitle(ariaLabel ?? labelEl?.textContent?.trim() ?? placeholder);
    setOpen(true);
  }, [disabled, selectedIndex, ariaLabel, triggerId, placeholder]);

  const close = useCallback((refocus = true) => {
    setOpen(false);
    setPos(null);
    if (refocus) trigger.current?.focus();
  }, []);

  const pick = (i: number) => {
    const o = options[i];
    if (o) onChange(o.value);
    close();
  };

  // Position the dropdown under (or above) the trigger
  useLayoutEffect(() => {
    if (!open || sheet || !trigger.current) return;
    const r = trigger.current.getBoundingClientRect();
    const width = Math.max(r.width, 200);
    const below = window.innerHeight - r.bottom - 12;
    const above = r.top - 12;
    const wanted = Math.min(320, options.length * 40 + 12);
    const placeBelow = below >= wanted || below >= above;
    const maxHeight = Math.max(120, Math.min(320, placeBelow ? below : above));
    setPos({
      top: placeBelow ? r.bottom + 6 : r.top - 6 - Math.min(wanted, maxHeight),
      left: Math.max(8, Math.min(r.left, window.innerWidth - width - 8)),
      width,
      maxHeight,
    });
  }, [open, sheet, options.length]);

  // Keep the highlighted option visible
  useEffect(() => {
    if (open) list.current?.querySelector(`#${CSS.escape(optionId(active))}`)?.scrollIntoView({ block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, active]);

  // Close on outside click, scroll or resize (desktop dropdown)
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!list.current?.contains(t) && !trigger.current?.contains(t)) close(false);
    };
    const onScroll = (e: Event) => !sheet && !list.current?.contains(e.target as Node) && close(false);
    const onResize = () => close(false);
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, sheet, close]);

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    const last = options.length - 1;
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActive((a) => Math.min(last, a + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
        break;
      case 'Home':
        e.preventDefault();
        setActive(0);
        break;
      case 'End':
        e.preventDefault();
        setActive(last);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        pick(active);
        break;
      case 'Escape':
        e.preventDefault(); // keeps a surrounding Modal open
        close();
        break;
      case 'Tab':
        close(false);
        break;
      default:
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const now = Date.now();
          typed.current.text = (now - typed.current.at < 600 ? typed.current.text : '') + e.key.toLowerCase();
          typed.current.at = now;
          const i = options.findIndex((o) => o.label.toLowerCase().startsWith(typed.current.text));
          if (i >= 0) setActive(i);
        }
    }
  }

  const renderLead = (o: SelectOption<T>) =>
    o.color ? (
      <span className={styles.dot} style={{ background: colorOf(o.color).solid } as CSSProperties} aria-hidden />
    ) : o.icon ? (
      <o.icon size={16} className={styles.optIcon} aria-hidden />
    ) : null;

  const optionsList = (
    <ul
      ref={list}
      id={listId}
      role="listbox"
      aria-labelledby={triggerId}
      className={cx(styles.list, sheet && styles.listSheet)}
      style={!sheet && pos ? { top: pos.top, left: pos.left, width: pos.width, maxHeight: pos.maxHeight } : undefined}
    >
      {options.map((o, i) => {
        const isSel = o.value === value;
        return (
          <li
            key={o.value}
            id={optionId(i)}
            role="option"
            aria-selected={isSel}
            className={cx(styles.option, i === active && styles.active, isSel && styles.selected)}
            onMouseEnter={() => setActive(i)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => pick(i)}
          >
            {renderLead(o)}
            <span className={styles.optText}>
              <span className={styles.optLabel}>{o.label}</span>
              {o.description && <span className={styles.optDesc}>{o.description}</span>}
            </span>
            {isSel && <Check size={16} className={styles.check} aria-hidden />}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <button
        ref={trigger}
        id={triggerId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? optionId(active) : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        className={cx(styles.trigger, open && styles.triggerOpen, className)}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
      >
        <span className={styles.value}>
          {selected ? (
            <>
              {renderLead(selected)}
              <span className={styles.valueText}>{selected.label}</span>
            </>
          ) : (
            <span className={styles.placeholder}>{placeholder}</span>
          )}
        </span>
        <ChevronDown size={16} className={styles.chevron} aria-hidden />
      </button>

      {open &&
        createPortal(
          sheet ? (
            <div className={styles.sheetBackdrop} onMouseDown={(e) => e.target === e.currentTarget && close()}>
              <div className={styles.sheet}>
                <div className={styles.sheetHandle} aria-hidden />
                {sheetTitle && <div className={styles.sheetTitle}>{sheetTitle}</div>}
                {optionsList}
              </div>
            </div>
          ) : (
            pos && optionsList
          ),
          document.body,
        )}
    </>
  );
}
