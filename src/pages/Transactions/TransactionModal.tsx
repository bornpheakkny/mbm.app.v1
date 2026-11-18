import { useState, type FormEvent } from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Alert } from '@/components/Alert';
import { Modal, ModalFooter } from '@/components/Modal';
import { errorMessage, transactionService } from '@/services';
import type { Category, CategoryType, Transaction, TransactionInput } from '@/types';
import { defaultDateFor } from '@/utils/format';
import styles from './TransactionsPage.module.css';
import { Select } from '@/components/Select';

/** Add / edit one income or expense entry */
export function TransactionModal(props: {
  type: CategoryType;
  title: string;
  catLabel: string;
  categories: Category[];
  initial: Transaction | null;
  month: string;
  onClose: () => void;
  onSaved: () => void;
  /** Called after each save while "Add another" is ticked */
  onAdded: () => void;
}) {
  const { type, title, catLabel, categories, initial, month, onClose, onSaved, onAdded } = props;
  const [form, setForm] = useState({
    date: initial?.date ?? defaultDateFor(month),
    categoryId: initial?.categoryId ?? categories[0]?.id ?? '',
    description: initial?.description ?? '',
    amount: initial ? String(initial.amount) : '',
    note: initial?.note ?? '',
  });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
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
    setSaved(null);
    try {
      if (initial) await transactionService.update(initial.id, body);
      else await transactionService.create(body);
      if (addAnother && !initial) {
        setSaved(`Saved "${body.description}". Add the next one.`);
        setForm((f) => ({ ...f, description: '', amount: '', note: '' }));
        onAdded();
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
    <Modal title={title} icon={type === 'INCOME' ? ArrowDownLeft : ArrowUpRight} onClose={onClose}>
      <form className="form" onSubmit={onSubmit}>
        {error && <Alert>{error}</Alert>}
        {saved && <Alert tone="success">{saved}</Alert>}
        <label className="field">
          <span>Amount</span>
          <input
            className={styles.amountInput}
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            required
            autoFocus
            placeholder="0.00"
            value={form.amount}
            onChange={set('amount')}
          />
        </label>
        <label className="field">
          <span>Description</span>
          <input required maxLength={200} placeholder={type === 'INCOME' ? 'e.g. Monthly salary' : 'e.g. Weekly groceries'} value={form.description} onChange={set('description')} />
        </label>
        <div className="form__row">
          <div className="field">
            <label className="field__label" htmlFor="tx-category">
              {catLabel}
            </label>
            <Select
              id="tx-category"
              value={form.categoryId}
              onChange={(categoryId) => setForm((f) => ({ ...f, categoryId }))}
              options={categories.map((c) => ({ value: c.id, label: c.name, color: c.color }))}
            />
          </div>
          <label className="field">
            <span>Date</span>
            <input type="date" required value={form.date} onChange={set('date')} />
          </label>
        </div>
        <label className="field">
          <span>
            Note <span className="muted">(optional)</span>
          </span>
          <input maxLength={500} placeholder="Shop, brand, anything to remember" value={form.note} onChange={set('note')} />
        </label>
        <ModalFooter
          start={
            !initial && (
              <label className="check">
                <input type="checkbox" checked={addAnother} onChange={(e) => setAddAnother(e.target.checked)} />
                Add another after saving
              </label>
            )
          }
        >
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            {saved ? 'Done' : 'Cancel'}
          </button>
          <button className="btn btn--primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
