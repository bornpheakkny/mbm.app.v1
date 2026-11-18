import { useEffect, useMemo, useState } from 'react';
import { budgetService, categoryService, errorMessage } from '@/services';
import type { Category } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useMonth } from '@/context/MonthContext';
import { useAsync } from '@/hooks/useAsync';
import { formatMoney, formatMonthLabel, shiftMonth } from '@/utils/format';
import { Alert, CategoryBadge } from '@/components/ui';

export function BudgetPage() {
  const { month } = useMonth();
  const { user } = useAuth();
  const money = (v: number) => formatMoney(v, user?.currency ?? 'USD');

  const data = useAsync(async () => {
    const [categories, budgets] = await Promise.all([categoryService.list(), budgetService.get(month)]);
    return { categories, budgets };
  }, [month]);

  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ tone: 'error' | 'success' | 'info'; msg: string } | null>(null);
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
  const plannedLeft = sum(income) - sum(expenses);

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
    const hasAny = (data.data?.budgets.length ?? 0) > 0;
    if (hasAny && !confirm(`Overwrite this month's budget with ${formatMonthLabel(prev)}?`)) return;
    setBusy(true);
    setStatus(null);
    try {
      await budgetService.copy(month, prev, true);
      await data.reload();
      setStatus({ tone: 'success', msg: `Copied budget from ${formatMonthLabel(prev)}.` });
    } catch (err) {
      setStatus({ tone: 'error', msg: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  const section = (title: string, cats: Category[]) => (
    <section className="card card--flush">
      <div className="card__head">
        <h2>{title}</h2>
        <strong>{money(sum(cats))}</strong>
      </div>
      <div className="budget-list">
        {cats.map((c) => (
          <label key={c.id} className="budget-row">
            <CategoryBadge name={c.name} color={c.color} />
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0"
              value={values[c.id] ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, [c.id]: e.target.value }))}
            />
          </label>
        ))}
      </div>
    </section>
  );

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1>Budget plan — {formatMonthLabel(month)}</h1>
          <p className="muted">
            Planned left over: <strong className={plannedLeft < 0 ? 'neg' : 'pos'}>{money(plannedLeft)}</strong>
          </p>
        </div>
        <div className="page__actions">
          <button className="btn btn--ghost" onClick={copyPrevious} disabled={busy}>
            Copy from last month
          </button>
          <button className="btn btn--primary" onClick={save} disabled={busy || !dirty}>
            {busy ? 'Saving…' : 'Save budget'}
          </button>
        </div>
      </div>

      {data.error && <Alert>{data.error}</Alert>}
      {status && <Alert tone={status.tone}>{status.msg}</Alert>}

      {data.data && (
        <div className="grid-2">
          {section('Income (expected)', income)}
          {section('Expenses (planned)', expenses)}
        </div>
      )}
    </div>
  );
}
