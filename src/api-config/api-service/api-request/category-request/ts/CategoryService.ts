import { api } from '@api/api-configuration/api-client/ts/ApiClient';
import type { Category, CategoryType } from '@type/type-model/ts/Model.type';

export const categoryService = {
  list: (params?: { type?: CategoryType; includeArchived?: boolean }) =>
    api.get<{ categories: Category[] }>('/categories', { params }).then((r) => r.data.categories),
  create: (body: { name: string; type: CategoryType; color?: string }) =>
    api.post<{ category: Category }>('/categories', body).then((r) => r.data.category),
  update: (id: string, body: Partial<Pick<Category, 'name' | 'color' | 'archived' | 'sortOrder'>>) =>
    api.patch<{ category: Category }>(`/categories/${id}`, body).then((r) => r.data.category),
  remove: (id: string) => api.delete(`/categories/${id}`),
};
