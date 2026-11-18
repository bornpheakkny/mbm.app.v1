import { useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Copy, PiggyBank, Save } from 'lucide-react';
import { Alert } from '@/components/Alert';
import { CategoryBadge } from '@/components/CategoryBadge';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { useConfirm } from '@/context/ConfirmContext';
import { useMonth } from '@/context/MonthContext';
import { useAsync } from '@/hooks/useAsync';
import { budgetService, categoryService, errorMessage } from '@/services';
import type { Category } from '@/types';
import { formatMoney, formatMonthLabel, shiftMonth } from '@/utils/format';
import './BudgetPage.css';

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
    <section className="card card--flush">
      <div className="card__head">
        <h2>
          <span className={`card__icon budget__icon--${kind}`}>
            {kind === 'income' ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}
          </span>
          {title}
        </h2>
        <span className="budget__sum">{money(sum(cats))}</span>
      </div>
      {cats.length === 0 ? (
        <EmptyState title="No categories">Add some on the Categories page.</EmptyState>
      ) : (
        <div className="budget-list">
          {cats.map((c) => {
            const changed = (values[c.id] ?? '') !== (saved[c.id] ?? '');
            return (
              <label key={c.id} className={`budget-row ${changed ? 'budget-row--changed' : ''}`}>
                <CategoryBadge name={c.name} color={c.color} />
                <span className="budget-row__input">
                  <span className="budget-row__cur">{cur}</span>
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
    <div className="page budget-page">
      <PageHeader
        eyebrow={formatMonthLabel(month)}
        title="Budget plan"
        description="Set how much you expect to earn and plan to spend in each category."
        actions={
          <>
            <button className="btn btn--secondary" onClick={copyPrevious} disabled={busy}>
              <Copy size={16} /> Copy last month
            </button>
            <button className="btn btn--primary budget__save-top" onClick={save} disabled={busy || !dirty}>
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

      <div className="budget-summary">
        <div>
          <span className="budget-summary__label">Expected income</span>
          <span className="budget-summary__value pos">{money(plannedIn)}</span>
        </div>
        <span className="budget-summary__op">−</span>
        <div>
          <span className="budget-summary__label">Planned spending</span>
          <span className="budget-summary__value">{money(plannedOut)}</span>
        </div>
        <span className="budget-summary__op">=</span>
        <div className="budget-summary__result">
          <span className="budget-summary__label">
            <PiggyBank size={14} /> Planned left over
          </span>
          <span className={`budget-summary__value ${plannedLeft < 0 ? 'neg' : 'pos'}`}>{money(plannedLeft)}</span>
        </div>
      </div>

      {data.data ? (
        <div className="grid-2">
          {section('Income (expected)', income, 'income')}
          {section('Expenses (planned)', expenses, 'expense')}
        </div>
      ) : (
        !data.error && (
          <section className="card">
            <EmptyState icon={PiggyBank} title="Loading…" />
          </section>
        )
      )}

      {dirty && (
        <div className="save-bar" role="region" aria-label="Unsaved changes">
          <span>You have unsaved changes</span>
          <div className="save-bar__actions">
            <button className="btn btn--ghost btn--sm" onClick={() => setValues(saved)} disabled={busy}>
              Discard
            </button>
            <button className="btn btn--primary btn--sm" onClick={save} disabled={busy}>
              <Save size={15} /> {busy ? 'Saving…' : 'Save budget'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
