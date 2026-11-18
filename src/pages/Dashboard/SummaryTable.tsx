import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, Pencil } from 'lucide-react';
import { CategoryBadge } from '@/components/CategoryBadge';
import { UsageBar } from '@/components/UsageBar';
import type { SummaryRow, SummaryTotals } from '@/types';

/** Budgeted / actual / difference table. Becomes stacked cards on phones. */
export function SummaryTable(props: {
  kind: 'income' | 'expense';
  title: string;
  firstCol: string;
  diffLabel: string;
  rows: SummaryRow[];
  totals: SummaryTotals;
  money: (v: number) => string;
}) {
  const { kind, title, firstCol, diffLabel, rows, totals, money } = props;
  const tone = (v: number) => (v < 0 ? 'neg' : v > 0 ? 'pos' : '');
  const Icon = kind === 'income' ? ArrowDownLeft : ArrowUpRight;

  return (
    <section className="card card--flush">
      <div className="card__head">
        <h2>
          <span className={`card__icon summary__icon--${kind}`}>
            <Icon size={17} />
          </span>
          {title}
        </h2>
        <Link to="/budget" className="btn btn--ghost btn--sm">
          <Pencil size={14} /> Edit budget
        </Link>
      </div>
      <div className="table-wrap">
        <table className="table table--stack summary-table" style={{ '--stack-cols': 3 } as CSSProperties}>
          <thead>
            <tr>
              <th>{firstCol}</th>
              <th className="num">Budgeted</th>
              <th className="num">Actual</th>
              <th className="num">{diffLabel}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.categoryId}>
                <td className="cell--title">
                  <CategoryBadge name={r.name} color={r.color} />
                  {kind === 'expense' && <UsageBar used={r.actual} budget={r.budgeted} />}
                </td>
                <td className="num" data-label="Budgeted">
                  {money(r.budgeted)}
                </td>
                <td className="num strong" data-label="Actual">
                  {money(r.actual)}
                </td>
                <td className={`num ${tone(r.difference)}`} data-label={diffLabel}>
                  {money(r.difference)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="cell--title">Total</td>
              <td className="num" data-label="Budgeted">
                {money(totals.budgeted)}
              </td>
              <td className="num" data-label="Actual">
                {money(totals.actual)}
              </td>
              <td className={`num ${tone(totals.difference)}`} data-label={diffLabel}>
                {money(totals.difference)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
