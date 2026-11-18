import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3, Gauge, PiggyBank, Plus, Receipt, TrendingUp, Wallet } from 'lucide-react';
import { Alert } from '@/components/Alert';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { UsageBar } from '@/components/UsageBar';
import { CHART_COLORS } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { useMonth } from '@/context/MonthContext';
import { useTheme } from '@/context/ThemeContext';
import { useAsync } from '@/hooks/useAsync';
import { summaryService } from '@/services';
import { formatMoney, formatMonthLabel, formatPercent, formatShortMonth } from '@/utils/format';
import { SummaryTable } from './SummaryTable';
import { cx } from '@/utils/cx';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const { month } = useMonth();
  const { user } = useAuth();
  const { theme } = useTheme();
  const cur = user?.currency ?? 'USD';
  const money = (v: number) => formatMoney(v, cur);
  const compact = (v: number) => (Math.abs(v) >= 1000 ? `${formatMoney(v / 1000, cur).replace(/\.00$/, '')}k` : formatMoney(v, cur));

  const summary = useAsync(() => summaryService.get(month), [month]);
  const trend = useAsync(() => summaryService.trend(month, 6), [month]);
  const s = summary.data;

  const c = CHART_COLORS[theme];
  const tick = { fill: c.axis, fontSize: 12 };
  const tooltip = {
    contentStyle: {
      background: c.tooltipBg,
      border: `1px solid ${c.tooltipBorder}`,
      borderRadius: 10,
      color: c.text,
      boxShadow: '0 8px 24px rgb(0 0 0 / 0.12)',
      fontSize: 13,
    },
    labelStyle: { color: c.text, fontWeight: 600, marginBottom: 4 },
    cursor: { fill: c.cursor },
    formatter: (v: unknown) => money(Number(v)),
  };

  const firstName = user?.name.split(' ')[0];

  return (
    <div className="page">
      <PageHeader
        eyebrow={formatMonthLabel(month)}
        title={`Hello, ${firstName} 👋`}
        description="Here's how your budget is doing this month."
        actions={
          <>
            <Link to="/income" className="btn btn--secondary">
              <Plus size={16} /> Income
            </Link>
            <Link to="/expenses" className="btn btn--primary">
              <Plus size={16} /> Expense
            </Link>
          </>
        }
      />

      {summary.error && <Alert>{summary.error}</Alert>}

      <section className="stats">
        <StatCard
          icon={Wallet}
          accent="green"
          label="Total income"
          value={s ? money(s.totals.totalIncome) : '—'}
          hint={s && `of ${money(s.totals.budgetedIncome)} expected`}
        />
        <StatCard
          icon={Receipt}
          accent="orange"
          label="Total expenses"
          value={s ? money(s.totals.totalExpenses) : '—'}
          hint={s && `of ${money(s.totals.budgetedExpenses)} planned`}
        />
        <StatCard
          icon={PiggyBank}
          accent="teal"
          label="Left over"
          value={s ? money(s.totals.leftOver) : '—'}
          tone={s ? (s.totals.leftOver >= 0 ? 'good' : 'bad') : 'default'}
          hint={s && (s.totals.leftOver >= 0 ? 'Income minus expenses' : 'You spent more than you earned')}
        />
        <StatCard
          icon={Gauge}
          accent="violet"
          label="Income spent"
          value={s ? formatPercent(s.totals.shareSpent) : '—'}
          tone={s && s.totals.shareSpent > 1 ? 'bad' : 'default'}
          hint={s && <UsageBar used={s.totals.totalExpenses} budget={s.totals.totalIncome} />}
        />
      </section>

      <div className="grid-2">
        <section className={cx('card', styles.chartCard)}>
          <div className="card__title">
            <h2>
              <span className="card__icon">
                <BarChart3 size={17} />
              </span>
              Budget vs actual
            </h2>
            <Legend items={[{ label: 'Planned', color: c.budgeted }, { label: 'Spent', color: c.actual }]} />
          </div>
          {s && s.expenses.rows.length > 0 ? (
            <div className={styles.chart}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={s.expenses.rows} margin={{ top: 4, right: 4, left: -8, bottom: 0 }} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={c.grid} />
                  <XAxis dataKey="name" angle={-40} textAnchor="end" interval={0} tick={{ ...tick, fontSize: 11 }} axisLine={false} tickLine={false} height={78} />
                  <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={compact} width={56} />
                  <Tooltip {...tooltip} />
                  <Bar dataKey="budgeted" name="Planned" fill={c.budgeted} radius={[4, 4, 0, 0]} maxBarSize={18} />
                  <Bar dataKey="actual" name="Spent" fill={c.actual} radius={[4, 4, 0, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon={BarChart3} title={summary.loading ? 'Loading…' : 'No expenses yet'}>
              {!summary.loading && 'Add expenses and a budget to compare them here.'}
            </EmptyState>
          )}
        </section>

        <section className={cx('card', styles.chartCard)}>
          <div className="card__title">
            <h2>
              <span className="card__icon">
                <TrendingUp size={17} />
              </span>
              Last 6 months
            </h2>
            <Legend items={[{ label: 'Income', color: c.income }, { label: 'Expenses', color: c.expenses }]} />
          </div>
          {trend.data ? (
            <div className={styles.chart}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend.data} margin={{ top: 4, right: 4, left: -8, bottom: 0 }} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={c.grid} />
                  <XAxis dataKey="month" tickFormatter={formatShortMonth} tick={tick} axisLine={false} tickLine={false} />
                  <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={compact} width={56} />
                  <Tooltip {...tooltip} labelFormatter={(m) => formatMonthLabel(String(m))} />
                  <Bar dataKey="income" name="Income" fill={c.income} radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="expenses" name="Expenses" fill={c.expenses} radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon={TrendingUp} title="Loading…" />
          )}
        </section>
      </div>

      {s && (
        <div className="grid-2">
          <SummaryTable
            kind="income"
            title="Income"
            firstCol="Source"
            diffLabel="Difference"
            rows={s.income.rows}
            totals={s.income.totals}
            money={money}
          />
          <SummaryTable
            kind="expense"
            title="Expenses"
            firstCol="Category"
            diffLabel="Remaining"
            rows={s.expenses.rows}
            totals={s.expenses.totals}
            money={money}
          />
        </div>
      )}
    </div>
  );
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className={styles.chartLegend}>
      {items.map((i) => (
        <span key={i.label}>
          <i style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}
