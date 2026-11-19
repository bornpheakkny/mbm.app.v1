import type { CSSProperties } from 'react';
import { Check, Pipette } from 'lucide-react';
import { COLOR_NAMES } from '@util/util-constant/UtilConstant';
import { colorOf, isCustomColor } from '@util/util-consumption/category-color/ts/CategoryColor';
import { cx } from '@util/util-consumption/class-name/ts/ClassName';
import styles from '../../css/main/CategoriesPage.module.css';

/** Preset color swatches + a custom color picker (any #hex) */
export function ColorSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const custom = isCustomColor(value);

  return (
    <div className={styles.pheakkornyMbmCategoriesPageSwatches} role="radiogroup" aria-label="Color">
      {COLOR_NAMES.map((name) => (
        <button
          key={name}
          type="button"
          role="radio"
          aria-checked={value === name}
          aria-label={name}
          title={name}
          className={cx(styles.pheakkornyMbmCategoriesPageSwatch, value === name && styles.pheakkornyMbmCategoriesPageSwatchOn)}
          style={{ background: colorOf(name).solid, color: colorOf(name).on }}
          onClick={() => onChange(name)}
        >
          {value === name && <Check size={12} strokeWidth={3} />}
        </button>
      ))}

      {/* Custom: the real <input type="color"> sits on top of the swatch so clicking it opens the picker */}
      <label
        className={cx(styles.pheakkornyMbmCategoriesPageSwatch, styles.pheakkornyMbmCategoriesPageSwatchCustom, custom && styles.pheakkornyMbmCategoriesPageSwatchOn)}
        style={custom ? ({ background: value, color: colorOf(value).on } as CSSProperties) : undefined}
        title={custom ? `Custom color ${value}` : 'Custom color'}
      >
        {custom ? <Check size={12} strokeWidth={3} /> : <Pipette size={12} strokeWidth={2.5} />}
        <input
          type="color"
          aria-label="Custom color"
          value={custom ? value : '#0d9488'}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  );
}
