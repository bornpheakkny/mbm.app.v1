import { api } from './apiClient';
import type { Summary, TrendPoint } from '@/types';

export const summaryService = {
  get: (month: string) => api.get<Summary>('/summary', { params: { month } }).then((r) => r.data),
  trend: (end: string, months = 6) =>
    api.get<{ trend: TrendPoint[] }>('/summary/trend', { params: { end, months } }).then((r) => r.data.trend),
};
