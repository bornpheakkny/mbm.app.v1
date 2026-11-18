import { useMemo, useState, type CSSProperties } from 'react';
import { ArrowDownLeft, ArrowUpRight, Pencil, Plus, Search, SearchX, Trash2 } from 'lucide-react';
import { Alert } from '@/components/Alert';
import { CategoryBadge } from '@/components/CategoryBadge';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { useConfirm } from '@/context/ConfirmContext';
import { useMonth } from '@/context/MonthContext';
import { useAsync } from '@/hooks/useAsync';
import { categoryService, errorMessage, transactionService } from '@/services';
import type { CategoryType, Transaction } from '@/types';
import { formatDate, formatMoney, formatMonthLabel } from '@/utils/format';
import { TransactionModal } from './TransactionModal';
import './TransactionsPage.css';

const COPY: Record<CategoryType, { title: string; total: string; cat: string; all: string; add: string; empty: string }> = {
  INCOME: { title: 'Income', total: 'Received', cat: 'Source', all: 'All sources', add: 'Add income', empty: 'No income recorded' },
  EXPENSE: { title: 'Expenses', total: 'Spent', cat: 'Category', all: 'All categories', add: 'Add expense', empty: 'No expenses recorded' },
};

/** Income or expense entries for the selected month */
export function TransactionsPage({ type }: { type: CategoryType }) {
  const { month } = useMonth();
  const { user } = useAuth();
  const confirm = useConfirm();
  const money = (v: number) => formatMoney(v, user?.currency ?? 'USD');
  const copy = COPY[type];
  const Icon = type === 'INCOME' ? ArrowDownLeft : ArrowUpRight;

  const [categoryId, setCategoryId] = useState('');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Transaction | 'new' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const categories = useAsync(() => categoryService.list({ type }), [type]);
  const list = useAsync(
    () => transactionService.list({ month, type, categoryId: categoryId || undefined }),
    [month, type, categoryId],
  );

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const all = list.data?.transactions ?? [];
    if (!term) return all;
    return all.filter((t) => t.description.toLowerCase().includes(term) || t.note?.toLowerCase().includes(term));
  }, [list.data, q]);

  const shownTotal = rows.reduce((s, t) => s + t.amount, 0);
  const filtered = Boolean(q || categoryId);

  async function remove(t: Transaction) {
    const ok = await confirm({
      title: `Delete this ${type === 'INCOME' ? 'income' : 'expense'}?`,
      message: (
        <>
          <strong>{t.description}</strong> · {money(t.amount)} on {formatDate(t.date)}. This can't be undone.
        </>
      ),
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    setActionError(null);
    try {
      await transactionService.remove(t.id);
      await list.reload();
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow={formatMonthLabel(month)}
        title={copy.title}
        description={
          <>
            {copy.total} <strong className="tx-total">{money(list.data?.totalAmount ?? 0)}</strong> across{' '}
            {list.data?.total ?? 0} {list.data?.total === 1 ? 'entry' : 'entries'}
          </>
        }
        actions={
          <button className="btn btn--primary" onClick={() => setEditing('new')} disabled={!categories.data?.length}>
            <Plus size={16} /> {copy.add}
          </button>
        }
      />

      <div className="toolbar">
        <div className="input-icon toolbar__search">
          <Search size={16} />
          <input placeholder="Search description or note…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
        </div>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} aria-label={copy.cat}>
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
          <EmptyState icon={Icon} title="Loading…" />
        ) : rows.length === 0 ? (
          filtered ? (
            <EmptyState icon={SearchX} title="Nothing matches" action={<button className="btn btn--secondary btn--sm" onClick={() => { setQ(''); setCategoryId(''); }}>Clear filters</button>}>
              Try a different search or category.
            </EmptyState>
          ) : (
            <EmptyState
              icon={Icon}
              title={`${copy.empty} for ${formatMonthLabel(month)}`}
              action={
                <button className="btn btn--primary btn--sm" onClick={() => setEditing('new')}>
                  <Plus size={15} /> {copy.add}
                </button>
              }
            >
              Entries you add appear here and update your dashboard.
            </EmptyState>
          )
        ) : (
          <div className="table-wrap">
            <table className="table table--stack tx-table" style={{ '--stack-cols': 2 } as CSSProperties}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>{copy.cat}</th>
                  <th className="num">Amount</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id}>
                    <td className="nowrap muted tx-date" data-label="Date">
                      {formatDate(t.date)}
                    </td>
                    <td className="cell--title tx-desc">
                      <div className="strong">{t.description}</div>
                      {t.note && <div className="xsmall muted">{t.note}</div>}
                    </td>
                    <td className="tx-cat" data-label={copy.cat}>
                      <CategoryBadge name={t.category.name} color={t.category.color} />
                    </td>
                    <td className={`num strong tx-amount tx-amount--${type.toLowerCase()}`} data-label="Amount">
                      {money(t.amount)}
                    </td>
                    <td className="cell--actions tx-actions">
                      <div className="row-actions">
                        <button className="icon-btn icon-btn--sm" aria-label={`Edit ${t.description}`} onClick={() => setEditing(t)}>
                          <Pencil size={16} />
                        </button>
                        <button className="icon-btn icon-btn--sm icon-btn--danger" aria-label={`Delete ${t.description}`} onClick={() => remove(t)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="cell--title">
                    Total{filtered ? ' (filtered)' : ''}
                  </td>
                  <td className="num" data-label={filtered ? 'Shown' : 'Total'}>
                    {money(shownTotal)}
                  </td>
                  <td className="hide-sm" />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      {editing && categories.data && (
        <TransactionModal
          type={type}
          title={editing === 'new' ? copy.add : `Edit ${type === 'INCOME' ? 'income' : 'expense'}`}
          catLabel={copy.cat}
          categories={categories.data}
          initial={editing === 'new' ? null : editing}
          month={month}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await list.reload();
          }}
          onAdded={() => list.reload()}
        />
      )}
    </div>
  );
}
