import { useMonth } from '@/context/MonthContext';
import { currentMonth, formatMonthLabel, shiftMonth } from '@/lib/format';

export function MonthPicker() {
  const { month, setMonth } = useMonth();
  const isCurrent = month === currentMonth();

  return (
    <div className="month-picker">
      <button className="icon-btn" aria-label="Previous month" onClick={() => setMonth(shiftMonth(month, -1))}>
        ‹
      </button>
      <label className="month-picker__label">
        <span>{formatMonthLabel(month)}</span>
        <input
          type="month"
          value={month}
          onChange={(e) => e.target.value && setMonth(e.target.value)}
          aria-label="Choose month"
        />
      </label>
      <button className="icon-btn" aria-label="Next month" onClick={() => setMonth(shiftMonth(month, 1))}>
        ›
      </button>
      {!isCurrent && (
        <button className="btn btn--ghost btn--sm" onClick={() => setMonth(currentMonth())}>
          Today
        </button>
      )}
    </div>
  );
}
