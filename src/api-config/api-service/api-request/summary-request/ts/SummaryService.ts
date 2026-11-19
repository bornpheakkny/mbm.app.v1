import { api } from '@api/api-configuration/api-client/ts/ApiClient';
import type { Summary, TrendPoint } from '@type/type-model/ts/Model.type';

export const summaryService = {
  get: (month: string) => api.get<Summary>('/summary', { params: { month } }).then((r) => r.data),
  trend: (end: string, months = 6) =>
    api.get<{ trend: TrendPoint[] }>('/summary/trend', { params: { end, months } }).then((r) => r.data.trend),
};
