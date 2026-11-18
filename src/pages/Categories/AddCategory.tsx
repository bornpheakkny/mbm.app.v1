import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { categoryService } from '@/services';
import type { CategoryType } from '@/types';
import { ColorSelect } from './ColorSelect';
import type { Run } from './CategoriesPage';

export function AddCategory({ type, run }: { type: CategoryType; run: Run }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('gray');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (await run(() => categoryService.create({ name: name.trim(), type, color }))) setName('');
  }

  return (
    <form className="cat-add" onSubmit={onSubmit}>
      <div className="cat-add__row">
        <input
          placeholder={type === 'INCOME' ? 'New income source' : 'New expense category'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          aria-label="New category name"
        />
        <button className="btn btn--primary" disabled={!name.trim()}>
          <Plus size={16} /> Add
        </button>
      </div>
      <ColorSelect value={color} onChange={setColor} />
    </form>
  );
}
