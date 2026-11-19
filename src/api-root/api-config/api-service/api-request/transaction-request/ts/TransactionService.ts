import { api } from '@api/api-configuration/api-client/ts/ApiClient';
import type { CategoryType, Transaction, TransactionInput, TransactionList } from '@type/type-model/ts/Model.type';

export const transactionService = {
  list: (params: { month?: string; type?: CategoryType; categoryId?: string; q?: string }) =>
    api.get<TransactionList>('/transactions', { params: { pageSize: 500, ...params } }).then((r) => r.data),
  create: (body: TransactionInput) =>
    api.post<{ transaction: Transaction }>('/transactions', body).then((r) => r.data.transaction),
  update: (id: string, body: TransactionInput) =>
    api.put<{ transaction: Transaction }>(`/transactions/${id}`, body).then((r) => r.data.transaction),
  remove: (id: string) => api.delete(`/transactions/${id}`),
};
