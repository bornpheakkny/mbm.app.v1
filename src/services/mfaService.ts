import { api } from './apiClient';
import type { MfaStatus, TotpSetup, User } from '@/types';

type Enabled = { user: User; recoveryCodes: string[] };

/** Two-step verification settings for the signed-in user */
export const mfaService = {
  status: () => api.get<MfaStatus>('/auth/mfa').then((r) => r.data),

  totpSetup: () => api.post<TotpSetup>('/auth/mfa/totp/setup').then((r) => r.data),
  totpEnable: (code: string, password: string) =>
    api.post<Enabled>('/auth/mfa/totp/enable', { code, password }).then((r) => r.data),

  emailSetup: () => api.post('/auth/mfa/email/setup'),
  emailEnable: (code: string, password: string) =>
    api.post<Enabled>('/auth/mfa/email/enable', { code, password }).then((r) => r.data),

  regenerateCodes: (password: string) =>
    api.post<{ recoveryCodes: string[] }>('/auth/mfa/recovery-codes', { password }).then((r) => r.data.recoveryCodes),
  disable: (password: string) => api.post<{ user: User }>('/auth/mfa/disable', { password }).then((r) => r.data.user),
};
