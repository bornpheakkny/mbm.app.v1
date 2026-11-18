import { useState } from 'react';
import { Archive, ArchiveRestore, Check, Pencil, Trash2, X } from 'lucide-react';
import { CategoryBadge } from '@/components/CategoryBadge';
import { useConfirm } from '@/context/ConfirmContext';
import { categoryService } from '@/services';
import type { Category } from '@/types';
import { ColorSelect } from './ColorSelect';
import type { Run } from './CategoriesPage';

/** One category row: view, rename/recolor inline, archive, delete */
export function CategoryItem({ category: c, run }: { category: Category; run: Run }) {
  const confirm = useConfirm();
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(c.name);
  const [color, setColor] = useState(c.color);

  async function remove() {
    const ok = await confirm({
      title: `Delete "${c.name}"?`,
      message: 'Only categories with no entries can be deleted. To keep history, archive it instead.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (ok) await run(() => categoryService.remove(c.id));
  }

  if (edit) {
    return (
      <li className="cat-item cat-item--edit">
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} aria-label="Category name" autoFocus />
        <ColorSelect value={color} onChange={setColor} />
        <div className="row-actions">
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => {
              setName(c.name);
              setColor(c.color);
              setEdit(false);
            }}
          >
            <X size={15} /> Cancel
          </button>
          <button
            className="btn btn--primary btn--sm"
            disabled={!name.trim()}
            onClick={async () => (await run(() => categoryService.update(c.id, { name: name.trim(), color }))) && setEdit(false)}
          >
            <Check size={15} /> Save
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className={`cat-item ${c.archived ? 'cat-item--archived' : ''}`}>
      <CategoryBadge name={c.name} color={c.color} />
      {c.archived && <span className="pill">Archived</span>}
      <div className="row-actions cat-item__actions">
        <button className="icon-btn icon-btn--sm" aria-label={`Edit ${c.name}`} title="Edit" onClick={() => setEdit(true)}>
          <Pencil size={16} />
        </button>
        <button
          className="icon-btn icon-btn--sm"
          aria-label={c.archived ? `Restore ${c.name}` : `Archive ${c.name}`}
          title={c.archived ? 'Restore' : 'Archive'}
          onClick={() => run(() => categoryService.update(c.id, { archived: !c.archived }))}
        >
          {c.archived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
        </button>
        <button className="icon-btn icon-btn--sm icon-btn--danger" aria-label={`Delete ${c.name}`} title="Delete" onClick={remove}>
          <Trash2 size={16} />
        </button>
      </div>
    </li>
  );
}
