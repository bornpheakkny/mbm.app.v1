import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMonth } from '@/context/MonthContext';
import { currentMonth, formatMonthLabel, shiftMonth } from '@/utils/format';
import { cx } from '@/utils/cx';
import styles from './MonthPicker.module.css';

/** ‹ November 2026 › — shared month for every page. Click the label to pick any month. */
export function MonthPicker({ className }: { className?: string }) {
  const { month, setMonth } = useMonth();
  const isCurrent = month === currentMonth();

  return (
    <div className={cx(styles.picker, className)}>
      <div className={styles.group}>
        <button className="icon-btn icon-btn--sm" aria-label="Previous month" onClick={() => setMonth(shiftMonth(month, -1))}>
          <ChevronLeft size={18} />
        </button>
        <label className={styles.label}>
          <CalendarDays size={16} className={styles.cal} aria-hidden />
          <span>{formatMonthLabel(month)}</span>
          <input
            type="month"
            value={month}
            onChange={(e) => e.target.value && setMonth(e.target.value)}
            aria-label="Choose month"
          />
        </label>
        <button className="icon-btn icon-btn--sm" aria-label="Next month" onClick={() => setMonth(shiftMonth(month, 1))}>
          <ChevronRight size={18} />
        </button>
      </div>
      {!isCurrent && (
        <button className={cx('btn btn--ghost btn--sm', styles.today)} onClick={() => setMonth(currentMonth())}>
          Today
        </button>
      )}
    </div>
  );
}
