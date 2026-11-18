import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { summaryApi } from '@/api/endpoints';
import type { SummaryRow, SummaryTotals } from '@/api/types';
import { useAuth } from '@/context/AuthContext';
import { useMonth } from '@/context/MonthContext';
import { useAsync } from '@/hooks/useAsync';
import { formatMoney, formatMonthLabel, formatPercent, formatShortMonth } from '@/lib/format';
import { Alert, CategoryBadge, StatCard, UsageBar } from '@/components/ui';

export function DashboardPage() {
  const { month } = useMonth();
  const { user } = useAuth();
  const cur = user?.currency ?? 'USD';
  const money = (v: number, sign = false) => formatMoney(v, cur, { sign });

  const summary = useAsync(() => summaryApi.get(month), [month]);
  const trend = useAsync(() => summaryApi.trend(month, 6), [month]);

  const s = summary.data;

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1>Monthly budget — {formatMonthLabel(month)}</h1>
          <p className="muted">Budgeted vs actual for every income source and expense category.</p>
        </div>
        <div className="page__actions">
          <Link to="/income" className="btn btn--ghost">
            + Income
          </Link>
          <Link to="/expenses" className="btn btn--primary">
            + Expense
          </Link>
        </div>
      </div>

      {summary.error && <Alert>{summary.error}</Alert>}

      <section className="stats">
        <StatCard
          label="Total income"
          value={s ? money(s.totals.totalIncome) : '—'}
          hint={s && `Budgeted ${money(s.totals.budgetedIncome)}`}
        />
        <StatCard
          label="Total expenses"
          value={s ? money(s.totals.totalExpenses) : '—'}
          hint={s && `Budgeted ${money(s.totals.budgetedExpenses)}`}
        />
        <StatCard
          label="Left over"
          value={s ? money(s.totals.leftOver) : '—'}
          tone={s ? (s.totals.leftOver >= 0 ? 'good' : 'bad') : 'default'}
        />
        <StatCard
          label="Share of income spent"
          value={s ? formatPercent(s.totals.shareSpent) : '—'}
          tone={s ? (s.totals.shareSpent <= 1 ? 'default' : 'bad') : 'default'}
          hint={s && <UsageBar used={s.totals.totalExpenses} budget={s.totals.totalIncome} />}
        />
      </section>

      <div className="grid-2">
        <section className="card">
          <h2>Budget vs actual — expenses</h2>
          {s && s.expenses.rows.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={s.expenses.rows} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} fontSize={11} height={60} />
                <YAxis fontSize={11} tickFormatter={(v: number) => money(v)} width={70} />
                <Tooltip formatter={(v) => money(Number(v))} />
                <Legend verticalAlign="top" height={28} />
                <Bar dataKey="budgeted" name="Budgeted" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Actual" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="muted">{summary.loading ? 'Loading…' : 'No expense data yet.'}</p>
          )}
        </section>

        <section className="card">
          <h2>Last 6 months</h2>
          {trend.data ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trend.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tickFormatter={formatShortMonth} fontSize={11} />
                <YAxis fontSize={11} tickFormatter={(v: number) => money(v)} width={70} />
                <Tooltip formatter={(v) => money(Number(v))} labelFormatter={(m) => formatMonthLabel(String(m))} />
                <Legend verticalAlign="top" height={28} />
                <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="muted">Loading…</p>
          )}
        </section>
      </div>

      {s && (
        <div className="grid-2">
          <SummaryTable
            title="Income"
            firstCol="Source"
            diffLabel="Difference"
            rows={s.income.rows}
            totals={s.income.totals}
            money={money}
          />
          <SummaryTable
            title="Expenses"
            firstCol="Category"
            diffLabel="Remaining"
            rows={s.expenses.rows}
            totals={s.expenses.totals}
            money={money}
            showUsage
          />
        </div>
      )}
    </div>
  );
}

function SummaryTable(props: {
  title: string;
  firstCol: string;
  diffLabel: string;
  rows: SummaryRow[];
  totals: SummaryTotals;
  money: (v: number, sign?: boolean) => string;
  showUsage?: boolean;
}) {
  const { title, firstCol, diffLabel, rows, totals, money, showUsage } = props;
  const tone = (v: number) => (v < 0 ? 'neg' : v > 0 ? 'pos' : '');

  return (
    <section className="card card--flush">
      <div className="card__head">
        <h2>{title}</h2>
        <Link to="/budget" className="link">
          Edit budget →
        </Link>
      </div>
      <div className="table-wrap">
        <table className="table">
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
                <td>
                  <CategoryBadge name={r.name} color={r.color} />
                  {showUsage && <UsageBar used={r.actual} budget={r.budgeted} />}
                </td>
                <td className="num">{money(r.budgeted)}</td>
                <td className="num">{money(r.actual)}</td>
                <td className={`num ${tone(r.difference)}`}>{money(r.difference)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td className="num">{money(totals.budgeted)}</td>
              <td className="num">{money(totals.actual)}</td>
              <td className={`num ${tone(totals.difference)}`}>{money(totals.difference)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
