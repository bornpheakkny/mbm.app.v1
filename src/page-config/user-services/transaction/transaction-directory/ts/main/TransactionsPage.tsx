import { useMemo, useState, type CSSProperties } from 'react';
import { ArrowDownLeft, ArrowUpRight, Pencil, Plus, Search, SearchX, Trash2 } from 'lucide-react';
import { Alert } from '@component/modals/alert-banner/ts/Alert';
import { CategoryBadge } from '@component/info/category-badge/ts/CategoryBadge';
import { EmptyState } from '@component/fallback/empty-state/ts/EmptyState';
import { PageHeader } from '@component/header/page-header/ts/PageHeader';
import { useAuth } from '@context/auth-provider/ts/AuthContext';
import { useConfirm } from '@context/confirm-provider/ts/ConfirmContext';
import { useMonth } from '@context/month-provider/ts/MonthContext';
import { useAsync } from '@util/util-hook/use-async/ts/useAsync';
import { categoryService, errorMessage, transactionService } from '@api/ApiService';
import type { CategoryType, Transaction } from '@type/type-model/ts/Model.type';
import { formatDate, formatMoney, formatMonthLabel } from '@util/util-consumption/format/ts/Format';
import { TransactionModal } from '@page/user-services/transaction/transaction-directory/ts/private/TransactionModal';
import { cx } from '@util/util-consumption/class-name/ts/ClassName';
import styles from '../../css/main/TransactionsPage.module.css';
import { Select } from '@component/input/select-field/ts/Select';

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
    <div className="pheakkornyMbmPage">
      <PageHeader
        eyebrow={formatMonthLabel(month)}
        title={copy.title}
        description={
          <>
            {copy.total} <strong className={styles.pheakkornyMbmTransactionsPageTxTotal}>{money(list.data?.totalAmount ?? 0)}</strong> across{' '}
            {list.data?.total ?? 0} {list.data?.total === 1 ? 'entry' : 'entries'}
          </>
        }
        actions={
          <button className="pheakkornyMbmBtn pheakkornyMbmBtnPrimary" onClick={() => setEditing('new')} disabled={!categories.data?.length}>
            <Plus size={16} /> {copy.add}
          </button>
        }
      />

      <div className="pheakkornyMbmToolbar">
        <div className="pheakkornyMbmInputIcon pheakkornyMbmToolbarSearch">
          <Search size={16} />
          <input placeholder="Search description or note…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
        </div>
        <Select
          className="pheakkornyMbmToolbarFilter"
          aria-label={copy.cat}
          value={categoryId}
          onChange={setCategoryId}
          options={[
            { value: '', label: copy.all },
            ...(categories.data ?? []).map((c) => ({ value: c.id, label: c.name, color: c.color })),
          ]}
        />
      </div>

      {(list.error || actionError) && <Alert>{list.error ?? actionError}</Alert>}

      <section className="pheakkornyMbmCard pheakkornyMbmCardFlush">
        {list.loading && !list.data ? (
          <EmptyState icon={Icon} title="Loading…" />
        ) : rows.length === 0 ? (
          filtered ? (
            <EmptyState icon={SearchX} title="Nothing matches" action={<button className="pheakkornyMbmBtn pheakkornyMbmBtnSecondary pheakkornyMbmBtnSm" onClick={() => { setQ(''); setCategoryId(''); }}>Clear filters</button>}>
              Try a different search or category.
            </EmptyState>
          ) : (
            <EmptyState
              icon={Icon}
              title={`${copy.empty} for ${formatMonthLabel(month)}`}
              action={
                <button className="pheakkornyMbmBtn pheakkornyMbmBtnPrimary pheakkornyMbmBtnSm" onClick={() => setEditing('new')}>
                  <Plus size={15} /> {copy.add}
                </button>
              }
            >
              Entries you add appear here and update your dashboard.
            </EmptyState>
          )
        ) : (
          <div className="pheakkornyMbmTableWrap">
            <table className={cx('pheakkornyMbmTable pheakkornyMbmTableStack', styles.pheakkornyMbmTransactionsPageTxTable)} style={{ '--stack-cols': 2 } as CSSProperties}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>{copy.cat}</th>
                  <th className="pheakkornyMbmNum">Amount</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id}>
                    <td className={cx('pheakkornyMbmNowrap pheakkornyMbmMuted', styles.pheakkornyMbmTransactionsPageTxDate)} data-label="Date">
                      {formatDate(t.date)}
                    </td>
                    <td className={cx('pheakkornyMbmCellTitle', styles.pheakkornyMbmTransactionsPageTxDesc)}>
                      <div className="pheakkornyMbmStrong">{t.description}</div>
                      {t.note && <div className="pheakkornyMbmXsmall pheakkornyMbmMuted">{t.note}</div>}
                    </td>
                    <td className={styles.pheakkornyMbmTransactionsPageTxCat} data-label={copy.cat}>
                      <CategoryBadge name={t.category.name} color={t.category.color} />
                    </td>
                    <td className={cx('pheakkornyMbmNum pheakkornyMbmStrong', styles.pheakkornyMbmTransactionsPageTxAmount, type === 'INCOME' && styles.pheakkornyMbmTransactionsPageTxAmountIncome)} data-label="Amount">
                      {money(t.amount)}
                    </td>
                    <td className={cx('pheakkornyMbmCellActions', styles.pheakkornyMbmTransactionsPageTxActions)}>
                      <div className="pheakkornyMbmRowActions">
                        <button className="pheakkornyMbmIconBtn pheakkornyMbmIconBtnSm" aria-label={`Edit ${t.description}`} onClick={() => setEditing(t)}>
                          <Pencil size={16} />
                        </button>
                        <button className="pheakkornyMbmIconBtn pheakkornyMbmIconBtnSm pheakkornyMbmIconBtnDanger" aria-label={`Delete ${t.description}`} onClick={() => remove(t)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="pheakkornyMbmCellTitle">
                    Total{filtered ? ' (filtered)' : ''}
                  </td>
                  <td className="pheakkornyMbmNum" data-label={filtered ? 'Shown' : 'Total'}>
                    {money(shownTotal)}
                  </td>
                  <td className="pheakkornyMbmHideSm" />
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
