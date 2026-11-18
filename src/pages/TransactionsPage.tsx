import { useMemo, useState, type FormEvent } from 'react';
import { errorMessage } from '@/api/client';
import { categoryApi, transactionApi } from '@/api/endpoints';
import type { Category, CategoryType, Transaction, TransactionInput } from '@/api/types';
import { useAuth } from '@/context/AuthContext';
import { useMonth } from '@/context/MonthContext';
import { useAsync } from '@/hooks/useAsync';
import { defaultDateFor, formatDate, formatMoney, formatMonthLabel } from '@/lib/format';
import { Alert, CategoryBadge, Empty, Modal } from '@/components/ui';

const COPY: Record<CategoryType, { title: string; total: string; cat: string; all: string; add: string }> = {
  INCOME: { title: 'Income', total: 'Total received', cat: 'Source', all: 'All sources', add: 'Add income' },
  EXPENSE: { title: 'Expenses', total: 'Total spent', cat: 'Category', all: 'All categories', add: 'Add expense' },
};

export function TransactionsPage({ type }: { type: CategoryType }) {
  const { month } = useMonth();
  const { user } = useAuth();
  const money = (v: number) => formatMoney(v, user?.currency ?? 'USD');
  const copy = COPY[type];

  const [categoryId, setCategoryId] = useState('');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Transaction | 'new' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const categories = useAsync(() => categoryApi.list({ type }), [type]);
  const list = useAsync(
    () => transactionApi.list({ month, type, categoryId: categoryId || undefined }),
    [month, type, categoryId],
  );

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const all = list.data?.transactions ?? [];
    if (!term) return all;
    return all.filter((t) => t.description.toLowerCase().includes(term) || t.note?.toLowerCase().includes(term));
  }, [list.data, q]);

  const shownTotal = rows.reduce((s, t) => s + t.amount, 0);

  async function remove(t: Transaction) {
    if (!confirm(`Delete "${t.description}" (${money(t.amount)})?`)) return;
    setActionError(null);
    try {
      await transactionApi.remove(t.id);
      await list.reload();
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1>
            {copy.title} — {formatMonthLabel(month)}
          </h1>
          <p className="muted">
            {copy.total}: <strong>{money(list.data?.totalAmount ?? 0)}</strong> · {list.data?.total ?? 0} entries
          </p>
        </div>
        <div className="page__actions">
          <button className="btn btn--primary" onClick={() => setEditing('new')} disabled={!categories.data?.length}>
            + {copy.add}
          </button>
        </div>
      </div>

      <div className="toolbar">
        <input
          className="search"
          placeholder="Search description or note…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">{copy.all}</option>
          {categories.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {(list.error || actionError) && <Alert>{list.error ?? actionError}</Alert>}

      <section className="card card--flush">
        {list.loading && !list.data ? (
          <Empty>Loading…</Empty>
        ) : rows.length === 0 ? (
          <Empty>
            No {copy.title.toLowerCase()} recorded for {formatMonthLabel(month)}.{' '}
            <button className="link" onClick={() => setEditing('new')}>
              {copy.add}
            </button>
          </Empty>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>{copy.cat}</th>
                  <th>Description</th>
                  <th className="num">Amount</th>
                  <th className="hide-sm">Note</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id}>
                    <td className="nowrap">{formatDate(t.date)}</td>
                    <td>
                      <CategoryBadge name={t.category.name} color={t.category.color} />
                    </td>
                    <td>{t.description}</td>
                    <td className="num">{money(t.amount)}</td>
                    <td className="muted hide-sm">{t.note}</td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" aria-label="Edit" onClick={() => setEditing(t)}>
                          ✎
                        </button>
                        <button className="icon-btn icon-btn--danger" aria-label="Delete" onClick={() => remove(t)}>
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>Total{q || categoryId ? ' (filtered)' : ''}</td>
                  <td className="num">{money(shownTotal)}</td>
                  <td colSpan={2} className="hide-sm" />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      {editing && categories.data && (
        <TransactionModal
          title={editing === 'new' ? copy.add : `Edit ${copy.title.toLowerCase()}`}
          catLabel={copy.cat}
          categories={categories.data}
          initial={editing === 'new' ? null : editing}
          month={month}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await list.reload();
          }}
        />
      )}
    </div>
  );
}

function TransactionModal(props: {
  title: string;
  catLabel: string;
  categories: Category[];
  initial: Transaction | null;
  month: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { title, catLabel, categories, initial, month, onClose, onSaved } = props;
  const [form, setForm] = useState({
    date: initial?.date ?? defaultDateFor(month),
    categoryId: initial?.categoryId ?? categories[0]?.id ?? '',
    description: initial?.description ?? '',
    amount: initial ? String(initial.amount) : '',
    note: initial?.note ?? '',
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [addAnother, setAddAnother] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!(amount > 0)) return setError('Amount must be greater than 0');
    const body: TransactionInput = {
      date: form.date,
      categoryId: form.categoryId,
      description: form.description.trim(),
      amount,
      note: form.note.trim() || null,
    };
    setBusy(true);
    setError(null);
    try {
      if (initial) await transactionApi.update(initial.id, body);
      else await transactionApi.create(body);
      if (addAnother && !initial) {
        setForm((f) => ({ ...f, description: '', amount: '', note: '' }));
      } else {
        onSaved();
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form className="form" onSubmit={onSubmit}>
        {error && <Alert>{error}</Alert>}
        <div className="form__row">
          <label className="field">
            <span>Date</span>
            <input type="date" required value={form.date} onChange={set('date')} />
          </label>
          <label className="field">
            <span>Amount</span>
            <input
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              required
              autoFocus
              value={form.amount}
              onChange={set('amount')}
            />
          </label>
        </div>
        <label className="field">
          <span>{catLabel}</span>
          <select required value={form.categoryId} onChange={set('categoryId')}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Description</span>
          <input required maxLength={200} value={form.description} onChange={set('description')} />
        </label>
        <label className="field">
          <span>Shop / brand / note (optional)</span>
          <input maxLength={500} value={form.note} onChange={set('note')} />
        </label>
        <div className="modal__foot">
          {!initial && (
            <label className="check">
              <input type="checkbox" checked={addAnother} onChange={(e) => setAddAnother(e.target.checked)} /> Add
              another
            </label>
          )}
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn--primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
