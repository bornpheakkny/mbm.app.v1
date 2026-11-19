import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, Pencil } from 'lucide-react';
import { CategoryBadge } from '@component/info/category-badge/ts/CategoryBadge';
import { UsageBar } from '@component/info/usage-bar/ts/UsageBar';
import type { SummaryRow, SummaryTotals } from '@type/type-model/ts/Model.type';
import { cx } from '@util/util-consumption/class-name/ts/ClassName';
import styles from '../../css/main/DashboardPage.module.css';

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
  const tone = (v: number) => (v < 0 ? 'pheakkornyMbmNeg' : v > 0 ? 'pheakkornyMbmPos' : '');
  const Icon = kind === 'income' ? ArrowDownLeft : ArrowUpRight;

  return (
    <section className="pheakkornyMbmCard pheakkornyMbmCardFlush">
      <div className="pheakkornyMbmCardHead">
        <h2>
          <span className="pheakkornyMbmCardIcon">
            <Icon size={17} />
          </span>
          {title}
        </h2>
        <Link to="/budget" className="pheakkornyMbmBtn pheakkornyMbmBtnGhost pheakkornyMbmBtnSm">
          <Pencil size={14} /> Edit budget
        </Link>
      </div>
      <div className="pheakkornyMbmTableWrap">
        <table className={cx('pheakkornyMbmTable pheakkornyMbmTableStack', styles.pheakkornyMbmDashboardPageSummaryTable)} style={{ '--stack-cols': 3 } as CSSProperties}>
          <thead>
            <tr>
              <th>{firstCol}</th>
              <th className="pheakkornyMbmNum">Budgeted</th>
              <th className="pheakkornyMbmNum">Actual</th>
              <th className="pheakkornyMbmNum">{diffLabel}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.categoryId}>
                <td className="pheakkornyMbmCellTitle">
                  <CategoryBadge name={r.name} color={r.color} />
                  {kind === 'expense' && <UsageBar used={r.actual} budget={r.budgeted} color={r.color} className={styles.pheakkornyMbmDashboardPageSummaryUsage} />}
                </td>
                <td className="pheakkornyMbmNum" data-label="Budgeted">
                  {money(r.budgeted)}
                </td>
                <td className="pheakkornyMbmNum pheakkornyMbmStrong" data-label="Actual">
                  {money(r.actual)}
                </td>
                <td className={`pheakkornyMbmNum ${tone(r.difference)}`} data-label={diffLabel}>
                  {money(r.difference)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="pheakkornyMbmCellTitle">Total</td>
              <td className="pheakkornyMbmNum" data-label="Budgeted">
                {money(totals.budgeted)}
              </td>
              <td className="pheakkornyMbmNum" data-label="Actual">
                {money(totals.actual)}
              </td>
              <td className={`pheakkornyMbmNum ${tone(totals.difference)}`} data-label={diffLabel}>
                {money(totals.difference)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
