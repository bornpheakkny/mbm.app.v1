import { api } from './client';
import type {
  AuthResponse,
  Budget,
  Category,
  CategoryType,
  Summary,
  Transaction,
  TransactionInput,
  TransactionList,
  TrendPoint,
  User,
} from './types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),
  register: (body: { name: string; email: string; password: string; currency?: string }) =>
    api.post<AuthResponse>('/auth/register', body).then((r) => r.data),
  me: () => api.get<{ user: User }>('/auth/me').then((r) => r.data.user),
  updateMe: (body: Partial<Pick<User, 'name' | 'currency'>>) =>
    api.patch<{ user: User }>('/auth/me', body).then((r) => r.data.user),
};

export const categoryApi = {
  list: (params?: { type?: CategoryType; includeArchived?: boolean }) =>
    api.get<{ categories: Category[] }>('/categories', { params }).then((r) => r.data.categories),
  create: (body: { name: string; type: CategoryType; color?: string }) =>
    api.post<{ category: Category }>('/categories', body).then((r) => r.data.category),
  update: (id: string, body: Partial<Pick<Category, 'name' | 'color' | 'archived' | 'sortOrder'>>) =>
    api.patch<{ category: Category }>(`/categories/${id}`, body).then((r) => r.data.category),
  remove: (id: string) => api.delete(`/categories/${id}`),
};

export const budgetApi = {
  get: (month: string) => api.get<{ budgets: Budget[] }>('/budgets', { params: { month } }).then((r) => r.data.budgets),
  save: (month: string, items: { categoryId: string; amount: number }[]) => api.put('/budgets', { month, items }),
  copy: (to: string, from?: string, overwrite = false) => api.post('/budgets/copy', { to, from, overwrite }),
};

export const transactionApi = {
  list: (params: { month?: string; type?: CategoryType; categoryId?: string; q?: string }) =>
    api.get<TransactionList>('/transactions', { params: { pageSize: 500, ...params } }).then((r) => r.data),
  create: (body: TransactionInput) =>
    api.post<{ transaction: Transaction }>('/transactions', body).then((r) => r.data.transaction),
  update: (id: string, body: TransactionInput) =>
    api.put<{ transaction: Transaction }>(`/transactions/${id}`, body).then((r) => r.data.transaction),
  remove: (id: string) => api.delete(`/transactions/${id}`),
};

export const summaryApi = {
  get: (month: string) => api.get<Summary>('/summary', { params: { month } }).then((r) => r.data),
  trend: (end: string, months = 6) =>
    api.get<{ trend: TrendPoint[] }>('/summary/trend', { params: { end, months } }).then((r) => r.data.trend),
};
