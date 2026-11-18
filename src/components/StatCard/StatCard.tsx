import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import './StatCard.css';

type Tone = 'default' | 'good' | 'bad';
type Accent = 'teal' | 'green' | 'orange' | 'blue' | 'violet' | 'red';

/** KPI tile: icon, label, big value and an optional hint line */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'teal',
  tone = 'default',
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  accent?: Accent;
  tone?: Tone;
}) {
  return (
    <div className={`stat stat--${tone}`}>
      <div className="stat__top">
        <span className="stat__label">{label}</span>
        {Icon && (
          <span className={`stat__icon stat__icon--${accent}`}>
            <Icon size={18} />
          </span>
        )}
      </div>
      <div className="stat__value">{value}</div>
      {hint && <div className="stat__hint">{hint}</div>}
    </div>
  );
}
