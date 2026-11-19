import { useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Copy, PiggyBank, Save } from 'lucide-react';
import { Alert } from '@component/modals/alert-banner/ts/Alert';
import { CategoryBadge } from '@component/info/category-badge/ts/CategoryBadge';
import { EmptyState } from '@component/fallback/empty-state/ts/EmptyState';
import { PageHeader } from '@component/header/page-header/ts/PageHeader';
import { useAuth } from '@context/auth-provider/ts/AuthContext';
import { useConfirm } from '@context/confirm-provider/ts/ConfirmContext';
import { useMonth } from '@context/month-provider/ts/MonthContext';
import { useAsync } from '@util/util-hook/use-async/ts/useAsync';
import { budgetService, categoryService, errorMessage } from '@api/ApiService';
import type { Category } from '@type/type-model/ts/Model.type';
import { formatMoney, formatMonthLabel, shiftMonth } from '@util/util-consumption/format/ts/Format';
import { cx } from '@util/util-consumption/class-name/ts/ClassName';
import styles from '../../css/main/BudgetPage.module.css';

/** Planned amount per category for the selected month */
export function BudgetPage() {
  const { month } = useMonth();
  const { user } = useAuth();
  const confirm = useConfirm();
  const cur = user?.currency ?? 'USD';
  const money = (v: number) => formatMoney(v, cur);

  const data = useAsync(async () => {
    const [categories, budgets] = await Promise.all([categoryService.list(), budgetService.get(month)]);
    return { categories, budgets };
  }, [month]);

  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ tone: 'error' | 'success'; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);

  // Fill inputs whenever data for the month loads
  useEffect(() => {
    if (!data.data) return;
    const map: Record<string, string> = {};
    for (const c of data.data.categories) map[c.id] = '';
    for (const b of data.data.budgets) map[b.categoryId] = String(b.amount);
    setValues(map);
    setStatus(null);
  }, [data.data]);

  const saved = useMemo(() => {
    const m: Record<string, string> = {};
    data.data?.categories.forEach((c) => (m[c.id] = ''));
    data.data?.budgets.forEach((b) => (m[b.categoryId] = String(b.amount)));
    return m;
  }, [data.data]);

  const dirty = Object.keys(values).some((k) => (values[k] ?? '') !== (saved[k] ?? ''));
  const income = data.data?.categories.filter((c) => c.type === 'INCOME') ?? [];
  const expenses = data.data?.categories.filter((c) => c.type === 'EXPENSE') ?? [];
  const sum = (cats: Category[]) => cats.reduce((s, c) => s + (Number(values[c.id]) || 0), 0);
  const plannedIn = sum(income);
  const plannedOut = sum(expenses);
  const plannedLeft = plannedIn - plannedOut;

  async function save() {
    setBusy(true);
    setStatus(null);
    try {
      const items = Object.entries(values)
        .filter(([id, v]) => v !== '' || saved[id] !== '')
        .map(([categoryId, v]) => ({ categoryId, amount: Number(v) || 0 }));
      await budgetService.save(month, items);
      await data.reload();
      setStatus({ tone: 'success', msg: `Budget for ${formatMonthLabel(month)} saved.` });
    } catch (err) {
      setStatus({ tone: 'error', msg: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  async function copyPrevious() {
    const prev = shiftMonth(month, -1);
    if ((data.data?.budgets.length ?? 0) > 0) {
      const ok = await confirm({
        title: `Copy ${formatMonthLabel(prev)}?`,
        message: `This replaces the amounts already planned for ${formatMonthLabel(month)}.`,
        confirmLabel: 'Copy and replace',
      });
      if (!ok) return;
    }
    setBusy(true);
    setStatus(null);
    try {
      await budgetService.copy(month, prev, true);
      await data.reload();
      setStatus({ tone: 'success', msg: `Copied the plan from ${formatMonthLabel(prev)}.` });
    } catch (err) {
      setStatus({ tone: 'error', msg: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  const section = (title: string, cats: Category[], kind: 'income' | 'expense') => (
    <section className="pheakkornyMbmCard pheakkornyMbmCardFlush">
      <div className="pheakkornyMbmCardHead">
        <h2>
          <span className="pheakkornyMbmCardIcon">
            {kind === 'income' ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}
          </span>
          {title}
        </h2>
        <span className={styles.pheakkornyMbmBudgetPageBudgetSum}>{money(sum(cats))}</span>
      </div>
      {cats.length === 0 ? (
        <EmptyState title="No categories">Add some on the Categories page.</EmptyState>
      ) : (
        <div className={styles.pheakkornyMbmBudgetPageBudgetList}>
          {cats.map((c) => {
            const changed = (values[c.id] ?? '') !== (saved[c.id] ?? '');
            return (
              <label key={c.id} className={cx(styles.pheakkornyMbmBudgetPageBudgetRow, changed && styles.pheakkornyMbmBudgetPageBudgetRowChanged)}>
                <CategoryBadge name={c.name} color={c.color} />
                <span className={styles.pheakkornyMbmBudgetPageBudgetRowInput}>
                  <span className={styles.pheakkornyMbmBudgetPageBudgetRowCur}>{cur}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    aria-label={`${c.name} budget`}
                    value={values[c.id] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [c.id]: e.target.value }))}
                  />
                </span>
              </label>
            );
          })}
        </div>
      )}
    </section>
  );

  return (
    <div className="pheakkornyMbmPage">
      <PageHeader
        eyebrow={formatMonthLabel(month)}
        title="Budget plan"
        description="Set how much you expect to earn and plan to spend in each category."
        actions={
          <>
            <button className="pheakkornyMbmBtn pheakkornyMbmBtnSecondary" onClick={copyPrevious} disabled={busy}>
              <Copy size={16} /> Copy last month
            </button>
            <button className={cx('pheakkornyMbmBtn pheakkornyMbmBtnPrimary', styles.pheakkornyMbmBudgetPageBudgetSaveTop)} onClick={save} disabled={busy || !dirty}>
              <Save size={16} /> {busy ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      />

      {data.error && <Alert>{data.error}</Alert>}
      {status && (
        <Alert tone={status.tone} onClose={() => setStatus(null)}>
          {status.msg}
        </Alert>
      )}

      <div className={styles.pheakkornyMbmBudgetPageBudgetSummary}>
        <div>
          <span className={styles.pheakkornyMbmBudgetPageBudgetSummaryLabel}>Expected income</span>
          <span className={cx('pheakkornyMbmPos', styles.pheakkornyMbmBudgetPageBudgetSummaryValue)}>{money(plannedIn)}</span>
        </div>
        <span className={styles.pheakkornyMbmBudgetPageBudgetSummaryOp}>−</span>
        <div>
          <span className={styles.pheakkornyMbmBudgetPageBudgetSummaryLabel}>Planned spending</span>
          <span className={styles.pheakkornyMbmBudgetPageBudgetSummaryValue}>{money(plannedOut)}</span>
        </div>
        <span className={styles.pheakkornyMbmBudgetPageBudgetSummaryOp}>=</span>
        <div className={styles.pheakkornyMbmBudgetPageBudgetSummaryResult}>
          <span className={styles.pheakkornyMbmBudgetPageBudgetSummaryLabel}>
            <PiggyBank size={14} /> Planned left over
          </span>
          <span className={cx(styles.pheakkornyMbmBudgetPageBudgetSummaryValue, plannedLeft < 0 ? 'pheakkornyMbmNeg' : 'pheakkornyMbmPos')}>{money(plannedLeft)}</span>
        </div>
      </div>

      {data.data ? (
        <div className="pheakkornyMbmGrid2">
          {section('Income (expected)', income, 'income')}
          {section('Expenses (planned)', expenses, 'expense')}
        </div>
      ) : (
        !data.error && (
          <section className="pheakkornyMbmCard">
            <EmptyState icon={PiggyBank} title="Loading…" />
          </section>
        )
      )}

      {dirty && (
        <div className={styles.pheakkornyMbmBudgetPageSaveBar} role="region" aria-label="Unsaved changes">
          <span>You have unsaved changes</span>
          <div className={styles.pheakkornyMbmBudgetPageSaveBarActions}>
            <button className="pheakkornyMbmBtn pheakkornyMbmBtnGhost pheakkornyMbmBtnSm" onClick={() => setValues(saved)} disabled={busy}>
              Discard
            </button>
            <button className="pheakkornyMbmBtn pheakkornyMbmBtnPrimary pheakkornyMbmBtnSm" onClick={save} disabled={busy}>
              <Save size={15} /> {busy ? 'Saving…' : 'Save budget'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
