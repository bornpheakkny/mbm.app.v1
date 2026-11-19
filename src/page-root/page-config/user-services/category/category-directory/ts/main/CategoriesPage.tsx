import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Alert } from '@component/modals/alert-banner/ts/Alert';
import { EmptyState } from '@component/fallback/empty-state/ts/EmptyState';
import { PageHeader } from '@component/header/page-header/ts/PageHeader';
import { useAsync } from '@util/util-hook/use-async/ts/useAsync';
import { categoryService, errorMessage } from '@api/ApiService';
import type { CategoryType } from '@type/type-model/ts/Model.type';
import { AddCategory } from '@page/user-services/category/category-directory/ts/private/AddCategory';
import { CategoryItem } from '@page/user-services/category/category-directory/ts/private/CategoryItem';
import styles from '../../css/main/CategoriesPage.module.css';

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
    <div className="pheakkornyMbmPage">
      <PageHeader
        title="Categories"
        description="Income sources and expense categories used in your budget and entries. Archive ones you no longer use to keep their history."
      />
      {(error || list.error) && (
        <Alert onClose={error ? () => setError(null) : undefined}>{error ?? list.error}</Alert>
      )}

      <div className="pheakkornyMbmGrid2">
        {(['INCOME', 'EXPENSE'] as const).map((type) => {
          const items = group(type);
          const active = items.filter((c) => !c.archived).length;
          return (
            <section key={type} className="pheakkornyMbmCard pheakkornyMbmCardFlush">
              <div className="pheakkornyMbmCardHead">
                <h2>
                  <span className="pheakkornyMbmCardIcon">
                    {type === 'INCOME' ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}
                  </span>
                  {type === 'INCOME' ? 'Income sources' : 'Expense categories'}
                </h2>
                <span className="pheakkornyMbmPill">{active} active</span>
              </div>
              {list.loading && !list.data ? (
                <EmptyState title="Loading…" />
              ) : (
                <ul className={styles.pheakkornyMbmCategoriesPageCatList}>
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
