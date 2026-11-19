import { useState } from 'react';
import { Archive, ArchiveRestore, Check, Pencil, Trash2, X } from 'lucide-react';
import { CategoryBadge } from '@component/info/category-badge/ts/CategoryBadge';
import { useConfirm } from '@context/confirm-provider/ts/ConfirmContext';
import { categoryService } from '@api/ApiService';
import type { Category } from '@type/type-model/ts/Model.type';
import { ColorSelect } from '@page/user-services/category/category-directory/ts/private/ColorSelect';
import type { Run } from '@page/user-services/category/category-directory/ts/main/CategoriesPage';
import { cx } from '@util/util-consumption/class-name/ts/ClassName';
import styles from '../../css/main/CategoriesPage.module.css';

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
      <li className={cx(styles.pheakkornyMbmCategoriesPageCatItem, styles.pheakkornyMbmCategoriesPageCatItemEdit)}>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} aria-label="Category name" autoFocus />
        <ColorSelect value={color} onChange={setColor} />
        <div className="pheakkornyMbmRowActions">
          <button
            className="pheakkornyMbmBtn pheakkornyMbmBtnGhost pheakkornyMbmBtnSm"
            onClick={() => {
              setName(c.name);
              setColor(c.color);
              setEdit(false);
            }}
          >
            <X size={15} /> Cancel
          </button>
          <button
            className="pheakkornyMbmBtn pheakkornyMbmBtnPrimary pheakkornyMbmBtnSm"
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
    <li className={styles.pheakkornyMbmCategoriesPageCatItem}>
      <CategoryBadge name={c.name} color={c.color} className={c.archived ? styles.pheakkornyMbmCategoriesPageArchivedBadge : undefined} />
      {c.archived && <span className="pheakkornyMbmPill">Archived</span>}
      <div className={cx('pheakkornyMbmRowActions', styles.pheakkornyMbmCategoriesPageCatItemActions)}>
        <button className="pheakkornyMbmIconBtn pheakkornyMbmIconBtnSm" aria-label={`Edit ${c.name}`} title="Edit" onClick={() => setEdit(true)}>
          <Pencil size={16} />
        </button>
        <button
          className="pheakkornyMbmIconBtn pheakkornyMbmIconBtnSm"
          aria-label={c.archived ? `Restore ${c.name}` : `Archive ${c.name}`}
          title={c.archived ? 'Restore' : 'Archive'}
          onClick={() => run(() => categoryService.update(c.id, { archived: !c.archived }))}
        >
          {c.archived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
        </button>
        <button className="pheakkornyMbmIconBtn pheakkornyMbmIconBtnSm pheakkornyMbmIconBtnDanger" aria-label={`Delete ${c.name}`} title="Delete" onClick={remove}>
          <Trash2 size={16} />
        </button>
      </div>
    </li>
  );
}
