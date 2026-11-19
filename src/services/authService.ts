import { api } from './apiClient';
import type { AuthResponse, Channel, LoginResponse, MfaChallenge, Preferences, User, VerificationChallenge } from '@/types';

export interface RegisterInput {
  name: string;
  username: string;
  email?: string;
  phone?: string;
  password: string;
  currency?: string;
}

export const authService = {
  /** Username, email or phone + password. May return a verification or two-step challenge. */
  login: (identifier: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { identifier, password }).then((r) => r.data),
  /** Creates the account and sends a 6-digit code; the account works once /verify confirms it */
  register: (body: RegisterInput) => api.post<VerificationChallenge>('/auth/register', body).then((r) => r.data),
  /** Confirms the sign-up / first-login code. Returns a session, or a two-step challenge. */
  verify: (verifyToken: string, code: string) =>
    api.post<AuthResponse | MfaChallenge>('/auth/verify', { verifyToken, code }).then((r) => r.data),
  resendVerifyCode: (verifyToken: string) =>
    api
      .post<{ verifyToken: string; channel: Channel; hint: string }>('/auth/verify/resend', { verifyToken })
      .then((r) => r.data),

  loginMfa: (mfaToken: string, code: string) =>
    api.post<AuthResponse>('/auth/login/mfa', { mfaToken, code }).then((r) => r.data),
  /** Emails a new sign-in code; returns the new mfaToken */
  resendLoginCode: (mfaToken: string) =>
    api.post<{ mfaToken: string }>('/auth/login/mfa/resend', { mfaToken }).then((r) => r.data.mfaToken),

  me: () => api.get<{ user: User }>('/auth/me').then((r) => r.data.user),
  updateMe: (body: Partial<Pick<User, 'name' | 'currency' | 'username'>> & { preferences?: Partial<Preferences> }) =>
    api.patch<{ user: User }>('/auth/me', body).then((r) => r.data.user),
  /** Returns a fresh token; other sessions are signed out */
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<{ token: string }>('/auth/change-password', { currentPassword, newPassword }).then((r) => r.data.token),

  // Recovery
  forgotUsername: (contact: string) =>
    api.post<{ message: string }>('/auth/forgot-username', { contact }).then((r) => r.data.message),
  forgotPassword: (identifier: string) =>
    api.post<{ resetToken: string; message: string }>('/auth/forgot-password', { identifier }).then((r) => r.data),
  resetPassword: (resetToken: string, code: string, password: string) =>
    api.post<{ username: string }>('/auth/reset-password', { resetToken, code, password }).then((r) => r.data),

  // Email
  /** Confirms an email link (admin-set address, or a changed address: changed = true) */
  verifyEmail: (token: string) =>
    api.post<{ email: string; changed: boolean }>('/auth/verify-email', { token }).then((r) => r.data),
  resendVerification: () => api.post('/auth/resend-verification'),
  /** Sends a confirmation link to the new address; the email only changes once it's confirmed */
  changeEmail: (newEmail: string, password: string) =>
    api.post<{ user: User }>('/auth/change-email', { newEmail, password }).then((r) => r.data.user),
  resendEmailChange: () => api.post('/auth/change-email/resend'),
  cancelEmailChange: () => api.delete<{ user: User }>('/auth/change-email').then((r) => r.data.user),

  // Phone
  /** Texts a code to the new number; it applies after verifyPhone */
  addPhone: (phone: string, password: string) =>
    api.post<{ user: User; hint: string }>('/auth/phone', { phone, password }).then((r) => r.data),
  verifyPhone: (code: string) => api.post<{ user: User }>('/auth/phone/verify', { code }).then((r) => r.data.user),
  cancelPendingPhone: () => api.delete<{ user: User }>('/auth/phone/pending').then((r) => r.data.user),
  removePhone: () => api.delete<{ user: User }>('/auth/phone').then((r) => r.data.user),
};
