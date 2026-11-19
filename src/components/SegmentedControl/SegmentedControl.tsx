import { useId, type KeyboardEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cx } from '@/utils/cx';
import styles from './SegmentedControl.module.css';

export interface Segment<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

/** Row of mutually exclusive options (radio group). Arrow keys move between options. */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  'aria-label': ariaLabel,
  disabled,
  block,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Segment<T>[];
  'aria-label': string;
  disabled?: boolean;
  /** Stretch to the full width with equal-width options */
  block?: boolean;
}) {
  const name = useId();

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const i = options.findIndex((o) => o.value === value);
    const next = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? i - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const o = options[(next + options.length) % options.length];
    onChange(o.value);
    (e.currentTarget.querySelector(`[data-value="${o.value}"]`) as HTMLButtonElement | null)?.focus();
  }

  return (
    <div className={cx(styles.group, block && styles.block)} role="radiogroup" aria-label={ariaLabel} onKeyDown={onKeyDown}>
      {options.map(({ value: v, label, icon: Icon }) => {
        const on = v === value;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            name={name}
            data-value={v}
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            disabled={disabled}
            className={cx(styles.option, on && styles.on)}
            onClick={() => onChange(v)}
          >
            {Icon && <Icon size={15} />}
            {label}
          </button>
        );
      })}
    </div>
  );
}
