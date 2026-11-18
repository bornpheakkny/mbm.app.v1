import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Alert } from '@/components/Alert';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { useAsync } from '@/hooks/useAsync';
import { categoryService, errorMessage } from '@/services';
import type { CategoryType } from '@/types';
import { AddCategory } from './AddCategory';
import { CategoryItem } from './CategoryItem';
import './CategoriesPage.css';

export type Run = (fn: () => Promise<unknown>) => Promise<boolean>;

/** Income sources and expense categories */
export function CategoriesPage() {
  const list = useAsync(() => categoryService.list({ includeArchived: true }), []);
  const [error, setError] = useState<string | null>(null);

  const run: Run = async (fn) => {
    setError(null);
    try {
      await fn();
      await list.reload();
      return true;
    } catch (err) {
      setError(errorMessage(err));
      return false;
    }
  };

  const group = (type: CategoryType) => list.data?.filter((c) => c.type === type) ?? [];

  return (
    <div className="page">
      <PageHeader
        title="Categories"
        description="Income sources and expense categories used in your budget and entries. Archive ones you no longer use to keep their history."
      />
      {(error || list.error) && (
        <Alert onClose={error ? () => setError(null) : undefined}>{error ?? list.error}</Alert>
      )}

      <div className="grid-2">
        {(['INCOME', 'EXPENSE'] as const).map((type) => {
          const items = group(type);
          const active = items.filter((c) => !c.archived).length;
          return (
            <section key={type} className="card card--flush">
              <div className="card__head">
                <h2>
                  <span className={`card__icon cat__icon--${type.toLowerCase()}`}>
                    {type === 'INCOME' ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}
                  </span>
                  {type === 'INCOME' ? 'Income sources' : 'Expense categories'}
                </h2>
                <span className="pill">{active} active</span>
              </div>
              {list.loading && !list.data ? (
                <EmptyState title="Loading…" />
              ) : (
                <ul className="cat-list">
                  {items.map((c) => (
                    <CategoryItem key={c.id} category={c} run={run} />
                  ))}
                </ul>
              )}
              <AddCategory type={type} run={run} />
            </section>
          );
        })}
      </div>
    </div>
  );
}
