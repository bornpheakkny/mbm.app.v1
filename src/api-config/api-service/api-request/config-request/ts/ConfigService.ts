import { api } from '@api/api-configuration/api-client/ts/ApiClient';
import type { ServerConfig } from '@type/type-model/ts/Model.type';

export const configService = {
  /** Public server settings (no sign-in needed) */
  get: () => api.get<ServerConfig>('/config').then((r) => r.data),
};
