import { Check } from 'lucide-react';
import { COLOR_NAMES } from '@/constants';
import { colorOf } from '@/utils/colors';
import { cx } from '@/utils/cx';
import styles from './CategoriesPage.module.css';

/** Row of color swatches */
export function ColorSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className={styles.swatches} role="radiogroup" aria-label="Color">
      {COLOR_NAMES.map((name) => (
        <button
          key={name}
          type="button"
          role="radio"
          aria-checked={value === name}
          aria-label={name}
          title={name}
          className={cx(styles.swatch, value === name && styles.swatchOn)}
          style={{ background: colorOf(name).solid }}
          onClick={() => onChange(name)}
        >
          {value === name && <Check size={12} strokeWidth={3} />}
        </button>
      ))}
    </div>
  );
}
