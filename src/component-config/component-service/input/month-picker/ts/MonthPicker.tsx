import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMonth } from '@context/month-provider/ts/MonthContext';
import { currentMonth, formatMonthLabel, shiftMonth } from '@util/util-consumption/format/ts/Format';
import { cx } from '@util/util-consumption/class-name/ts/ClassName';
import styles from '../css/MonthPicker.module.css';

/** ‹ November 2026 › — shared month for every page. Click the label to pick any month. */
export function MonthPicker({ className }: { className?: string }) {
  const { month, setMonth } = useMonth();
  const isCurrent = month === currentMonth();

  return (
    <div className={cx(styles.pheakkornyMbmMonthPicker, className)}>
      <div className={styles.pheakkornyMbmMonthPickerGroup}>
        <button className="pheakkornyMbmIconBtn pheakkornyMbmIconBtnSm" aria-label="Previous month" onClick={() => setMonth(shiftMonth(month, -1))}>
          <ChevronLeft size={18} />
        </button>
        <label className={styles.pheakkornyMbmMonthPickerLabel}>
          <CalendarDays size={16} className={styles.pheakkornyMbmMonthPickerCal} aria-hidden />
          <span>{formatMonthLabel(month)}</span>
          <input
            type="month"
            value={month}
            onChange={(e) => e.target.value && setMonth(e.target.value)}
            aria-label="Choose month"
          />
        </label>
        <button className="pheakkornyMbmIconBtn pheakkornyMbmIconBtnSm" aria-label="Next month" onClick={() => setMonth(shiftMonth(month, 1))}>
          <ChevronRight size={18} />
        </button>
      </div>
      {!isCurrent && (
        <button className={cx('pheakkornyMbmBtn pheakkornyMbmBtnGhost pheakkornyMbmBtnSm', styles.pheakkornyMbmMonthPickerToday)} onClick={() => setMonth(currentMonth())}>
          Today
        </button>
      )}
    </div>
  );
}
