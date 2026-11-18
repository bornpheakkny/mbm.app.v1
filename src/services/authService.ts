import { api } from './apiClient';
import type { AuthResponse, LoginResponse, User } from '@/types';

export const authService = {
  /** Returns a session, or an MFA challenge when two-step verification is on */
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email, password }).then((r) => r.data),
  loginMfa: (mfaToken: string, code: string) =>
    api.post<AuthResponse>('/auth/login/mfa', { mfaToken, code }).then((r) => r.data),
  /** Emails a new sign-in code; returns the new mfaToken */
  resendLoginCode: (mfaToken: string) =>
    api.post<{ mfaToken: string }>('/auth/login/mfa/resend', { mfaToken }).then((r) => r.data.mfaToken),
  register: (body: { name: string; email: string; password: string; currency?: string }) =>
    api.post<AuthResponse>('/auth/register', body).then((r) => r.data),
  me: () => api.get<{ user: User }>('/auth/me').then((r) => r.data.user),
  updateMe: (body: Partial<Pick<User, 'name' | 'currency'>>) =>
    api.patch<{ user: User }>('/auth/me', body).then((r) => r.data.user),
  /** Returns a fresh token; other sessions are signed out */
  changePassword: (currentPassword: string, newPassword: string) =>
    api
      .post<{ token: string }>('/auth/change-password', { currentPassword, newPassword })
      .then((r) => r.data.token),

  /** Confirms a sign-up email or a changed email (changed: true) */
  verifyEmail: (token: string) =>
    api.post<{ email: string; changed: boolean }>('/auth/verify-email', { token }).then((r) => r.data),
  /** Sends a confirmation link to the new address; the email only changes once it's confirmed */
  changeEmail: (newEmail: string, password: string) =>
    api.post<{ user: User }>('/auth/change-email', { newEmail, password }).then((r) => r.data.user),
  resendEmailChange: () => api.post('/auth/change-email/resend'),
  cancelEmailChange: () => api.delete<{ user: User }>('/auth/change-email').then((r) => r.data.user),
  resendVerification: () => api.post('/auth/resend-verification'),
  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/auth/forgot-password', { email }).then((r) => r.data.message),
  resetPassword: (token: string, password: string) =>
    api.post<{ email: string }>('/auth/reset-password', { token, password }).then((r) => r.data),
};
