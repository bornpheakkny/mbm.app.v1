import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { categoryService } from '@api/ApiService';
import type { CategoryType } from '@type/type-model/ts/Model.type';
import { ColorSelect } from '@page/user-services/category/category-directory/ts/private/ColorSelect';
import type { Run } from '@page/user-services/category/category-directory/ts/main/CategoriesPage';
import styles from '../../css/main/CategoriesPage.module.css';

export function AddCategory({ type, run }: { type: CategoryType; run: Run }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('gray');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (await run(() => categoryService.create({ name: name.trim(), type, color }))) setName('');
  }

  return (
    <form className={styles.pheakkornyMbmCategoriesPageCatAdd} onSubmit={onSubmit}>
      <div className={styles.pheakkornyMbmCategoriesPageCatAddRow}>
        <input
          placeholder={type === 'INCOME' ? 'New income source' : 'New expense category'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          aria-label="New category name"
        />
        <button className="pheakkornyMbmBtn pheakkornyMbmBtnPrimary" disabled={!name.trim()}>
          <Plus size={16} /> Add
        </button>
      </div>
      <ColorSelect value={color} onChange={setColor} />
    </form>
  );
}
