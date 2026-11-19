import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3, Gauge, PiggyBank, Plus, Receipt, TrendingUp, Wallet } from 'lucide-react';
import { Alert } from '@component/modals/alert-banner/ts/Alert';
import { EmptyState } from '@component/fallback/empty-state/ts/EmptyState';
import { PageHeader } from '@component/header/page-header/ts/PageHeader';
import { StatCard } from '@component/card/stat-card/ts/StatCard';
import { UsageBar } from '@component/info/usage-bar/ts/UsageBar';
import { CHART_COLORS } from '@util/util-constant/UtilConstant';
import { useAuth } from '@context/auth-provider/ts/AuthContext';
import { useMonth } from '@context/month-provider/ts/MonthContext';
import { useTheme } from '@context/theme-provider/ts/ThemeContext';
import { useAsync } from '@util/util-hook/use-async/ts/useAsync';
import { summaryService } from '@api/ApiService';
import { formatMoney, formatMonthLabel, formatPercent, formatShortMonth } from '@util/util-consumption/format/ts/Format';
import { SummaryTable } from '@page/user-services/summary/dashboard/ts/private/SummaryTable';
import { cx } from '@util/util-consumption/class-name/ts/ClassName';
import styles from '../../css/main/DashboardPage.module.css';

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
    <div className="pheakkornyMbmPage">
      <PageHeader
        eyebrow={formatMonthLabel(month)}
        title={`Hello, ${firstName} 👋`}
        description="Here's how your budget is doing this month."
        actions={
          <>
            <Link to="/income" className="pheakkornyMbmBtn pheakkornyMbmBtnSecondary">
              <Plus size={16} /> Income
            </Link>
            <Link to="/expenses" className="pheakkornyMbmBtn pheakkornyMbmBtnPrimary">
              <Plus size={16} /> Expense
            </Link>
          </>
        }
      />

      {summary.error && <Alert>{summary.error}</Alert>}

      <section className="pheakkornyMbmStats">
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

      <div className="pheakkornyMbmGrid2">
        <section className={cx('pheakkornyMbmCard', styles.pheakkornyMbmDashboardPageChartCard)}>
          <div className="pheakkornyMbmCardTitle">
            <h2>
              <span className="pheakkornyMbmCardIcon">
                <BarChart3 size={17} />
              </span>
              Budget vs actual
            </h2>
            <Legend items={[{ label: 'Planned', color: c.budgeted }, { label: 'Spent', color: c.actual }]} />
          </div>
          {s && s.expenses.rows.length > 0 ? (
            <div className={styles.pheakkornyMbmDashboardPageChart}>
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

        <section className={cx('pheakkornyMbmCard', styles.pheakkornyMbmDashboardPageChartCard)}>
          <div className="pheakkornyMbmCardTitle">
            <h2>
              <span className="pheakkornyMbmCardIcon">
                <TrendingUp size={17} />
              </span>
              Last 6 months
            </h2>
            <Legend items={[{ label: 'Income', color: c.income }, { label: 'Expenses', color: c.expenses }]} />
          </div>
          {trend.data ? (
            <div className={styles.pheakkornyMbmDashboardPageChart}>
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
        <div className="pheakkornyMbmGrid2">
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
    <div className={styles.pheakkornyMbmDashboardPageChartLegend}>
      {items.map((i) => (
        <span key={i.label}>
          <i style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}
