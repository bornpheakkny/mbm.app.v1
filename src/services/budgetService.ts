import { api } from './apiClient';
import type { Budget } from '@/types';

export const budgetService = {
  get: (month: string) => api.get<{ budgets: Budget[] }>('/budgets', { params: { month } }).then((r) => r.data.budgets),
  save: (month: string, items: { categoryId: string; amount: number }[]) => api.put('/budgets', { month, items }),
  copy: (to: string, from?: string, overwrite = false) => api.post('/budgets/copy', { to, from, overwrite }),
};
