import { Check } from 'lucide-react';
import { COLOR_NAMES } from '@/constants';
import { colorOf } from '@/utils/colors';

/** Row of color swatches */
export function ColorSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="swatches" role="radiogroup" aria-label="Color">
      {COLOR_NAMES.map((name) => (
        <button
          key={name}
          type="button"
          role="radio"
          aria-checked={value === name}
          aria-label={name}
          title={name}
          className={`swatch ${value === name ? 'swatch--on' : ''}`}
          style={{ background: colorOf(name).solid }}
          onClick={() => onChange(name)}
        >
          {value === name && <Check size={12} strokeWidth={3} />}
        </button>
      ))}
    </div>
  );
}
