import { api } from '@api/api-configuration/api-client/ts/ApiClient';
import type { AdminUser, AdminUserInput, AdminUserList, Role } from '@type/type-model/ts/Model.type';

export const adminService = {
  listUsers: (params?: { q?: string; role?: Role; status?: 'active' | 'disabled' }) =>
    api.get<AdminUserList>('/admin/users', { params }).then((r) => r.data),
  createUser: (body: AdminUserInput & { password: string }) =>
    api.post<{ user: AdminUser }>('/admin/users', body).then((r) => r.data.user),
  updateUser: (id: string, body: Partial<Omit<AdminUserInput, 'password'> & { active: boolean }>) =>
    api.patch<{ user: AdminUser }>(`/admin/users/${id}`, body).then((r) => r.data.user),
  resetPassword: (id: string, password: string) => api.post(`/admin/users/${id}/reset-password`, { password }),
  resetMfa: (id: string) => api.post<{ user: AdminUser }>(`/admin/users/${id}/reset-mfa`).then((r) => r.data.user),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
};
