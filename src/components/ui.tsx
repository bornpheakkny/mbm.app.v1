import { useEffect, type ReactNode } from 'react';
import { colorOf } from '@/lib/colors';

export function CategoryBadge({ name, color }: { name: string; color: string }) {
  const c = colorOf(color);
  return (
    <span className="badge" style={{ background: c.bg, color: c.fg }}>
      {name}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: 'default' | 'good' | 'bad';
}) {
  return (
    <div className={`stat stat--${tone}`}>
      <div className="stat__label">{label}</div>
      <div className="stat__value">{value}</div>
      {hint && <div className="stat__hint">{hint}</div>}
    </div>
  );
}

export function Alert({ children, tone = 'error' }: { children: ReactNode; tone?: 'error' | 'info' | 'success' }) {
  return <div className={`alert alert--${tone}`}>{children}</div>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal__head">
          <h2>{title}</h2>
          <button className="icon-btn" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Progress bar: share of a budget used (red when over) */
export function UsageBar({ used, budget }: { used: number; budget: number }) {
  const pct = budget > 0 ? Math.min(used / budget, 1) : used > 0 ? 1 : 0;
  const over = budget > 0 ? used > budget : used > 0;
  return (
    <div className="usage" title={budget > 0 ? `${Math.round((used / budget) * 100)}% used` : 'No budget'}>
      <div className={`usage__fill ${over ? 'usage__fill--over' : ''}`} style={{ width: `${pct * 100}%` }} />
    </div>
  );
}
