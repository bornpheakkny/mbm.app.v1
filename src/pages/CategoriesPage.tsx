import { useState, type FormEvent } from 'react';
import { categoryService, errorMessage } from '@/services';
import type { Category, CategoryType } from '@/types';
import { useAsync } from '@/hooks/useAsync';
import { COLOR_NAMES } from '@/constants';
import { colorOf } from '@/utils/colors';
import { Alert, CategoryBadge } from '@/components/ui';

export function CategoriesPage() {
  const list = useAsync(() => categoryService.list({ includeArchived: true }), []);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<unknown>) {
    setError(null);
    try {
      await fn();
      await list.reload();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const group = (type: CategoryType) => list.data?.filter((c) => c.type === type) ?? [];

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1>Categories</h1>
          <p className="muted">Income sources and expense categories used in your budget and entries.</p>
        </div>
      </div>
      {(error || list.error) && <Alert>{error ?? list.error}</Alert>}

      <div className="grid-2">
        {(['INCOME', 'EXPENSE'] as const).map((type) => (
          <section key={type} className="card card--flush">
            <div className="card__head">
              <h2>{type === 'INCOME' ? 'Income sources' : 'Expense categories'}</h2>
            </div>
            <ul className="cat-list">
              {group(type).map((c) => (
                <CategoryItem key={c.id} category={c} run={run} />
              ))}
            </ul>
            <AddCategory type={type} run={run} />
          </section>
        ))}
      </div>
    </div>
  );
}

function ColorSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="swatches" role="radiogroup" aria-label="Color">
      {COLOR_NAMES.map((name) => (
        <button
          key={name}
          type="button"
          role="radio"
          aria-checked={value === name}
          aria-label={name}
          className={`swatch ${value === name ? 'swatch--on' : ''}`}
          style={{ background: colorOf(name).solid }}
          onClick={() => onChange(name)}
        />
      ))}
    </div>
  );
}

function CategoryItem({
  category: c,
  run,
}: {
  category: Category;
  run: (fn: () => Promise<unknown>) => Promise<void>;
}) {
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(c.name);
  const [color, setColor] = useState(c.color);

  if (edit) {
    return (
      <li className="cat-item cat-item--edit">
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
        <ColorSelect value={color} onChange={setColor} />
        <div className="row-actions">
          <button className="btn btn--ghost btn--sm" onClick={() => setEdit(false)}>
            Cancel
          </button>
          <button
            className="btn btn--primary btn--sm"
            onClick={() => run(() => categoryService.update(c.id, { name, color })).then(() => setEdit(false))}
          >
            Save
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className={`cat-item ${c.archived ? 'cat-item--archived' : ''}`}>
      <CategoryBadge name={c.name} color={c.color} />
      {c.archived && <span className="muted small">archived</span>}
      <div className="row-actions">
        <button className="btn btn--ghost btn--sm" onClick={() => setEdit(true)}>
          Edit
        </button>
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => run(() => categoryService.update(c.id, { archived: !c.archived }))}
        >
          {c.archived ? 'Restore' : 'Archive'}
        </button>
        <button
          className="icon-btn icon-btn--danger"
          aria-label="Delete"
          onClick={() => confirm(`Delete "${c.name}"?`) && run(() => categoryService.remove(c.id))}
        >
          🗑
        </button>
      </div>
    </li>
  );
}

function AddCategory({ type, run }: { type: CategoryType; run: (fn: () => Promise<unknown>) => Promise<void> }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('gray');

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    void run(() => categoryService.create({ name: name.trim(), type, color })).then(() => setName(''));
  }

  return (
    <form className="cat-add" onSubmit={onSubmit}>
      <input
        placeholder={type === 'INCOME' ? 'New income source' : 'New expense category'}
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={60}
      />
      <ColorSelect value={color} onChange={setColor} />
      <button className="btn btn--primary btn--sm">Add</button>
    </form>
  );
}
