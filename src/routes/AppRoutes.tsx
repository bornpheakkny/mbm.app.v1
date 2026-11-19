import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { AccountPage } from '@/pages/Account';
import { BudgetPage } from '@/pages/Budget';
import { CategoriesPage } from '@/pages/Categories';
import { DashboardPage } from '@/pages/Dashboard';
import { ForgotPasswordPage } from '@/pages/ForgotPassword';
import { ForgotUsernamePage } from '@/pages/ForgotUsername';
import { LoginPage } from '@/pages/Login';
import { RegisterPage } from '@/pages/Register';
import { ResetPasswordPage } from '@/pages/ResetPassword';
import { TransactionsPage } from '@/pages/Transactions';
import { UsersPage } from '@/pages/Users';
import { VerifyEmailPage } from '@/pages/VerifyEmail';
import { AdminRoute, GuestRoute, ProtectedRoute } from './RouteGuards';

export function AppRoutes() {
  return (
    <Routes>
      {/* Signed-out only */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/forgot-username" element={<ForgotUsernamePage />} />
      </Route>

      {/* Opened from email links — work signed in or out */}
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Signed-in */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="income" element={<TransactionsPage key="income" type="INCOME" />} />
          <Route path="expenses" element={<TransactionsPage key="expenses" type="EXPENSE" />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="account" element={<AccountPage />} />

          {/* Admin only */}
          <Route element={<AdminRoute />}>
            <Route path="admin/users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
