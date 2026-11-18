import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { AccountPage } from '@/pages/AccountPage';
import { BudgetPage } from '@/pages/BudgetPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { UsersPage } from '@/pages/UsersPage';
import { VerifyEmailPage } from '@/pages/VerifyEmailPage';
import { AdminRoute, GuestRoute, ProtectedRoute } from './RouteGuards';

export function AppRoutes() {
  return (
    <Routes>
      {/* Signed-out only */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
